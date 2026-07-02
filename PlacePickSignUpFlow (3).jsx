import React, { useState, useCallback, useEffect } from "react";

/**
 * 플레이스픽 (PlacePick) — 스플래시 / 로그인 / 회원가입(약관동의) 플로우
 * ------------------------------------------------------------
 * 피그마 와이어프레임의 화면 구성·문구·레이아웃을 그대로 유지하고,
 * 그 위에 실제 동작하는 로직(상태 관리, 유효성 검사, 화면 전환, 체크박스 로직)만 붙였습니다.
 *
 * 화면 흐름:
 *   splash → login → signupTerms → (가입 완료 콜백)
 *
 * 서버 연동 지점 (지금은 mock):
 *   - loginUser(id, password)
 *   - completeSignUp(agreedTerms)
 * 아래 두 함수만 실제 API 호출로 교체하면 됩니다.
 */

// ----------------------------------------------------
// 서버 연동 지점 (mock)
// ----------------------------------------------------
async function loginUser(userId, password) {
  // TODO: 실제 로그인 API로 교체
  // const res = await fetch("/api/auth/login", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ userId, password }),
  // });
  // if (!res.ok) throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
  // return res.json();

  await new Promise((r) => setTimeout(r, 500));
  if (!userId || !password) throw new Error("아이디와 비밀번호를 입력해주세요.");
  return { id: userId };
}

async function completeSignUp(agreedTerms) {
  // TODO: 실제 회원가입 API로 교체
  // const res = await fetch("/api/auth/signup", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(agreedTerms),
  // });
  // if (!res.ok) throw new Error("회원가입에 실패했습니다.");
  // return res.json();

  await new Promise((r) => setTimeout(r, 500));
  return { success: true };
}

// ----------------------------------------------------
// 공통 UI 조각
// ----------------------------------------------------
function StatusBar() {
  return (
    <div style={s.statusBar}>
      <span>9:41</span>
      <span style={s.statusIcons}>
        <i className="ti ti-antenna-bars-5" style={{ fontSize: 14 }} />
        <i className="ti ti-wifi" style={{ fontSize: 14 }} />
        <i className="ti ti-battery-4" style={{ fontSize: 14 }} />
      </span>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div style={s.homeIndicatorWrap}>
      <div style={s.homeIndicator} />
    </div>
  );
}

function PhoneFrame({ children }) {
  return <div style={s.phone}>{children}</div>;
}

// ----------------------------------------------------
// 화면 1: 스플래시
// ----------------------------------------------------
function SplashScreen({ onFinish }) {
  useEffect(() => {
    const t = setTimeout(onFinish, 1200);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <PhoneFrame>
      <StatusBar />
      <div style={s.splashBody} onClick={onFinish}>
        <div style={s.logoPlaceholder}>
          <i className="ti ti-photo-x" style={{ fontSize: 28, color: "#B4B2A9" }} />
        </div>
        <p style={s.splashTitle}>PlacePick</p>
      </div>
      <div style={s.bottomTextWrap}>
        <p style={s.bottomText}>당신을 위한 최적의 공간 선택</p>
        <div style={s.dots}>
          <span style={{ ...s.dot, ...s.dotActive }} />
          <span style={s.dot} />
          <span style={s.dot} />
        </div>
      </div>
      <HomeIndicator />
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 화면 2: 로그인
// ----------------------------------------------------
function LoginScreen({ onGoSignUp, onLoginSuccess }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setSubmitting(true);
      try {
        const user = await loginUser(userId, password);
        onLoginSuccess?.(user);
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [userId, password, onLoginSuccess]
  );

  return (
    <PhoneFrame>
      <StatusBar />
      <form onSubmit={handleLogin} style={s.loginBody}>
        <div style={s.logoPlaceholder}>
          <i className="ti ti-photo-x" style={{ fontSize: 28, color: "#B4B2A9" }} />
        </div>
        <p style={s.loginTitle}>PlacePick</p>
        <p style={s.loginSubtitle}>당신만의 인생 맛집을 찾아보세요</p>

        <input
          type="text"
          placeholder="아이디를 입력하세요."
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={s.input}
        />
        <input
          type="password"
          placeholder="비밀번호를 입력하세요."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ ...s.input, marginTop: 10 }}
        />

        <button
          type="button"
          style={s.guestLinkCentered}
          onClick={() => window.alert("비회원으로 시작합니다.")}
        >
          비회원으로 시작하기
        </button>

        {error && <p style={s.loginError}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{ ...s.loginButton, opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? "로그인 중..." : "로그인"}
        </button>

        <div style={s.linkRow}>
          <button type="button" style={s.linkText} onClick={() => window.alert("아이디 찾기")}>
            아이디 찾기
          </button>
          <span style={s.linkDivider}>|</span>
          <button type="button" style={s.linkText} onClick={() => window.alert("비밀번호 찾기")}>
            비밀번호 찾기
          </button>
          <span style={s.linkDivider}>|</span>
          <button type="button" style={s.linkText} onClick={onGoSignUp}>
            회원가입
          </button>
        </div>
      </form>

      <HomeIndicator />
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 화면 3: 회원가입 - 약관동의
// ----------------------------------------------------
const TERMS_CONFIG = [
  { key: "age14", label: "만 14세 이상", required: true, viewable: false },
  { key: "service", label: "이용약관 동의", required: true, viewable: true },
  { key: "privacy", label: "개인정보 처리방침 동의", required: true, viewable: true },
  { key: "marketing", label: "광고성 정보 수신 및 마케팅 활용 동의", required: false, viewable: true },
];

function SignUpTermsScreen({ onBack, onAgree }) {
  const [checked, setChecked] = useState({
    age14: false,
    service: false,
    privacy: false,
    marketing: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const requiredKeys = TERMS_CONFIG.filter((t) => t.required).map((t) => t.key);
  const allKeys = TERMS_CONFIG.map((t) => t.key);
  const allChecked = allKeys.every((k) => checked[k]);
  const requiredChecked = requiredKeys.every((k) => checked[k]);

  const toggleOne = (key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    const next = !allChecked;
    const updated = {};
    allKeys.forEach((k) => (updated[k] = next));
    setChecked(updated);
  };

  const handleSubmit = async () => {
    if (!requiredChecked) return;
    setSubmitting(true);
    try {
      await completeSignUp(checked);
      onAgree?.(checked);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <div style={s.signupHeader}>
        <button type="button" onClick={onBack} style={s.backButton} aria-label="뒤로가기">
          <i className="ti ti-arrow-left" style={{ fontSize: 20 }} />
        </button>
        <div style={s.progressBarBg}>
          <div style={s.progressBarFill} />
        </div>
      </div>

      <div style={s.signupBody}>
        <p style={s.signupTitle}>
          <b>PlacePick</b>의 서비스 이용약관에 동의해주세요
        </p>

        <div style={s.termsList}>
          {TERMS_CONFIG.map((t) => (
            <div key={t.key} style={s.termRow}>
              <label style={s.termLabelWrap}>
                <input
                  type="checkbox"
                  checked={checked[t.key]}
                  onChange={() => toggleOne(t.key)}
                  style={s.checkbox}
                />
                <span style={s.termLabel}>
                  <span style={t.required ? s.requiredTag : s.optionalTag}>
                    [{t.required ? "필수" : "선택"}]
                  </span>{" "}
                  {t.label}
                </span>
              </label>
              {t.viewable && (
                <button
                  type="button"
                  style={s.viewLink}
                  onClick={() => window.alert(`${t.label} 상세 내용`)}
                >
                  보기
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={s.termsDivider} />

        <label style={s.allAgreeRow}>
          <input
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            style={s.checkbox}
          />
          <span style={s.allAgreeLabel}>모두 동의 (선택 정보 포함)</span>
        </label>
      </div>

      <div style={s.signupFooter}>
        <button
          type="button"
          disabled={!requiredChecked || submitting}
          onClick={handleSubmit}
          style={{
            ...s.agreeButton,
            opacity: !requiredChecked || submitting ? 0.4 : 1,
            cursor: !requiredChecked || submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "처리중..." : "동의하고 가입하기"}
        </button>
      </div>
      <HomeIndicator />
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 최상위 App: 화면 전환 관리
// ----------------------------------------------------
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [signupResult, setSignupResult] = useState(null);

  if (screen === "splash") {
    return <SplashScreen onFinish={() => setScreen("login")} />;
  }

  if (screen === "login") {
    return (
      <LoginScreen
        onGoSignUp={() => setScreen("signupTerms")}
        onLoginSuccess={() => setScreen("done")}
      />
    );
  }

  if (screen === "signupTerms") {
    return (
      <SignUpTermsScreen
        onBack={() => setScreen("login")}
        onAgree={(agreed) => {
          setSignupResult(agreed);
          setScreen("done");
        }}
      />
    );
  }

  // 로그인 성공 / 가입 완료 후 화면 (와이어프레임에 없는 부분이라 최소 placeholder)
  return (
    <PhoneFrame>
      <StatusBar />
      <div style={s.doneBody}>
        <i className="ti ti-circle-check" style={{ fontSize: 40, color: "#1D9E75" }} />
        <p style={s.doneText}>
          {signupResult ? "회원가입이 완료되었습니다." : "로그인되었습니다."}
        </p>
      </div>
      <HomeIndicator />
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 스타일 — 와이어프레임 톤(그레이스케일, 얇은 보더, 최소 장식) 유지
// ----------------------------------------------------
const s = {
  phone: {
    width: 375,
    minHeight: 720,
    margin: "0 auto",
    background: "#FFFFFF",
    border: "1px solid #E5E5E5",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#1A1A1A",
    position: "relative",
  },
  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 18px 0",
    fontSize: 13,
    fontWeight: 600,
  },
  statusIcons: { display: "flex", gap: 4, alignItems: "center" },

  logoPlaceholder: {
    width: 64,
    height: 64,
    border: "1px solid #D9D9D9",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  splashBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  splashTitle: { fontWeight: 700, fontSize: 15, margin: 0 },

  loginBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 24px 0",
  },
  loginTitle: { fontWeight: 700, fontSize: 18, margin: "4px 0 4px" },
  loginSubtitle: { fontSize: 12.5, color: "#8A8A8A", margin: "0 0 28px" },

  input: {
    width: "100%",
    height: 42,
    padding: "0 12px",
    fontSize: 13,
    border: "1px solid #DADADA",
    borderRadius: 6,
    outline: "none",
    boxSizing: "border-box",
    color: "#1A1A1A",
    background: "#FFFFFF",
  },
  guestLink: {
    alignSelf: "flex-end",
    marginTop: 8,
    fontSize: 11.5,
    color: "#8A8A8A",
    background: "none",
    border: "none",
    textDecoration: "underline",
    cursor: "pointer",
    padding: 0,
  },
  guestLinkCentered: {
    alignSelf: "center",
    marginTop: 10,
    fontSize: 11.5,
    color: "#8A8A8A",
    background: "none",
    border: "none",
    textDecoration: "underline",
    cursor: "pointer",
    padding: 0,
  },
  loginError: {
    width: "100%",
    fontSize: 12,
    color: "#C0392B",
    margin: "10px 0 0",
    textAlign: "left",
  },
  loginButton: {
    width: "100%",
    height: 42,
    marginTop: 16,
    borderRadius: 6,
    border: "1px solid #DADADA",
    background: "#F2F2F2",
    color: "#3A3A3A",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  linkRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
  },
  linkText: {
    fontSize: 11.5,
    color: "#8A8A8A",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  linkDivider: { fontSize: 11.5, color: "#DADADA" },

  bottomTextWrap: { textAlign: "center", paddingBottom: 10 },
  bottomText: { fontSize: 11.5, color: "#B0B0B0", margin: "0 0 8px" },
  dots: { display: "flex", justifyContent: "center", gap: 5 },
  dot: { width: 5, height: 5, borderRadius: "50%", background: "#E0E0E0" },
  dotActive: { background: "#8A8A8A" },

  homeIndicatorWrap: { display: "flex", justifyContent: "center", padding: "8px 0 14px" },
  homeIndicator: { width: 110, height: 4, borderRadius: 2, background: "#1A1A1A" },

  signupHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 18px 0",
  },
  backButton: { background: "none", border: "none", cursor: "pointer", padding: 4, color: "#1A1A1A" },
  progressBarBg: {
    width: 64,
    height: 4,
    borderRadius: 2,
    background: "#D9D9D9",
    overflow: "hidden",
  },
  progressBarFill: { width: "100%", height: "100%", background: "#D9D9D9" },

  signupBody: { flex: 1, padding: "20px 22px 0" },
  signupTitle: { fontSize: 15.5, lineHeight: 1.5, margin: "0 0 22px", fontWeight: 400 },

  termsList: { display: "flex", flexDirection: "column" },
  termRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "9px 0",
  },
  termLabelWrap: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  checkbox: { width: 15, height: 15, accentColor: "#3A3A3A", flexShrink: 0 },
  termLabel: { fontSize: 12.5, color: "#3A3A3A" },
  requiredTag: { color: "#3A3A3A", fontWeight: 600 },
  optionalTag: { color: "#8A8A8A", fontWeight: 600 },
  viewLink: {
    fontSize: 11,
    color: "#B0B0B0",
    textDecoration: "underline",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },

  termsDivider: { height: 1, background: "#EDEDED", margin: "14px 0" },

  allAgreeRow: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  allAgreeLabel: { fontSize: 12.5, fontWeight: 600, color: "#1A1A1A" },

  signupFooter: { padding: "16px 22px 6px" },
  agreeButton: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    border: "none",
    background: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 600,
  },

  doneBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  doneText: { fontSize: 13.5, color: "#3A3A3A" },
};
