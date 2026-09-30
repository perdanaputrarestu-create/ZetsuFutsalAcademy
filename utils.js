/**
 * ZETSU FUTSAL ACADEMY — Pure utility helpers
 * Dipisah agar bisa diuji (poin 5 & 9) tanpa menyentuh alur UI.
 * Tidak bergantung pada DOM / Supabase / state global.
 */
(function (global) {
  'use strict';

  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3;
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lng2 - lng1) * Math.PI / 180;
    const x = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
  }

  function getAgeGroup(birthYear) {
    const y = Number(birthYear);
    if (y >= 2017 && y <= 2019) return 'U10';
    if (y >= 2014 && y <= 2016) return 'U13';
    if (y >= 2012 && y <= 2013) return 'U16';
    return '';
  }

  function ageGroupLabel(birthYear) {
    return getAgeGroup(birthYear) || 'Lainnya';
  }

  function monthName(m) {
    return ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][m];
  }

  const SPP_MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  function normalizeSppMonth(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 1 && n <= 12) return SPP_MONTHS_ID[n - 1];
    const key = raw.toLowerCase().replace(/[^a-z]/g, '');
    const aliases = {
      jan: 'Januari', januari: 'Januari', feb: 'Februari', februari: 'Februari',
      mar: 'Maret', maret: 'Maret', apr: 'April', april: 'April', mei: 'Mei', may: 'Mei',
      jun: 'Juni', juni: 'Juni', jul: 'Juli', juli: 'Juli', aug: 'Agustus', agu: 'Agustus',
      agustus: 'Agustus', sep: 'September', sept: 'September', september: 'September',
      okt: 'Oktober', oct: 'Oktober', oktober: 'Oktober', nov: 'November', november: 'November',
      des: 'Desember', dec: 'Desember', desember: 'Desember'
    };
    return aliases[key] || raw.toLowerCase().replace(/^./, c => c.toUpperCase());
  }

  function normalizeSppStatus(value) {
    return String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  }

  function normalizeSppUserId(value) {
    return String(value ?? '').trim().toLowerCase();
  }

  function normalizeSppName(value) {
    return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function getSppPeriodValue(s) {
    const month = normalizeSppMonth(s?.month ?? s?.bulan ?? s?.spp_month);
    const year = Number(s?.year ?? s?.tahun ?? s?.spp_year);
    return { month, year };
  }

  function sppRecordBelongsToUser(s, u) {
    const ids = [s?.user_id, s?.userId, s?.player_id, s?.playerId, s?.member_id, s?.memberId]
      .map(normalizeSppUserId).filter(Boolean);
    const uid = normalizeSppUserId(u?.id);
    if (uid && ids.includes(uid)) return true;
    const names = [s?.user_name, s?.userName, s?.player_name, s?.playerName, s?.name]
      .map(normalizeSppName).filter(Boolean);
    return !!normalizeSppName(u?.name) && names.includes(normalizeSppName(u?.name));
  }

  function isSppPaidFor(s, user, month, year) {
    if (!sppRecordBelongsToUser(s, user)) return false;
    const p = getSppPeriodValue(s);
    return p.month === normalizeSppMonth(month) &&
      p.year === Number(year) &&
      ['lunas', 'paid', 'sudah bayar', 'sudah dibayar'].includes(normalizeSppStatus(s?.status));
  }

  function findValidOffice(lat, lng, offices) {
    const list = (offices || [])
      .filter(o => o && o.lat != null && o.lng != null && Number.isFinite(+o.lat) && Number.isFinite(+o.lng) && Number(o.radius || 0) > 0)
      .map(o => ({ ...o, _distance: calculateDistance(lat, lng, +o.lat, +o.lng) }))
      .sort((a, b) => a._distance - b._distance);
    return list.find(o => o._distance <= Number(o.radius)) || null;
  }

  /**
   * Hitung streak kehadiran dari daftar tanggal (YYYY-MM-DD) yang sudah di-sort descending unik.
   * daysSortedDesc: array string tanggal unik, terbaru dulu.
   * refDate: Date acuan (default hari ini).
   */
  function calcStreakFromDays(daysSortedDesc, refDate) {
    const days = Array.isArray(daysSortedDesc) ? daysSortedDesc : [];
    let streak = 0;
    const d = refDate ? new Date(refDate) : new Date();
    const fmt = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    for (const x of days) {
      const ds = fmt(d);
      if (x === ds) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else if (streak === 0) {
        d.setDate(d.getDate() - 1);
        if (x === fmt(d)) {
          streak++;
          d.setDate(d.getDate() - 1);
        } else break;
      } else break;
    }
    return streak;
  }

  function money(n) {
    return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  }

  function todayFromDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function today() {
    return todayFromDate(new Date());
  }

  function esc(v) {
    return String(v ?? '').replace(/[&<>'"]/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[m]));
  }

  function paginate(items, page, pageSize) {
    const list = Array.isArray(items) ? items : [];
    const size = Math.max(1, Number(pageSize) || 10);
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / size));
    const p = Math.min(Math.max(1, Number(page) || 1), totalPages);
    const start = (p - 1) * size;
    return {
      page: p,
      pageSize: size,
      total,
      totalPages,
      items: list.slice(start, start + size),
      hasPrev: p > 1,
      hasNext: p < totalPages
    };
  }

  const ZetsuUtils = {
    calculateDistance,
    getAgeGroup,
    ageGroupLabel,
    monthName,
    SPP_MONTHS_ID,
    normalizeSppMonth,
    normalizeSppStatus,
    normalizeSppUserId,
    normalizeSppName,
    getSppPeriodValue,
    sppRecordBelongsToUser,
    isSppPaidFor,
    findValidOffice,
    calcStreakFromDays,
    money,
    today,
    todayFromDate,
    esc,
    paginate
  };

  global.ZetsuUtils = ZetsuUtils;
})(typeof window !== 'undefined' ? window : globalThis);
