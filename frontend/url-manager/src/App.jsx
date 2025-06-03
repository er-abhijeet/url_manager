import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Link,
  Share2,
  Eye,
  Globe,
  Smartphone,
  Monitor,
  Shield,
  Copy,
  Plus,
  TrendingUp,
  Users,
  MousePointer,
} from "lucide-react";

const URLManager = () => {
  const [urls, setUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [newUrl, setNewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [copySuccess, setCopySuccess] = useState(""); 
  const [visitData, setVisitData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [osData, setOsData] = useState([]);
  const [visitDetails, setVisitDetails] = useState([]);
  const API_BASE_URL = "http://192.168.31.232:3003";
  const ip = API_BASE_URL + "/";

  
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B"];

  useEffect(() => {
    
    const fetchUrls = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/urls`);
        const data = await response.json();
        setUrls(data);
        if (data.length > 0) {
          setSelectedUrl(data[0]);
        }
      } catch (error) {
        console.error("Error fetching URLs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrls();
  }, []);

  useEffect(() => {
    
    const fetchAnalyticsData = async () => {
  if (!selectedUrl) return;

  try {
    setIsLoading(true);
    
    const visitsResponse = await fetch(`${API_BASE_URL}/analytics/${selectedUrl.short_url}/visits-by-date`);
    const visitsData = await visitsResponse.json();
    setVisitData(visitsData.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }), 
      visits: Number(item.visits) 
    })));
    // console.log('Visit Data:', visitsData); 


    
    const devicesResponse = await fetch(`${API_BASE_URL}/analytics/${selectedUrl.short_url}/devices`);
    const devicesData = await devicesResponse.json();
    setDeviceData(devicesData.map((item, index) => ({
      ...item,
      value: Number(item.value), 
      color: COLORS[index % COLORS.length]
    })));
    // console.log('Device Data:', devicesData); 

    
    const osResponse = await fetch(`${API_BASE_URL}/analytics/${selectedUrl.short_url}/oses`);
    const osData = await osResponse.json();
    setOsData(osData);

    
    const visitDetailsResponse = await fetch(`${API_BASE_URL}/analytics/${selectedUrl.short_url}/visits`);
    const visitDetailsData = await visitDetailsResponse.json();
    setVisitDetails(visitDetailsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
  } finally {
    setIsLoading(false);
  }
};

    fetchAnalyticsData();
  }, [selectedUrl]);

  const createShortUrl = async () => {
    if (!newUrl.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ full_url: newUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to create short URL");
      }

      const newShortUrl = await response.json();
      setUrls([
        {
          short_url: newShortUrl.short_url.split("/").pop(),
          full_url: newShortUrl.full_url,
          created_at: null, 
          visits: 0,
        },
        ...urls,
      ]);
      setNewUrl("");
    } catch (error) {
      console.error("Error creating short URL:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (short_url) => {
    navigator.clipboard.writeText(`${ip}${short_url}`);
    setCopySuccess(short_url); 
    setTimeout(() => setCopySuccess(""), 500);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <Link className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  URL Manager
                </h1>
                <p className="text-sm text-gray-500">
                  Create, manage, and track your short URLs
                </p>
              </div>
            </div>

            <nav className="flex space-x-8">
              {["dashboard", "urls", "analytics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                    activeTab === tab
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Create URL Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Create Short URL
              </h2>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Enter your long URL here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={createShortUrl}
                  disabled={isLoading || !newUrl.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>{isLoading ? "Creating...." : "Create"}</span>
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Link}
                title="Total URLs"
                value={urls.length}
                subtitle="Active short URLs"
                color="indigo"
              />
              <StatCard
                icon={MousePointer}
                title="Total Clicks"
                value={urls.reduce(
                  (sum, url) => parseInt(sum) + parseInt(url.visits),
                  0
                )}
                subtitle="All time clicks"
                color="green"
              />
              <StatCard
                icon={TrendingUp}
                title="Avg Clicks/URL"
                value={
                  urls.reduce(
                    (sum, url) => parseInt(sum) + parseInt(url.visits),
                    0
                  ) / (urls.length || 1)
                }
                subtitle="Performance metric"
                color="yellow"
              />
              <StatCard
                icon={Users}
                title="Today's Visits"
                value={visitData
                  .filter(
                    (v) =>
                      new Date(v.date).toDateString() ===
                      new Date().toDateString()
                  )
                  .reduce((sum, v) => parseInt(sum) + parseInt(v.visits), 0)}
                subtitle="Last 24 hours"
                color="purple"
              />
            </div>

            {/* Recent URLs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent URLs
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {urls.slice(0, 5).map((url) => (
                  <div
                    key={url.short_url}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Link className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {ip + url.short_url}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-md">
                              {url.full_url}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {url.visits} clicks
                          </p>
                          <p className="text-xs text-gray-500">
                            {url.created_at || "N/A"}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(url.short_url)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
                        >
                          <Copy className="w-4 h-4" />
                          {copySuccess === url.short_url && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                              Copied!
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "urls" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  All URLs
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Short URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Original URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {urls.map((url) => (
                      <tr key={url.short_url} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                              <Link className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {ip + url.short_url}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500 truncate max-w-xs block">
                            {url.full_url}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">
                              {url.visits}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {url.created_at || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => copyToClipboard(url.short_url)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
                            >
                              <Copy className="w-4 h-4" />
                              {copySuccess === url.short_url && (
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                                  Copied!
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                                </div>
                              )}
                            </button>
                            <button
                              onClick={() => setSelectedUrl(url)}
                              className="p-2 text-indigo-400 hover:text-indigo-600 transition-colors"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* URL Selector */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Select URL for Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {urls.map((url) => (
                  <div
                    key={url.short_url}
                    onClick={() => setSelectedUrl(url)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedUrl?.short_url === url.short_url
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          selectedUrl?.short_url === url.short_url
                            ? "bg-indigo-200"
                            : "bg-gray-100"
                        }`}
                      >
                        <Link
                          className={`w-4 h-4 ${
                            selectedUrl?.short_url === url.short_url
                              ? "text-indigo-600"
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          /{url.short_url}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {url.full_url}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Eye className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {url.visits} visits
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {urls.length === 0 && (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No URLs created yet. Go to Dashboard to create your first
                    URL!
                  </p>
                </div>
              )}
            </div>

            {selectedUrl && (
              <div className="space-y-8">
                {/* Analytics Header */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Analytics Dashboard
                      </h3>
                      <p className="text-sm text-indigo-600 font-medium mt-1">
                        {ip + selectedUrl.short_url}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 max-w-2xl truncate">
                        {selectedUrl.full_url}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">
                        {selectedUrl.visits}
                      </p>
                      <p className="text-sm text-gray-500">Total Visits</p>
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Visits Over Time */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Visits Over Time
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={visitData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="visits"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                          activeDot={{
                            r: 6,
                            stroke: "#3b82f6",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Device Types */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Device Types
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Operating Systems */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Operating Systems
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={osData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="visits"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Recent Visits */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Visits
                    </h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {visitDetails.map((visit) => (
                        <div
                          key={visit.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {visit.device === "Mobile" ? (
                                <Smartphone className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Monitor className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {visit.ip}
                              </p>
                              <p className="text-xs text-gray-500">
                                {visit.device} • {visit.os}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {visit.vpn && (
                              <div className="p-1 bg-orange-100 rounded">
                                <Shield className="w-3 h-3 text-orange-600" />
                              </div>
                            )}
                            <span className="text-xs text-gray-500">
                              {visit.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default URLManager;
