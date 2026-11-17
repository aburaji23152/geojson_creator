(() => {
  'use strict';

  // =========================================================================
  // 1. 定数・カラーパレット・入れ子構造サンプルデータ定義
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
        parentId: null,
        name: '蒼海',
        suffix: '県',
        adminLevel: 'prefecture',
        prefecture: '蒼海県',
        subpref: '',
        county: '',
        code: '99000',
        fillColor: '#3b82f6',
        strokeColor: '#1e3a8a',
        visible: true,
        expanded: true,
        vertices: [
          { ...pNW }, { ...pN1 }, { ...pN2 }, { ...pNE },
          { ...pE1 }, { ...pSE }, { ...pS1 }, { ...pSW }, { ...pW1 }
        ]
      },
      {
        id: 'feat_grp_city',
        parentId: 'feat_pref_1',
        name: '蒼海',
        suffix: '市',
        adminLevel: 'group',
        prefecture: '蒼海県',
        subpref: '',
        county: '蒼海市',
        code: '99100',
        fillColor: '#6366f1',
        strokeColor: '#3730a3',
        visible: true,
        expanded: true,
        vertices: [
          { ...pW1 }, { ...c1 }, { ...c2 }, { ...c3 }, { ...pS1 }, { ...pSW }
        ]
      },
      {
        id: 'feat_muni_3',
        parentId: 'feat_grp_city',
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
        expanded: true,
        vertices: [
          { ...c1 }, { ...c2 }, { ...c3 }, { ...pS1 }, { ...pSW }, { ...c4 }
        ]
      },
      {
        id: 'feat_muni_4',
        parentId: 'feat_grp_city',
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
        expanded: true,
        vertices: [
          { ...pW1 }, { ...c1 }, { ...c4 }, { ...pSW }
        ]
      },
      {
        id: 'feat_grp_gun',
        parentId: 'feat_pref_1',
        name: '北嶺',
        suffix: '郡',
        adminLevel: 'group',
        prefecture: '蒼海県',
        subpref: '',
        county: '北嶺郡',
        code: '99300',
        fillColor: '#059669',
        strokeColor: '#064e3b',
        visible: true,
        expanded: true,
        vertices: [
          { ...pNW }, { ...pN1 }, { ...pN2 }, { ...c2 }, { ...c1 }, { ...pW1 }
        ]
      },
      {
        id: 'feat_muni_1',
        parentId: 'feat_grp_gun',
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
        expanded: true,
        vertices: [
          { ...pNW }, { ...pN1 }, { ...pN2 }, { ...c2 }, { ...c1 }, { ...pW1 }
        ]
      },
      {
        id: 'feat_muni_2',
        parentId: 'feat_pref_1',
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
        expanded: true,
        vertices: [
          { ...pN2 }, { ...pNE }, { ...pE1 }, { ...pSE }, { ...c3 }, { ...c2 }
        ]
      }
    ];
  }

  // =========================================================================
  // 2. アプリケーション状態管理
  // =========================================================================
  const state = {
    features: [],
    selectedId: null,
    pendingParentId: null,
    pendingAdminLevel: null,
    tool: 'select',
    snapEnabled: true,
    topologySyncEnabled: true,
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
    dragLinkedVertices: [],
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
  const statusTopologyBadge = document.getElementById('status-topology-badge');
  const drawingToolbar = document.getElementById('drawing-toolbar');
  const drawingTargetLabel = document.getElementById('drawing-target-label');
  const drawingVertexCount = document.getElementById('drawing-vertex-count');

  const rightPanel = document.getElementById('right-panel');
  const propEmptyState = document.getElementById('prop-empty-state');
  const propForm = document.getElementById('prop-form');
  const propAdminLevel = document.getElementById('prop-admin-level');
  const parentSelectorWrapper = document.getElementById('parent-selector-wrapper');
  const propParentId = document.getElementById('prop-parent-id');
  const propName = document.getElementById('prop-name');
  const propSuffix = document.getElementById('prop-suffix');
  const propPrefecture = document.getElementById('prop-prefecture');
  const propSubpref = document.getElementById('prop-subpref');
  const propCounty = document.getElementById('prop-county');
  const propCode = document.getElementById('prop-code');
  const propFillColor = document.getElementById('prop-fill-color');
  const propStrokeColor = document.getElementById('prop-stroke-color');
  const childCreatorBar = document.getElementById('child-creator-bar');
  const layerList = document.getElementById('layer-list');
  const layerCount = document.getElementById('layer-count');

  // =========================================================================
  // 4. ユーティリティ関数（座標変換・幾何演算・ポリゴン統合）
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
    }, 2800);
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

  function isPointOnBoundaryOrInside(pt, vertices, eps = 1.5) {
    if (isPointInPolygon(pt, vertices)) return true;
    for (let i = 0; i < vertices.length; i++) {
      const a = vertices[i];
      const b = vertices[(i + 1) % vertices.length];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) {
        if (dist(pt, a) <= eps) return true;
        continue;
      }
      const t = Math.max(0, Math.min(1, ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / lenSq));
      const proj = { x: a.x + t * dx, y: a.y + t * dy };
      if (dist(pt, proj) <= eps) return true;
    }
    return false;
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
  // 4-B. 複数ポリゴンの外周輪郭統合（2D平面アレンジメント＋外周トレース）
  // =========================================================================
  function getSegmentIntersection(a, b, c, d) {
    const r = { x: b.x - a.x, y: b.y - a.y };
    const s = { x: d.x - c.x, y: d.y - c.y };
    const rxs = r.x * s.y - r.y * s.x;
    if (Math.abs(rxs) < 1e-9) return null;
    const cma = { x: c.x - a.x, y: c.y - a.y };
    const t = (cma.x * s.y - cma.y * s.x) / rxs;
    const u = (cma.x * r.y - cma.y * r.x) / rxs;
    if (t > 1e-4 && t < 1 - 1e-4 && u > 1e-4 && u < 1 - 1e-4) {
      return { x: a.x + t * r.x, y: a.y + t * r.y, t, u };
    }
    return null;
  }

  function pointOnSegmentParam(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-6) return null;
    const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
    if (t <= 1e-4 || t >= 1 - 1e-4) return null;
    const projX = a.x + t * dx;
    const projY = a.y + t * dy;
    if (Math.hypot(p.x - projX, p.y - projY) <= 2.5) {
      return t;
    }
    return null;
  }

  function ensureClockwiseRing(verts) {
    let area = 0;
    for (let i = 0; i < verts.length; i++) {
      const p1 = verts[i];
      const p2 = verts[(i + 1) % verts.length];
      area += (p2.x - p1.x) * (p2.y + p1.y);
    }
    // Y軸下向き座標系では area < 0 が時計回り
    if (area > 0) {
      return [...verts].reverse().map(v => ({ x: v.x, y: v.y }));
    }
    return verts.map(v => ({ x: v.x, y: v.y }));
  }

  // 凸包フォールバック（離れ島として追加された場合でも確実に親ポリゴンを広げる）
  function computeConvexHull(points) {
    const pts = [...points].sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
    if (pts.length <= 3) return pts;
    const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lower = [];
    for (const p of pts) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop();
      }
      lower.push(p);
    }
    const upper = [];
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }
    upper.pop();
    lower.pop();
    return lower.concat(upper);
  }

  // 複数のポリゴン配列を受け取り、全体の外周輪郭（和集合の外縁ポリゴン）を返す
  function computeUnionOuterBoundary(polygons) {
    const validPolys = polygons
      .filter(p => Array.isArray(p) && p.length >= 3)
      .map(p => ensureClockwiseRing(p));

    if (validPolys.length === 0) return [];
    if (validPolys.length === 1) return validPolys[0];

    // 1. すべての辺を収集
    const rawEdges = [];
    validPolys.forEach((poly, polyIdx) => {
      for (let i = 0; i < poly.length; i++) {
        rawEdges.push({
          a: { ...poly[i] },
          b: { ...poly[(i + 1) % poly.length] },
          polyIdx
        });
      }
    });

    // 2. 交点および他ポリゴンの頂点が辺上に乗る位置で辺を細分化
    const splitParams = rawEdges.map(() => [0, 1]);

    for (let i = 0; i < rawEdges.length; i++) {
      const e1 = rawEdges[i];
      for (let p = 0; p < validPolys.length; p++) {
        for (const v of validPolys[p]) {
          const t = pointOnSegmentParam(v, e1.a, e1.b);
          if (t !== null) splitParams[i].push(t);
        }
      }
      for (let j = i + 1; j < rawEdges.length; j++) {
        const e2 = rawEdges[j];
        const hit = getSegmentIntersection(e1.a, e1.b, e2.a, e2.b);
        if (hit) {
          splitParams[i].push(hit.t);
          splitParams[j].push(hit.u);
        }
      }
    }

    // 3. 座標スナップ（2.5px以内の近接頂点を同一ノードに統合して隙間を防止）
    const canonicalNodes = [];
    function getCanonicalPoint(pt) {
      for (const node of canonicalNodes) {
        if (dist(node, pt) <= 2.5) return node;
      }
      const newNode = { x: Number(pt.x.toFixed(3)), y: Number(pt.y.toFixed(3)) };
      canonicalNodes.push(newNode);
      return newNode;
    }

    // 4. 細分化された有向サブセグメントから、外周境界辺のみを抽出
    const boundaryEdges = [];
    for (let i = 0; i < rawEdges.length; i++) {
      const e = rawEdges[i];
      const ts = [...new Set(splitParams[i].map(v => Number(v.toFixed(5))))].sort((x, y) => x - y);

      for (let k = 0; k < ts.length - 1; k++) {
        const t0 = ts[k];
        const t1 = ts[k + 1];
        if (t1 - t0 < 1e-4) continue;

        const p0 = getCanonicalPoint({
          x: e.a.x + (e.b.x - e.a.x) * t0,
          y: e.a.y + (e.b.y - e.a.y) * t0
        });
        const p1 = getCanonicalPoint({
          x: e.a.x + (e.b.x - e.a.x) * t1,
          y: e.a.y + (e.b.y - e.a.y) * t1
        });
        if (dist(p0, p1) < 0.8) continue;

        const mx = (p0.x + p1.x) / 2;
        const my = (p0.y + p1.y) / 2;
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const len = Math.hypot(dx, dy);

        // 時計回り進行方向 (dx, dy) の外側法線方向（Y軸下向き系では (dy/len, -dx/len)）
        const testOutsidePt = {
          x: mx + (dy / len) * 2.2,
          y: my - (dx / len) * 2.2
        };

        let isInsideAny = false;
        for (let p = 0; p < validPolys.length; p++) {
          if (isPointInPolygon(testOutsidePt, validPolys[p])) {
            isInsideAny = true;
            break;
          }
        }

        if (!isInsideAny) {
          // 逆向きの辺がすでにある場合は共有境界（内壁）なので相殺除去
          const revIdx = boundaryEdges.findIndex(be => dist(be.from, p1) < 1.0 && dist(be.to, p0) < 1.0);
          if (revIdx !== -1) {
            boundaryEdges.splice(revIdx, 1);
          } else {
            const dupIdx = boundaryEdges.findIndex(be => dist(be.from, p0) < 1.0 && dist(be.to, p1) < 1.0);
            if (dupIdx === -1) {
              boundaryEdges.push({ from: p0, to: p1, used: false });
            }
          }
        }
      }
    }

    // 5. 外周辺を連結して最大の閉ループ（最外周ポリゴン）を構築
    const loops = [];
    for (let startIdx = 0; startIdx < boundaryEdges.length; startIdx++) {
      if (boundaryEdges[startIdx].used) continue;

      const loop = [];
      let curr = boundaryEdges[startIdx];
      curr.used = true;
      loop.push({ x: curr.from.x, y: curr.from.y });

      let safety = 0;
      while (safety++ < 3000) {
        if (dist(curr.to, loop[0]) < 1.0 && loop.length >= 3) {
          break;
        }
        loop.push({ x: curr.to.x, y: curr.to.y });

        const candidates = boundaryEdges.filter(be => !be.used && dist(be.from, curr.to) < 1.0);
        if (candidates.length === 0) break;

        let chosen = candidates[0];
        if (candidates.length > 1) {
          const inAngle = Math.atan2(curr.from.y - curr.to.y, curr.from.x - curr.to.x);
          let bestTurn = Infinity;
          for (const cand of candidates) {
            const outAngle = Math.atan2(cand.to.y - cand.from.y, cand.to.x - cand.from.x);
            let diff = outAngle - inAngle;
            while (diff <= 0) diff += Math.PI * 2;
            if (diff < bestTurn) {
              bestTurn = diff;
              chosen = cand;
            }
          }
        }
        chosen.used = true;
        curr = chosen;
      }

      if (loop.length >= 3) {
        loops.push(loop);
      }
    }

    const originalArea = Math.abs(polygonSignedArea(validPolys[0]));

    if (loops.length > 0) {
      loops.sort((a, b) => Math.abs(polygonSignedArea(b)) - Math.abs(polygonSignedArea(a)));
      const bestLoop = removeCollinearVertices(loops[0]);
      const bestArea = Math.abs(polygonSignedArea(bestLoop));

      // 面積が元の親ポリゴン以上に広がっている、または頂点が変わっていれば採用
      if (bestArea >= originalArea * 0.98) {
        return bestLoop;
      }
    }

    // 離れ島（完全に離れた位置）に新しい市区町村を追加した場合は、全体を包含する外郭で拡張
    const allPts = validPolys.flat();
    return computeConvexHull(allPts);
  }

  function polygonSignedArea(verts) {
    let area = 0;
    for (let i = 0; i < verts.length; i++) {
      const p1 = verts[i];
      const p2 = verts[(i + 1) % verts.length];
      area += (p2.x - p1.x) * (p2.y + p1.y);
    }
    return area * 0.5;
  }

  function removeCollinearVertices(verts) {
    if (verts.length <= 3) return verts;
    const result = [];
    const n = verts.length;
    for (let i = 0; i < n; i++) {
      const prev = verts[(i - 1 + n) % n];
      const curr = verts[i];
      const next = verts[(i + 1) % n];
      const cross = Math.abs((curr.x - prev.x) * (next.y - curr.y) - (curr.y - prev.y) * (next.x - curr.x));
      const len1 = dist(prev, curr);
      const len2 = dist(curr, next);
      if (len1 > 0.5 && len2 > 0.5 && cross / (len1 * len2) > 0.01) {
        result.push(curr);
      }
    }
    return result.length >= 3 ? result : verts;
  }

  // 新しく追加・変形された区画（childFeat）を含めて、親（郡・政令市）および祖父（県）の外周境界を自動拡張
  function expandAncestorBoundariesWithNewChild(childFeat) {
    let currChild = childFeat;
    const expandedNames = [];

    while (currChild && currChild.parentId) {
      const parent = state.features.find(f => f.id === currChild.parentId);
      if (!parent) break;

      if (parent.vertices && parent.vertices.length >= 3 && currChild.vertices && currChild.vertices.length >= 3) {
        // 子区画の頂点が1つでも親ポリゴンの外側にあるか判定
        const hasProtrudingVertex = currChild.vertices.some(v => !isPointOnBoundaryOrInside(v, parent.vertices, 1.5));

        if (hasProtrudingVertex) {
          const mergedOuter = computeUnionOuterBoundary([parent.vertices, currChild.vertices]);
          if (mergedOuter && mergedOuter.length >= 3) {
            parent.vertices = mergedOuter;
            expandedNames.push(`${parent.name}${parent.suffix}`);
          }
        }
      }
      currChild = parent;
    }

    return expandedNames;
  }

  // 指定した親区画（県・郡・政令市）の配下にある全子孫ポリゴンから外周境界を再構築する
  function rebuildParentBoundaryFromDescendants(parentFeat) {
    const collectDescendantPolygons = (pid) => {
      const directChildren = state.features.filter(f => f.parentId === pid);
      let polys = [];
      for (const ch of directChildren) {
        if (ch.vertices && ch.vertices.length >= 3) {
          polys.push(ch.vertices);
        }
        polys = polys.concat(collectDescendantPolygons(ch.id));
      }
      return polys;
    };

    const childPolys = collectDescendantPolygons(parentFeat.id);
    if (childPolys.length === 0) return false;

    const unionOuter = computeUnionOuterBoundary(childPolys);
    if (unionOuter && unionOuter.length >= 3) {
      parentFeat.vertices = unionOuter;
      return true;
    }
    return false;
  }

  // 親階層（都道府県・郡・政令市）からN03属性（N03_001〜003）を自動継承する
  function inheritHierarchyAttributes(feat) {
    if (!feat.parentId) return;
    const parent = state.features.find(f => f.id === feat.parentId);
    if (!parent) return;

    if (parent.adminLevel === 'prefecture') {
      feat.prefecture = `${parent.name}${parent.suffix}`;
      if (feat.adminLevel === 'group') {
        if (parent.suffix === '道' && (feat.suffix === '振興局' || feat.suffix === '支庁')) {
          feat.subpref = `${feat.name}${feat.suffix}`;
        } else {
          feat.county = `${feat.name}${feat.suffix}`;
        }
      }
    } else if (parent.adminLevel === 'group') {
      const grandParent = state.features.find(f => f.id === parent.parentId);
      feat.prefecture = grandParent ? `${grandParent.name}${grandParent.suffix}` : (parent.prefecture || feat.prefecture);
      if (parent.suffix === '振興局' || parent.suffix === '支庁') {
        feat.subpref = `${parent.name}${parent.suffix}`;
      } else {
        feat.county = `${parent.name}${parent.suffix}`;
      }
    }
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
  // 6. スナップ & 共有境界（県境・郡境・隣接境界）トポロジー連動検出
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
        if (state.dragLinkedVertices.some(lv => lv.featureId === feat.id && lv.vertexIndex === i)) {
          continue;
        }
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

  function collectSharedVertices(worldPt, sourceFeatureId, sourceVertexIndex) {
    if (!state.topologySyncEnabled) return [];
    const TOLERANCE_WORLD = 1.5;
    const linked = [];

    for (const feat of state.features) {
      for (let i = 0; i < feat.vertices.length; i++) {
        if (feat.id === sourceFeatureId && i === sourceVertexIndex) continue;
        if (dist(feat.vertices[i], worldPt) <= TOLERANCE_WORLD) {
          linked.push({
            featureId: feat.id,
            vertexIndex: i
          });
        }
      }
    }
    return linked;
  }

  function insertSharedEdgeMidpoint(v1, v2, newMidPt, sourceFeatureId) {
    if (!state.topologySyncEnabled) return;
    const TOLERANCE_WORLD = 1.5;

    for (const feat of state.features) {
      if (feat.id === sourceFeatureId) continue;
      const verts = feat.vertices;
      for (let i = 0; i < verts.length; i++) {
        const a = verts[i];
        const b = verts[(i + 1) % verts.length];
        const sameForward = dist(a, v1) <= TOLERANCE_WORLD && dist(b, v2) <= TOLERANCE_WORLD;
        const sameReverse = dist(a, v2) <= TOLERANCE_WORLD && dist(b, v1) <= TOLERANCE_WORLD;
        if (sameForward || sameReverse) {
          verts.splice(i + 1, 0, { x: newMidPt.x, y: newMidPt.y });
          break;
        }
      }
    }
  }

  function deleteSharedVertices(worldPt, sourceFeatureId) {
    if (!state.topologySyncEnabled) return;
    const TOLERANCE_WORLD = 1.5;

    for (const feat of state.features) {
      if (feat.id === sourceFeatureId) continue;
      if (feat.vertices.length <= 3) continue;
      for (let i = feat.vertices.length - 1; i >= 0; i--) {
        if (feat.vertices.length <= 3) break;
        if (dist(feat.vertices[i], worldPt) <= TOLERANCE_WORLD) {
          feat.vertices.splice(i, 1);
        }
      }
    }
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

    const levelOrder = { prefecture: 1, group: 2, municipality: 3, island: 3 };
    const sortedFeatures = [...state.features].sort((a, b) => {
      return (levelOrder[a.adminLevel] || 3) - (levelOrder[b.adminLevel] || 3);
    });

    for (const feat of sortedFeatures) {
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

    let fillAlpha = 0.32;
    if (feat.adminLevel === 'prefecture') {
      fillAlpha = isSelected ? 0.16 : 0.07;
    } else if (feat.adminLevel === 'group') {
      fillAlpha = isSelected ? 0.22 : 0.11;
    } else {
      fillAlpha = isSelected ? 0.44 : 0.30;
    }

    ctx.fillStyle = hexToRgba(feat.fillColor, fillAlpha);
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#2563eb' : feat.strokeColor;
    if (feat.adminLevel === 'prefecture') {
      ctx.lineWidth = isSelected ? 4.5 : 3.5;
      ctx.setLineDash([12, 5]);
    } else if (feat.adminLevel === 'group') {
      ctx.lineWidth = isSelected ? 3.5 : 2.6;
      ctx.setLineDash([10, 3, 2, 3]);
    } else if (feat.adminLevel === 'island') {
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.setLineDash([4, 4]);
    } else {
      ctx.lineWidth = isSelected ? 2.8 : 1.6;
      ctx.setLineDash([]);
    }
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.setLineDash([]);

    if (isSelected) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.32)';
      ctx.lineWidth = 7;
      ctx.stroke();
    }

    const fullName = `${feat.name}${feat.suffix}`;
    if (fullName.trim() !== '') {
      const centroidWorld = getPolygonCentroid(feat.vertices);
      const centerScreen = worldToScreen(centroidWorld.x, centroidWorld.y);

      let offsetY = 0;
      let fontSize = 12 * Math.sqrt(state.camera.zoom);
      if (feat.adminLevel === 'prefecture') {
        offsetY = -22;
        fontSize = Math.max(13, Math.min(22, 16 * Math.sqrt(state.camera.zoom)));
      } else if (feat.adminLevel === 'group') {
        offsetY = -12;
        fontSize = Math.max(11, Math.min(18, 13.5 * Math.sqrt(state.camera.zoom)));
      } else {
        fontSize = Math.max(10, Math.min(15, 11.5 * Math.sqrt(state.camera.zoom)));
      }

      ctx.font = `${feat.adminLevel !== 'municipality' ? '700' : '600'} ${Math.round(fontSize)}px "Noto Sans JP", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.lineWidth = 3.5;
      ctx.strokeStyle = isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)';
      ctx.strokeText(fullName, centerScreen.x, centerScreen.y + offsetY);

      ctx.fillStyle = feat.adminLevel === 'prefecture'
        ? (isDark ? '#93c5fd' : '#1e3a8a')
        : feat.adminLevel === 'group'
        ? (isDark ? '#c4b5fd' : '#3730a3')
        : (isDark ? '#f1f5f9' : '#0f172a');
      ctx.fillText(fullName, centerScreen.x, centerScreen.y + offsetY);
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
      const sharedList = collectSharedVertices(verts[i], feat.id, i);
      const isShared = sharedList.length > 0;
      const size = isHovered ? 11 : 8;

      if (isShared && state.topologySyncEnabled) {
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 9, 0, Math.PI * 2);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = isHovered ? '#f59e0b' : (isShared ? '#eef2ff' : '#ffffff');
      ctx.strokeStyle = isShared ? '#4f46e5' : '#1d4ed8';
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
          state.dragLinkedVertices = collectSharedVertices(selectedFeat.vertices[i], selectedFeat.id, i);
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
          insertSharedEdgeMidpoint(v1, v2, midWorld, selectedFeat.id);

          state.dragMode = 'vertex';
          state.dragTargetVertexIndex = i + 1;
          state.dragLinkedVertices = collectSharedVertices(midWorld, selectedFeat.id, i + 1);
          render();
          return;
        }
      }
    }

    const levelPriority = { municipality: 3, island: 3, group: 2, prefecture: 1 };
    const hitCandidates = state.features
      .filter(feat => feat.visible && feat.vertices.length >= 3 && isPointInPolygon(state.mouseWorld, feat.vertices))
      .sort((a, b) => (levelPriority[b.adminLevel] || 0) - (levelPriority[a.adminLevel] || 0));

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
        feat.vertices[state.dragTargetVertexIndex] = { ...pos };

        if (state.topologySyncEnabled && state.dragLinkedVertices.length > 0) {
          for (const linked of state.dragLinkedVertices) {
            const targetFeat = state.features.find(f => f.id === linked.featureId);
            if (targetFeat && targetFeat.vertices[linked.vertexIndex]) {
              targetFeat.vertices[linked.vertexIndex] = { ...pos };
            }
          }
        }
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
      // 市区町村や郡の頂点を外側に広げた場合も、親の県・郡の外周境界が自動拡張される
      if (state.topologySyncEnabled && state.selectedId) {
        const movedFeat = state.features.find(f => f.id === state.selectedId);
        if (movedFeat && movedFeat.parentId) {
          expandAncestorBoundariesWithNewChild(movedFeat);
        }
      }
      saveHistory();
    }
    state.dragMode = null;
    state.dragTargetVertexIndex = -1;
    state.dragLinkedVertices = [];
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
        const removedPt = { ...selectedFeat.vertices[i] };
        selectedFeat.vertices.splice(i, 1);
        deleteSharedVertices(removedPt, selectedFeat.id);
        state.hoveredVertex = null;
        saveHistory();
        render();
        showToast('頂点（および共有境界頂点）を削除しました');
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
  // 9. 新規ポリゴン・入れ子階層作成処理（追加した領域も含めて県・郡の境界を自動拡張）
  // =========================================================================
  function startDrawingChildFeature(parentId, targetAdminLevel) {
    state.pendingParentId = parentId;
    state.pendingAdminLevel = targetAdminLevel;
    const parent = state.features.find(f => f.id === parentId);
    const levelLabel = targetAdminLevel === 'prefecture'
      ? '都道府県'
      : targetAdminLevel === 'group'
      ? '郡・政令市'
      : '市区町村・区';

    drawingTargetLabel.textContent = parent
      ? `「${parent.name}${parent.suffix}」配下の${levelLabel}`
      : `新規${levelLabel}`;

    setTool('polygon');
    showToast(`地図をクリックして境界を描画してください（はみ出した分は親の県・郡も自動拡張します）`);
  }

  function createNewFeatureFromVertices(vertices) {
    const idx = state.features.length + 1;
    const palette = COLOR_PALETTE[(idx - 1) % COLOR_PALETTE.length];

    let parentId = state.pendingParentId;
    let adminLevel = state.pendingAdminLevel;

    if (!adminLevel) {
      const currentSelected = state.features.find(f => f.id === state.selectedId);
      if (currentSelected) {
        if (currentSelected.adminLevel === 'prefecture') {
          parentId = currentSelected.id;
          adminLevel = 'municipality';
        } else if (currentSelected.adminLevel === 'group') {
          parentId = currentSelected.id;
          adminLevel = 'municipality';
        } else {
          parentId = currentSelected.parentId;
          adminLevel = 'municipality';
        }
      } else {
        const rootPref = state.features.find(f => f.adminLevel === 'prefecture');
        if (rootPref) {
          parentId = rootPref.id;
          adminLevel = 'municipality';
        } else {
          parentId = null;
          adminLevel = 'prefecture';
        }
      }
    }

    const parentFeat = parentId ? state.features.find(f => f.id === parentId) : null;
    if (parentFeat) {
      parentFeat.expanded = true;
    }

    let defaultName = `新規第${idx}`;
    let defaultSuffix = '市';
    if (adminLevel === 'prefecture') {
      defaultName = '新規';
      defaultSuffix = '県';
    } else if (adminLevel === 'group') {
      defaultName = '新規';
      defaultSuffix = '郡';
    } else if (parentFeat && parentFeat.suffix === '市') {
      defaultName = `第${idx}`;
      defaultSuffix = '区';
    } else if (parentFeat && parentFeat.suffix === '郡') {
      defaultName = `新設`;
      defaultSuffix = '町';
    }

    const newFeat = {
      id: `feat_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      parentId: parentId || null,
      name: defaultName,
      suffix: defaultSuffix,
      adminLevel,
      prefecture: '',
      subpref: '',
      county: '',
      code: adminLevel === 'prefecture' ? '99000' : `99${String(200 + idx).padStart(3, '0')}`,
      fillColor: palette.fill,
      strokeColor: palette.stroke,
      visible: true,
      expanded: true,
      vertices
    };

    inheritHierarchyAttributes(newFeat);

    state.pendingParentId = null;
    state.pendingAdminLevel = null;
    drawingTargetLabel.textContent = '新規ポリゴン';

    state.features.push(newFeat);

    // 追加された区画を含めて親（郡・政令市）および祖父（都道府県）の外周境界を自動拡張
    const expandedAncestors = expandAncestorBoundariesWithNewChild(newFeat);

    state.selectedId = newFeat.id;
    saveHistory();
    syncUI();
    render();

    if (expandedAncestors.length > 0) {
      showToast(`「${newFeat.name}${newFeat.suffix}」を追加し、${expandedAncestors.join('・')} の境界も自動更新しました`, 'success');
    } else {
      showToast(`「${newFeat.name}${newFeat.suffix}」を作成しました`, 'success');
    }
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
    state.pendingParentId = null;
    state.pendingAdminLevel = null;
    drawingTargetLabel.textContent = '新規ポリゴン';
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
  // 10. ツール切替・カメラフィット・入れ子ツリーUI同期
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
      select: 'クリックで選択、県境・郡境の共有頂点（二重丸）を動かすと上位境界も自動で連動します',
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

      parentSelectorWrapper.classList.toggle('hidden', selectedFeat.adminLevel === 'prefecture');
      propParentId.innerHTML = '<option value="">（なし / 独立）</option>';
      state.features.forEach(candidate => {
        if (candidate.id === selectedFeat.id) return;
        if (selectedFeat.adminLevel === 'group' && candidate.adminLevel !== 'prefecture') return;
        if (selectedFeat.adminLevel === 'municipality' && !['prefecture', 'group'].includes(candidate.adminLevel)) return;

        const opt = document.createElement('option');
        opt.value = candidate.id;
        const prefix = candidate.adminLevel === 'group' ? '└ ' : '';
        opt.textContent = `${prefix}${candidate.name}${candidate.suffix}`;
        propParentId.appendChild(opt);
      });
      propParentId.value = selectedFeat.parentId || '';

      propName.value = selectedFeat.name;
      propSuffix.value = selectedFeat.suffix;
      propPrefecture.value = selectedFeat.prefecture || '';
      propSubpref.value = selectedFeat.subpref || '';
      propCounty.value = selectedFeat.county || '';
      propCode.value = selectedFeat.code || '';
      propFillColor.value = selectedFeat.fillColor;
      propStrokeColor.value = selectedFeat.strokeColor;

      childCreatorBar.innerHTML = '';
      if (selectedFeat.adminLevel === 'prefecture') {
        childCreatorBar.innerHTML = `
          <div class="space-y-1.5 pt-1">
            <div class="flex gap-1.5">
              <button type="button" id="btn-add-sub-group" class="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition">
                ＋ 郡・政令市を描画
              </button>
              <button type="button" id="btn-add-sub-muni" class="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition">
                ＋ 市区町村を描画
              </button>
            </div>
            <button type="button" id="btn-rebuild-parent-boundary" class="w-full py-1.5 px-2 rounded-lg text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition">
              🔄 配下の郡・市区町村に合わせて県境を自動再構築
            </button>
          </div>
        `;
        document.getElementById('btn-add-sub-group').addEventListener('click', () => {
          startDrawingChildFeature(selectedFeat.id, 'group');
        });
        document.getElementById('btn-add-sub-muni').addEventListener('click', () => {
          startDrawingChildFeature(selectedFeat.id, 'municipality');
        });
        document.getElementById('btn-rebuild-parent-boundary').addEventListener('click', () => {
          if (rebuildParentBoundaryFromDescendants(selectedFeat)) {
            saveHistory();
            render();
            showToast(`「${selectedFeat.name}${selectedFeat.suffix}」の外周境界を配下区画に合わせて再構築しました`, 'success');
          } else {
            showToast('配下に所属する区画がありません', 'error');
          }
        });
      } else if (selectedFeat.adminLevel === 'group') {
        const subLabel = selectedFeat.suffix === '市' ? '行政区（〇〇区）を描画' : '配下の町村を描画';
        childCreatorBar.innerHTML = `
          <div class="space-y-1.5 pt-1">
            <button type="button" id="btn-add-sub-ward" class="w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition">
              ＋ ${subLabel}
            </button>
            <button type="button" id="btn-rebuild-group-boundary" class="w-full py-1.5 px-2 rounded-lg text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition">
              🔄 配下の市区町村に合わせて境界（および県境）を自動更新
            </button>
          </div>
        `;
        document.getElementById('btn-add-sub-ward').addEventListener('click', () => {
          startDrawingChildFeature(selectedFeat.id, 'municipality');
        });
        document.getElementById('btn-rebuild-group-boundary').addEventListener('click', () => {
          if (rebuildParentBoundaryFromDescendants(selectedFeat)) {
            expandAncestorBoundariesWithNewChild(selectedFeat);
            saveHistory();
            render();
            showToast(`「${selectedFeat.name}${selectedFeat.suffix}」と親都道府県の境界を更新しました`, 'success');
          } else {
            showToast('配下に所属する区画がありません', 'error');
          }
        });
      }
    } else {
      propEmptyState.classList.remove('hidden');
      propForm.classList.add('hidden');
    }

    layerCount.textContent = state.features.length;
    layerList.innerHTML = '';

    const renderedIds = new Set();

    function renderTreeNode(feat, depth) {
      if (renderedIds.has(feat.id)) return;
      renderedIds.add(feat.id);

      const children = state.features.filter(f => f.parentId === feat.id);
      const hasChildren = children.length > 0;
      const isSelected = feat.id === state.selectedId;

      const badgeMap = {
        prefecture: { text: '都道府県', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
        group: { text: '郡/政令市', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' },
        municipality: { text: '市区町村', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
        island: { text: '所属未定', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' }
      };
      const badge = badgeMap[feat.adminLevel] || badgeMap.municipality;

      const item = document.createElement('div');
      item.style.marginLeft = `${depth * 14}px`;
      item.className = `group flex items-center justify-between gap-1.5 p-1.5 rounded-lg border text-xs cursor-pointer transition ${
        isSelected
          ? 'bg-blue-50/90 border-blue-400 dark:bg-blue-950/60 dark:border-blue-600 shadow-xs'
          : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:border-slate-800'
      }`;

      item.innerHTML = `
        <div class="flex items-center gap-1 min-w-0 flex-1">
          ${hasChildren
            ? `<button type="button" data-action="toggle-expand" class="w-4 h-4 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] text-slate-500 shrink-0">${feat.expanded !== false ? '▼' : '▶'}</button>`
            : `<span class="w-4 text-center text-slate-300 dark:text-slate-600 text-[10px] shrink-0">${depth > 0 ? '└' : '•'}</span>`
          }
          <button type="button" data-action="toggle-vis" class="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0" title="表示/非表示">
            ${feat.visible
              ? '<svg class="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>'
              : '<svg class="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>'
            }
          </button>
          <span class="w-2.5 h-2.5 rounded-xs shrink-0 border border-black/20" style="background-color: ${feat.fillColor};"></span>
          <div class="truncate ml-0.5">
            <div class="font-semibold truncate ${feat.visible ? '' : 'opacity-45 line-through'}">${escapeHtml(feat.name + feat.suffix)}</div>
            <div class="flex items-center gap-1 mt-0.5">
              <span class="text-[9px] px-1 py-0.2 rounded font-medium ${badge.cls}">${badge.text}</span>
              <span class="text-[9px] font-mono text-slate-400">${escapeHtml(feat.code || '')}</span>
            </div>
          </div>
        </div>
        ${(feat.adminLevel === 'prefecture' || feat.adminLevel === 'group')
          ? `<button type="button" data-action="add-child" title="配下に市区町村を追加描画（県・郡も自動拡張）" class="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-[10px] font-bold shrink-0 transition">＋追加</button>`
          : ''
        }
      `;

      item.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
          e.stopPropagation();
          const action = actionBtn.dataset.action;
          if (action === 'toggle-expand') {
            feat.expanded = feat.expanded === false ? true : false;
            syncUI();
          } else if (action === 'toggle-vis') {
            feat.visible = !feat.visible;
            saveHistory();
            syncUI();
            render();
          } else if (action === 'add-child') {
            startDrawingChildFeature(feat.id, 'municipality');
          }
          return;
        }

        state.selectedId = feat.id;
        syncUI();
        render();
      });

      layerList.appendChild(item);

      if (feat.expanded !== false) {
        children.forEach(child => renderTreeNode(child, depth + 1));
      }
    }

    const roots = state.features.filter(f => !f.parentId || !state.features.some(p => p.id === f.parentId));
    roots.forEach(root => renderTreeNode(root, 0));
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
        let ring = f.vertices.map(v => worldToGeo(v.x, v.y));

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
        const isGroup = f.adminLevel === 'group';

        const properties = {
          N03_001: isPref ? fullName : (f.prefecture || null),
          N03_002: f.subpref && f.subpref.trim() !== '' ? f.subpref.trim() : null,
          N03_003: isGroup ? fullName : (f.county && f.county.trim() !== '' ? f.county.trim() : null),
          N03_004: (isPref || isGroup) ? null : (fullName || null),
          N03_007: f.code && f.code.trim() !== '' ? f.code.trim() : null
        };

        if (includeStyleMeta) {
          properties._editor = {
            id: f.id,
            parent_id: f.parentId || null,
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

  function splitAdminNameAndSuffix(fullName) {
    if (!fullName) return { name: '', suffix: '' };
    const suffixes = ['振興局', '支庁', '県', '都', '道', '府', '郡', '市', '区', '町', '村', '島'];
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

        const n03Pref = props.N03_001 || props.prefecture || '';
        const n03Subpref = props.N03_002 || '';
        const n03County = props.N03_003 || '';
        const n03Muni = props.N03_004 || '';
        const n03Code = props.N03_007 || props.code || '';

        const isPrefPolygon = !n03Muni && !n03County && Boolean(n03Pref) && editorMeta.admin_type !== 'municipality';
        const isGroupPolygon = !n03Muni && Boolean(n03County) && editorMeta.admin_type !== 'municipality';

        const targetFullName = n03Muni || n03County || n03Pref || props.name || `区画${i + 1}`;
        const split = splitAdminNameAndSuffix(targetFullName);

        const baseName = editorMeta.base_name || props.base_name || split.name;
        const suffix = editorMeta.admin_label !== undefined ? editorMeta.admin_label : split.suffix;
        const adminLevel = editorMeta.admin_type || props.admin_type || (isPrefPolygon ? 'prefecture' : isGroupPolygon ? 'group' : 'municipality');

        return {
          id: editorMeta.id || `imp_${Date.now()}_${i}`,
          parentId: editorMeta.parent_id || null,
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
          expanded: true,
          vertices: ring.map(([lon, lat]) => geoToWorld(lon, lat))
        };
      });

      state.features.forEach(feat => {
        if (feat.parentId) return;
        if (feat.adminLevel === 'group' && feat.prefecture) {
          const pref = state.features.find(p => p.adminLevel === 'prefecture' && `${p.name}${p.suffix}` === feat.prefecture);
          if (pref) feat.parentId = pref.id;
        } else if (feat.adminLevel === 'municipality') {
          if (feat.county) {
            const grp = state.features.find(g => g.adminLevel === 'group' && `${g.name}${g.suffix}` === feat.county);
            if (grp) {
              feat.parentId = grp.id;
              return;
            }
          }
          if (feat.prefecture) {
            const pref = state.features.find(p => p.adminLevel === 'prefecture' && `${p.name}${p.suffix}` === feat.prefecture);
            if (pref) feat.parentId = pref.id;
          }
        }
      });

      state.selectedId = state.features[0]?.id || null;
      saveHistory();
      syncUI();
      fitViewToFeatures();
      showToast(`${state.features.length}件の行政区域データを階層構築して読み込みました`, 'success');
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
      statusSnapBadge.textContent = state.snapEnabled ? '吸着: ON' : '吸着: OFF';
      btnSnap.className = state.snapEnabled
        ? 'w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700 transition'
        : 'w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition';
      showToast(state.snapEnabled ? '頂点スナップを有効にしました' : '頂点スナップを無効にしました');
      render();
    });

    const btnTopology = document.getElementById('btn-toggle-topology');
    const topologyLabel = document.getElementById('topology-label');
    btnTopology.addEventListener('click', () => {
      state.topologySyncEnabled = !state.topologySyncEnabled;
      topologyLabel.textContent = state.topologySyncEnabled ? '県境連動' : '単独編集';
      statusTopologyBadge.textContent = state.topologySyncEnabled ? '県境連動: ON' : '県境連動: OFF';
      btnTopology.className = state.topologySyncEnabled
        ? 'w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 transition'
        : 'w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition';
      showToast(state.topologySyncEnabled ? '共有境界（県境・郡境）の自動追従を有効にしました' : '境界を単独で編集するモードにしました');
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

    document.getElementById('btn-create-root-pref').addEventListener('click', () => {
      startDrawingChildFeature(null, 'prefecture');
    });
    document.getElementById('btn-add-pref-quick').addEventListener('click', () => {
      startDrawingChildFeature(null, 'prefecture');
    });

    document.getElementById('btn-load-sample').addEventListener('click', () => {
      state.features = createSampleFeatures();
      state.selectedId = state.features[2].id;
      saveHistory();
      syncUI();
      fitViewToFeatures();
      showToast('架空「蒼海県（政令市・郡・市区町村の入れ子構造）」を読み込みました', 'success');
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

    propAdminLevel.addEventListener('change', () => {
      const feat = state.features.find(f => f.id === state.selectedId);
      if (!feat) return;
      feat.adminLevel = propAdminLevel.value;
      if (feat.adminLevel === 'prefecture') feat.parentId = null;
      inheritHierarchyAttributes(feat);
      saveHistory();
      syncUI();
      render();
    });

    propParentId.addEventListener('change', () => {
      const feat = state.features.find(f => f.id === state.selectedId);
      if (!feat) return;
      feat.parentId = propParentId.value || null;
      inheritHierarchyAttributes(feat);
      expandAncestorBoundariesWithNewChild(feat);
      saveHistory();
      syncUI();
      render();
    });

    const bindPropChange = (el, key, commitHistory = false, propagateChildren = false) => {
      el.addEventListener(commitHistory ? 'change' : 'input', () => {
        const feat = state.features.find(f => f.id === state.selectedId);
        if (!feat) return;
        feat[key] = el.value;
        if (propagateChildren) {
          state.features.forEach(child => {
            if (child.parentId === feat.id) inheritHierarchyAttributes(child);
            state.features.forEach(grandChild => {
              if (grandChild.parentId === child.id) inheritHierarchyAttributes(grandChild);
            });
          });
        }
        if (commitHistory) saveHistory();
        syncUI();
        render();
      });
    };

    bindPropChange(propName, 'name', false, true);
    propName.addEventListener('change', saveHistory);
    bindPropChange(propSuffix, 'suffix', true, true);
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
      expandAncestorBoundariesWithNewChild(copy);
      state.selectedId = copy.id;
      saveHistory();
      syncUI();
      render();
      showToast('地物を複製しました');
    });

    document.getElementById('btn-delete-feature').addEventListener('click', () => {
      if (!state.selectedId) return;
      const targetId = state.selectedId;
      state.features.forEach(f => {
        if (f.parentId === targetId) f.parentId = null;
      });
      state.features = state.features.filter(f => f.id !== targetId);
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
        case 't': btnTopology.click(); break;
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
                const removedPt = { ...feat.vertices[state.hoveredVertex.vertexIndex] };
                feat.vertices.splice(state.hoveredVertex.vertexIndex, 1);
                deleteSharedVertices(removedPt, feat.id);
                state.hoveredVertex = null;
                saveHistory();
                render();
                showToast('頂点（および共有境界頂点）を削除しました');
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
  // 13. PWA 機能（Service Worker 登録・インストール促進・ファイル関連付け）
  // =========================================================================
  function initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./sw.js')
          .catch((err) => console.warn('ServiceWorker registration failed:', err));
      });
    }

    let deferredPrompt = null;
    const btnInstall = document.getElementById('btn-install-pwa');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (btnInstall) {
        btnInstall.classList.remove('hidden');
        btnInstall.classList.add('flex');
      }
    });

    if (btnInstall) {
      btnInstall.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('アプリをインストールしました', 'success');
        }
        deferredPrompt = null;
        btnInstall.classList.add('hidden');
        btnInstall.classList.remove('flex');
      });
    }

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (btnInstall) {
        btnInstall.classList.add('hidden');
        btnInstall.classList.remove('flex');
      }
    });

    if ('launchQueue' in window) {
      window.launchQueue.setConsumer(async (launchParams) => {
        if (!launchParams.files || launchParams.files.length === 0) return;
        try {
          const fileHandle = launchParams.files[0];
          const file = await fileHandle.getFile();
          const text = await file.text();
          importGeoJSONText(text);
        } catch (err) {
          console.error(err);
          showToast('ファイルの読み込みに失敗しました', 'error');
        }
      });
    }
  }

  // =========================================================================
  // 14. 起動シーケンス
  // =========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    initEvents();
    initPWA();
    state.features = createSampleFeatures();
    state.selectedId = state.features[2].id;
    saveHistory();
    syncUI();
    resizeCanvas();
    fitViewToFeatures();
  });
})();
