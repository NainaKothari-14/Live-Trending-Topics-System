import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, ThumbsUp, Eye, Flame, Sun, Moon } from "lucide-react";

const socket = io("https://live-trending-topics-system.onrender.com");

const TOPICS = ["#Tech", "#Sports", "#Music", "#Movies"];// Predefined topics

const TOPIC_ICONS = {// Icons for each topic can be removed or customized
  "#Tech": "💻",
  "#Sports": "⚽",
  "#Music": "🎵",
  "#Movies": "🎬"
};

// Theme-aware colors
const COLORS = {
  light: {
    "#Tech": "#6366f1",
    "#Sports": "#22c55e",
    "#Music": "#a855f7",
    "#Movies": "#eab308"
  },
  dark: {
    "#Tech": "#818cf8",
    "#Sports": "#7ede4aff",
    "#Music": "#c084fc",
    "#Movies": "#facc15"
  }
};

export default function App() {
  const [counts, setCounts] = useState({});
  const [trending, setTrending] = useState("");
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState(() => {
    // Check localStorage or system preference
    if (typeof window !== "undefined") { //It prevents errors during client side renderning
      const saved = localStorage.getItem("theme");//Get saved theme from localStorage
      if (saved) return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  //For setting the theme in localStorage
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    socket.on("counter_update", ({ topic, action, count }) => {
      setCounts((prev) => ({
        ...prev,
        [`${topic}_${action}`]: count//Update the count for the specific topic and action
      }));
    });

    socket.on("trending_update", (topic) => {
      setTrending(topic);
    });

    return () => {
      socket.off("counter_update");
      socket.off("trending_update");
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {//Update history every 2 seconds
      const dataPoint = {
        time: new Date().toLocaleTimeString(),
        ...TOPICS.reduce((acc, topic) => {
          acc[topic] = (counts[`${topic}_LIKE`] || 0) + (counts[`${topic}_VIEW`] || 0);
          return acc;
        }, {})
      };
      setHistory((prev) => [...prev.slice(-19), dataPoint]);//Keep only last 20 data points
    }, 2000);//2s interval

    return () => clearInterval(interval);
  }, [counts]);

  const sendAction = (topic, action) => {
    socket.emit("topic_action", { topic, action });
  };

  const getTotalEngagement = (topic) => {
    return (counts[`${topic}_LIKE`] || 0) + (counts[`${topic}_VIEW`] || 0);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isDark = theme === "dark";
  const colors = COLORS[theme];

  // Theme classes
  const themeClasses = {
    bg: isDark ? "bg-slate-900" : "bg-stone-50",
    header: isDark ? "bg-slate-800 border-slate-700" : "bg-white border-stone-200",
    card: isDark ? "bg-slate-800 border-slate-700" : "bg-white border-stone-200",
    cardHover: isDark ? "hover:border-slate-600" : "hover:border-stone-300",
    cardTrending: isDark ? "border-amber-500/50 ring-1 ring-amber-500/20" : "border-amber-300 ring-1 ring-amber-100",
    text: isDark ? "text-slate-100" : "text-stone-800",
    textMuted: isDark ? "text-slate-400" : "text-stone-500",
    textSubtle: isDark ? "text-slate-500" : "text-stone-400",
    button: isDark
      ? "bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200"
      : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700",
    buttonCount: isDark
      ? "bg-slate-800 border-slate-600 text-slate-400"
      : "bg-white border-stone-200 text-stone-500",
    badge: isDark ? "bg-slate-700 text-slate-300" : "bg-stone-100 text-stone-600",
    trendingBadge: isDark
      ? "bg-amber-900/30 border-amber-700/50 text-amber-400"
      : "bg-amber-50 border-amber-200 text-amber-800",
    hotBadge: isDark ? "bg-amber-900/40 text-amber-400" : "bg-amber-50 text-amber-700",
    progressBg: isDark ? "bg-slate-700" : "bg-stone-100",
    footer: isDark ? "border-slate-800" : "border-stone-200",
    grid: isDark ? "#334155" : "#e7e5e4",
    axis: isDark ? "#94a3b8" : "#a8a29e",
    tooltip: isDark
      ? { bg: "#1e293b", border: "#334155" }
      : { bg: "#fff", border: "#e7e5e4" },
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${themeClasses.header} border-b transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? "bg-slate-700" : "bg-stone-100"}`}>
                <TrendingUp className={`w-6 h-6 ${isDark ? "text-slate-300" : "text-stone-700"}`} />
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${themeClasses.text}`}>
                  Trending Topics
                </h1>
                <p className={`text-sm ${themeClasses.textMuted}`}>
                  Real-time engagement tracker
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {trending && (
                <div className={`flex items-center gap-2 border px-4 py-2 rounded-lg ${themeClasses.trendingBadge}`}>
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-medium">Trending: {trending}</span>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-lg border transition-all duration-200 ${isDark
                    ? "bg-slate-700 border-slate-600 hover:bg-slate-600 text-amber-400"
                    : "bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-600"
                  }`}
                aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Chart Section */}
        {history.length > 1 && (
          <section className={`${themeClasses.card} rounded-xl border p-6 mb-8 transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-medium ${themeClasses.text}`}>
                Engagement Over Time
              </h2>
              <span className={`text-xs px-3 py-1 rounded-full ${themeClasses.badge}`}>
                Live updates every 2s
              </span>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeClasses.grid} />
                <XAxis
                  dataKey="time"
                  stroke={themeClasses.axis}
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke={themeClasses.axis}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: themeClasses.tooltip.bg,
                    border: `1px solid ${themeClasses.tooltip.border}`,
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "13px",
                    color: isDark ? "#e2e8f0" : "#1c1917"
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "13px",
                    paddingTop: "20px",
                    color: isDark ? "#e2e8f0" : "#1c1917"
                  }}
                />
                {TOPICS.map((topic) => (
                  <Line
                    key={topic}
                    type="monotone"
                    dataKey={topic}
                    stroke={colors[topic]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: colors[topic] }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Topic Cards Grid */}
        <section>
          <h2 className={`text-lg font-medium ${themeClasses.text} mb-4`}>Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOPICS.map((topic) => {
              const total = getTotalEngagement(topic);
              const isTrending = trending === topic;
              const likes = counts[`${topic}_LIKE`] || 0;
              const views = counts[`${topic}_VIEW`] || 0;

              return (
                <div
                  key={topic}
                  className={`rounded-xl border p-6 transition-all duration-200 ${themeClasses.card} ${isTrending ? themeClasses.cardTrending : themeClasses.cardHover
                    }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{TOPIC_ICONS[topic]}</span>
                      <div>
                        <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
                          {topic}
                        </h3>
                        <p className={`text-sm ${themeClasses.textMuted}`}>
                          {total.toLocaleString()} total engagements
                        </p>
                      </div>
                    </div>

                    {isTrending && (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${themeClasses.hotBadge}`}>
                        <Flame className="w-3 h-3" />
                        Hot
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className={`h-1.5 rounded-full overflow-hidden ${themeClasses.progressBg}`}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((total / 100) * 100, 100)}%`,
                          backgroundColor: colors[topic]
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => sendAction(topic, "LIKE")}
                      className={`flex-1 group flex items-center justify-center gap-2 border font-medium py-3 px-4 rounded-lg transition-colors ${themeClasses.button}`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${themeClasses.textMuted} group-hover:text-rose-500 transition-colors`} />
                      <span>Like</span>
                      <span className={`ml-auto text-sm px-2 py-0.5 rounded border ${themeClasses.buttonCount}`}>
                        {likes.toLocaleString()}
                      </span>
                    </button>

                    <button
                      onClick={() => sendAction(topic, "VIEW")}
                      className={`flex-1 group flex items-center justify-center gap-2 border font-medium py-3 px-4 rounded-lg transition-colors ${themeClasses.button}`}
                    >
                      <Eye className={`w-4 h-4 ${themeClasses.textMuted} group-hover:text-blue-500 transition-colors`} />
                      <span>View</span>
                      <span className={`ml-auto text-sm px-2 py-0.5 rounded border ${themeClasses.buttonCount}`}>
                        {views.toLocaleString()}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t mt-12 ${themeClasses.footer} transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <p className={`text-center text-sm ${themeClasses.textSubtle}`}>
            Data refreshes automatically • {new Date().toLocaleDateString()}
          </p>
        </div>
      </footer>
    </div>
  );
}
