(() => {
  'use strict';

  // =========================================================================
  // 1. 定数・カラーパレット・初期サンプルデータ定義
  // =========================================================================
  const COLOR_PALETTE = [
    { fill: '#3b82f6', stroke: '#1d4ed8', label: 'ブルー' },
    { fill: '#10b981', stroke: '#047857', label: 'エメラルド' },
    { fill: '#f59e0b', stroke: '#b45309', label: 'アンバー' },
    { fill: '#ef4444', stroke: '#b91c1c', label: 'レッド' },
    { fill: '#8b5cf6', stroke: '#6d28d9', label: 'バイオレット' },
    { fill: '#ec4899', stroke: '#be185d', label: 'ピンク' },
    { fill: '#06b6d4', stroke: '#0e7490', label: 'シアン' },
    { fill: '#84cc16', stroke: '#4d7c0f', label: 'ライム' },
    { fill: '#f97316', stroke: '#c2410c', label: 'オレンジ' },
    { fill: '#64748b', stroke: '#334155', label: 'スレート' }
  ];

  // 国土数値情報(N03)準拠のプロパティを持つ架空の「蒼海県」サンプル
  function createSampleFeatures() {
    const pNW = { x: -240, y: -170 };
    const pN1 = { x: -70, y: -195 };
    const pN2 = { x: 95, y: -180 };
    const pNE = { x: 230, y: -110 };
    const pE1 = { x: 255, y: 20 };
    const pSE = { x: 185, y: 155 };
    const pS1 = { x: 30, y: 185 };
    const pSW = { x: -155, y: 165 };
    const pW1 = { x: -260, y: 15 };

    const c1 = { x: -55, y: -35 };
    const c2 = { x: 75, y: -25 };
    const c3 = { x: 20, y: 75 };
    const c4 = { x: -110, y: 55 };

    return [
      {
        id: 'feat_pref_1',
        name: '蒼海',
        suffix: '県',
        adminLevel: 'prefecture',
        prefecture: '蒼海県', // N03_001
        subpref: '',          // N03_002
        county: '',           // N03_003
        code: '99000',        // N03_007
        fillColor: '#3b82f6',
        strokeColor: '#1e3a8a',
        visible: true,
        vertices: [pNW, pN1, pN2, pNE, pE1, pSE, pS1, pSW, pW1]
      },
      {
        id: 'feat_muni_1',
        name: '北嶺',
        suffix: '町',
        adminLevel: 'municipality',
        prefecture: '蒼海県',
        subpref: '',
        county: '北嶺郡',
        code: '99301',
        fillColor: '#10b981',
        strokeColor: '#065f46',
        visible: true,
        vertices: [pNW, pN1, pN2, c2, c1, pW1]
      },
      {
        id: 'feat_muni_2',
        name: '東雲',
        suffix: '市',
        adminLevel: 'municipality',
        prefecture: '蒼海県',
        subpref: '',
        county: '',
        code: '99201',
        fillColor: '#f59e0b',
        strokeColor: '#92400e',
        visible: true,
        vertices: [pN2, pNE, pE1, pSE, c3, c2]
      },
      {
        id: 'feat_muni_3',
        name: '中央',
        suffix: '区',
        adminLevel: 'municipality',
        prefecture: '蒼海県',
        subpref: '',
        county: '蒼海市',
        code: '99101',
        fillColor: '#ef4444',
        strokeColor: '#991b1b',
        visible: true,
        vertices: [c1, c2, c3, pS1, pSW, c4]
      },
      {
        id: 'feat_muni_4',
        name: '西湊',
        suffix: '区',
        adminLevel: 'municipality',
        prefecture: '蒼海県',
        subpref: '',
        county: '蒼海市',
        code: '99102',
        fillColor: '#8b5cf6',
        strokeColor: '#5b21b6',
        visible: true,
        vertices: [pW1, c1, c4, pSW]
      }
    ];
  }

  // =========================================================================
  // 2. アプリケーション状態管理
  // =========================================================================
  const state = {
    features: [],
    selectedId: null,
    tool: 'select',
    snapEnabled: true,
    showGrid: true,

    camera: {
      x: 0,
      y: 0,
      zoom: 1.0
    },

    geoMapping: {
      originLon: 138.00,
      originLat: 35.50,
      degPer100px: 0.10
    },

    underlay: {
      image: null,
      opacity: 0.45,
      scale: 1.0
    },

    mouseScreen: { x: 0, y: 0 },
    mouseWorld: { x: 0, y: 0 },
    snapTarget: null,
    hoveredVertex: null,
    hoveredMidpoint: null,

    drawingVertices: [],
    isFreehandDrawing: false,
    freehandPoints: [],

    dragMode: null,
    dragStartScreen: { x: 0, y: 0 },
    dragStartCamera: { x: 0, y: 0 },
    dragTargetVertexIndex: -1,
    dragStartFeatureVertices: null,
    isSpacePressed: false,

    history: [],
    historyIndex: -1
  };

  // =========================================================================
  // 3. DOM要素の取得
  // =========================================================================
  const canvas = document.getElementById('map-canvas');
  const ctx = canvas.getContext('2d');
  const canvasContainer = document.getElementById('canvas-container');

  const statusCoords = document.getElementById('status-coords');
  const statusZoom = document.getElementById('status-zoom');
  const statusHint = document.getElementById('status-hint');
  const statusSnapBadge = document.getElementById('status-snap-badge');
  const drawingToolbar = document.getElementById('drawing-toolbar');
  const drawingVertexCount = document.getElementById('drawing-vertex-count');

  const rightPanel = document.getElementById('right-panel');
  const propEmptyState = document.getElementById('prop-empty-state');
  const propForm = document.getElementById('prop-form');
  const propAdminLevel = document.getElementById('prop-admin-level');
  const propName = document.getElementById('prop-name');
  const propSuffix = document.getElementById('prop-suffix');
  const propPrefecture = document.getElementById('prop-prefecture');
  const propSubpref = document.getElementById('prop-subpref');
  const propCounty = document.getElementById('prop-county');
  const propCode = document.getElementById('prop-code');
  const propFillColor = document.getElementById('prop-fill-color');
  const propStrokeColor = document.getElementById('prop-stroke-color');
  const layerList = document.getElementById('layer-list');
  const layerCount = document.getElementById('layer-count');

  // =========================================================================
  // 4. ユーティリティ関数（座標変換・幾何演算・通知）
  // =========================================================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const bgClass = type === 'success'
      ? 'bg-emerald-600 text-white'
      : type === 'error'
      ? 'bg-rose-600 text-white'
      : 'bg-slate-800 dark:bg-slate-700 text-white';

    toast.className = `${bgClass} px-4 py-2 rounded-full text-xs font-medium shadow-lg transition-all duration-300 opacity-0 translate-y-2`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('opacity-0', 'translate-y-2');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 2600);
  }

  function screenToWorld(sx, sy) {
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    return {
      x: state.camera.x + (sx - cx) / state.camera.zoom,
      y: state.camera.y + (sy - cy) / state.camera.zoom
    };
  }

  function worldToScreen(wx, wy) {
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    return {
      x: cx + (wx - state.camera.x) * state.camera.zoom,
      y: cy + (wy - state.camera.y) * state.camera.zoom
    };
  }

  function worldToGeo(wx, wy) {
    const scale = state.geoMapping.degPer100px / 100;
    const lon = state.geoMapping.originLon + wx * scale;
    const lat = state.geoMapping.originLat - wy * scale;
    return [
      Number(lon.toFixed(6)),
      Number(lat.toFixed(6))
    ];
  }

  function geoToWorld(lon, lat) {
    const scale = state.geoMapping.degPer100px / 100;
    return {
      x: (lon - state.geoMapping.originLon) / scale,
      y: (state.geoMapping.originLat - lat) / scale
    };
  }

  function dist(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  function isPointInPolygon(pt, vertices) {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x, yi = vertices[i].y;
      const xj = vertices[j].x, yj = vertices[j].y;
      const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
        (pt.x < (xj - xi) * (pt.y - yi) / ((yj - yi) || 1e-12) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function getPolygonCentroid(vertices) {
    if (!vertices || vertices.length === 0) return { x: 0, y: 0 };
    let area = 0, cx = 0, cy = 0;
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      const cross = p1.x * p2.y - p2.x * p1.y;
      area += cross;
      cx += (p1.x + p2.x) * cross;
      cy += (p1.y + p2.y) * cross;
    }
    area *= 0.5;
    if (Math.abs(area) < 1e-5) {
      const sum = vertices.reduce((acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }), { x: 0, y: 0 });
      return { x: sum.x / vertices.length, y: sum.y / vertices.length };
    }
    return { x: cx / (6 * area), y: cy / (6 * area) };
  }

  function simplifyDouglasPeucker(points, epsilon) {
    if (points.length <= 2) return points;
    let maxDist = 0;
    let index = 0;
    const end = points.length - 1;

    for (let i = 1; i < end; i++) {
      const d = perpendicularDistance(points[i], points[0], points[end]);
      if (d > maxDist) {
        index = i;
        maxDist = d;
      }
    }

    if (maxDist > epsilon) {
      const left = simplifyDouglasPeucker(points.slice(0, index + 1), epsilon);
      const right = simplifyDouglasPeucker(points.slice(index), epsilon);
      return left.slice(0, -1).concat(right);
    } else {
      return [points[0], points[end]];
    }
  }

  function perpendicularDistance(pt, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const mag = Math.hypot(dx, dy);
    if (mag === 0) return dist(pt, lineStart);
    return Math.abs(dy * pt.x - dx * pt.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / mag;
  }

  // =========================================================================
  // 5. Undo / Redo 履歴管理
  // =========================================================================
  function cloneFeatures(features) {
    return JSON.parse(JSON.stringify(features));
  }

  function saveHistory() {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(cloneFeatures(state.features));
    if (state.history.length > 50) {
      state.history.shift();
    } else {
      state.historyIndex++;
    }
    updateHistoryButtons();
  }

  function undo() {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      state.features = cloneFeatures(state.history[state.historyIndex]);
      if (state.selectedId && !state.features.find(f => f.id === state.selectedId)) {
        state.selectedId = null;
      }
      updateHistoryButtons();
      syncUI();
      render();
      showToast('操作を元に戻しました');
    }
  }

  function redo() {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex++;
      state.features = cloneFeatures(state.history[state.historyIndex]);
      updateHistoryButtons();
      syncUI();
      render();
      showToast('操作をやり直しました');
    }
  }

  function updateHistoryButtons() {
    document.getElementById('btn-undo').disabled = state.historyIndex <= 0;
    document.getElementById('btn-redo').disabled = state.historyIndex >= state.history.length - 1;
  }

  // =========================================================================
  // 6. スナップ（頂点吸着）検出ロジック
  // =========================================================================
  function findSnapTarget(screenPt, excludeFeatureId = null, excludeVertexIndex = -1) {
    if (!state.snapEnabled) return null;
    const SNAP_RADIUS_PX = 14;
    let bestTarget = null;
    let minScreenDist = SNAP_RADIUS_PX;

    for (const feat of state.features) {
      if (!feat.visible) continue;
      for (let i = 0; i < feat.vertices.length; i++) {
        if (feat.id === excludeFeatureId && i === excludeVertexIndex) continue;
        const v = feat.vertices[i];
        const vs = worldToScreen(v.x, v.y);
        const d = dist(screenPt, vs);
        if (d < minScreenDist) {
          minScreenDist = d;
          bestTarget = {
            x: v.x,
            y: v.y,
            featureId: feat.id,
            vertexIndex: i
          };
        }
      }
    }
    return bestTarget;
  }

  // =========================================================================
  // 7. キャンバス描画エンジン
  // =========================================================================
  function resizeCanvas() {
    const rect = canvasContainer.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }

  function render() {
    const rect = canvasContainer.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const isDark = document.documentElement.classList.contains('dark');

    ctx.fillStyle = isDark ? '#090d16' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    if (state.showGrid) {
      drawGrid(width, height, isDark);
    }

    if (state.underlay.image) {
      drawUnderlayImage();
    }

    for (const feat of state.features) {
      if (!feat.visible || feat.vertices.length < 3) continue;
      const isSelected = feat.id === state.selectedId;
      drawFeaturePolygon(feat, isSelected, isDark);
    }

    if (state.tool === 'select' && state.selectedId) {
      const selectedFeat = state.features.find(f => f.id === state.selectedId);
      if (selectedFeat && selectedFeat.visible) {
        drawEditHandles(selectedFeat);
      }
    }

    if (state.tool === 'polygon' && state.drawingVertices.length > 0) {
      drawPolygonInProgress();
    }

    if (state.tool === 'freehand' && state.isFreehandDrawing && state.freehandPoints.length > 1) {
      drawFreehandInProgress();
    }

    if (state.snapTarget) {
      const sp = worldToScreen(state.snapTarget.x, state.snapTarget.y);
      ctx.save();
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 9, 0, Math.PI * 2);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.restore();
    }
  }

  function drawGrid(width, height, isDark) {
    let gridStepWorld = 50;
    if (state.camera.zoom < 0.4) gridStepWorld = 200;
    else if (state.camera.zoom < 0.8) gridStepWorld = 100;
    else if (state.camera.zoom > 2.5) gridStepWorld = 25;

    const topLeft = screenToWorld(0, 0);
    const bottomRight = screenToWorld(width, height);

    const startX = Math.floor(topLeft.x / gridStepWorld) * gridStepWorld;
    const endX = Math.ceil(bottomRight.x / gridStepWorld) * gridStepWorld;
    const startY = Math.floor(topLeft.y / gridStepWorld) * gridStepWorld;
    const endY = Math.ceil(bottomRight.y / gridStepWorld) * gridStepWorld;

    ctx.save();
    ctx.lineWidth = 1;

    for (let wx = startX; wx <= endX; wx += gridStepWorld) {
      const sx = worldToScreen(wx, 0).x;
      const isAxis = Math.abs(wx) < 1e-5;
      ctx.strokeStyle = isAxis
        ? (isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.3)')
        : (isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(148, 163, 184, 0.22)');
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();
    }

    for (let wy = startY; wy <= endY; wy += gridStepWorld) {
      const sy = worldToScreen(0, wy).y;
      const isAxis = Math.abs(wy) < 1e-5;
      ctx.strokeStyle = isAxis
        ? (isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.3)')
        : (isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(148, 163, 184, 0.22)');
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawUnderlayImage() {
    const img = state.underlay.image;
    const w = img.width * state.underlay.scale;
    const h = img.height * state.underlay.scale;
    const topLeft = worldToScreen(-w / 2, -h / 2);

    ctx.save();
    ctx.globalAlpha = state.underlay.opacity;
    ctx.drawImage(
      img,
      topLeft.x,
      topLeft.y,
      w * state.camera.zoom,
      h * state.camera.zoom
    );
    ctx.restore();
  }

  function drawFeaturePolygon(feat, isSelected, isDark) {
    const pts = feat.vertices.map(v => worldToScreen(v.x, v.y));
    if (pts.length < 3) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();

    const fillAlpha = feat.adminLevel === 'prefecture'
      ? (isSelected ? 0.22 : 0.12)
      : (isSelected ? 0.42 : 0.28);

    ctx.fillStyle = hexToRgba(feat.fillColor, fillAlpha);
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#2563eb' : feat.strokeColor;
    if (feat.adminLevel === 'prefecture') {
      ctx.lineWidth = isSelected ? 4.5 : 3.5;
      ctx.setLineDash([10, 4]);
    } else if (feat.adminLevel === 'island') {
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.setLineDash([4, 4]);
    } else {
      ctx.lineWidth = isSelected ? 3 : 1.8;
      ctx.setLineDash([]);
    }
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.setLineDash([]);

    if (isSelected) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
      ctx.lineWidth = 8;
      ctx.stroke();
    }

    const fullName = `${feat.name}${feat.suffix}`;
    if (fullName.trim() !== '') {
      const centroidWorld = getPolygonCentroid(feat.vertices);
      const centerScreen = worldToScreen(centroidWorld.x, centroidWorld.y);

      const fontSize = feat.adminLevel === 'prefecture'
        ? Math.max(12, Math.min(20, 15 * Math.sqrt(state.camera.zoom)))
        : Math.max(10, Math.min(15, 12 * Math.sqrt(state.camera.zoom)));

      ctx.font = `${feat.adminLevel === 'prefecture' ? '700' : '600'} ${Math.round(fontSize)}px "Noto Sans JP", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.lineWidth = 3.5;
      ctx.strokeStyle = isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)';
      ctx.strokeText(fullName, centerScreen.x, centerScreen.y);

      ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a';
      ctx.fillText(fullName, centerScreen.x, centerScreen.y);
    }

    ctx.restore();
  }

  function drawEditHandles(feat) {
    const verts = feat.vertices;
    ctx.save();

    for (let i = 0; i < verts.length; i++) {
      const v1 = verts[i];
      const v2 = verts[(i + 1) % verts.length];
      const midWorld = { x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2 };
      const midScreen = worldToScreen(midWorld.x, midWorld.y);

      const edgeLenPx = dist(worldToScreen(v1.x, v1.y), worldToScreen(v2.x, v2.y));
      if (edgeLenPx < 24) continue;

      const isHovered = state.hoveredMidpoint && state.hoveredMidpoint.edgeIndex === i;
      ctx.beginPath();
      ctx.arc(midScreen.x, midScreen.y, isHovered ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#2563eb' : 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#2563eb';
      ctx.stroke();
    }

    for (let i = 0; i < verts.length; i++) {
      const sp = worldToScreen(verts[i].x, verts[i].y);
      const isHovered = state.hoveredVertex && state.hoveredVertex.vertexIndex === i;
      const size = isHovered ? 11 : 8;

      ctx.fillStyle = isHovered ? '#f59e0b' : '#ffffff';
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(sp.x - size / 2, sp.y - size / 2, size, size);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawPolygonInProgress() {
    const pts = state.drawingVertices.map(v => worldToScreen(v.x, v.y));
    const cursorWorld = state.snapTarget ? { x: state.snapTarget.x, y: state.snapTarget.y } : state.mouseWorld;
    const cursorScreen = worldToScreen(cursorWorld.x, cursorWorld.y);

    ctx.save();
    if (pts.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.lineTo(cursorScreen.x, cursorScreen.y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(37, 99, 235, 0.16)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.lineTo(cursorScreen.x, cursorScreen.y);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    for (let i = 0; i < pts.length; i++) {
      ctx.beginPath();
      const isFirst = i === 0 && pts.length >= 3;
      ctx.arc(pts[i].x, pts[i].y, isFirst ? 7 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = isFirst ? '#10b981' : '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1d4ed8';
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFreehandInProgress() {
    const pts = state.freehandPoints.map(v => worldToScreen(v.x, v.y));
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }

  function hexToRgba(hex, alpha) {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) || 59;
    const g = parseInt(clean.substring(2, 4), 16) || 130;
    const b = parseInt(clean.substring(4, 6), 16) || 246;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // =========================================================================
  // 8. キャンバスマウス・タッチ操作ハンドリング
  // =========================================================================
  function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function handlePointerDown(e) {
    if (e.button === 2) return;

    const screenPt = getPointerPos(e);
    state.mouseScreen = screenPt;
    state.mouseWorld = screenToWorld(screenPt.x, screenPt.y);

    if (e.button === 1 || state.isSpacePressed || state.tool === 'pan') {
      state.dragMode = 'pan';
      state.dragStartScreen = screenPt;
      state.dragStartCamera = { ...state.camera };
      canvas.style.cursor = 'grabbing';
      return;
    }

    if (state.tool === 'select') {
      handleSelectPointerDown(screenPt);
    } else if (state.tool === 'polygon') {
      handlePolygonPointerDown(screenPt);
    } else if (state.tool === 'freehand') {
      handleFreehandPointerDown(screenPt);
    }
  }

  function handleSelectPointerDown(screenPt) {
    const selectedFeat = state.features.find(f => f.id === state.selectedId);

    if (selectedFeat && selectedFeat.visible) {
      for (let i = 0; i < selectedFeat.vertices.length; i++) {
        const vs = worldToScreen(selectedFeat.vertices[i].x, selectedFeat.vertices[i].y);
        if (dist(screenPt, vs) <= 10) {
          state.dragMode = 'vertex';
          state.dragTargetVertexIndex = i;
          return;
        }
      }

      for (let i = 0; i < selectedFeat.vertices.length; i++) {
        const v1 = selectedFeat.vertices[i];
        const v2 = selectedFeat.vertices[(i + 1) % selectedFeat.vertices.length];
        const midWorld = { x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2 };
        const midScreen = worldToScreen(midWorld.x, midWorld.y);
        if (dist(screenPt, midScreen) <= 9) {
          selectedFeat.vertices.splice(i + 1, 0, midWorld);
          state.dragMode = 'vertex';
          state.dragTargetVertexIndex = i + 1;
          render();
          return;
        }
      }
    }

    const hitCandidates = [];
    for (let i = state.features.length - 1; i >= 0; i--) {
      const feat = state.features[i];
      if (!feat.visible || feat.vertices.length < 3) continue;
      if (isPointInPolygon(state.mouseWorld, feat.vertices)) {
        hitCandidates.push(feat);
      }
    }

    if (hitCandidates.length > 0) {
      let nextSelected = hitCandidates[0];
      if (hitCandidates.length > 1 && state.selectedId) {
        const idx = hitCandidates.findIndex(f => f.id === state.selectedId);
        if (idx !== -1 && !window.event?.shiftKey) {
          nextSelected = hitCandidates[(idx + 1) % hitCandidates.length];
        } else if (idx !== -1) {
          nextSelected = hitCandidates[idx];
        }
      }

      state.selectedId = nextSelected.id;
      syncUI();

      if (window.event?.shiftKey) {
        state.dragMode = 'feature';
        state.dragStartScreen = screenPt;
        state.dragStartFeatureVertices = cloneFeatures(nextSelected.vertices);
      }
      render();
    } else {
      state.selectedId = null;
      syncUI();
      state.dragMode = 'pan';
      state.dragStartScreen = screenPt;
      state.dragStartCamera = { ...state.camera };
      render();
    }
  }

  function handlePolygonPointerDown(screenPt) {
    const snap = findSnapTarget(screenPt);
    const targetWorld = snap ? { x: snap.x, y: snap.y } : { ...state.mouseWorld };

    if (state.drawingVertices.length >= 3) {
      const firstScreen = worldToScreen(state.drawingVertices[0].x, state.drawingVertices[0].y);
      if (dist(screenPt, firstScreen) <= 14) {
        finishPolygonDrawing();
        return;
      }
    }

    state.drawingVertices.push(targetWorld);
    updateDrawingToolbar();
    render();
  }

  function handleFreehandPointerDown(screenPt) {
    const snap = findSnapTarget(screenPt);
    const startPt = snap ? { x: snap.x, y: snap.y } : { ...state.mouseWorld };
    state.isFreehandDrawing = true;
    state.freehandPoints = [startPt];
    render();
  }

  function handlePointerMove(e) {
    const screenPt = getPointerPos(e);
    state.mouseScreen = screenPt;
    state.mouseWorld = screenToWorld(screenPt.x, screenPt.y);

    const [lon, lat] = worldToGeo(state.mouseWorld.x, state.mouseWorld.y);
    statusCoords.textContent = `東経 ${lon.toFixed(4)}° / 北緯 ${lat.toFixed(4)}°`;

    if (state.dragMode === 'pan') {
      const dx = (screenPt.x - state.dragStartScreen.x) / state.camera.zoom;
      const dy = (screenPt.y - state.dragStartScreen.y) / state.camera.zoom;
      state.camera.x = state.dragStartCamera.x - dx;
      state.camera.y = state.dragStartCamera.y - dy;
      render();
      return;
    }

    if (state.dragMode === 'vertex' && state.selectedId) {
      const feat = state.features.find(f => f.id === state.selectedId);
      if (feat) {
        const snap = findSnapTarget(screenPt, feat.id, state.dragTargetVertexIndex);
        state.snapTarget = snap;
        const pos = snap ? { x: snap.x, y: snap.y } : { ...state.mouseWorld };
        feat.vertices[state.dragTargetVertexIndex] = pos;
        render();
      }
      return;
    }

    if (state.dragMode === 'feature' && state.selectedId && state.dragStartFeatureVertices) {
      const feat = state.features.find(f => f.id === state.selectedId);
      if (feat) {
        const dx = (screenPt.x - state.dragStartScreen.x) / state.camera.zoom;
        const dy = (screenPt.y - state.dragStartScreen.y) / state.camera.zoom;
        feat.vertices = state.dragStartFeatureVertices.map(v => ({
          x: v.x + dx,
          y: v.y + dy
        }));
        render();
      }
      return;
    }

    if (state.tool === 'freehand' && state.isFreehandDrawing) {
      const lastPt = state.freehandPoints[state.freehandPoints.length - 1];
      if (dist(state.mouseWorld, lastPt) > 4 / state.camera.zoom) {
        state.freehandPoints.push({ ...state.mouseWorld });
        state.snapTarget = findSnapTarget(screenPt);
        render();
      }
      return;
    }

    if (state.tool === 'polygon') {
      state.snapTarget = findSnapTarget(screenPt);
      render();
      return;
    }

    if (state.tool === 'select') {
      state.snapTarget = null;
      state.hoveredVertex = null;
      state.hoveredMidpoint = null;

      const selectedFeat = state.features.find(f => f.id === state.selectedId);
      if (selectedFeat && selectedFeat.visible) {
        for (let i = 0; i < selectedFeat.vertices.length; i++) {
          const vs = worldToScreen(selectedFeat.vertices[i].x, selectedFeat.vertices[i].y);
          if (dist(screenPt, vs) <= 10) {
            state.hoveredVertex = { featureId: selectedFeat.id, vertexIndex: i };
            canvas.style.cursor = 'move';
            render();
            return;
          }
        }
        for (let i = 0; i < selectedFeat.vertices.length; i++) {
          const v1 = selectedFeat.vertices[i];
          const v2 = selectedFeat.vertices[(i + 1) % selectedFeat.vertices.length];
          const midWorld = { x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2 };
          const midScreen = worldToScreen(midWorld.x, midWorld.y);
          if (dist(screenPt, midScreen) <= 9) {
            state.hoveredMidpoint = { featureId: selectedFeat.id, edgeIndex: i, ...midWorld };
            canvas.style.cursor = 'copy';
            render();
            return;
          }
        }
      }
      canvas.style.cursor = state.isSpacePressed ? 'grab' : 'default';
      render();
    }
  }

  function handlePointerUp() {
    if (state.dragMode === 'vertex' || state.dragMode === 'feature') {
      saveHistory();
    }
    state.dragMode = null;
    state.dragTargetVertexIndex = -1;
    state.dragStartFeatureVertices = null;
    state.snapTarget = null;

    if (state.tool === 'freehand' && state.isFreehandDrawing) {
      finishFreehandDrawing();
    }

    updateCursorStyle();
    render();
  }

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (state.tool !== 'select' || !state.selectedId) return;
    const selectedFeat = state.features.find(f => f.id === state.selectedId);
    if (!selectedFeat || !selectedFeat.visible) return;

    const screenPt = getPointerPos(e);
    for (let i = 0; i < selectedFeat.vertices.length; i++) {
      const vs = worldToScreen(selectedFeat.vertices[i].x, selectedFeat.vertices[i].y);
      if (dist(screenPt, vs) <= 11) {
        if (selectedFeat.vertices.length <= 3) {
          showToast('ポリゴンには最低3つの頂点が必要です', 'error');
          return;
        }
        selectedFeat.vertices.splice(i, 1);
        state.hoveredVertex = null;
        saveHistory();
        render();
        showToast('頂点を削除しました');
        return;
      }
    }
  });

  canvas.addEventListener('dblclick', () => {
    if (state.tool === 'polygon' && state.drawingVertices.length >= 3) {
      const len = state.drawingVertices.length;
      if (len >= 4 && dist(state.drawingVertices[len - 1], state.drawingVertices[len - 2]) < 3) {
        state.drawingVertices.pop();
      }
      finishPolygonDrawing();
    }
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const screenPt = getPointerPos(e);
    const beforeWorld = screenToWorld(screenPt.x, screenPt.y);

    const zoomFactor = e.deltaY < 0 ? 1.14 : 1 / 1.14;
    state.camera.zoom = Math.max(0.15, Math.min(12, state.camera.zoom * zoomFactor));

    const afterWorld = screenToWorld(screenPt.x, screenPt.y);
    state.camera.x += (beforeWorld.x - afterWorld.x);
    state.camera.y += (beforeWorld.y - afterWorld.y);

    statusZoom.textContent = `${Math.round(state.camera.zoom * 100)}%`;
    render();
  }, { passive: false });

  // =========================================================================
  // 9. 新規ポリゴン・フリーハンド完了処理
  // =========================================================================
  function createNewFeatureFromVertices(vertices) {
    const idx = state.features.length + 1;
    const palette = COLOR_PALETTE[(idx - 1) % COLOR_PALETTE.length];
    const hasPref = state.features.some(f => f.adminLevel === 'prefecture');
    const defaultPref = state.features.find(f => f.adminLevel === 'prefecture');

    const newFeat = {
      id: `feat_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: hasPref ? `新設第${idx}` : '新規',
      suffix: hasPref ? '市' : '県',
      adminLevel: hasPref ? 'municipality' : 'prefecture',
      prefecture: defaultPref ? `${defaultPref.name}${defaultPref.suffix}` : '新規県',
      subpref: '',
      county: '',
      code: hasPref ? `99${String(200 + idx).padStart(3, '0')}` : '99000',
      fillColor: palette.fill,
      strokeColor: palette.stroke,
      visible: true,
      vertices
    };

    state.features.push(newFeat);
    state.selectedId = newFeat.id;
    saveHistory();
    syncUI();
    render();
    showToast(`「${newFeat.name}${newFeat.suffix}」を作成しました`, 'success');
  }

  function finishPolygonDrawing() {
    if (state.drawingVertices.length < 3) {
      showToast('ポリゴンを確定するには3点以上必要です', 'error');
      return;
    }
    const verts = [...state.drawingVertices];
    state.drawingVertices = [];
    updateDrawingToolbar();
    setTool('select');
    createNewFeatureFromVertices(verts);
  }

  function cancelPolygonDrawing() {
    state.drawingVertices = [];
    updateDrawingToolbar();
    render();
  }

  function finishFreehandDrawing() {
    state.isFreehandDrawing = false;
    const raw = state.freehandPoints;
    state.freehandPoints = [];

    if (raw.length < 5) {
      render();
      return;
    }

    const endSnap = findSnapTarget(state.mouseScreen);
    if (endSnap) {
      raw[raw.length - 1] = { x: endSnap.x, y: endSnap.y };
    }

    const epsilon = 5.5 / state.camera.zoom;
    let simplified = simplifyDouglasPeucker(raw, epsilon);

    if (simplified.length > 3 && dist(simplified[0], simplified[simplified.length - 1]) < 12 / state.camera.zoom) {
      simplified.pop();
    }

    if (simplified.length >= 3) {
      setTool('select');
      createNewFeatureFromVertices(simplified);
    } else {
      render();
    }
  }

  function updateDrawingToolbar() {
    if (state.tool === 'polygon' && state.drawingVertices.length > 0) {
      drawingToolbar.classList.remove('hidden');
      drawingVertexCount.textContent = state.drawingVertices.length;
    } else {
      drawingToolbar.classList.add('hidden');
    }
  }

  // =========================================================================
  // 10. ツール切替・カメラフィット・UI同期
  // =========================================================================
  function setTool(toolName) {
    if (state.tool === 'polygon' && toolName !== 'polygon') {
      state.drawingVertices = [];
      updateDrawingToolbar();
    }
    state.tool = toolName;
    state.snapTarget = null;

    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === toolName);
    });

    const hints = {
      select: 'クリックで選択、頂点ドラッグで編集、辺の中点ドラッグで頂点追加、右クリックで頂点削除',
      polygon: 'クリックで頂点を追加し、始点クリックまたはダブルクリック / Enter で確定します',
      freehand: 'ドラッグして境界線をなぞり描きします（離すと自動で頂点を最適化してポリゴン化）',
      pan: 'ドラッグで画面を移動、ホイールで拡大・縮小します'
    };
    statusHint.textContent = `ヒント: ${hints[toolName] || ''}`;
    updateCursorStyle();
    render();
  }

  function updateCursorStyle() {
    if (state.isSpacePressed || state.tool === 'pan') {
      canvas.style.cursor = state.dragMode === 'pan' ? 'grabbing' : 'grab';
    } else if (state.tool === 'polygon' || state.tool === 'freehand') {
      canvas.style.cursor = 'crosshair';
    } else {
      canvas.style.cursor = 'default';
    }
  }

  function fitViewToFeatures() {
    const visibleFeats = state.features.filter(f => f.visible && f.vertices.length > 0);
    if (visibleFeats.length === 0) {
      state.camera = { x: 0, y: 0, zoom: 1.0 };
      statusZoom.textContent = '100%';
      render();
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const f of visibleFeats) {
      for (const v of f.vertices) {
        if (v.x < minX) minX = v.x;
        if (v.y < minY) minY = v.y;
        if (v.x > maxX) maxX = v.x;
        if (v.y > maxY) maxY = v.y;
      }
    }

    const rect = canvasContainer.getBoundingClientRect();
    const boxW = Math.max(100, maxX - minX);
    const boxH = Math.max(100, maxY - minY);
    const padding = 0.78;

    state.camera.x = (minX + maxX) / 2;
    state.camera.y = (minY + maxY) / 2;
    state.camera.zoom = Math.max(0.2, Math.min(4.0, Math.min((rect.width * padding) / boxW, (rect.height * padding) / boxH)));
    statusZoom.textContent = `${Math.round(state.camera.zoom * 100)}%`;
    render();
  }

  function syncUI() {
    const selectedFeat = state.features.find(f => f.id === state.selectedId);

    if (selectedFeat) {
      propEmptyState.classList.add('hidden');
      propForm.classList.remove('hidden');
      propAdminLevel.value = selectedFeat.adminLevel;
      propName.value = selectedFeat.name;
      propSuffix.value = selectedFeat.suffix;
      propPrefecture.value = selectedFeat.prefecture || '';
      propSubpref.value = selectedFeat.subpref || '';
      propCounty.value = selectedFeat.county || '';
      propCode.value = selectedFeat.code || '';
      propFillColor.value = selectedFeat.fillColor;
      propStrokeColor.value = selectedFeat.strokeColor;
    } else {
      propEmptyState.classList.remove('hidden');
      propForm.classList.add('hidden');
    }

    layerCount.textContent = state.features.length;
    layerList.innerHTML = '';

    for (let i = state.features.length - 1; i >= 0; i--) {
      const feat = state.features[i];
      const isSelected = feat.id === state.selectedId;

      const badgeMap = {
        prefecture: { text: '都道府県', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
        municipality: { text: '市区町村', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
        island: { text: '所属未定', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' }
      };
      const badge = badgeMap[feat.adminLevel] || badgeMap.municipality;

      const item = document.createElement('div');
      item.className = `group flex items-center justify-between gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
        isSelected
          ? 'bg-blue-50/90 border-blue-400 dark:bg-blue-950/60 dark:border-blue-600 shadow-xs'
          : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:border-slate-800'
      }`;

      item.innerHTML = `
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <button type="button" data-action="toggle-vis" class="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0" title="表示/非表示">
            ${feat.visible
              ? '<svg class="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>'
              : '<svg class="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>'
            }
          </button>
          <span class="w-3 h-3 rounded-xs shrink-0 border border-black/20" style="background-color: ${feat.fillColor};"></span>
          <div class="truncate">
            <div class="font-semibold truncate ${feat.visible ? '' : 'opacity-45 line-through'}">${escapeHtml(feat.name + feat.suffix)}</div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-[9px] px-1.5 py-0.2 rounded font-medium ${badge.cls}">${badge.text}</span>
              <span class="text-[10px] font-mono text-slate-400">${escapeHtml(feat.code || '')}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-0.5 opacity-75 group-hover:opacity-100 shrink-0">
          <button type="button" data-action="move-up" ${i === state.features.length - 1 ? 'disabled' : ''} class="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-25" title="前面へ移動">▲</button>
          <button type="button" data-action="move-down" ${i === 0 ? 'disabled' : ''} class="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-25" title="背面へ移動">▼</button>
        </div>
      `;

      item.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
          e.stopPropagation();
          const action = actionBtn.dataset.action;
          if (action === 'toggle-vis') {
            feat.visible = !feat.visible;
            saveHistory();
            syncUI();
            render();
          } else if (action === 'move-up' && i < state.features.length - 1) {
            [state.features[i], state.features[i + 1]] = [state.features[i + 1], state.features[i]];
            saveHistory();
            syncUI();
            render();
          } else if (action === 'move-down' && i > 0) {
            [state.features[i], state.features[i - 1]] = [state.features[i - 1], state.features[i]];
            saveHistory();
            syncUI();
            render();
          }
          return;
        }

        state.selectedId = feat.id;
        syncUI();
        render();
      });

      layerList.appendChild(item);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  // =========================================================================
  // 11. GeoJSON 生成（国土数値情報 N03 行政区域データ構造準拠）＆ インポート
  // =========================================================================
  function buildGeoJSON(pretty = true, includeStyleMeta = true) {
    const features = state.features
      .filter(f => f.vertices && f.vertices.length >= 3)
      .map(f => {
        // ワールド座標 -> [lon, lat]
        let ring = f.vertices.map(v => worldToGeo(v.x, v.y));

        // RFC 7946: 外周リングを反時計回り(CCW)に正規化
        let signedArea = 0;
        for (let i = 0; i < ring.length; i++) {
          const p1 = ring[i];
          const p2 = ring[(i + 1) % ring.length];
          signedArea += (p2[0] - p1[0]) * (p2[1] + p1[1]);
        }
        if (signedArea > 0) {
          ring.reverse();
        }
        ring.push([...ring[0]]);

        const fullName = `${f.name}${f.suffix}`;
        const isPref = f.adminLevel === 'prefecture';

        // 国土数値情報 行政区域データ (N03) 標準属性定義
        // N03_001: 都道府県名
        // N03_002: 支庁・振興局名（該当なしは null）
        // N03_003: 郡・政令市名（該当なしは null）
        // N03_004: 市区町村名（都道府県ポリゴンや所属未定地は null / または名称）
        // N03_007: 行政区域コード（5桁文字列）
        const properties = {
          N03_001: isPref ? fullName : (f.prefecture || null),
          N03_002: f.subpref && f.subpref.trim() !== '' ? f.subpref.trim() : null,
          N03_003: f.county && f.county.trim() !== '' ? f.county.trim() : null,
          N03_004: isPref ? null : (fullName || null),
          N03_007: f.code && f.code.trim() !== '' ? f.code.trim() : null
        };

        // 再編集時の色・ラベル復元用メタデータ（任意）
        if (includeStyleMeta) {
          properties._editor = {
            base_name: f.name,
            admin_label: f.suffix,
            admin_type: f.adminLevel,
            fill: f.fillColor,
            stroke: f.strokeColor
          };
        }

        return {
          type: 'Feature',
          properties,
          geometry: {
            type: 'Polygon',
            coordinates: [ring]
          }
        };
      });

    const fc = {
      type: 'FeatureCollection',
      name: 'N03_fictional_boundaries',
      crs: {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
      },
      features
    };

    return pretty ? JSON.stringify(fc, null, 2) : JSON.stringify(fc);
  }

  // 自治体名から「名称」と「区分ラベル（県・市・町など）」を分離するヘルパー
  function splitAdminNameAndSuffix(fullName) {
    if (!fullName) return { name: '', suffix: '' };
    const suffixes = ['県', '都', '道', '府', '市', '区', '町', '村', '島'];
    for (const s of suffixes) {
      if (fullName.endsWith(s) && fullName.length > s.length) {
        return {
          name: fullName.slice(0, -s.length),
          suffix: s
        };
      }
    }
    return { name: fullName, suffix: '' };
  }

  function importGeoJSONText(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      let rawFeatures = [];

      if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
        rawFeatures = parsed.features;
      } else if (parsed.type === 'Feature') {
        rawFeatures = [parsed];
      } else {
        throw new Error('有効なGeoJSON (FeatureCollection または Feature) ではありません');
      }

      const imported = [];
      let allCoords = [];

      rawFeatures.forEach((gf, idx) => {
        if (!gf.geometry) return;
        const props = gf.properties || {};
        const palette = COLOR_PALETTE[idx % COLOR_PALETTE.length];

        const polygons = [];
        if (gf.geometry.type === 'Polygon' && Array.isArray(gf.geometry.coordinates[0])) {
          polygons.push(gf.geometry.coordinates[0]);
        } else if (gf.geometry.type === 'MultiPolygon' && Array.isArray(gf.geometry.coordinates)) {
          gf.geometry.coordinates.forEach(poly => {
            if (Array.isArray(poly[0])) polygons.push(poly[0]);
          });
        }

        polygons.forEach((ring, pIdx) => {
          if (ring.length < 3) return;
          const cleanRing = [...ring];
          if (
            cleanRing.length > 3 &&
            cleanRing[0][0] === cleanRing[cleanRing.length - 1][0] &&
            cleanRing[0][1] === cleanRing[cleanRing.length - 1][1]
          ) {
            cleanRing.pop();
          }
          cleanRing.forEach(c => allCoords.push(c));
          imported.push({ ring: cleanRing, props, palette, pIdx, idx });
        });
      });

      if (imported.length === 0) {
        showToast('読み込み可能なポリゴンデータが見つかりませんでした', 'error');
        return;
      }

      if (allCoords.length > 0) {
        let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
        allCoords.forEach(([lon, lat]) => {
          if (lon < minLon) minLon = lon;
          if (lon > maxLon) maxLon = lon;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        });
        state.geoMapping.originLon = Number(((minLon + maxLon) / 2).toFixed(4));
        state.geoMapping.originLat = Number(((minLat + maxLat) / 2).toFixed(4));
        const span = Math.max(maxLon - minLon, maxLat - minLat, 0.05);
        state.geoMapping.degPer100px = Number((span / 5).toFixed(5));

        document.getElementById('coord-origin-lon').value = state.geoMapping.originLon;
        document.getElementById('coord-origin-lat').value = state.geoMapping.originLat;
        document.getElementById('coord-deg-per-100px').value = state.geoMapping.degPer100px;
      }

      state.features = imported.map((item, i) => {
        const { ring, props, palette } = item;
        const editorMeta = props._editor || {};

        // 国土数値情報 (N03_001〜N03_007) からの復元を優先
        const n03Pref = props.N03_001 || props.prefecture || '';
        const n03Subpref = props.N03_002 || '';
        const n03County = props.N03_003 || '';
        const n03Muni = props.N03_004 || '';
        const n03Code = props.N03_007 || props.code || '';

        // N03_004 が空で N03_001 がある場合は都道府県ポリゴンとみなす
        const isPrefPolygon = !n03Muni && Boolean(n03Pref) && editorMeta.admin_type !== 'municipality';
        const targetFullName = n03Muni || n03Pref || props.name || `区画${i + 1}`;
        const split = splitAdminNameAndSuffix(targetFullName);

        const baseName = editorMeta.base_name || props.base_name || split.name;
        const suffix = editorMeta.admin_label !== undefined ? editorMeta.admin_label : split.suffix;
        const adminLevel = editorMeta.admin_type || props.admin_type || (isPrefPolygon ? 'prefecture' : 'municipality');

        return {
          id: `imp_${Date.now()}_${i}`,
          name: baseName,
          suffix: suffix,
          adminLevel,
          prefecture: n03Pref,
          subpref: n03Subpref,
          county: n03County,
          code: n03Code,
          fillColor: editorMeta.fill || props.fill || palette.fill,
          strokeColor: editorMeta.stroke || props.stroke || palette.stroke,
          visible: true,
          vertices: ring.map(([lon, lat]) => geoToWorld(lon, lat))
        };
      });

      state.selectedId = state.features[0]?.id || null;
      saveHistory();
      syncUI();
      fitViewToFeatures();
      showToast(`${state.features.length}件の行政区域データを読み込みました`, 'success');
    } catch (err) {
      console.error(err);
      showToast(`GeoJSONの解析に失敗しました: ${err.message}`, 'error');
    }
  }

  // =========================================================================
  // 12. イベントリスナーの初期化
  // =========================================================================
  function initEvents() {
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) handlePointerDown(e);
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        handlePointerMove(e);
      }
    }, { passive: false });
    canvas.addEventListener('touchend', handlePointerUp);

    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => setTool(btn.dataset.tool));
    });

    const btnSnap = document.getElementById('btn-toggle-snap');
    const snapLabel = document.getElementById('snap-label');
    btnSnap.addEventListener('click', () => {
      state.snapEnabled = !state.snapEnabled;
      snapLabel.textContent = state.snapEnabled ? '吸着ON' : '吸着OFF';
      statusSnapBadge.textContent = state.snapEnabled ? 'スナップ: 有効' : 'スナップ: 無効';
      btnSnap.className = state.snapEnabled
        ? 'w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700 transition'
        : 'w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition';
      showToast(state.snapEnabled ? '頂点スナップを有効にしました' : '頂点スナップを無効にしました');
      render();
    });

    document.getElementById('btn-fit-view').addEventListener('click', fitViewToFeatures);
    document.getElementById('btn-undo').addEventListener('click', undo);
    document.getElementById('btn-redo').addEventListener('click', redo);

    document.getElementById('btn-zoom-in').addEventListener('click', () => {
      state.camera.zoom = Math.min(12, state.camera.zoom * 1.25);
      statusZoom.textContent = `${Math.round(state.camera.zoom * 100)}%`;
      render();
    });
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      state.camera.zoom = Math.max(0.15, state.camera.zoom / 1.25);
      statusZoom.textContent = `${Math.round(state.camera.zoom * 100)}%`;
      render();
    });

    document.getElementById('btn-finish-polygon').addEventListener('click', finishPolygonDrawing);
    document.getElementById('btn-cancel-polygon').addEventListener('click', cancelPolygonDrawing);

    document.getElementById('btn-load-sample').addEventListener('click', () => {
      state.features = createSampleFeatures();
      state.selectedId = state.features[3].id;
      saveHistory();
      syncUI();
      fitViewToFeatures();
      showToast('架空「蒼海県」と4市区町村（N03形式）を読み込みました', 'success');
    });

    document.getElementById('btn-clear-all').addEventListener('click', () => {
      if (state.features.length === 0) return;
      state.features = [];
      state.selectedId = null;
      saveHistory();
      syncUI();
      render();
      showToast('全地物をクリアしました（Ctrl+Zで復元可能）');
    });

    const btnGrid = document.getElementById('btn-toggle-grid');
    btnGrid.addEventListener('click', () => {
      state.showGrid = !state.showGrid;
      btnGrid.classList.toggle('opacity-50', !state.showGrid);
      render();
    });

    document.getElementById('btn-toggle-theme').addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      render();
    });

    document.getElementById('btn-toggle-right-panel').addEventListener('click', () => {
      rightPanel.classList.toggle('translate-x-full');
    });
    document.getElementById('btn-close-right-panel').addEventListener('click', () => {
      rightPanel.classList.add('translate-x-full');
    });

    // プロパティフォーム入力イベント
    const bindPropChange = (el, key, commitHistory = false) => {
      el.addEventListener(commitHistory ? 'change' : 'input', () => {
        const feat = state.features.find(f => f.id === state.selectedId);
        if (!feat) return;
        feat[key] = el.value;
        if (commitHistory) saveHistory();
        syncUI();
        render();
      });
    };

    bindPropChange(propAdminLevel, 'adminLevel', true);
    bindPropChange(propName, 'name', false);
    propName.addEventListener('change', saveHistory);
    bindPropChange(propSuffix, 'suffix', true);
    bindPropChange(propPrefecture, 'prefecture', false);
    propPrefecture.addEventListener('change', saveHistory);
    bindPropChange(propSubpref, 'subpref', false);
    propSubpref.addEventListener('change', saveHistory);
    bindPropChange(propCounty, 'county', false);
    propCounty.addEventListener('change', saveHistory);
    bindPropChange(propCode, 'code', false);
    propCode.addEventListener('change', saveHistory);
    bindPropChange(propFillColor, 'fillColor', true);
    bindPropChange(propStrokeColor, 'strokeColor', true);

    const paletteContainer = document.getElementById('color-palette');
    COLOR_PALETTE.forEach(c => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition';
      swatch.style.backgroundColor = c.fill;
      swatch.title = c.label;
      swatch.addEventListener('click', () => {
        const feat = state.features.find(f => f.id === state.selectedId);
        if (!feat) return;
        feat.fillColor = c.fill;
        feat.strokeColor = c.stroke;
        saveHistory();
        syncUI();
        render();
      });
      paletteContainer.appendChild(swatch);
    });

    document.getElementById('btn-duplicate-feature').addEventListener('click', () => {
      const feat = state.features.find(f => f.id === state.selectedId);
      if (!feat) return;
      const copy = cloneFeatures(feat);
      copy.id = `feat_${Date.now()}`;
      copy.name = `${copy.name}のコピー`;
      copy.vertices = copy.vertices.map(v => ({ x: v.x + 25, y: v.y + 25 }));
      state.features.push(copy);
      state.selectedId = copy.id;
      saveHistory();
      syncUI();
      render();
      showToast('地物を複製しました');
    });

    document.getElementById('btn-delete-feature').addEventListener('click', () => {
      if (!state.selectedId) return;
      state.features = state.features.filter(f => f.id !== state.selectedId);
      state.selectedId = null;
      saveHistory();
      syncUI();
      render();
      showToast('地物を削除しました');
    });

    document.getElementById('btn-deselect-all').addEventListener('click', () => {
      state.selectedId = null;
      syncUI();
      render();
    });

    // GeoJSON エクスポートモーダル制御
    const modalExport = document.getElementById('modal-export');
    const exportTextarea = document.getElementById('export-json-textarea');
    const exportPretty = document.getElementById('export-pretty-print');
    const exportIncludeStyle = document.getElementById('export-include-style');

    const refreshExportPreview = () => {
      exportTextarea.value = buildGeoJSON(exportPretty.checked, exportIncludeStyle.checked);
    };

    document.getElementById('btn-open-export').addEventListener('click', () => {
      refreshExportPreview();
      modalExport.classList.remove('hidden');
    });

    exportPretty.addEventListener('change', refreshExportPreview);
    exportIncludeStyle.addEventListener('change', refreshExportPreview);

    document.getElementById('btn-copy-geojson').addEventListener('click', () => {
      exportTextarea.select();
      exportTextarea.setSelectionRange(0, 999999);
      try {
        document.execCommand('copy');
        showToast('N03形式GeoJSONをクリップボードにコピーしました', 'success');
      } catch (err) {
        showToast('コピーに失敗しました', 'error');
      }
    });

    document.getElementById('btn-download-geojson').addEventListener('click', () => {
      const content = buildGeoJSON(exportPretty.checked, exportIncludeStyle.checked);
      let filename = document.getElementById('export-filename').value.trim() || 'N03-20260101_99_GML.geojson';
      if (!filename.endsWith('.geojson') && !filename.endsWith('.json')) {
        filename += '.geojson';
      }
      const blob = new Blob([content], { type: 'application/geo+json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast(`「${filename}」をダウンロードしました`, 'success');
    });

    document.getElementById('input-import-geojson').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        importGeoJSONText(ev.target.result);
        e.target.value = '';
      };
      reader.readAsText(file, 'UTF-8');
    });

    const modalSettings = document.getElementById('modal-settings');
    document.getElementById('btn-open-settings').addEventListener('click', () => {
      modalSettings.classList.remove('hidden');
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById(btn.dataset.closeModal).classList.add('hidden');
      });
    });

    document.getElementById('input-underlay-image').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          state.underlay.image = img;
          render();
          showToast('下絵画像を読み込みました', 'success');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('btn-clear-underlay').addEventListener('click', () => {
      state.underlay.image = null;
      render();
      showToast('下絵画像をクリアしました');
    });

    document.getElementById('underlay-opacity').addEventListener('input', (e) => {
      const val = Number(e.target.value);
      state.underlay.opacity = val / 100;
      document.getElementById('underlay-opacity-val').textContent = `${val}%`;
      render();
    });

    document.getElementById('underlay-scale').addEventListener('input', (e) => {
      const val = Number(e.target.value);
      state.underlay.scale = val / 100;
      document.getElementById('underlay-scale-val').textContent = `${val}%`;
      render();
    });

    const updateGeoMapping = () => {
      state.geoMapping.originLon = parseFloat(document.getElementById('coord-origin-lon').value) || 138.0;
      state.geoMapping.originLat = parseFloat(document.getElementById('coord-origin-lat').value) || 35.5;
      state.geoMapping.degPer100px = Math.max(0.0001, parseFloat(document.getElementById('coord-deg-per-100px').value) || 0.1);
    };
    ['coord-origin-lon', 'coord-origin-lat', 'coord-deg-per-100px'].forEach(id => {
      document.getElementById(id).addEventListener('change', updateGeoMapping);
    });

    document.querySelectorAll('.preset-coord').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('coord-origin-lon').value = btn.dataset.lon;
        document.getElementById('coord-origin-lat').value = btn.dataset.lat;
        document.getElementById('coord-deg-per-100px').value = btn.dataset.deg;
        updateGeoMapping();
        showToast('座標プリセットを適用しました');
      });
    });

    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') document.activeElement.blur();
        return;
      }

      if (e.code === 'Space' && !state.isSpacePressed) {
        state.isSpacePressed = true;
        updateCursorStyle();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v': setTool('select'); break;
        case 'p': setTool('polygon'); break;
        case 'f': setTool('freehand'); break;
        case 'h': setTool('pan'); break;
        case 's': btnSnap.click(); break;
        case '0': fitViewToFeatures(); break;
        case 'enter':
          if (state.tool === 'polygon' && state.drawingVertices.length >= 3) {
            finishPolygonDrawing();
          }
          break;
        case 'escape':
          if (state.tool === 'polygon' && state.drawingVertices.length > 0) {
            cancelPolygonDrawing();
          } else {
            state.selectedId = null;
            syncUI();
            render();
          }
          break;
        case 'delete':
        case 'backspace':
          if (state.tool === 'select' && state.selectedId) {
            const feat = state.features.find(f => f.id === state.selectedId);
            if (feat && state.hoveredVertex && state.hoveredVertex.featureId === feat.id) {
              if (feat.vertices.length > 3) {
                feat.vertices.splice(state.hoveredVertex.vertexIndex, 1);
                state.hoveredVertex = null;
                saveHistory();
                render();
                showToast('頂点を削除しました');
              } else {
                showToast('ポリゴンには最低3つの頂点が必要です', 'error');
              }
            }
          }
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        state.isSpacePressed = false;
        updateCursorStyle();
      }
    });
  }

  // =========================================================================
  // 13. 起動シーケンス
  // =========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    initEvents();
    state.features = createSampleFeatures();
    state.selectedId = state.features[3].id;
    saveHistory();
    syncUI();
    resizeCanvas();
    fitViewToFeatures();
  });
})();
