// Atualização forçada para rebuild limpo import { useState, useEffect, useRef } from "react";
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

  // Aqui estariam outros hooks e lógicas, que você deve manter

  const exportarPDF = () => {
    const input = printRef.current;
    html2canvas(input).then((canvas) => {
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

