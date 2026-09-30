/**
 * ZETSU unit tests untuk pure helpers (poin 9).
 * Jalankan di browser: buka tests.html
 * Atau di Node: node js/tests.js (setelah load utils)
 */
(function (global) {
  'use strict';

  const U = global.ZetsuUtils;
  if (!U) {
    console.error('ZetsuUtils belum termuat. Load js/utils.js dulu.');
    return;
  }

  let passed = 0;
  let failed = 0;
  const logs = [];

  function assert(name, cond, detail) {
    if (cond) {
      passed++;
      logs.push({ ok: true, name });
    } else {
      failed++;
      logs.push({ ok: false, name, detail: detail || '' });
      console.error('FAIL:', name, detail || '');
    }
  }

  // --- calculateDistance ---
  assert('distance same point = 0', U.calculateDistance(-6.2, 106.8, -6.2, 106.8) === 0);
  const d1 = U.calculateDistance(-6.2000, 106.8166, -6.2010, 106.8166);
  assert('distance ~111m for 0.001 deg lat', d1 > 100 && d1 < 130, 'got ' + d1);

  // --- age group ---
  assert('U10 2017', U.getAgeGroup(2017) === 'U10');
  assert('U10 2019', U.getAgeGroup(2019) === 'U10');
  assert('U13 2015', U.getAgeGroup(2015) === 'U13');
  assert('U16 2012', U.getAgeGroup(2012) === 'U16');
  assert('Lainnya 2010', U.getAgeGroup(2010) === '');
  assert('label Lainnya', U.ageGroupLabel(2010) === 'Lainnya');

  // --- findValidOffice ---
  const offices = [
    { id: 'a', name: 'A', lat: -6.2, lng: 106.8, radius: 50 },
    { id: 'b', name: 'B', lat: -6.21, lng: 106.81, radius: 200 }
  ];
  const near = U.findValidOffice(-6.2001, 106.8001, offices);
  assert('findValidOffice near A', near && near.id === 'a', near && near.id);
  const far = U.findValidOffice(-6.5, 107.0, offices);
  assert('findValidOffice far = null', far === null);

  // --- isSppPaidFor ---
  const user = { id: 'ZFA-001', name: 'Budi' };
  const paid = { user_id: 'ZFA-001', month: 'September', year: 2026, status: 'Lunas', amount: 150000 };
  const unpaid = { user_id: 'ZFA-001', month: 'September', year: 2026, status: 'Belum Lunas' };
  assert('isSppPaidFor lunas', U.isSppPaidFor(paid, user, 'September', 2026) === true);
  assert('isSppPaidFor belum', U.isSppPaidFor(unpaid, user, 'September', 2026) === false);
  assert('isSppPaidFor wrong month', U.isSppPaidFor(paid, user, 'Agustus', 2026) === false);

  // --- streak ---
  const today = U.today();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = U.todayFromDate(y);
  assert('streak 2 days', U.calcStreakFromDays([today, yesterday]) === 2);
  assert('streak empty', U.calcStreakFromDays([]) === 0);

  // --- paginate ---
  const pg = U.paginate([1, 2, 3, 4, 5], 2, 2);
  assert('paginate page 2', pg.page === 2 && pg.items.length === 2 && pg.items[0] === 3, JSON.stringify(pg));
  assert('paginate totalPages', pg.totalPages === 3);

  // --- money / esc ---
  assert('money format', U.money(150000).includes('150'));
  assert('esc html', U.esc('<b>') === '&lt;b&gt;');

  const summary = { passed, failed, total: passed + failed, logs };
  global.ZetsuTestResult = summary;
  console.log(`ZETSU tests: ${passed} passed, ${failed} failed`);
  return summary;
})(typeof window !== 'undefined' ? window : globalThis);
