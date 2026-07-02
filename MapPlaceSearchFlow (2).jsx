import React, { useState } from "react";

/**
 * 플레이스픽 — 지도에서 맛집 검색해서 추가하는 화면 (회원가입과 무관한 독립 기능)
 * ------------------------------------------------------------
 * intro(진입) → collect(안내 문구 + 검색창) → search(지도 + 검색결과 목록)
 *   → 결과 선택 시 하단 시트로 상세 확인 → 저장하기
 *
 * 지도 자체는 아직 실제 지도 SDK(카카오맵/네이버맵/구글맵 등)가 연결 안 되어 있어서
 * 와이어프레임처럼 플레이스홀더로 남겨뒀습니다. 실제 지도를 붙이려면
 * <MapPlaceholder /> 부분을 지도 SDK의 <Map> 컴포넌트로 교체하면 됩니다.
 *
 * 서버 연동 지점 (지금은 mock):
 *   - searchPlaces(query)   -> 실제 장소 검색 API
 *   - savePlace(place)      -> "인생맛집" 저장 API
 */

// ----------------------------------------------------
// 서버 연동 지점 (mock)
// ----------------------------------------------------
const MOCK_PLACES = [
  {
    id: "p1",
    name: "가게이름",
    category: "태국음식",
    address: "경기 의정부시 흥화로190번길 6 호원동2...",
    review: 474,
    distance: "414m",
    lat: 37.7378,
    lng: 127.0337,
  },
  {
    id: "p2",
    name: "가게이름",
    category: "태국음식",
    address: "경기 의정부시 흥화로190번길 6 호원동2...",
    review: 474,
    distance: "414m",
    lat: 37.738,
    lng: 127.034,
  },
  {
    id: "p3",
    name: "가게이름",
    category: "태국음식",
    address: "경기 의정부시 흥화로190번길 6 호원동2...",
    review: 474,
    distance: "414m",
    lat: 37.7375,
    lng: 127.0335,
  },
];

async function searchPlaces(query) {
  // TODO: 실제 장소 검색 API로 교체 (예: 카카오 로컬 API)
  await new Promise((r) => setTimeout(r, 300));
  if (!query) return MOCK_PLACES;
  return MOCK_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );
}

async function fetchPlaceDetail(place) {
  // TODO: 실제 장소 상세 API로 교체
  await new Promise((r) => setTimeout(r, 300));
  return {
    name: "Lumière Atelier",
    rating: 4.9,
    reviewCount: 128,
    category: "Modern French",
    price: "$$$",
    distance: "0.8 km",
    openNow: true,
    saved: "2.4k",
  };
}

async function savePlace(place) {
  // TODO: 실제 "인생맛집" 저장 API로 교체
  await new Promise((r) => setTimeout(r, 500));
  return { success: true, place };
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

// 실제 지도 SDK로 교체할 자리. 지금은 와이어프레임처럼 플레이스홀더만 표시.
function MapPlaceholder() {
  return (
    <div style={s.mapPlaceholder}>
      <i className="ti ti-photo-x" style={{ fontSize: 32, color: "#B4B2A9" }} />
      <span style={s.mapPlaceholderText}>지도 영역 (지도 SDK 연동 예정)</span>
    </div>
  );
}

// ----------------------------------------------------
// 화면 1: 처음 앱을 접했을때 나오는 상황
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
// 화면 2: 정보수집 화면
// ----------------------------------------------------
function CollectScreen({ onGoSearch }) {
  return (
    <PhoneFrame>
      <StatusBar />
      <div style={s.collectBody}>
        <p style={s.collectText}>
          당신의 <b>인생맛집</b>을 소개해주세요!
        </p>
        <button type="button" style={s.searchTrigger} onClick={onGoSearch}>
          <i className="ti ti-search" style={{ fontSize: 15, color: "#B0B0B0" }} />
          <span style={s.searchTriggerText}>음식 종류 또는 식당 이름 검색...</span>
        </button>
      </div>
      <HomeIndicator />
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 화면 3: 검색창
// ----------------------------------------------------
function SearchScreen({ onSelectPlace, onOpenMenu }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(MOCK_PLACES);
  const [loading, setLoading] = useState(false);

  const handleQueryChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setLoading(true);
    const found = await searchPlaces(value);
    setResults(found);
    setLoading(false);
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <div style={s.searchHeader}>
        <button type="button" style={s.iconButton} onClick={onOpenMenu} aria-label="메뉴">
          <i className="ti ti-menu-2" style={{ fontSize: 20 }} />
        </button>
        <span style={s.searchHeaderTitle}>PlacePick</span>
        <button type="button" style={s.iconButton} aria-label="알림">
          <i className="ti ti-bell" style={{ fontSize: 20 }} />
        </button>
      </div>

      <div style={s.searchBarRow}>
        <div style={s.searchBarWrap}>
          <i className="ti ti-search" style={{ fontSize: 15, color: "#B0B0B0" }} />
          <input
            type="text"
            placeholder="음식 종류 또는 식당 이름 검색..."
            value={query}
            onChange={handleQueryChange}
            style={s.searchBarInput}
          />
        </div>
        <button type="button" style={s.locationButton} aria-label="내 위치">
          <i className="ti ti-current-location" style={{ fontSize: 16 }} />
        </button>
      </div>

      <div style={s.resultsList}>
        {loading && <p style={s.noResults}>검색 중...</p>}
        {!loading &&
          results.map((p) => (
            <button key={p.id} type="button" style={s.resultRow} onClick={() => onSelectPlace(p)}>
              <i className="ti ti-map-pin" style={{ fontSize: 16, color: "#8A8A8A", marginTop: 2 }} />
              <div style={s.resultInfo}>
                <p style={s.resultName}>{p.name}</p>
                <p style={s.resultAddress}>{p.address}</p>
                <p style={s.resultReview}>리뷰 {p.review}</p>
              </div>
              <div style={s.resultMeta}>
                <span style={s.resultCategory}>{p.category}</span>
                <span style={s.resultDistance}>{p.distance}</span>
              </div>
            </button>
          ))}
        {!loading && results.length === 0 && <p style={s.noResults}>검색 결과가 없습니다.</p>}
      </div>

      <HomeIndicator />
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 화면 4: 맛집 탐색 확인 (지도 + 하단 시트)
// ----------------------------------------------------
function PlaceConfirmScreen({ place, onSave, onClose }) {
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetchPlaceDetail(place).then((d) => {
      if (!cancelled) setDetail(d);
    });
    return () => {
      cancelled = true;
    };
  }, [place]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePlace(place);
      setSaved(true);
      setTimeout(() => onSave(place), 800);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
        <MapPlaceholder />

        <button type="button" style={s.sheetCloseArea} onClick={onClose} aria-label="닫기" />

        <div style={s.sheet}>
          <div style={s.sheetHandle} />
          {!detail ? (
            <p style={s.noResults}>불러오는 중...</p>
          ) : (
            <>
              <div style={s.sheetImage}>
                <i className="ti ti-photo-x" style={{ fontSize: 26, color: "#B4B2A9" }} />
              </div>
              <div style={s.sheetTitleRow}>
                <p style={s.sheetName}>{detail.name}</p>
                <span style={s.sheetRating}>
                  <i className="ti ti-star-filled" style={{ fontSize: 12, color: "#1A1A1A" }} />{" "}
                  {detail.rating} ({detail.reviewCount})
                </span>
              </div>
              <p style={s.sheetSub}>
                {detail.category} · {detail.price} · {detail.distance}
              </p>
              <div style={s.sheetTagsRow}>
                {detail.openNow && <span style={s.tagOpen}>Open Now</span>}
                <span style={s.tagSaved}>
                  <i className="ti ti-bookmark" style={{ fontSize: 11 }} /> {detail.saved} Saved
                </span>
              </div>
              <p style={s.sheetSectionLabel}>CHEF'S SELECTION</p>
              <div style={s.sheetThumbRow}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={s.sheetThumb}>
                    <i className="ti ti-photo-x" style={{ fontSize: 16, color: "#B4B2A9" }} />
                  </div>
                ))}
              </div>
              <button type="button" onClick={handleSave} disabled={saving || saved} style={s.saveButton}>
                {saved ? "저장 완료" : saving ? "저장 중..." : "저장하기"}
              </button>
            </>
          )}
        </div>
      </div>
      <HomeIndicator />
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 최상위 컴포넌트: 화면 전환 관리 (회원가입과 완전히 독립)
// ----------------------------------------------------
export default function MapPlaceSearchFlow() {
  const [screen, setScreen] = useState("intro");
  const [selectedPlace, setSelectedPlace] = useState(null);

  if (screen === "intro") return <IntroScreen onNext={() => setScreen("collect")} />;

  if (screen === "collect") return <CollectScreen onGoSearch={() => setScreen("search")} />;

  if (screen === "search")
    return (
      <SearchScreen
        onOpenMenu={() => setScreen("collect")}
        onSelectPlace={(p) => {
          setSelectedPlace(p);
          setScreen("confirm");
        }}
      />
    );

  if (screen === "confirm")
    return (
      <PlaceConfirmScreen
        place={selectedPlace}
        onClose={() => setScreen("search")}
        onSave={() => setScreen("search")}
      />
    );

  return null;
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

  collectBody: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", gap: 24 },
  collectText: { fontSize: 15, lineHeight: 1.5, textAlign: "center", color: "#1A1A1A", margin: 0 },
  searchTrigger: {
    width: "100%",
    height: 42,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 14px",
    border: "1px solid #DADADA",
    borderRadius: 21,
    background: "#FFFFFF",
    cursor: "pointer",
  },
  searchTriggerText: { fontSize: 12.5, color: "#B0B0B0" },

  searchHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 0" },
  searchHeaderTitle: { fontSize: 15, fontWeight: 700 },
  iconButton: { background: "none", border: "none", color: "#1A1A1A", cursor: "pointer", padding: 4 },

  searchBarRow: { display: "flex", gap: 8, padding: "12px 16px 0" },
  searchBarWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 38,
    padding: "0 12px",
    border: "1px solid #DADADA",
    borderRadius: 19,
    background: "#FAFAFA",
  },
  searchBarInput: { flex: 1, border: "none", outline: "none", background: "none", fontSize: 12.5, color: "#1A1A1A" },
  locationButton: {
    width: 38,
    height: 38,
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

  resultsList: { flex: 1, padding: "8px 16px 0", overflowY: "auto" },
  resultRow: {
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "12px 0",
    border: "none",
    borderBottom: "1px solid #F0F0F0",
    background: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 13, fontWeight: 600, color: "#1A1A1A", margin: "0 0 2px" },
  resultAddress: { fontSize: 11, color: "#8A8A8A", margin: "0 0 2px" },
  resultReview: { fontSize: 11, color: "#B0B0B0", margin: 0 },
  resultMeta: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 },
  resultCategory: { fontSize: 11, color: "#3A3A3A", fontWeight: 600 },
  resultDistance: { fontSize: 11, color: "#B0B0B0" },
  noResults: { textAlign: "center", color: "#B0B0B0", fontSize: 12.5, marginTop: 40 },

  mapPlaceholder: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "#FAFAF8",
    borderTop: "1px solid #F0F0F0",
  },
  mapPlaceholderText: { fontSize: 11, color: "#B4B2A9" },

  sheetCloseArea: { position: "absolute", inset: 0, background: "none", border: "none", cursor: "pointer" },
  sheet: {
    position: "relative",
    background: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: "10px 20px 20px",
    boxSizing: "border-box",
    boxShadow: "0 -1px 0 #E5E5E5",
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, background: "#DADADA", margin: "0 auto 12px" },
  sheetImage: {
    width: "100%",
    height: 96,
    border: "1px solid #E5E5E5",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  sheetTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  sheetName: { fontSize: 15, fontWeight: 700, margin: 0, color: "#1A1A1A" },
  sheetRating: { fontSize: 11.5, color: "#1A1A1A", display: "flex", alignItems: "center", gap: 3 },
  sheetSub: { fontSize: 11.5, color: "#8A8A8A", margin: "4px 0 10px" },
  sheetTagsRow: { display: "flex", gap: 8, marginBottom: 14 },
  tagOpen: { fontSize: 10.5, fontWeight: 600, color: "#1D9E75", background: "#E1F5EE", padding: "3px 8px", borderRadius: 5 },
  tagSaved: { fontSize: 10.5, fontWeight: 600, color: "#3A3A3A", background: "#F2F2F2", padding: "3px 8px", borderRadius: 5, display: "inline-flex", alignItems: "center", gap: 3 },
  sheetSectionLabel: { fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: "#8A8A8A", margin: "0 0 8px" },
  sheetThumbRow: { display: "flex", gap: 8, marginBottom: 18 },
  sheetThumb: {
    width: 56,
    height: 56,
    border: "1px solid #E5E5E5",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    width: "100%",
    height: 46,
    borderRadius: 24,
    border: "none",
    background: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
