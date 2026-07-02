import React, { useState, useEffect } from "react";

/**
 * 플레이스픽 — 업로드(나만의 맛집 등록) 플로우
 * ------------------------------------------------------------
 * init(방법 선택 + 사진 그리드) → confirm(업로드 하시겠습니까?)
 *   → reading(이미지 읽는 중 - mock OCR) → infoConfirm(정보 확인/수정, 여러 장 페이지네이션)
 *   → done(저장 완료 - 저장 리스트 관리)
 *
 * 서버 연동 지점 (지금은 mock):
 *   - extractPlaceInfo(photo) -> 실제 이미지 인식/정보 추출 API로 교체
 *   - savePlaces(items)       -> 실제 저장 API로 교체
 */

// ----------------------------------------------------
// 서버 연동 지점 (mock)
// ----------------------------------------------------
const MOCK_EXTRACT_POOL = [
  { name: "도담 레스토랑", category: "한식", price: "20000 ~ 50000", address: "서울 송파구 올림픽로 99", hours: "주말 휴무, 평일 9:00 ~ 21:00" },
  { name: "SEOUL 피자 & 스파게티", category: "양식", price: "15000 ~ 40000", address: "서울 강남구 테헤란로 123", hours: "주말 휴무, 평일 9:00 ~ 21:00" },
  { name: "한강 바베큐", category: "바베큐", price: "30000 ~ 60000", address: "서울 영등포구 여의도동 45", hours: "매일 11:00 ~ 22:00" },
];

async function extractPlaceInfo(index) {
  // TODO: 실제 이미지 인식(OCR/AI) API로 교체
  await new Promise((r) => setTimeout(r, 1500));
  return { ...MOCK_EXTRACT_POOL[index % MOCK_EXTRACT_POOL.length] };
}

async function savePlaces(items) {
  // TODO: 실제 저장 API로 교체
  await new Promise((r) => setTimeout(r, 400));
  return { success: true, items };
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

const TABS = [
  { key: "home", label: "홈", icon: "ti-home" },
  { key: "upload", label: "업로드", icon: "ti-circle-plus" },
  { key: "saved", label: "저장정보", icon: "ti-bookmark" },
  { key: "ranking", label: "랭킹", icon: "ti-trophy" },
];

function TabBar({ active }) {
  return (
    <div style={s.tabBar}>
      {TABS.map((t) => (
        <div key={t.key} style={s.tabButton}>
          <i className={`ti ${t.icon}`} style={{ fontSize: 20, color: active === t.key ? "#1A1A1A" : "#B0B0B0" }} />
          <span style={{ ...s.tabLabel, color: active === t.key ? "#1A1A1A" : "#B0B0B0" }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

function Header({ title }) {
  return (
    <div style={s.header}>
      <button type="button" style={s.iconButton} aria-label="메뉴">
        <i className="ti ti-menu-2" style={{ fontSize: 20 }} />
      </button>
      <span style={s.headerTitle}>{title}</span>
      <button type="button" style={s.iconButton} aria-label="알림">
        <i className="ti ti-bell" style={{ fontSize: 20 }} />
      </button>
    </div>
  );
}

// ----------------------------------------------------
// 화면 1: 업로드 = 초기 화면 (방법 선택 + 사진 그리드)
// ----------------------------------------------------
const PHOTO_COUNT = 11;

function UploadInitScreen({ onNext }) {
  const [method, setMethod] = useState("gallery"); // gallery | file | link
  const [linkValue, setLinkValue] = useState("");
  const [selected, setSelected] = useState([]);

  const togglePhoto = (i) => {
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  const handleUpload = () => {
    if (method === "link") {
      if (!linkValue.trim()) {
        window.alert("링크를 입력해주세요.");
        return;
      }
      onNext([{ type: "link", value: linkValue }]);
      return;
    }
    if (selected.length === 0) {
      window.alert("추가할 장소의 사진을 선택해주세요.");
      return;
    }
    onNext(selected.map((i) => ({ type: "photo", index: i })));
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <Header title="업로드" />

      <div style={s.uploadBody}>
        <p style={s.uploadIntroText}>
          나만의 맛집을 <b>저장하고 관리해보세요!</b>
        </p>

        <div style={s.methodRow}>
          <button
            type="button"
            style={method === "gallery" ? s.methodBtnActive : s.methodBtn}
            onClick={() => setMethod("gallery")}
          >
            <i className="ti ti-photo" style={{ fontSize: 20 }} />
            <span style={s.methodLabel}>갤러리</span>
          </button>
          <button
            type="button"
            style={method === "file" ? s.methodBtnActive : s.methodBtn}
            onClick={() => setMethod("file")}
          >
            <i className="ti ti-file" style={{ fontSize: 20 }} />
            <span style={s.methodLabel}>파일</span>
          </button>
          <button
            type="button"
            style={method === "link" ? s.methodBtnActive : s.methodBtn}
            onClick={() => setMethod("link")}
          >
            <i className="ti ti-link" style={{ fontSize: 20 }} />
            <span style={s.methodLabel}>링크</span>
          </button>
        </div>

        {method === "link" ? (
          <div style={{ marginTop: 20 }}>
            <p style={s.selectLabel}>공유받은 링크를 붙여넣어주세요.</p>
            <input
              type="text"
              placeholder="https://..."
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              style={s.linkInput}
            />
          </div>
        ) : (
          <>
            <div style={s.selectRow}>
              <p style={s.selectLabel}>추가할 장소를 선택해주세요.</p>
              <span style={s.selectCount}>{selected.length}장 선택됨</span>
            </div>
            <div style={s.filterRow}>
              <span style={s.screenshotDropdown}>
                스크린샷 <i className="ti ti-chevron-down" style={{ fontSize: 13 }} />
              </span>
              <button
                type="button"
                style={s.selectAllBtn}
                onClick={() =>
                  setSelected(
                    selected.length === PHOTO_COUNT
                      ? []
                      : Array.from({ length: PHOTO_COUNT }, (_, i) => i)
                  )
              }
              >
                <i className="ti ti-copy-check" style={{ fontSize: 13 }} /> 선택
              </button>
            </div>

            <div style={s.photoGrid}>
              <button
                type="button"
                style={s.cameraCell}
                onClick={() => window.alert("카메라를 실행합니다.")}
                aria-label="카메라로 촬영"
              >
                <i className="ti ti-camera" style={{ fontSize: 22, color: "#B4B2A9" }} />
              </button>
              {Array.from({ length: PHOTO_COUNT }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => togglePhoto(i)}
                  style={{
                    ...s.photoCell,
                    borderColor: selected.includes(i) ? "#1A1A1A" : "#E5E5E5",
                  }}
                >
                  <i className="ti ti-photo-x" style={{ fontSize: 20, color: "#C4C2B8" }} />
                  {selected.includes(i) && (
                    <span style={s.photoCheckBadge}>
                      <i className="ti ti-check" style={{ fontSize: 11, color: "#FFFFFF" }} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={s.footer}>
        <button type="button" onClick={handleUpload} style={s.primaryButton}>
          업로드
        </button>
      </div>
      <TabBar active="upload" />
      <HomeIndicator />
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 화면 2: 업로드 - 정보 확인 (업로드 하시겠습니까?)
// ----------------------------------------------------
function UploadConfirmScreen({ onConfirm }) {
  return (
    <PhoneFrame>
      <StatusBar />
      <Header title="업로드" />
      <div style={s.uploadBody}>
        <p style={s.confirmTitle}>업로드 하시겠습니까?</p>
        <div style={s.previewImageBox}>
          <i className="ti ti-photo-x" style={{ fontSize: 40, color: "#C4C2B8" }} />
        </div>
      </div>
      <div style={s.footer}>
        <button type="button" onClick={onConfirm} style={s.primaryButton}>
          업로드
        </button>
      </div>
      <TabBar active="upload" />
      <HomeIndicator />
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 화면 3: 이미지를 읽는중
// ----------------------------------------------------
function ReadingScreen({ onDone }) {
  const [dot, setDot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setDot((d) => (d + 1) % 3), 400);
    onDone().finally(() => clearInterval(interval));
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PhoneFrame>
      <StatusBar />
      <Header title="업로드" />
      <div style={s.uploadBody}>
        <p style={s.confirmTitle}>이미지 읽는 중...</p>
        <div style={s.previewImageBox}>
          <i className="ti ti-photo-x" style={{ fontSize: 40, color: "#C4C2B8" }} />
        </div>
        <div style={s.loadingDotsRow}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ ...s.loadingDot, opacity: i === dot ? 1 : 0.3 }} />
          ))}
        </div>
      </div>
      <div style={s.footer}>
        <button type="button" disabled style={{ ...s.primaryButton, opacity: 0.5 }}>
          업로드
        </button>
      </div>
      <TabBar active="upload" />
      <HomeIndicator />
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 화면 4: 업로드 - 정보 확인 (추출된 정보 수정 + 페이지네이션)
// ----------------------------------------------------
function InfoConfirmScreen({ items, onSave }) {
  const [index, setIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [data, setData] = useState(items);
  const [saving, setSaving] = useState(false);

  const current = data[index];

  const updateField = (field, value) => {
    setData((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePlaces(data);
      onSave(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <Header title="업로드" />
      <div style={s.uploadBody}>
        <div style={s.infoTitleRow}>
          <p style={s.confirmTitle}>정보가 맞는지 확인해주세요!</p>
          <button
            type="button"
            style={s.editIconBtn}
            onClick={() => setEditMode((v) => !v)}
            aria-label="정보 수정"
          >
            <i className="ti ti-pencil" style={{ fontSize: 16 }} />
          </button>
        </div>

        <div style={s.previewImageBox}>
          <i className="ti ti-photo-x" style={{ fontSize: 40, color: "#C4C2B8" }} />
        </div>

        {!editMode ? (
          <>
            <p style={s.placeName}>
              {current.name}
              <span style={s.placePrice}>{current.price}</span>
            </p>
            <p style={s.placeCategory}>{current.category}</p>
            <p style={s.placeMetaRow}>
              <i className="ti ti-map-pin" style={{ fontSize: 13 }} /> {current.address}
            </p>
            <p style={s.placeMetaRow}>
              <i className="ti ti-calendar" style={{ fontSize: 13 }} /> {current.hours}
            </p>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <input value={current.name} onChange={(e) => updateField("name", e.target.value)} style={s.editInput} placeholder="가게 이름" />
            <input value={current.category} onChange={(e) => updateField("category", e.target.value)} style={s.editInput} placeholder="카테고리" />
            <input value={current.price} onChange={(e) => updateField("price", e.target.value)} style={s.editInput} placeholder="가격대" />
            <input value={current.address} onChange={(e) => updateField("address", e.target.value)} style={s.editInput} placeholder="주소" />
            <input value={current.hours} onChange={(e) => updateField("hours", e.target.value)} style={s.editInput} placeholder="영업시간" />
          </div>
        )}

        {data.length > 1 && (
          <div style={s.paginationRow}>
            {data.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}번째 항목`}
                style={{ ...s.pageDot, background: i === index ? "#1A1A1A" : "#DADADA" }}
              />
            ))}
          </div>
        )}
      </div>

      <div style={s.footer}>
        <button type="button" onClick={handleSave} disabled={saving} style={s.primaryButton}>
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
      <TabBar active="upload" />
      <HomeIndicator />
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 화면 5: 업로드 - 저장 완료
// ----------------------------------------------------
const PRESET_SAVED = [
  { name: "도담 레스토랑", category: "한식", address: "서울 송파구 올림픽로 99", hours: "주말 휴무, 평일 9:00 ~ 21:00" },
  { name: "SEOUL 피자 & 스파게티", category: "양식", address: "서울 강남구 테헤란로 123", hours: "주말 휴무, 평일 9:00 ~ 21:00" },
  { name: "한강 바베큐", category: "바베큐", address: "서울 영등포구 여의도동 45", hours: "매일 11:00 ~ 22:00" },
];

function SavedDoneScreen({ newItems, onAddMore }) {
  const [list, setList] = useState([...PRESET_SAVED, ...newItems]);

  const handleDelete = (i) => {
    setList((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <Header title="업로드" />
      <div style={s.uploadBody}>
        <div style={s.doneIconWrap}>
          <div style={s.doneCircle}>
            <i className="ti ti-check" style={{ fontSize: 28, color: "#FFFFFF" }} />
          </div>
          <p style={s.doneTitle}>저장 완료</p>
          <p style={s.doneSubtitle}>선택한 맛집이 저장되었습니다.</p>
        </div>

        <div style={s.listTitleRow}>
          <span style={s.listTitle}>저장 리스트</span>
          <span style={s.listActions}>
            <i className="ti ti-pencil" style={{ fontSize: 14 }} />
            <i className="ti ti-trash" style={{ fontSize: 14 }} />
          </span>
        </div>

        <div style={s.savedList}>
          {list.map((item, i) => (
            <div key={i} style={s.savedRow}>
              <div style={{ flex: 1 }}>
                <p style={s.savedName}>{item.name}</p>
                <p style={s.savedCategory}>{item.category}</p>
                <p style={s.savedMeta}>
                  <i className="ti ti-map-pin" style={{ fontSize: 11 }} /> {item.address}
                </p>
                <p style={s.savedMeta}>
                  <i className="ti ti-calendar" style={{ fontSize: 11 }} /> {item.hours}
                </p>
              </div>
              <button type="button" style={s.deleteBtn} onClick={() => handleDelete(i)} aria-label="삭제">
                <i className="ti ti-x" style={{ fontSize: 14 }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={s.footer}>
        <button type="button" onClick={onAddMore} style={s.primaryButton}>
          <i className="ti ti-plus" style={{ fontSize: 14 }} /> 추가하기
        </button>
      </div>
      <TabBar active="upload" />
      <HomeIndicator />
    </PhoneFrame>
  );
}

// ----------------------------------------------------
// 최상위 컴포넌트
// ----------------------------------------------------
export default function UploadFlow() {
  const [screen, setScreen] = useState("init");
  const [selectedItems, setSelectedItems] = useState([]);
  const [extractedItems, setExtractedItems] = useState([]);
  const [savedNewItems, setSavedNewItems] = useState([]);

  if (screen === "init")
    return (
      <UploadInitScreen
        onNext={(items) => {
          setSelectedItems(items);
          setScreen("confirm");
        }}
      />
    );

  if (screen === "confirm")
    return <UploadConfirmScreen onConfirm={() => setScreen("reading")} />;

  if (screen === "reading")
    return (
      <ReadingScreen
        onDone={async () => {
          const results = await Promise.all(selectedItems.map((_, i) => extractPlaceInfo(i)));
          setExtractedItems(results);
          setScreen("infoConfirm");
        }}
      />
    );

  if (screen === "infoConfirm")
    return (
      <InfoConfirmScreen
        items={extractedItems}
        onSave={(data) => {
          setSavedNewItems(data);
          setScreen("done");
        }}
      />
    );

  if (screen === "done")
    return (
      <SavedDoneScreen
        newItems={savedNewItems}
        onAddMore={() => {
          setSelectedItems([]);
          setExtractedItems([]);
          setSavedNewItems([]);
          setScreen("init");
        }}
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

  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 0" },
  headerTitle: { fontSize: 15, fontWeight: 700 },
  iconButton: { background: "none", border: "none", color: "#1A1A1A", cursor: "pointer", padding: 4 },

  uploadBody: { flex: 1, padding: "16px 18px 0", overflowY: "auto" },
  uploadIntroText: { fontSize: 15.5, lineHeight: 1.5, margin: "0 0 18px", color: "#1A1A1A" },

  methodRow: { display: "flex", gap: 10 },
  methodBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "12px 0",
    border: "1px solid #E5E5E5",
    borderRadius: 10,
    background: "#FAFAF8",
    color: "#8A8A8A",
    cursor: "pointer",
  },
  methodBtnActive: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "12px 0",
    border: "1px solid #1A1A1A",
    borderRadius: 10,
    background: "#1A1A1A",
    color: "#FFFFFF",
    cursor: "pointer",
  },
  methodLabel: { fontSize: 11 },

  linkInput: {
    width: "100%",
    height: 42,
    padding: "0 12px",
    fontSize: 13,
    border: "1px solid #DADADA",
    borderRadius: 8,
    outline: "none",
    boxSizing: "border-box",
  },

  selectRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 },
  selectLabel: { fontSize: 12.5, color: "#3A3A3A", margin: 0 },
  selectCount: { fontSize: 11, color: "#8A8A8A" },

  filterRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  screenshotDropdown: { fontSize: 11.5, color: "#8A8A8A", display: "flex", alignItems: "center", gap: 2 },
  selectAllBtn: {
    fontSize: 11,
    color: "#3A3A3A",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  photoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 10 },
  cameraCell: {
    aspectRatio: "1",
    border: "1px solid #E5E5E5",
    borderRadius: 6,
    background: "#F5F4F0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  photoCell: {
    position: "relative",
    aspectRatio: "1",
    border: "1px solid #E5E5E5",
    borderRadius: 6,
    background: "#EDECE6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  photoCheckBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#1A1A1A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmTitle: { fontSize: 15.5, fontWeight: 600, margin: "0 0 18px" },
  previewImageBox: {
    width: "100%",
    height: 220,
    border: "1px solid #E5E5E5",
    borderRadius: 8,
    background: "#F0EFEA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingDotsRow: { display: "flex", justifyContent: "center", gap: 8, marginTop: 20 },
  loadingDot: { width: 7, height: 7, borderRadius: "50%", background: "#1A1A1A", transition: "opacity 0.2s" },

  infoTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  editIconBtn: { background: "none", border: "none", color: "#1A1A1A", cursor: "pointer", padding: 4 },

  placeName: { fontSize: 15, fontWeight: 700, margin: "14px 0 2px", display: "flex", justifyContent: "space-between" },
  placePrice: { fontSize: 12.5, fontWeight: 400, color: "#3A3A3A" },
  placeCategory: { fontSize: 12, color: "#8A8A8A", margin: "0 0 10px" },
  placeMetaRow: { fontSize: 12, color: "#3A3A3A", display: "flex", alignItems: "center", gap: 5, margin: "4px 0" },

  editInput: {
    width: "100%",
    height: 38,
    padding: "0 12px",
    fontSize: 12.5,
    border: "1px solid #DADADA",
    borderRadius: 6,
    outline: "none",
    boxSizing: "border-box",
  },

  paginationRow: { display: "flex", justifyContent: "center", gap: 6, marginTop: 16 },
  pageDot: { width: 6, height: 6, borderRadius: "50%", border: "none", cursor: "pointer" },

  doneIconWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 0 20px" },
  doneCircle: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "#1A1A1A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  doneTitle: { fontSize: 15, fontWeight: 700, margin: 0 },
  doneSubtitle: { fontSize: 12, color: "#8A8A8A", margin: 0 },

  listTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  listTitle: { fontSize: 13, fontWeight: 700 },
  listActions: { display: "flex", gap: 10, color: "#8A8A8A" },

  savedList: { display: "flex", flexDirection: "column", gap: 10 },
  savedRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "10px 0",
    borderBottom: "1px solid #F0F0F0",
  },
  savedName: { fontSize: 13, fontWeight: 600, margin: "0 0 2px" },
  savedCategory: { fontSize: 11, color: "#8A8A8A", margin: "0 0 4px" },
  savedMeta: { fontSize: 11, color: "#8A8A8A", display: "flex", alignItems: "center", gap: 4, margin: "2px 0" },
  deleteBtn: { background: "none", border: "none", color: "#B0B0B0", cursor: "pointer", padding: 4, flexShrink: 0 },

  footer: { padding: "14px 18px 6px" },
  primaryButton: {
    width: "100%",
    height: 46,
    borderRadius: 10,
    border: "none",
    background: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  tabBar: { display: "flex", borderTop: "1px solid #EDEDED", padding: "10px 0 6px" },
  tabButton: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  tabLabel: { fontSize: 10 },
};
