import { useState, useEffect, useRef } from "react";

const BACKEND = "https://lights-backend-hw0t.onrender.com";

const PLATFORMS = {
  tiktok: {
    label: "TikTok", icon: "♪", color: "#39ff14",
    services: [
      { id: "tt_followers", label: "Followers", icon: "◎", desc: "Boost your TikTok profile credibility with real-looking followers delivered fast.",
        tiers: [{ qty: 100, price: 500 }, { qty: 500, price: 2500 }, { qty: 1000, price: 5000 }, { qty: 5000, price: 25000 }, { qty: 10000, price: 50000 }] },
      { id: "tt_likes", label: "Likes", icon: "◈", desc: "Push your videos higher in TikTok's algorithm with engagement signals.",
        tiers: [{ qty: 100, price: 280 }, { qty: 500, price: 1400 }, { qty: 1000, price: 2800 }, { qty: 5000, price: 14000 }, { qty: 10000, price: 28000 }] },
      { id: "tt_views", label: "Views", icon: "◉", desc: "Hit TikTok view thresholds fast and trigger the algorithm.",
        tiers: [{ qty: 1000, price: 320 }, { qty: 5000, price: 1600 }, { qty: 10000, price: 3200 }, { qty: 50000, price: 16000 }, { qty: 100000, price: 32000 }] },
      { id: "tt_reposts", label: "Reposts", icon: "◫", desc: "Spread your content across TikTok networks and expand reach.",
        tiers: [{ qty: 50, price: 40 }, { qty: 100, price: 80 }, { qty: 500, price: 400 }, { qty: 1000, price: 800 }, { qty: 5000, price: 4000 }] },
    ],
  },
  youtube: {
    label: "YouTube", icon: "▶", color: "#ff3939",
    services: [
      { id: "yt_subscribers", label: "Subscribers", icon: "◎", desc: "Grow your YouTube channel subscriber count and boost social proof.",
        tiers: [{ qty: 100, price: 3000 }, { qty: 500, price: 15000 }, { qty: 1000, price: 30000 }, { qty: 5000, price: 150000 }, { qty: 10000, price: 300000 }] },
      { id: "yt_likes", label: "Likes", icon: "◈", desc: "Increase your video like count and improve YouTube ranking signals.",
        tiers: [{ qty: 100, price: 250 }, { qty: 500, price: 1250 }, { qty: 1000, price: 2500 }, { qty: 5000, price: 12500 }, { qty: 10000, price: 25000 }] },
      { id: "yt_shares", label: "Shares", icon: "◫", desc: "Amplify your video reach across platforms with share boosts.",
        tiers: [{ qty: 100, price: 360 }, { qty: 500, price: 1800 }, { qty: 1000, price: 3600 }, { qty: 5000, price: 18000 }, { qty: 10000, price: 36000 }] },
    ],
  },
  twitter: {
    label: "Twitter/X", icon: "✕", color: "#1d9bf0",
    services: [
      { id: "tw_followers", label: "Followers", icon: "◎", desc: "Grow your Twitter/X following and boost your profile authority fast.",
        tiers: [{ qty: 100, price: 234 }, { qty: 500, price: 1168 }, { qty: 1000, price: 2336 }, { qty: 5000, price: 11680 }, { qty: 10000, price: 23360 }] },
      { id: "tw_likes", label: "Likes", icon: "◈", desc: "Increase your tweet like count and boost engagement signals.",
        tiers: [{ qty: 100, price: 346 }, { qty: 500, price: 1728 }, { qty: 1000, price: 3456 }, { qty: 5000, price: 17280 }, { qty: 10000, price: 34560 }] },
      { id: "tw_retweets", label: "Retweets", icon: "◫", desc: "Amplify your tweets and expand your reach across Twitter/X.",
        tiers: [{ qty: 100, price: 317 }, { qty: 500, price: 1584 }, { qty: 1000, price: 3168 }, { qty: 5000, price: 15840 }, { qty: 10000, price: 31680 }] },
    ],
  },
  instagram: {
    label: "Instagram", icon: "◑", color: "#e1306c",
    services: [
      { id: "ig_followers", label: "Followers", icon: "◎", desc: "Boost your Instagram profile with real-looking followers delivered fast.",
        tiers: [{ qty: 100, price: 90 }, { qty: 500, price: 448 }, { qty: 1000, price: 896 }, { qty: 5000, price: 4480 }, { qty: 10000, price: 8960 }] },
      { id: "ig_likes", label: "Likes", icon: "◈", desc: "Increase your post like count and improve Instagram ranking.",
        tiers: [{ qty: 100, price: 24 }, { qty: 500, price: 120 }, { qty: 1000, price: 240 }, { qty: 5000, price: 1200 }, { qty: 10000, price: 2400 }] },
      { id: "ig_views", label: "Views", icon: "◉", desc: "Boost your Instagram video and reel view counts instantly.",
        tiers: [{ qty: 10000, price: 45 }, { qty: 50000, price: 224 }, { qty: 100000, price: 448 }, { qty: 500000, price: 2240 }, { qty: 1000000, price: 4480 }] },
    ],
  },
};

const STATUS_STEPS = ["Order Received", "Payment Confirmed", "Processing", "Delivering", "Completed"];
const ADMIN_PASSWORD_KEY = "lights_admin_token";

function formatNaira(n) { return "₦" + n.toLocaleString("en-NG"); }
function genOrderId() { return "LGT-" + Date.now().toString(36).toUpperCase(); }

// ── PAYMENT MODAL ─────────────────────────────────────────────────────────────
function PaymentModal({ order, onClose }) {
  const [step, setStep] = useState("loading");
  const [error, setError] = useState(null);
  const ac = PLATFORMS[order.platform]?.color || "#39ff14";

  useEffect(() => {
    fetch(`${BACKEND}/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: order.id, platform: order.platform, service: order.service,
        qty: order.qty, price: order.price, username: order.username,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setStep("error"); return; }
        window.location.href = data.authorization_url;
      })
      .catch(() => { setError("Could not connect to server. Try again."); setStep("error"); });
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.93)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#0c0c0c", border: `1px solid ${ac}33`, width: "100%", maxWidth: 460, padding: 36, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 18, background: "none", border: "none", color: "#444", fontSize: 20, cursor: "pointer" }}>✕</button>
        {step === "loading" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 9, color: ac, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>Preparing Payment</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#555", marginBottom: 16 }}>Please wait...</div>
            <div style={{ fontSize: 10, color: "#333" }}>You'll be redirected to Paystack to complete your payment securely.</div>
          </div>
        )}
        {step === "error" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ color: "#ff3939", fontSize: 13, marginBottom: 16 }}>{error}</div>
            <button onClick={onClose} style={{ background: "#ff3939", color: "#000", border: "none", padding: "12px 24px", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, cursor: "pointer" }}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ORDER TRACKER ─────────────────────────────────────────────────────────────
function OrderTracker({ initId, onBack }) {
  const [inputId, setInputId] = useState(initId || "");
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const lookup = async (id) => {
    if (!id.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/order/${id.trim().toUpperCase()}`);
      const data = await res.json();
      setOrder(data.error ? null : data);
    } catch { setOrder(null); }
    setSearched(true);
    setLoading(false);
  };

  useEffect(() => { if (initId) lookup(initId); }, []);

  useEffect(() => {
    if (!order) return;
    clearInterval(intervalRef.current);
    if (order.status >= STATUS_STEPS.length - 1) return;
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND}/order/${order.id}`);
        const data = await res.json();
        if (!data.error) setOrder(data);
        if (data.status >= STATUS_STEPS.length - 1) clearInterval(intervalRef.current);
      } catch { }
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [order?.id, order?.status]);

  const ac = order ? (PLATFORMS[order.platform]?.color || "#39ff14") : "#39ff14";

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#f0f0f0", fontFamily: "'DM Mono', monospace", paddingTop: 80 }}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "60px 28px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 44, display: "flex", alignItems: "center", gap: 8 }}>← Back</button>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#39ff14", textTransform: "uppercase", marginBottom: 8 }}>Order Tracker</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, marginBottom: 36 }}>TRACK YOUR ORDER</h1>
        <div style={{ display: "flex", marginBottom: 36 }}>
          <input value={inputId} onChange={e => setInputId(e.target.value)} onKeyDown={e => e.key === "Enter" && lookup(inputId)}
            placeholder="Enter Order ID  e.g. LGT-ABC123"
            style={{ flex: 1, background: "#0c0c0c", border: "1px solid #1a1a1a", borderRight: "none", color: "#f0f0f0", padding: "13px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none" }} />
          <button onClick={() => lookup(inputId)} style={{ background: "#39ff14", color: "#000", border: "none", padding: "13px 22px", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: "0.1em", cursor: "pointer" }}>
            {loading ? "..." : "Track"}
          </button>
        </div>
        {searched && !order && !loading && <div style={{ color: "#333", fontSize: 12 }}>No order found with that ID.</div>}
        {order && (
          <div style={{ border: `1px solid ${ac}33`, background: "#0a0a0a", padding: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
              {[["Order ID", order.id, ac], ["Service", `${order.qty?.toLocaleString()} ${order.service}`, "#f0f0f0"], ["Amount", formatNaira(order.price), "#f0f0f0"]].map(([l, v, c]) => (
                <div key={l}>
                  <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>{l}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: c, wordBreak: "break-all" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ position: "relative", paddingLeft: 4 }}>
              <div style={{ position: "absolute", left: 19, top: 20, bottom: 20, width: 1, background: "#141414" }} />
              {STATUS_STEPS.map((step, i) => {
                const done = i <= order.status;
                const active = i === order.status;
                return (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: i < STATUS_STEPS.length - 1 ? 22 : 0, position: "relative", zIndex: 1 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: `2px solid ${done ? ac : "#1e1e1e"}`, background: done ? ac : "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#000", fontWeight: 700, boxShadow: active ? `0 0 14px ${ac}99` : "none", transition: "all 0.5s" }}>
                      {done && "✓"}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: done ? "#f0f0f0" : "#2a2a2a", transition: "color 0.5s" }}>{step}</div>
                      {active && i < STATUS_STEPS.length - 1 && <div style={{ fontSize: 9, color: ac, marginTop: 2 }}>In progress...</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ADMIN LOGIN ───────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockLeft, setLockLeft] = useState(0);
  const lockRef = useRef(null);

  const tryLogin = async () => {
    if (locked || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/admin-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.token) { localStorage.setItem(ADMIN_PASSWORD_KEY, data.token); onLogin(data.token); }
      else {
        const a = attempts + 1; setAttempts(a); setError(true); setPw("");
        setTimeout(() => setError(false), 2200);
        if (a >= 5) {
          setLocked(true); setLockLeft(30);
          lockRef.current = setInterval(() => setLockLeft(l => { if (l <= 1) { clearInterval(lockRef.current); setLocked(false); setAttempts(0); return 0; } return l - 1; }), 1000);
        }
      }
    } catch { setError(true); setTimeout(() => setError(false), 2200); }
    setLoading(false);
  };

  useEffect(() => () => clearInterval(lockRef.current), []);

  return (
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace" }}>
      <div style={{ width: 340, padding: 44, border: "1px solid #141414", background: "#0a0a0a" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: "0.2em" }}>LIGHTS</div>
          <div style={{ fontSize: 9, color: "#292929", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 4 }}>Admin Access</div>
        </div>
        {locked ? (
          <div style={{ textAlign: "center", color: "#ff3939", fontSize: 11, lineHeight: 1.8 }}>
            Too many failed attempts.<br />
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, display: "block", marginTop: 8 }}>{lockLeft}s</span>
          </div>
        ) : (<>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && tryLogin()}
            placeholder="Password"
            style={{ width: "100%", background: "#111", border: `1px solid ${error ? "#ff393988" : "#1a1a1a"}`, color: "#f0f0f0", padding: "13px 16px", fontFamily: "'DM Mono', monospace", fontSize: 13, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
          {error && <div style={{ color: "#ff3939", fontSize: 9, marginBottom: 10 }}>Incorrect. {5 - attempts} attempt{5 - attempts !== 1 ? "s" : ""} remaining.</div>}
          <button onClick={tryLogin} style={{ width: "100%", background: "#39ff14", color: "#000", border: "none", padding: "13px", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: "0.1em", cursor: "pointer" }}>
            {loading ? "Checking..." : "Enter"}
          </button>
        </>)}
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
function AdminDashboard({ token, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${BACKEND}/admin/orders`, { headers: { "x-admin-token": token } });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); const t = setInterval(fetchOrders, 10000); return () => clearInterval(t); }, []);

  const totalRev = orders.reduce((s, o) => s + (o.price || 0), 0);
  const completed = orders.filter(o => o.status === STATUS_STEPS.length - 1).length;
  const processing = orders.filter(o => o.status > 0 && o.status < STATUS_STEPS.length - 1).length;

  const platformRevenue = Object.keys(PLATFORMS).map(p => ({
    key: p,
    label: PLATFORMS[p].label,
    color: PLATFORMS[p].color,
    rev: orders.filter(o => o.platform === p).reduce((s, o) => s + (o.price || 0), 0)
  }));

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#f0f0f0", fontFamily: "'DM Mono', monospace" }}>
      <style>{`.arow{border-bottom:1px solid #0d0d0d;transition:background 0.15s}.arow:hover{background:#0c0c0c}`}</style>
      <div style={{ borderBottom: "1px solid #0d0d0d", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(5,5,5,0.97)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#39ff14", display: "inline-block", boxShadow: "0 0 8px #39ff14" }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: "0.2em" }}>LIGHTS</span>
          <span style={{ fontSize: 8, color: "#252525", letterSpacing: "0.25em", textTransform: "uppercase", marginLeft: 6 }}>Admin</span>
        </div>
        <button onClick={onLogout} style={{ background: "none", border: "1px solid #141414", color: "#444", padding: "8px 16px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>Logout</button>
      </div>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[["Total Revenue", formatNaira(totalRev), "#39ff14"], ["Total Orders", orders.length, "#f0f0f0"], ["Completed", completed, "#39ff14"], ["Processing", processing, "#ffaa00"]].map(([l, v, c]) => (
            <div key={l} style={{ background: "#0b0b0b", border: "1px solid #141414", padding: "22px 20px" }}>
              <div style={{ fontSize: 8, color: "#333", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10 }}>{l}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: c }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 36 }}>
          {platformRevenue.map(({ key, label, color, rev }) => (
            <div key={key} style={{ background: "#0b0b0b", border: `1px solid ${color}18`, padding: "16px 18px" }}>
              <div style={{ fontSize: 8, color: "#444", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color }}>{formatNaira(rev)}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: "#39ff14", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>All Orders ({orders.length})</div>
        {loading ? <div style={{ color: "#333", fontSize: 12, padding: "48px 0" }}>Loading orders...</div>
          : orders.length === 0 ? <div style={{ color: "#222", fontSize: 12, padding: "48px 0" }}>No orders yet.</div>
          : (
            <div style={{ border: "1px solid #111", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 0.8fr 0.8fr 0.7fr 1fr 1fr", padding: "11px 18px", background: "#090909", fontSize: 8, color: "#2a2a2a", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                {["Order ID", "Platform", "Service", "Qty", "Amount", "Status"].map(h => <div key={h}>{h}</div>)}
              </div>
              {orders.map(o => {
                const sc = o.status === STATUS_STEPS.length - 1 ? "#39ff14" : o.status > 0 ? "#ffaa00" : "#444";
                const pc = PLATFORMS[o.platform]?.color || "#888";
                return (
                  <div key={o.id} className="arow" style={{ display: "grid", gridTemplateColumns: "1.6fr 0.8fr 0.8fr 0.7fr 1fr 1fr", padding: "15px 18px", fontSize: 11, alignItems: "center" }}>
                    <div style={{ color: "#39ff14", fontFamily: "'Bebas Neue', sans-serif", fontSize: 14 }}>{o.id}</div>
                    <div style={{ color: pc, textTransform: "capitalize", fontSize: 10 }}>{o.platform}</div>
                    <div style={{ color: "#888" }}>{o.service}</div>
                    <div style={{ color: "#666" }}>{o.qty?.toLocaleString()}</div>
                    <div style={{ color: "#ccc" }}>{formatNaira(o.price)}</div>
                    <div style={{ color: sc, fontSize: 9 }}>{STATUS_STEPS[o.status] || "Unknown"}</div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [platform, setPlatform] = useState("tiktok");
  const [activeServiceId, setActiveServiceId] = useState("tt_followers");
  const [selectedTier, setSelectedTier] = useState(null);
  const [username, setUsername] = useState("");
  const [pendingOrder, setPendingOrder] = useState(null);
  const [trackId, setTrackId] = useState(null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_PASSWORD_KEY));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference") || params.get("trxref");
    if (ref) {
      window.history.replaceState({}, "", window.location.pathname);
      setTrackId(ref.toUpperCase());
      setPage("tracker");
    }
  }, []);

  const cp = PLATFORMS[platform];
  const ac = cp.color;
  const cs = cp.services.find(s => s.id === activeServiceId) || cp.services[0];

  const switchPlatform = (p) => { setPlatform(p); setActiveServiceId(PLATFORMS[p].services[0].id); setSelectedTier(null); };

  const handlePlaceOrder = () => {
    if (!selectedTier || !username.trim()) return;
    setPendingOrder({ id: genOrderId(), platform, service: cs.label, qty: selectedTier.qty, price: selectedTier.price, username: username.trim() });
  };

  const handleAdminLogin = (token) => { setAdminToken(token); setPage("admin"); };
  const handleAdminLogout = () => { localStorage.removeItem(ADMIN_PASSWORD_KEY); setAdminToken(null); setPage("home"); };

  if (page === "tracker") return <OrderTracker initId={trackId} onBack={() => { setPage("home"); setTrackId(null); }} />;
  if (page === "admin") return adminToken ? <AdminDashboard token={adminToken} onLogout={handleAdminLogout} /> : <AdminLogin onLogin={handleAdminLogin} />;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#f0f0f0", fontFamily: "'DM Mono', monospace", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#39ff14}
        .nl{color:#484848;background:none;border:none;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;transition:color .2s}.nl:hover{color:#ccc}
        .st{background:transparent;border:1px solid #141414;color:#383838;padding:11px 18px;cursor:pointer;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.15em;text-transform:uppercase;transition:all .15s;display:flex;align-items:center;gap:7px}.st:hover{color:#999}
        .tr{border:1px solid #141414;padding:15px 18px;cursor:pointer;background:#0a0a0a;display:flex;justify-content:space-between;align-items:center;transition:all .15s}.tr:hover{border-color:#222}
        .inf{width:100%;background:#0c0c0c;border:1px solid #1a1a1a;color:#f0f0f0;padding:12px 15px;font-family:'DM Mono',monospace;font-size:12px;outline:none;transition:border-color .2s}.inf:focus{border-color:#272727}.inf::placeholder{color:#252525}
        .obtn{width:100%;border:none;padding:13px;font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.1em;transition:all .2s}
        @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fi{animation:fi .35s ease forwards}
        @keyframes pd{0%,100%{opacity:1}50%{opacity:.25}}
        .plat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
        @media(max-width:700px){.g2{grid-template-columns:1fr!important}.plat-grid{grid-template-columns:repeat(2,1fr)}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "17px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #0c0c0c", background: "rgba(8,8,8,0.96)", backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: ac, display: "inline-block", boxShadow: `0 0 9px ${ac}`, animation: "pd 2.5s infinite", transition: "background .3s" }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: "0.2em" }}>LIGHTS</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <button className="nl" onClick={() => document.getElementById("svc")?.scrollIntoView({ behavior: "smooth" })}>Services</button>
          <button className="nl" onClick={() => { setTrackId(null); setPage("tracker"); }}>Track Order</button>
          <button className="nl" onClick={() => setPage("admin")} style={{ color: ac }}>Admin</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 130, paddingBottom: 70, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "5%", right: "-8%", width: 560, height: 560, background: `radial-gradient(circle, ${ac}07 0%, transparent 65%)`, pointerEvents: "none", transition: "background .4s" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 26, height: 1, background: ac }} />
            <span style={{ fontSize: 8, letterSpacing: "0.32em", color: ac, textTransform: "uppercase" }}>Growth Platform · Nigeria</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(68px,12vw,144px)", lineHeight: 0.87, letterSpacing: "-0.01em", marginBottom: 24 }}>
            TURN ON<br />
            <span style={{ color: ac, textShadow: `0 0 50px ${ac}44`, transition: "all .3s" }}>YOUR</span><br />
            LIGHTS.
          </h1>
          <p style={{ maxWidth: 420, color: "#3e3e3e", fontSize: 11, lineHeight: 1.9, letterSpacing: "0.04em", marginBottom: 32 }}>
            TikTok, YouTube, Twitter/X & Instagram growth tools. Followers, likes, views and more — delivered fast. Pay in Naira.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => document.getElementById("svc")?.scrollIntoView({ behavior: "smooth" })} style={{ background: ac, color: "#000", border: "none", padding: "12px 26px", fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: "0.1em", cursor: "pointer", transition: "all .3s" }}
              onMouseOver={e => e.currentTarget.style.boxShadow = `0 0 28px ${ac}66`}
              onMouseOut={e => e.currentTarget.style.boxShadow = "none"}>Browse Services</button>
            <button onClick={() => { setTrackId(null); setPage("tracker"); }} style={{ background: "transparent", color: "#444", border: "1px solid #141414", padding: "12px 26px", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.12em", cursor: "pointer", textTransform: "uppercase", transition: "all .2s" }}
              onMouseOver={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.color = "#aaa"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = "#141414"; e.currentTarget.style.color = "#444"; }}>Track Order</button>
          </div>
          <div style={{ display: "flex", gap: 36, marginTop: 56 }}>
            {[["4", "Platforms"], ["₦", "Naira Pay"], ["< 1hr", "Start Time"]].map(([n, l]) => (
              <div key={l} style={{ borderLeft: `2px solid ${ac}`, paddingLeft: 14 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28 }}>{n}</div>
                <div style={{ fontSize: 8, color: "#2e2e2e", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="svc" style={{ padding: "72px 0", borderTop: "1px solid #0c0c0c" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 26, height: 1, background: ac }} />
            <span style={{ fontSize: 8, letterSpacing: "0.32em", color: ac, textTransform: "uppercase" }}>Services</span>
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, marginBottom: 32 }}>CHOOSE YOUR BOOST</h2>

          {/* Platform grid */}
          <div className="plat-grid" style={{ marginBottom: 28 }}>
            {Object.entries(PLATFORMS).map(([key, p]) => (
              <button key={key} onClick={() => switchPlatform(key)} style={{ background: platform === key ? p.color + "10" : "transparent", border: `1px solid ${platform === key ? p.color : "#141414"}`, color: platform === key ? p.color : "#383838", padding: "11px 16px", cursor: "pointer", fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: "0.08em", transition: "all .2s", display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
                <span>{p.icon}</span>{p.label}
              </button>
            ))}
          </div>

          {/* Service tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 36 }}>
            {cp.services.map(s => (
              <button key={s.id} className="st"
                style={activeServiceId === s.id ? { borderColor: ac, color: ac, background: ac + "08" } : {}}
                onClick={() => { setActiveServiceId(s.id); setSelectedTier(null); }}>
                <span style={{ fontSize: 13 }}>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>

          <div className="g2 fi" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }} key={activeServiceId}>
            <div>
              <p style={{ fontSize: 10, color: "#363636", lineHeight: 1.9, letterSpacing: "0.04em", marginBottom: 20 }}>{cs.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {cs.tiers.map(t => (
                  <div key={t.qty} className="tr"
                    style={selectedTier?.qty === t.qty ? { borderColor: ac, background: ac + "07" } : {}}
                    onClick={() => setSelectedTier(t)}>
                    <div>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: selectedTier?.qty === t.qty ? ac : "#f0f0f0", transition: "color .15s" }}>{t.qty.toLocaleString()}</span>
                      <span style={{ fontSize: 8, color: "#292929", marginLeft: 7, letterSpacing: "0.15em", textTransform: "uppercase" }}>{cs.label}</span>
                    </div>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: selectedTier?.qty === t.qty ? ac : "#484848", transition: "color .15s" }}>{formatNaira(t.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ border: "1px solid #141414", padding: 26, background: "#0a0a0a", position: "sticky", top: 82 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.22em", color: "#272727", textTransform: "uppercase", marginBottom: 14 }}>Order Summary</div>
                <div style={{ minHeight: 48, marginBottom: 22 }}>
                  {selectedTier ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26 }}>{selectedTier.qty.toLocaleString()} {cs.label}</span>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: ac }}>{formatNaira(selectedTier.price)}</span>
                    </div>
                  ) : <div style={{ color: "#1e1e1e", fontSize: 11 }}>← Pick a package</div>}
                </div>
                <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "#272727", textTransform: "uppercase", marginBottom: 8 }}>
                  {cs.id.includes("followers") || cs.id.includes("subscribers") ? "Username" : "Post URL or Username"}
                </div>
                <input className="inf" placeholder="@yourusername or paste post URL" value={username} onChange={e => setUsername(e.target.value)} style={{ marginBottom: 10 }} />
                <button className="obtn"
                  disabled={!selectedTier || !username.trim()}
                  onClick={handlePlaceOrder}
                  style={{ background: (!selectedTier || !username.trim()) ? "#111" : ac, color: (!selectedTier || !username.trim()) ? "#2a2a2a" : "#000", cursor: (!selectedTier || !username.trim()) ? "not-allowed" : "pointer" }}>
                  {selectedTier ? `Pay ${formatNaira(selectedTier.price)}` : "Select a Package"}
                </button>
                <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 7 }}>
                  {[["⚡", "Starts within minutes"], ["🔒", "No password needed"], ["💳", "Pay securely via Paystack"]].map(([i, t]) => (
                    <div key={t} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 10 }}>{i}</span>
                      <span style={{ fontSize: 9, color: "#2e2e2e", lineHeight: 1.5 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "72px 0", borderTop: "1px solid #0c0c0c", background: "#050505" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 26, height: 1, background: ac }} />
            <span style={{ fontSize: 8, letterSpacing: "0.32em", color: ac, textTransform: "uppercase" }}>Process</span>
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, marginBottom: 44 }}>THREE STEPS.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            {[["01", "Pick your package", "Choose platform, service type, and quantity from TikTok, YouTube, Twitter/X or Instagram."], ["02", "Pay securely", "You'll be redirected to Paystack to pay via card or bank transfer. Fast and secure."], ["03", "Track it live", "After payment you'll be redirected back to track your order in real time."]].map(([n, t, d]) => (
              <div key={n} style={{ padding: "32px 24px", border: "1px solid #0c0c0c", background: "#080808", transition: "border-color .2s" }}
                onMouseOver={e => e.currentTarget.style.borderColor = ac + "1e"}
                onMouseOut={e => e.currentTarget.style.borderColor = "#0c0c0c"}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: ac, opacity: 0.18, lineHeight: 1, marginBottom: 14 }}>{n}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: "0.04em", marginBottom: 9 }}>{t}</div>
                <div style={{ fontSize: 10, color: "#333", lineHeight: 1.8 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #0c0c0c", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: "0.2em", color: "#1e1e1e" }}>LIGHTS</span>
        <span style={{ fontSize: 8, color: "#161616", letterSpacing: "0.1em" }}>© 2026 LIGHTS</span>
        <button className="nl" onClick={() => setPage("admin")} style={{ color: ac }}>Admin ↗</button>
      </footer>

      {pendingOrder && <PaymentModal order={pendingOrder} onClose={() => setPendingOrder(null)} />}
    </div>
  );
}
