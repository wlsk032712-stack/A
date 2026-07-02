import React, { useState } from "react";

/**
 * 플레이스픽 — 저장 화면 (저장 / 예약 서브탭 통합)
 * ------------------------------------------------------------
 * 하단 탭바의 "저장/예약" 탭 하나로 들어와서, 화면 상단 서브탭으로
 * 저장 목록과 예약 목록을 전환합니다.
 *
 * 중요: window.alert / window.confirm / window.prompt는 아티팩트 iframe 샌드박스에서
 * 막혀 있어 조용히 아무 반응이 없을 수 있습니다. 그래서 전부 화면 내부의
 * 커스텀 토스트 / 확인 다이얼로그 / 이름수정 모달로 대체했습니다.
 *
 * 서버 연동 지점 (지금은 mock):
 *   - fetchCollections() / fetchReservations() -> 실제 API로 교체
 *   - deleteCollection(id) / cancelReservations(id) -> 실제 API로 교체
 */

// ----------------------------------------------------
// mock 데이터
// ----------------------------------------------------
const MOCK_PLACE = {
  name: "쿠로코 식당 연남점",
  status: "영업중 11:00-21:00",
  address: "서울 서대문구 연남길 2 로3 803",
  rating: 4.9,
  reviewCount: 146,
};

const INITIAL_COLLECTIONS = [
  {
    id: "c1",
    name: "컬렉션 이름",
    favorite: true,
    items: [
      { ...MOCK_PLACE },
      { ...MOCK_PLACE, name: "식당 이름" },
      { ...MOCK_PLACE, name: "쿠로코 식당 연남점" },
    ],
  },
  {
    id: "c2",
    name: "컬렉션 2",
    favorite: false,
    items: [
      { ...MOCK_PLACE },
      { ...MOCK_PLACE, name: "식당 이름" },
      { ...MOCK_PLACE, name: "쿠로코 식당 연남점" },
    ],
  },
];

const INITIAL_RESERVATIONS = [
  {
    id: "r1",
    date: "2026.04.25",
    label: "오늘의 예약",
    cancelled: false,
    items: [
      { time: "13:30", ...MOCK_PLACE, code: "3145" },
      { time: "15:00", ...MOCK_PLACE, name: "카페 봄날", code: "3145" },
    ],
  },
  {
    id: "r2",
    date: "2026.04.25",
    label: "2026.04.25 목요일",
    cancelled: false,
    items: [
      { time: "13:30", ...MOCK_PLACE, code: "3145" },
      { time: "15:00", ...MOCK_PLACE, name: "카페 봄날", code: "3145" },
    ],
  },
  {
    id: "r3",
    date: "2026.04.25",
    label: "2026.04.25 목요일",
    cancelled: true,
    items: [{ time: "13:30", ...MOCK_PLACE, code: "3145" }],
  },
];

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

const TABS = [
  { key: "home", label: "홈", icon: "ti-home" },
  { key: "upload", label: "업로드", icon: "ti-circle-plus" },
  { key: "saved", label: "저장/예약", icon: "ti-bookmark" },
  { key: "ranking", label: "랭킹", icon: "ti-trophy" },
];

function BottomTabBar() {
  return (
    <div style={s.bottomTabBar}>
      {TABS.map((t) => (
        <div key={t.key} style={s.bottomTabButton}>
          <i className={`ti ${t.icon}`} style={{ fontSize: 20, color: t.key === "saved" ? "#1A1A1A" : "#B0B0B0" }} />
          <span style={{ ...s.bottomTabLabel, color: t.key === "saved" ? "#1A1A1A" : "#B0B0B0" }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

function PlaceCard({ place }) {
  return (
    <div style={s.placeCard}>
      <div style={s.placeThumb}>
        <i className="ti ti-photo-x" style={{ fontSize: 18, color: "#B4B2A9" }} />
      </div>
      <div style={s.placeInfo}>
        <p style={s.placeName}>{place.name}</p>
        <p style={s.placeStatus}>{place.status}</p>
        <p style={s.placeAddress}>{place.address}</p>
      </div>
      <div style={s.placeRatingCol}>
        {place.code && <span style={s.placeCode}>예약 {place.code}</span>}
        <span style={s.placeRating}>
          <i className="ti ti-star-filled" style={{ fontSize: 11, color: "#F2B84B" }} /> {place.rating}
          {place.reviewCount ? `(${place.reviewCount})` : ""}
        </span>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 브라우저 팝업(alert/confirm/prompt) 대체용 커스텀 UI
// ----------------------------------------------------
function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={s.toast}>
      <span style={s.toastText}>{message}</span>
    </div>
  );
}

function ConfirmDialog({ dialog, onCancel }) {
  if (!dialog) return null;
  return (
    <div style={s.sheetOverlay} onClick={onCancel}>
      <div style={s.confirmBox} onClick={(e) => e.stopPropagation()}>
        <p style={s.confirmMessage}>{dialog.message}</p>
        <div style={s.confirmBtnRow}>
          <button type="button" style={s.confirmCancelBtn} onClick={onCancel}>
            아니오
          </button>
          <button
            type="button"
            style={dialog.danger ? { ...s.confirmOkBtn, background: "#C0392B" } : s.confirmOkBtn}
            onClick={() => {
              dialog.onConfirm();
            }}
          >
            {dialog.confirmLabel || "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditNameModal({ target, onSave, onCancel }) {
  const [value, setValue] = useState(target ? target.name : "");

  React.useEffect(() => {
    if (target) setValue(target.name);
  }, [target]);

  if (!target) return null;
  return (
    <div style={s.sheetOverlay} onClick={onCancel}>
      <div style={s.confirmBox} onClick={(e) => e.stopPropagation()}>
        <p style={s.confirmMessage}>컬렉션 이름 수정</p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={s.editNameInput}
          autoFocus
        />
        <div style={s.confirmBtnRow}>
          <button type="button" style={s.confirmCancelBtn} onClick={onCancel}>
            취소
          </button>
          <button type="button" style={s.confirmOkBtn} onClick={() => onSave(value)}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 저장 탭
// ----------------------------------------------------
function CollectionCard({ collection, onToggleFavorite, onOpenActions }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? collection.items : collection.items.slice(0, 2);
  const hasMore = collection.items.length > 2;

  return (
    <div style={s.collectionCard}>
      <div style={s.collectionHeader}>
        <span style={s.collectionName}>{collection.name}</span>
        <button type="button" style={s.iconBtnSmall} onClick={() => onOpenActions(collection)} aria-label="컬렉션 편집">
          <i className="ti ti-pencil" style={{ fontSize: 14 }} />
        </button>
        <button
          type="button"
          style={s.iconBtnSmall}
          onClick={() => onToggleFavorite(collection.id)}
          aria-label="즐겨찾기"
        >
          <i
            className={collection.favorite ? "ti ti-star-filled" : "ti ti-star"}
            style={{ fontSize: 15, color: collection.favorite ? "#F2B84B" : "#C4C2B8" }}
          />
        </button>
      </div>

      {visibleItems.map((item, i) => (
        <PlaceCard key={i} place={item} />
      ))}

      {hasMore && (
        <button type="button" style={s.moreBtn} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "접기" : `더보기 (${collection.items.length - 2})`}
        </button>
      )}
    </div>
  );
}

function ActionSheet({ collection, onClose, onEdit, onShare, onDelete }) {
  if (!collection) return null;
  return (
    <div style={s.sheetOverlay} onClick={onClose}>
      <div style={s.actionSheet} onClick={(e) => e.stopPropagation()}>
        <div style={s.sheetHandle} />
        <button type="button" style={s.sheetActionBtn} onClick={() => onEdit(collection)}>
          편집
        </button>
        <button type="button" style={s.sheetActionBtn} onClick={() => onShare(collection)}>
          공유
        </button>
        <button type="button" style={{ ...s.sheetActionBtn, color: "#C0392B" }} onClick={() => onDelete(collection)}>
          삭제
        </button>
      </div>
    </div>
  );
}

function SavedTab({ showToast, showConfirm }) {
  const [collections, setCollections] = useState(INITIAL_COLLECTIONS);
  const [sheetTarget, setSheetTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [sortDesc, setSortDesc] = useState(true);

  const toggleFavorite = (id) => {
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)));
  };

  const openEdit = (collection) => {
    setSheetTarget(null);
    setEditTarget(collection);
  };

  const saveEdit = (newName) => {
    if (newName && newName.trim()) {
      setCollections((prev) => prev.map((c) => (c.id === editTarget.id ? { ...c, name: newName.trim() } : c)));
      showToast("컬렉션 이름을 수정했어요.");
    }
    setEditTarget(null);
  };

  const handleShare = (collection) => {
    setSheetTarget(null);
    showToast(`"${collection.name}" 공유 링크를 복사했어요.`);
  };

  const handleDelete = (collection) => {
    setSheetTarget(null);
    showConfirm({
      message: `"${collection.name}" 컬렉션을 삭제할까요?`,
      danger: true,
      confirmLabel: "삭제",
      onConfirm: () => {
        setCollections((prev) => prev.filter((c) => c.id !== collection.id));
        showToast("컬렉션을 삭제했어요.");
      },
    });
  };

  return (
    <>
      <div style={s.sortRow}>
        <button type="button" style={s.sortDropdown} onClick={() => setSortDesc((v) => !v)}>
          {sortDesc ? "최신순" : "오래된순"} <i className="ti ti-chevron-down" style={{ fontSize: 13 }} />
        </button>
      </div>

      <div style={s.scrollBody}>
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onToggleFavorite={toggleFavorite}
            onOpenActions={setSheetTarget}
          />
        ))}
        {collections.length === 0 && <p style={s.emptyText}>저장된 컬렉션이 없어요.</p>}
      </div>

      <ActionSheet
        collection={sheetTarget}
        onClose={() => setSheetTarget(null)}
        onEdit={openEdit}
        onShare={handleShare}
        onDelete={handleDelete}
      />
      <EditNameModal target={editTarget} onSave={saveEdit} onCancel={() => setEditTarget(null)} />
    </>
  );
}

// ----------------------------------------------------
// 예약 탭
// ----------------------------------------------------
function ReservationGroup({ group, onCancel }) {
  if (group.cancelled) {
    return (
      <div style={s.reservationGroupCancelled}>
        <div style={s.reservationHeaderRow}>
          <span style={s.reservationLabel}>{group.label}</span>
        </div>
        <p style={s.cancelledText}>취소 된 예약 정보입니다.</p>
      </div>
    );
  }

  return (
    <div style={group.isToday ? s.reservationGroupToday : s.reservationGroup}>
      <div style={s.reservationHeaderRow}>
        <span style={s.reservationLabel}>
          {group.label} {group.date}
        </span>
        <button type="button" style={s.cancelLink} onClick={() => onCancel(group)}>
          취소하기
        </button>
      </div>
      {group.items.map((item, i) => (
        <div key={i} style={s.reservationItem}>
          <span style={s.reservationTime}>{item.time}</span>
          <PlaceCard place={item} />
        </div>
      ))}
    </div>
  );
}

function ReservationTab({ showToast, showConfirm }) {
  const [groups, setGroups] = useState(
    INITIAL_RESERVATIONS.map((g, i) => ({ ...g, isToday: i === 0 }))
  );
  const [sortDesc, setSortDesc] = useState(true);

  const handleCancel = (target) => {
    showConfirm({
      message: "이 예약을 취소할까요?",
      danger: true,
      confirmLabel: "예약 취소",
      onConfirm: () => {
        setGroups((prev) => prev.map((g) => (g.id === target.id ? { ...g, cancelled: true } : g)));
        showToast("예약이 취소되었어요.");
      },
    });
  };

  return (
    <>
      <div style={s.sortRow}>
        <button type="button" style={s.sortDropdown} onClick={() => setSortDesc((v) => !v)}>
          {sortDesc ? "최신순" : "오래된순"} <i className="ti ti-chevron-down" style={{ fontSize: 13 }} />
        </button>
      </div>

      <div style={s.scrollBody}>
        {groups.map((group) => (
          <ReservationGroup key={group.id} group={group} onCancel={handleCancel} />
        ))}
      </div>

      <div style={s.reservationFooter}>
        <button type="button" style={s.reserveButton} onClick={() => showToast("예약하기 화면으로 이동합니다.")}>
          예약하기
        </button>
        <button
          type="button"
          style={s.moreInfoButton}
          onClick={() => showToast("식당 상세 정보를 불러옵니다.")}
        >
          식당 정보 더보기
        </button>
      </div>
    </>
  );
}

// ----------------------------------------------------
// 최상위 컴포넌트
// ----------------------------------------------------
export default function SavedScreen() {
  const [tab, setTab] = useState("saved"); // saved | reservation
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2000);
  };

  const showConfirm = (dialog) => {
    setConfirmDialog({
      ...dialog,
      onConfirm: () => {
        dialog.onConfirm();
        setConfirmDialog(null);
      },
    });
  };

  return (
    <div style={s.phone}>
      <StatusBar />
      <div style={s.header}>
        <button type="button" style={s.iconBtnSmall} aria-label="메뉴">
          <i className="ti ti-menu-2" style={{ fontSize: 20 }} />
        </button>
        <span style={s.headerTitle}>저장/예약</span>
        <button type="button" style={s.iconBtnSmall} aria-label="알림">
          <i className="ti ti-bell" style={{ fontSize: 20 }} />
        </button>
      </div>

      <div style={s.subTabRow}>
        <button
          type="button"
          onClick={() => setTab("saved")}
          style={tab === "saved" ? s.subTabActive : s.subTab}
        >
          저장
        </button>
        <button
          type="button"
          onClick={() => setTab("reservation")}
          style={tab === "reservation" ? s.subTabActive : s.subTab}
        >
          예약
        </button>
      </div>

      {tab === "saved" ? (
        <SavedTab showToast={showToast} showConfirm={showConfirm} />
      ) : (
        <ReservationTab showToast={showToast} showConfirm={showConfirm} />
      )}

      <BottomTabBar />
      <HomeIndicator />

      <ConfirmDialog dialog={confirmDialog} onCancel={() => setConfirmDialog(null)} />
      <Toast message={toast} />
    </div>
  );
}

// ----------------------------------------------------
// 스타일
// ----------------------------------------------------
const s = {
  phone: {
    width: 375,
    minHeight: 780,
    margin: "0 auto",
    background: "#FFFFFF",
    border: "1px solid #E5E5E5",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#1A1A1A",
    position: "relative",
    overflow: "hidden",
  },
  statusBar: { display: "flex", justifyContent: "space-between", padding: "10px 18px 0", fontSize: 13, fontWeight: 600 },
  statusIcons: { display: "flex", gap: 4, alignItems: "center" },

  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 0" },
  headerTitle: { fontSize: 15, fontWeight: 700 },
  iconBtnSmall: { background: "none", border: "none", color: "#1A1A1A", cursor: "pointer", padding: 4 },

  subTabRow: { display: "flex", gap: 20, padding: "14px 18px 0", borderBottom: "1px solid #F0F0F0" },
  subTab: { fontSize: 13.5, color: "#B0B0B0", background: "none", border: "none", padding: "0 0 10px", cursor: "pointer" },
  subTabActive: {
    fontSize: 13.5,
    color: "#1A1A1A",
    fontWeight: 700,
    background: "none",
    border: "none",
    borderBottom: "2px solid #1A1A1A",
    padding: "0 0 10px",
    cursor: "pointer",
  },

  sortRow: { display: "flex", justifyContent: "flex-end", padding: "10px 18px 0" },
  sortDropdown: {
    fontSize: 11.5,
    color: "#8A8A8A",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 2,
  },

  scrollBody: { flex: 1, padding: "8px 18px 0", overflowY: "auto" },
  emptyText: { textAlign: "center", color: "#B0B0B0", fontSize: 12.5, marginTop: 40 },

  collectionCard: { marginBottom: 20 },
  collectionHeader: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8 },
  collectionName: { fontSize: 13.5, fontWeight: 700, flex: 1 },

  placeCard: { display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid #F5F5F5" },
  placeThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    background: "#2A2A28",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  placeInfo: { flex: 1, minWidth: 0 },
  placeName: { fontSize: 12.5, fontWeight: 600, margin: "0 0 2px" },
  placeStatus: { fontSize: 10.5, color: "#8A8A8A", margin: "0 0 2px" },
  placeAddress: { fontSize: 10.5, color: "#B0B0B0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  placeRatingCol: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 },
  placeCode: { fontSize: 9.5, color: "#8A8A8A" },
  placeRating: { fontSize: 11, fontWeight: 600, color: "#1A1A1A", display: "flex", alignItems: "center", gap: 2 },

  moreBtn: {
    width: "100%",
    textAlign: "center",
    fontSize: 11.5,
    color: "#8A8A8A",
    background: "#FAFAF8",
    border: "1px solid #F0F0F0",
    borderRadius: 6,
    padding: "6px 0",
    cursor: "pointer",
    marginTop: 4,
  },

  sheetOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "flex-end",
    borderRadius: 12,
    zIndex: 20,
  },
  actionSheet: { width: "100%", background: "#FFFFFF", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: "10px 0 20px" },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, background: "#DADADA", margin: "0 auto 8px" },
  sheetActionBtn: {
    width: "100%",
    textAlign: "center",
    padding: "14px 0",
    fontSize: 14,
    fontWeight: 600,
    color: "#1A1A1A",
    background: "none",
    border: "none",
    borderTop: "1px solid #F0F0F0",
    cursor: "pointer",
  },

  confirmBox: {
    width: "100%",
    background: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: "24px 20px 20px",
    boxSizing: "border-box",
  },
  confirmMessage: { fontSize: 14, fontWeight: 600, textAlign: "center", margin: "0 0 18px", color: "#1A1A1A" },
  confirmBtnRow: { display: "flex", gap: 8 },
  confirmCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    border: "1px solid #DADADA",
    background: "#FFFFFF",
    color: "#3A3A3A",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  confirmOkBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    border: "none",
    background: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  editNameInput: {
    width: "100%",
    height: 42,
    padding: "0 12px",
    fontSize: 13,
    border: "1px solid #DADADA",
    borderRadius: 8,
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 16,
  },

  toast: {
    position: "absolute",
    left: "50%",
    bottom: 90,
    transform: "translateX(-50%)",
    background: "rgba(26,26,26,0.92)",
    color: "#FFFFFF",
    padding: "10px 18px",
    borderRadius: 20,
    fontSize: 12.5,
    zIndex: 30,
    maxWidth: "85%",
    textAlign: "center",
  },
  toastText: { margin: 0 },

  reservationGroup: { marginBottom: 20 },
  reservationGroupToday: {
    marginBottom: 20,
    background: "#EFEBFB",
    borderRadius: 12,
    padding: 10,
  },
  reservationGroupCancelled: {
    marginBottom: 20,
    opacity: 0.5,
  },
  reservationHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  reservationLabel: { fontSize: 12.5, fontWeight: 700, color: "#1A1A1A" },
  cancelLink: { fontSize: 11.5, color: "#8A8A8A", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" },
  cancelledText: { fontSize: 12, color: "#8A8A8A", textAlign: "center", padding: "16px 0" },
  reservationItem: { marginBottom: 8 },
  reservationTime: { fontSize: 11.5, fontWeight: 700, color: "#3A3A3A", display: "block", marginBottom: 4 },

  reservationFooter: { display: "flex", flexDirection: "column", gap: 8, padding: "10px 18px" },
  reserveButton: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    border: "none",
    background: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  moreInfoButton: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    border: "1px solid #DADADA",
    background: "#FFFFFF",
    color: "#3A3A3A",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },

  bottomTabBar: { display: "flex", borderTop: "1px solid #EDEDED", padding: "10px 0 6px" },
  bottomTabButton: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  bottomTabLabel: { fontSize: 10 },

  homeIndicatorWrap: { display: "flex", justifyContent: "center", padding: "8px 0 14px" },
  homeIndicator: { width: 110, height: 4, borderRadius: 2, background: "#1A1A1A" },
};
