import { useState, useRef } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area 
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ChevronDown, Download, FileImage, File } from 'lucide-react';

type ChartPeriod = 'daily' | 'weekly' | 'monthly';
type ChartType = 'line' | 'bar' | 'composed';

interface SalesChartProps {
  data: any[];
  period: ChartPeriod;
  onPeriodChange?: (period: ChartPeriod) => void;
}

const SalesChart = ({ data, period, onPeriodChange }: SalesChartProps) => {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  
  const handlePeriodChange = (newPeriod: ChartPeriod) => {
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };

  const exportToImage = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current);
      const image = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = image;
      link.download = `sales-chart-${period}.png`;
      link.click();
    } catch (error) {
      console.error('Error exporting to image:', error);
    }
  };

  const exportToPDF = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current);
      const imageData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('landscape');
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imageData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`sales-chart-${period}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-header flex flex-wrap justify-between items-center gap-3">
        <div className="text-lg font-semibold">
          Grafik Penjualan
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              onClick={() => handlePeriodChange('daily')}
              className={`px-3 py-1.5 text-sm ${
                period === 'daily' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Harian
            </button>
            <button
              onClick={() => handlePeriodChange('weekly')}
              className={`px-3 py-1.5 text-sm ${
                period === 'weekly' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Mingguan
            </button>
            <button
              onClick={() => handlePeriodChange('monthly')}
              className={`px-3 py-1.5 text-sm ${
                period === 'monthly' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Bulanan
            </button>
          </div>
          
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 text-sm ${
                chartType === 'line' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 text-sm ${
                chartType === 'bar' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('composed')}
              className={`px-3 py-1.5 text-sm ${
                chartType === 'composed' ? 'bg-primary-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Combined
            </button>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            >
              <Download size={16} />
              Export
              <ChevronDown size={16} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={exportToImage}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <FileImage size={16} />
                  Export PNG
                </button>
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  <File size={16} />
                  Export PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="card-body" ref={chartRef}>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#0a91eb" activeDot={{ r: 8 }} name="Pendapatan" />
                <Line type="monotone" dataKey="sparepartSales" stroke="#ed6e1e" name="Sparepart" />
                <Line type="monotone" dataKey="serviceSales" stroke="#2c9d5d" name="Service" />
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sparepartSales" fill="#ed6e1e" name="Sparepart" />
                <Bar dataKey="serviceSales" fill="#2c9d5d" name="Service" />
              </BarChart>
            ) : (
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sparepartSales" fill="#ed6e1e" name="Sparepart" />
                <Bar dataKey="serviceSales" fill="#2c9d5d" name="Service" />
                <Area type="monotone" dataKey="total" fill="#0a91eb" stroke="#0a91eb" name="Pendapatan" />
                <Line type="monotone" dataKey="previousPeriod" stroke="#9333ea" name="Periode Sebelumnya" />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
