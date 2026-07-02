import React, { useState, useMemo } from "react";

/**
 * 플레이스픽 — SNS/플랫폼에서 발견한 맛집 정보를 저장하러 온 경우
 * ------------------------------------------------------------
 * intro(진입) → explore(지도 + 필터 칩 + 평점 슬라이더 + 결과보기)
 *
 * 지도는 아직 실제 지도 SDK가 없어 플레이스홀더로 남겨뒀습니다.
 * 필터 로직(칩 토글, 평점 범위 슬라이더, 초기화, 결과 개수 계산)은 전부 실제로 동작합니다.
 *
 * 서버 연동 지점 (지금은 mock):
 *   - fetchFilteredPlaces(filters) -> 실제 필터 검색 API로 교체
 */

// ----------------------------------------------------
// 서버 연동 지점 (mock)
// ----------------------------------------------------
const MOCK_RESTAURANTS = [
  { id: 1, name: "맛집A", category: "한식", rating: 4.6, price: 2 },
  { id: 2, name: "맛집B", category: "일식", rating: 4.2, price: 3 },
  { id: 3, name: "맛집C", category: "양식", rating: 3.8, price: 3 },
  { id: 4, name: "맛집D", category: "카페", rating: 4.9, price: 1 },
  { id: 5, name: "맛집E", category: "중식", rating: 3.5, price: 2 },
  { id: 6, name: "맛집F", category: "한식", rating: 4.0, price: 2 },
  { id: 7, name: "맛집G", category: "일식", rating: 4.4, price: 4 },
  { id: 8, name: "맛집H", category: "양식", rating: 3.2, price: 3 },
];

async function fetchFilteredPlaces(filters) {
  // TODO: 실제 필터 검색 API로 교체
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_RESTAURANTS.filter((p) => p.rating >= filters.minRating && p.rating <= filters.maxRating);
}

// ----------------------------------------------------
// 공통 UI 조각
// ----------------------------------------------------

// 순수 포인터 이벤트로 직접 구현한 듀얼 썸 슬라이더.
// 네이티브 <input type="range"> 두 개를 겹치는 방식은 iframe/모바일 웹뷰에서
// 위쪽 슬라이더가 전체 트랙의 포인터 이벤트를 가로채는 문제가 있어 이 방식으로 대체함.
function DualThumbSlider({ min, max, step, minValue, maxValue, onChange }) {
  const trackRef = React.useRef(null);
  const draggingRef = React.useRef(null); // 'min' | 'max' | null

  const clamp = (v) => Math.min(max, Math.max(min, v));
  const round = (v) => Math.round(v / step) * step;

  const percentOf = (v) => ((v - min) / (max - min)) * 100;

  const valueFromClientX = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const raw = min + ratio * (max - min);
    return Math.round(round(raw) * 10) / 10;
  };

  const startDrag = (which) => (e) => {
    e.preventDefault();
    draggingRef.current = which;
    const move = (ev) => {
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const v = valueFromClientX(clientX);
      if (draggingRef.current === "min") {
        onChange(Math.min(v, maxValue - step), maxValue);
      } else {
        onChange(minValue, Math.max(v, minValue + step));
      }
    };
    const end = () => {
      draggingRef.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end);
  };

  const handleTrackClick = (e) => {
    if (e.target !== trackRef.current) return;
    const v = valueFromClientX(e.clientX);
    const distToMin = Math.abs(v - minValue);
    const distToMax = Math.abs(v - maxValue);
    if (distToMin <= distToMax) {
      onChange(Math.min(v, maxValue - step), maxValue);
    } else {
      onChange(minValue, Math.max(v, minValue + step));
    }
  };

  return (
    <div ref={trackRef} onClick={handleTrackClick} style={s.customSliderTrack}>
      <div style={s.customSliderBg} />
      <div
        style={{
          ...s.customSliderActive,
          left: `${percentOf(minValue)}%`,
          right: `${100 - percentOf(maxValue)}%`,
        }}
      />
      <div
        role="slider"
        aria-label="최소 평점"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={minValue}
        tabIndex={0}
        onMouseDown={startDrag("min")}
        onTouchStart={startDrag("min")}
        style={{ ...s.customSliderThumb, left: `${percentOf(minValue)}%` }}
      />
      <div
        role="slider"
        aria-label="최대 평점"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={maxValue}
        tabIndex={0}
        onMouseDown={startDrag("max")}
        onTouchStart={startDrag("max")}
        style={{ ...s.customSliderThumb, left: `${percentOf(maxValue)}%` }}
      />
    </div>
  );
}

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
// 화면 1: 자신의 맛집을 저장하고 싶을때 (진입 화면)
// ----------------------------------------------------
function IntroScreen({ onNext }) {
  return (
    <PhoneFrame>
      <StatusBar />
      <div style={s.introBody} onClick={onNext}>
        <div style={s.logoPlaceholder}>
          <i className="ti ti-photo-x" style={{ fontSize: 28, color: "#B4B2A9" }} />
        </div>
        <p style={s.introTitle}>PlacePick</p>
      </div>
      <div style={s.bottomTextWrap}>
        <p style={s.bottomText}>당신을 위한 최적의 공간 선택</p>
        <div style={s.dots}>
          <span style={s.dot} />
          <span style={s.dot} />
          <span style={s.dot} />
        </div>
      </div>
      <HomeIndicator />
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 화면 2: 맛집 필터링 탐색 (슬라이더 - 와이어프레임)
// ----------------------------------------------------
const FILTER_CHIPS = ["평점 4.0+", "음식 종류", "가격", "리뷰", "분위기", "영업중"];
const TABS = [
  { key: "home", label: "홈", icon: "ti-home" },
  { key: "upload", label: "업로드", icon: "ti-circle-plus" },
  { key: "mymap", label: "저장/예약", icon: "ti-bookmark" },
  { key: "ranking", label: "랭킹", icon: "ti-trophy" },
];

function ExploreScreen() {
  const [activeChips, setActiveChips] = useState({ "평점 4.0+": true });
  const [minRating, setMinRating] = useState(3.2);
  const [maxRating, setMaxRating] = useState(4.8);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const toggleChip = (chip) => {
    const willActivate = !activeChips[chip];
    setActiveChips((prev) => ({ ...prev, [chip]: willActivate }));
    if (chip === "평점 4.0+" && willActivate) {
      setMinRating(4.0);
      setMaxRating(5.0);
    }
  };

  const handleReset = () => {
    setActiveChips({});
    setMinRating(1.0);
    setMaxRating(5.0);
  };

  const filteredCount = useMemo(
    () => MOCK_RESTAURANTS.filter((p) => p.rating >= minRating && p.rating <= maxRating).length,
    [minRating, maxRating]
  );

  const handleViewResults = async () => {
    setLoading(true);
    const found = await fetchFilteredPlaces({ minRating, maxRating });
    setLoading(false);
    window.alert(`${found.length}개의 맛집을 찾았어요.\n${found.map((r) => r.name).join(", ")}`);
  };

  return (
    <PhoneFrame>
      <StatusBar />

      <div style={s.header}>
        <button type="button" style={s.iconButton} aria-label="메뉴">
          <i className="ti ti-menu-2" style={{ fontSize: 20 }} />
        </button>
        <span style={s.headerTitle}>PlacePick</span>
        <button type="button" style={s.iconButton} aria-label="알림">
          <i className="ti ti-bell" style={{ fontSize: 20 }} />
        </button>
      </div>

      <div style={s.searchBarRow}>
        <div style={s.searchBarWrap}>
          <i className="ti ti-search" style={{ fontSize: 15, color: "#B0B0B0" }} />
          <input type="text" placeholder="음식 종류 또는 식당 이름 검색..." style={s.searchBarInput} />
        </div>
        <button type="button" style={s.locationButton} aria-label="내 위치">
          <i className="ti ti-current-location" style={{ fontSize: 16 }} />
        </button>
      </div>

      <div style={s.mapArea}>
        <div style={s.mapPin}>
          <div style={s.mapPinIcon}>
            <i className="ti ti-tools-kitchen-2" style={{ fontSize: 14, color: "#FFFFFF" }} />
          </div>
          <span style={s.mapPinLabel}>맛집A</span>
        </div>
        <div style={s.mapPinSmall} />
        <span style={s.mapAreaLabel}>지도 영역 (Map Area)</span>
      </div>

      <div style={s.filterChipsRow}>
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => toggleChip(chip)}
            style={activeChips[chip] ? s.chipActive : s.chip}
          >
            {chip}
          </button>
        ))}
      </div>

      <div style={s.ratingSection}>
        <div style={s.ratingHeaderRow}>
          <span style={s.ratingLabel}>평점 선택</span>
          <span style={s.ratingValue}>
            {minRating.toFixed(1)} ~ {maxRating.toFixed(1)}
          </span>
        </div>
        <div style={s.sliderWrap}>
          <i className="ti ti-star" style={{ fontSize: 12, color: "#B0B0B0" }} />
          <DualThumbSlider
            min={1}
            max={5}
            step={0.1}
            minValue={minRating}
            maxValue={maxRating}
            onChange={(min, max) => {
              setMinRating(min);
              setMaxRating(max);
            }}
          />
          <i className="ti ti-star-filled" style={{ fontSize: 12, color: "#1A1A1A" }} />
        </div>
      </div>

      <div style={s.actionRow}>
        <button type="button" onClick={handleReset} style={s.resetButton}>
          초기화
        </button>
        <button type="button" onClick={handleViewResults} disabled={loading} style={s.resultButton}>
          {loading ? "불러오는 중..." : `${filteredCount}개 결과 보기 →`}
        </button>
      </div>

      <div style={s.tabBar}>
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setActiveTab(t.key)} style={s.tabButton}>
            <i className={`ti ${t.icon}`} style={{ fontSize: 20, color: activeTab === t.key ? "#1A1A1A" : "#B0B0B0" }} />
            <span style={{ ...s.tabLabel, color: activeTab === t.key ? "#1A1A1A" : "#B0B0B0" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 최상위 컴포넌트
// ----------------------------------------------------
export default function SnsPlaceFilterFlow() {
  const [screen, setScreen] = useState("intro");
  if (screen === "intro") return <IntroScreen onNext={() => setScreen("explore")} />;
  return <ExploreScreen />;
}

// ----------------------------------------------------
// 스타일
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
  statusBar: { display: "flex", justifyContent: "space-between", padding: "10px 18px 0", fontSize: 13, fontWeight: 600 },
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
  introBody: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  introTitle: { fontWeight: 700, fontSize: 15, margin: 0 },

  bottomTextWrap: { textAlign: "center", paddingBottom: 10 },
  bottomText: { fontSize: 11.5, color: "#B0B0B0", margin: "0 0 8px" },
  dots: { display: "flex", justifyContent: "center", gap: 5 },
  dot: { width: 5, height: 5, borderRadius: "50%", background: "#B0B0B0" },

  homeIndicatorWrap: { display: "flex", justifyContent: "center", padding: "8px 0 14px" },
  homeIndicator: { width: 110, height: 4, borderRadius: 2, background: "#1A1A1A" },

  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 0" },
  headerTitle: { fontSize: 15, fontWeight: 700 },
  iconButton: { background: "none", border: "none", color: "#1A1A1A", cursor: "pointer", padding: 4 },

  searchBarRow: { display: "flex", gap: 8, padding: "10px 16px 0" },
  searchBarWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 36,
    padding: "0 12px",
    border: "1px solid #DADADA",
    borderRadius: 18,
    background: "#FAFAFA",
  },
  searchBarInput: { flex: 1, border: "none", outline: "none", background: "none", fontSize: 12, color: "#1A1A1A" },
  locationButton: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid #DADADA",
    background: "#FFFFFF",
    color: "#3A3A3A",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  mapArea: {
    position: "relative",
    margin: "10px 16px 0",
    height: 210,
    border: "1px solid #EDEDED",
    borderRadius: 8,
    background: "#FAFAF8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
  },
  mapPin: {
    position: "absolute",
    top: 44,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  mapPinIcon: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "#1A1A1A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mapPinLabel: { fontSize: 10.5, color: "#3A3A3A", background: "#FFFFFF", padding: "1px 6px", borderRadius: 4, border: "1px solid #EDEDED" },
  mapPinSmall: {
    position: "absolute",
    top: 108,
    right: 60,
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#D9D9D9",
    border: "1px solid #C4C4C4",
  },
  mapAreaLabel: { fontSize: 11, color: "#B4B2A9" },

  filterChipsRow: { display: "flex", gap: 6, padding: "12px 16px 0", overflowX: "auto" },
  chip: {
    flexShrink: 0,
    padding: "6px 12px",
    fontSize: 11.5,
    fontWeight: 600,
    borderRadius: 16,
    border: "1px solid #DADADA",
    background: "#FFFFFF",
    color: "#3A3A3A",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  chipActive: {
    flexShrink: 0,
    padding: "6px 12px",
    fontSize: 11.5,
    fontWeight: 600,
    borderRadius: 16,
    border: "1px solid #1A1A1A",
    background: "#1A1A1A",
    color: "#FFFFFF",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  ratingSection: { padding: "16px 16px 0" },
  ratingHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  ratingLabel: { fontSize: 12.5, fontWeight: 600, color: "#1A1A1A" },
  ratingValue: { fontSize: 12, color: "#8A8A8A" },
  sliderWrap: { display: "flex", alignItems: "center", gap: 8 },
  customSliderTrack: {
    position: "relative",
    flex: 1,
    height: 24,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    touchAction: "none",
  },
  customSliderBg: { position: "absolute", left: 0, right: 0, height: 3, borderRadius: 2, background: "#EDEDED", pointerEvents: "none" },
  customSliderActive: { position: "absolute", height: 3, borderRadius: 2, background: "#1A1A1A", pointerEvents: "none" },
  customSliderThumb: {
    position: "absolute",
    top: "50%",
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#1A1A1A",
    border: "2px solid #FFFFFF",
    boxShadow: "0 0 0 1px #DADADA",
    transform: "translate(-50%, -50%)",
    cursor: "grab",
    touchAction: "none",
  },

  actionRow: { display: "flex", gap: 8, padding: "18px 16px 0" },
  resetButton: {
    flexShrink: 0,
    height: 40,
    padding: "0 16px",
    borderRadius: 20,
    border: "1px solid #DADADA",
    background: "#FFFFFF",
    color: "#3A3A3A",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  resultButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    border: "none",
    background: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
  },

  tabBar: {
    display: "flex",
    marginTop: "auto",
    borderTop: "1px solid #EDEDED",
    padding: "10px 0 6px",
  },
  tabButton: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  tabLabel: { fontSize: 10 },
};
