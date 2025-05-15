import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DashboardMetaAds() {
  const [darkMode, setDarkMode] = useState(true);
  const [campanhas, setCampanhas] = useState([]);
  const [modoDemo, setModoDemo] = useState(false);
  const printRef = useRef();

  const toggleTheme = () => setDarkMode(!darkMode);
  const themeClasses = darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  const sheetId = "2PACX-1vTBhdsO4VY9Cw0R5SAT3A-thlzE3AnURnKn7psYmEweKZglrHfWgO5i5GAIuOb5b9RYV8Wv39eicigF";
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

  const diagnosticarCampanha = ({ cpm, cpc, ctr, roas }) => {
    if (roas < 1.5) return { status: "Crítica", acao: "Pausar campanha" };
    if (ctr < 1.0) return { status: "Atenção", acao: "Revisar criativo/público" };
    if (roas >= 3.0) return { status: "Saudável", acao: "Escalar orçamento" };
    return { status: "Estável", acao: "Aguardar mais dados" };
  };

  useEffect(() => {
    if (modoDemo) {
      setCampanhas([
        {
          id: "demo-1",
          nome: "Campanha Fictícia",
          tipo: "Vendas",
          cpm: 12.5,
          cpc: 1.8,
          ctr: 2.4,
          roas: 3.2,
          data: "2025-05-14",
          status: "Saudável",
          acao: "Escalar orçamento",
        }
      ]);
    } else {
      fetch(sheetUrl)
        .then(res => res.text())
        .then(text => {
          const json = JSON.parse(text.substring(47).slice(0, -2));
          const rows = json.table.rows.map(r => r.c);
          const novasCampanhas = rows.map((r, i) => {
            const nome = r[1]?.v || "";
            const tipo = r[2]?.v || "";
            const cpm = parseFloat(r[3]?.v || 0);
            const cpc = parseFloat(r[4]?.v || 0);
            const ctr = parseFloat(r[5]?.v || 0);
            const roas = parseFloat(r[6]?.v || 0);
            const data = r[0]?.v || "";
            const { status, acao } = diagnosticarCampanha({ cpm, cpc, ctr, roas });
            return {
              id: `GS-${i + 1}`,
              nome,
              tipo,
              cpm,
              cpc,
              ctr,
              roas,
              data,
              status,
              acao
            };
          });
          setCampanhas(novasCampanhas);
        });
    }
  }, [modoDemo]);
  const campanhasAgrupadas = campanhas.reduce((acc, campanha) => {
    acc[campanha.data] = acc[campanha.data] || [];
    acc[campanha.data].push(campanha);
    return acc;
  }, {});

  const dadosGrafico = Object.entries(campanhasAgrupadas).map(([data, campanhasDia]) => {
    const roasMedio = campanhasDia.reduce((sum, c) => sum + c.roas, 0) / campanhasDia.length;
    const cpaMedio = campanhasDia.reduce((sum, c) => sum + (c.cpc / (c.ctr / 100 || 1)), 0) / campanhasDia.length;
    return { data, roas: parseFloat(roasMedio.toFixed(2)), cpa: parseFloat(cpaMedio.toFixed(2)) };
  });

  const exportarCSV = () => {
    const linhas = campanhas.map(c => (
      [c.id, c.nome, c.tipo, c.cpm, c.cpc, c.ctr, c.roas, c.status, c.acao, c.data].join(",")
    ));
    const csv = ["ID,Nome,Tipo,CPM,CPC,CTR,ROAS,Status,Ação,Data", ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "campanhas-meta-ads.csv");
    link.click();
  };

  const exportarPDF = () => {
    html2canvas(printRef.current).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("relatorio-meta-ads.pdf");
    });
  };

  return (
    <div className={`min-h-screen p-6 ${themeClasses}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meta Ads Intelligence Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => setModoDemo(!modoDemo)} className="px-3 py-1 bg-blue-600 text-white rounded">
            {modoDemo ? "🔐 Modo Real" : "👤 Modo Demo"}
          </button>
          <button onClick={exportarCSV} className="px-3 py-1 bg-green-600 text-white rounded">Exportar CSV</button>
          <button onClick={exportarPDF} className="px-3 py-1 bg-purple-600 text-white rounded">Exportar PDF</button>
          <button onClick={toggleTheme} className="px-3 py-1 bg-gray-700 text-white rounded">
            {darkMode ? "☀️ Claro" : "🌙 Escuro"}
          </button>
        </div>
      </div>

      <div ref={printRef} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Tendência de ROAS e CPA</h2>
          <div className="w-full h-64 bg-white rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosGrafico} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="roas" stroke="#8884d8" name="ROAS" />
                <Line yAxisId="right" type="monotone" dataKey="cpa" stroke="#82ca9d" name="CPA" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
