import { useState, useEffect, useRef } from "react";

const TARIFF_RATES = {
  china: { name: "China", rate: 145, label: "145%" },
  eu: { name: "European Union", rate: 20, label: "20%" },
  japan: { name: "Japan", rate: 24, label: "24%" },
  south_korea: { name: "South Korea", rate: 25, label: "25%" },
  india: { name: "India", rate: 26, label: "26%" },
  vietnam: { name: "Vietnam", rate: 46, label: "46%" },
  taiwan: { name: "Taiwan", rate: 32, label: "32%" },
  thailand: { name: "Thailand", rate: 36, label: "36%" },
  indonesia: { name: "Indonesia", rate: 32, label: "32%" },
  uk: { name: "United Kingdom", rate: 10, label: "10%" },
  canada: { name: "Canada (IEEPA fentanyl)", rate: 25, label: "25%" },
  mexico: { name: "Mexico (IEEPA fentanyl)", rate: 25, label: "25%" },
  cambodia: { name: "Cambodia", rate: 49, label: "49%" },
  bangladesh: { name: "Bangladesh", rate: 37, label: "37%" },
  other_reciprocal: { name: "Other (Reciprocal baseline)", rate: 10, label: "10%" },
};

const INTEREST_RATE_HIGH = 0.06;
const INTEREST_RATE_LOW = 0.045;
const SCOTUS_DATE = new Date("2026-02-20");

function formatCurrency(val) {
  if (val >= 1e6) return "$" + (val / 1e6).toFixed(2) + "M";
  if (val >= 1e3) return "$" + (val / 1e3).toFixed(1) + "K";
  return "$" + val.toFixed(2);
}

function formatCurrencyFull(val) {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function daysBetween(d1, d2) {
  return Math.max(0, Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
}

export default function TariffRefundCalculator() {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState("");
  const [customRate, setCustomRate] = useState("");
  const [importValue, setImportValue] = useState("");
  const [entryCount, setEntryCount] = useState("1");
  const [startMonth, setStartMonth] = useState("2025-04");
  const [endMonth, setEndMonth] = useState("2026-02");
  const [showResults, setShowResults] = useState(false);
  const [leadForm, setLeadForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", company: "", phone: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [animateResults, setAnimateResults] = useState(false);
  const resultsRef = useRef(null);

  const effectiveRate = country === "custom"
    ? parseFloat(customRate) || 0
    : TARIFF_RATES[country]?.rate || 0;

  const totalImport = parseFloat(importValue?.replace(/,/g, "")) || 0;
  const dutiesPaid = totalImport * (effectiveRate / 100);
  const interestRate = dutiesPaid > 10000 ? INTEREST_RATE_LOW : INTEREST_RATE_HIGH;

  const now = new Date();
  const daysSinceRuling = daysBetween(SCOTUS_DATE, now);
  const interestAccrued = dutiesPaid * (interestRate / 365) * daysSinceRuling;
  const totalRefund = dutiesPaid + interestAccrued;
  const dailyInterest = dutiesPaid * (interestRate / 365);

  function handleCalculate() {
    setShowResults(true);
    setAnimateResults(false);
    setTimeout(() => {
      setAnimateResults(true);
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function handleReset() {
    setShowResults(false);
    setStep(1);
    setCountry("");
    setCustomRate("");
    setImportValue("");
    setEntryCount("1");
    setStartMonth("2025-04");
    setEndMonth("2026-02");
    setLeadForm(false);
    setFormSubmitted(false);
  }

  const canCalculate = country && totalImport > 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(168deg, #0a0f1c 0%, #101829 40%, #0d1520 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
      padding: "0",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(30, 58, 95, 0.6) 0%, rgba(15, 30, 55, 0.8) 100%)",
        borderBottom: "1px solid rgba(100, 180, 255, 0.1)",
        padding: "28px 24px 24px",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(34, 197, 94, 0.12)",
          border: "1px solid rgba(34, 197, 94, 0.3)",
          borderRadius: "20px",
          padding: "5px 14px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#4ade80",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "14px",
          fontFamily: "'Space Mono', monospace",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "pulse 2s infinite" }} />
          SCOTUS ruling active — refunds ordered
        </div>
        <h1 style={{
          fontSize: "clamp(22px, 5vw, 32px)",
          fontWeight: 700,
          margin: "0 0 6px",
          letterSpacing: "-0.02em",
          background: "linear-gradient(135deg, #ffffff 30%, #93c5fd 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>IEEPA Tariff Refund Calculator</h1>
        <p style={{
          fontSize: "14px",
          color: "#94a3b8",
          margin: 0,
          maxWidth: 520,
          marginInline: "auto",
          lineHeight: 1.5,
        }}>
          Estimate your potential refund after the Supreme Court struck down IEEPA tariffs on February 20, 2026
        </p>
      </div>

      {/* Main Calculator */}
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "24px 16px 40px" }}>

        {/* Country Selection */}
        <Section number="1" title="Country of Origin" active={true}>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={selectStyle}
          >
            <option value="">Select country…</option>
            {Object.entries(TARIFF_RATES).map(([k, v]) => (
              <option key={k} value={k}>{v.name} — {v.label} IEEPA rate</option>
            ))}
            <option value="custom">Custom rate…</option>
          </select>
          {country === "custom" && (
            <div style={{ marginTop: 10 }}>
              <label style={labelStyle}>Custom IEEPA Tariff Rate (%)</label>
              <input
                type="number"
                min="0"
                max="500"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                placeholder="e.g. 34"
                style={inputStyle}
              />
            </div>
          )}
          {country && country !== "custom" && (
            <div style={{
              marginTop: 10,
              padding: "10px 14px",
              background: "rgba(59, 130, 246, 0.08)",
              borderRadius: 8,
              border: "1px solid rgba(59, 130, 246, 0.15)",
              fontSize: 13,
              color: "#93c5fd",
              fontFamily: "'Space Mono', monospace",
            }}>
              IEEPA Rate: <strong>{TARIFF_RATES[country].label}</strong> — now invalidated by SCOTUS
            </div>
          )}
        </Section>

        {/* Import Value */}
        <Section number="2" title="Total Import Value (USD)" active={!!country}>
          <label style={labelStyle}>Total value of goods imported under IEEPA tariffs</label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
              fontSize: 16,
              fontWeight: 700,
            }}>$</span>
            <input
              type="text"
              value={importValue}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.]/g, "");
                setImportValue(raw);
              }}
              placeholder="500,000"
              style={{ ...inputStyle, paddingLeft: 30 }}
              disabled={!country}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {[50000, 250000, 1000000, 5000000].map((v) => (
              <button
                key={v}
                onClick={() => setImportValue(String(v))}
                style={{
                  ...chipStyle,
                  background: importValue === String(v) ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.04)",
                  borderColor: importValue === String(v) ? "rgba(59, 130, 246, 0.4)" : "rgba(255,255,255,0.08)",
                  color: importValue === String(v) ? "#93c5fd" : "#94a3b8",
                }}
              >
                {formatCurrency(v)}
              </button>
            ))}
          </div>
        </Section>

        {/* Time Period */}
        <Section number="3" title="Import Period" active={totalImport > 0}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Start</label>
              <input type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} min="2025-04" max="2026-02" style={inputStyle} disabled={!totalImport} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>End</label>
              <input type="month" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} min="2025-04" max="2026-02" style={inputStyle} disabled={!totalImport} />
            </div>
          </div>
        </Section>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          disabled={!canCalculate}
          style={{
            width: "100%",
            padding: "16px 24px",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            color: canCalculate ? "#000" : "#475569",
            background: canCalculate
              ? "linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)"
              : "rgba(255,255,255,0.06)",
            border: "none",
            borderRadius: 12,
            cursor: canCalculate ? "pointer" : "not-allowed",
            marginTop: 8,
            letterSpacing: "-0.01em",
            transition: "all 0.3s ease",
            boxShadow: canCalculate ? "0 4px 24px rgba(74, 222, 128, 0.2)" : "none",
          }}
        >
          Calculate My Refund
        </button>

        {/* Results */}
        {showResults && (
          <div
            ref={resultsRef}
            style={{
              marginTop: 28,
              opacity: animateResults ? 1 : 0,
              transform: animateResults ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Total Refund Card */}
            <div style={{
              background: "linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(6, 78, 59, 0.15) 100%)",
              border: "1px solid rgba(34, 197, 94, 0.25)",
              borderRadius: 16,
              padding: "28px 24px",
              textAlign: "center",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "#86efac", fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>
                Estimated Total Refund
              </div>
              <div style={{
                fontSize: "clamp(32px, 8vw, 48px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {formatCurrencyFull(totalRefund)}
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                Including interest accrued since SCOTUS ruling
              </div>
            </div>

            {/* Breakdown Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <BreakdownCard
                label="IEEPA Duties Paid"
                value={formatCurrencyFull(dutiesPaid)}
                sub={`${effectiveRate}% on ${formatCurrency(totalImport)}`}
                color="#60a5fa"
              />
              <BreakdownCard
                label="Interest Accrued"
                value={formatCurrencyFull(interestAccrued)}
                sub={`${(interestRate * 100).toFixed(1)}% APR × ${daysSinceRuling} days`}
                color="#fbbf24"
              />
              <BreakdownCard
                label="Daily Interest"
                value={formatCurrencyFull(dailyInterest)}
                sub="Accruing per day of delay"
                color="#f87171"
              />
              <BreakdownCard
                label="Entries"
                value={parseInt(entryCount) > 1 ? entryCount : "—"}
                sub="Track in ACE portal"
                color="#a78bfa"
              />
            </div>

            {/* Timeline Info */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "18px 20px",
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 10 }}>Refund Timeline</div>
              <TimelineItem icon="⚖️" text="Feb 20, 2026 — Supreme Court strikes down IEEPA tariffs (Learning Resources v. Trump)" />
              <TimelineItem icon="📋" text="Mar 4, 2026 — CIT orders CBP to liquidate/reliquidate all IEEPA entries" />
              <TimelineItem icon="🖥️" text="Mid-April 2026 — CBP self-service refund portal expected in ACE" />
              <TimelineItem icon="⏰" text="No lawsuit required — CBP building streamlined process for all 330K+ importers" last />
            </div>

            {/* CTA / Lead Capture */}
            {!formSubmitted ? (
              <div style={{
                background: "linear-gradient(145deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.1) 100%)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: 16,
                padding: "24px 20px",
              }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: "#e2e8f0" }}>
                  Get Your Free Refund Eligibility Report
                </h3>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px", lineHeight: 1.5 }}>
                  Our trade specialists can review your ACE data and identify your exact refund amount — including duties you may not know are recoverable.
                </p>
                {!leadForm ? (
                  <button
                    onClick={() => setLeadForm(true)}
                    style={{
                      width: "100%",
                      padding: "14px",
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      color: "#fff",
                      background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                      boxShadow: "0 4px 20px rgba(59, 130, 246, 0.25)",
                    }}
                  >
                    Claim Your Free Report →
                  </button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <input placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
                      <input placeholder="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} style={inputStyle} />
                    </div>
                    <input placeholder="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
                    <input placeholder="Phone (optional)" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} />
                    <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4, marginTop: 2 }}>
                      Estimated refund: <strong style={{ color: "#4ade80" }}>{formatCurrencyFull(totalRefund)}</strong> · Your data is kept confidential.
                    </div>
                    <button
                      onClick={() => setFormSubmitted(true)}
                      disabled={!formData.name || !formData.email}
                      style={{
                        width: "100%",
                        padding: "14px",
                        fontSize: 15,
                        fontWeight: 700,
                        fontFamily: "'DM Sans', sans-serif",
                        color: formData.name && formData.email ? "#fff" : "#475569",
                        background: formData.name && formData.email
                          ? "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                          : "rgba(255,255,255,0.06)",
                        border: "none",
                        borderRadius: 10,
                        cursor: formData.name && formData.email ? "pointer" : "not-allowed",
                      }}
                    >
                      Submit for Free Review
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                borderRadius: 16,
                padding: "28px 20px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#4ade80", marginBottom: 6 }}>Request Received</div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
                  A trade specialist will contact you within 24 hours to review your estimated <strong style={{ color: "#4ade80" }}>{formatCurrencyFull(totalRefund)}</strong> refund.
                </div>
              </div>
            )}

            {/* Reset */}
            <button
              onClick={handleReset}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "12px",
                fontSize: 13,
                fontWeight: 500,
                color: "#64748b",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ← Start Over
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{
          marginTop: 28,
          padding: "14px 16px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.05)",
          fontSize: 11,
          color: "#475569",
          lineHeight: 1.6,
        }}>
          <strong style={{ color: "#64748b" }}>Disclaimer:</strong> This calculator provides estimates only and does not constitute legal, financial, or trade compliance advice. Actual refund amounts depend on entry-level data, liquidation status, and CBP processing. Interest rates are based on IRS corporate overpayment rates as of March 2026. Consult a licensed customs broker or trade attorney for specific guidance. Section 232 and Section 301 tariffs remain in effect and are not covered by the SCOTUS IEEPA ruling.
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        input:focus, select:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}

function Section({ number, title, active, children }) {
  return (
    <div style={{
      marginBottom: 20,
      opacity: active ? 1 : 0.35,
      pointerEvents: active ? "auto" : "none",
      transition: "opacity 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "'Space Mono', monospace",
          background: active ? "rgba(59, 130, 246, 0.15)" : "rgba(255,255,255,0.05)",
          color: active ? "#60a5fa" : "#475569",
          border: `1px solid ${active ? "rgba(59, 130, 246, 0.3)" : "rgba(255,255,255,0.06)"}`,
          flexShrink: 0,
        }}>
          {number}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: active ? "#e2e8f0" : "#475569" }}>{title}</span>
      </div>
      <div style={{ marginLeft: 36 }}>{children}</div>
    </div>
  );
}

function BreakdownCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12,
      padding: "16px 14px",
      borderTop: `2px solid ${color}`,
    }}>
      <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function TimelineItem({ icon, text, last }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: last ? 0 : 10, alignItems: "flex-start" }}>
      <span style={{ fontSize: 14, flexShrink: 0, lineHeight: "20px" }}>{icon}</span>
      <span style={{ fontSize: 12, color: "#94a3b8", lineHeight: "20px" }}>{text}</span>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  color: "#e2e8f0",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease",
};

const selectStyle = {
  ...inputStyle,
  appearance: "auto",
  cursor: "pointer",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "#94a3b8",
  marginBottom: 6,
  fontWeight: 500,
};

const chipStyle = {
  padding: "6px 14px",
  fontSize: 12,
  fontWeight: 600,
  fontFamily: "'Space Mono', monospace",
  border: "1px solid",
  borderRadius: 8,
  cursor: "pointer",
  background: "transparent",
  transition: "all 0.2s ease",
};
