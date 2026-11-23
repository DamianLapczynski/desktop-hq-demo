/* Desktop HQ — portfolio demo shim.
 * Loaded before the dashboard script. Replaces the Node/Express backend with an in-browser
 * mock: every fetch('/api/...') is answered here with fictional data (dates relative to today),
 * writes change in-memory state only (gone after reload), and the local JARVIS voice socket
 * is stubbed. Nothing leaves the browser except Google Fonts and the Open-Meteo weather call.
 */
(function () {
  'use strict';

  // ---------- Demo defaults: plain vault graph, no galaxy / war mode ----------
  try {
    localStorage.setItem('nx-layout', 'graf');
    localStorage.setItem('nx-wojna', '0');
  } catch (e) {}

  // ---------- Date helpers ----------
  var NOW = new Date();
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function tzOffset(d) {
    var m = -d.getTimezoneOffset(), s = m >= 0 ? '+' : '-'; m = Math.abs(m);
    return s + pad(Math.floor(m / 60)) + ':' + pad(m % 60);
  }
  function at(dayOffset, hh, mm) {
    var d = addDays(NOW, dayOffset); d.setHours(hh, mm || 0, 0, 0);
    return d;
  }
  function iso(d) { return ymd(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':00' + tzOffset(d); }
  function hm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  var TODAY = ymd(NOW);
  var DOW = ['ndz', 'pon', 'wt', 'śr', 'czw', 'pt', 'sob'];
  var MONTHS_PL = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
  var MONTHS_NOM = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  var uid = 0;
  function id(p) { uid += 1; return (p || 'd') + uid.toString(36) + 'x'; }

  // ---------- Calendar ----------
  function ev(dayOffset, h1, m1, h2, m2, title, cal, loc) {
    var s = at(dayOffset, h1, m1), e = at(dayOffset, h2, m2);
    return { id: id('ev'), title: title, time: hm(s), end: hm(e), startIso: iso(s), endIso: iso(e),
      startDay: ymd(s), endDay: ymd(e), allDay: false, sortKey: hm(s), calendar: cal, location: loc || '' };
  }
  function allDay(dayOffset, title, cal) {
    var d = ymd(addDays(NOW, dayOffset));
    return { id: id('ev'), title: title, time: 'cały dzień', end: '', startIso: null, endIso: null,
      startDay: null, endDay: null, allDay: true, sortKey: '00:00', calendar: cal, location: '' };
  }
  function buildCalendar() {
    var today = [
      allDay(0, 'Sprint review week', 'Work'),
      ev(0, 8, 0, 9, 0, 'Morning swim', 'Personal', 'City Aquatics Centre'),
      ev(0, 10, 15, 11, 45, 'Anatomy lecture: shoulder girdle', 'Studies', 'Lecture Hall B'),
      ev(0, 14, 0, 14, 30, 'Portfolio review call', 'Work'),
      ev(0, 18, 30, 20, 0, 'Climbing with friends', 'Personal', 'Boulder Lab'),
    ];
    var tomorrow = [
      ev(1, 9, 0, 12, 0, 'Biomechanics lab', 'Studies', 'Room 214'),
      ev(1, 13, 0, 14, 0, 'Lunch with Alex', 'Personal', 'Green Fork'),
      ev(1, 16, 0, 17, 30, 'Lifeguard shift', 'Work', 'City Aquatics Centre'),
    ];
    var upcoming = [];
    var plan = [
      [['Physiology seminar', 'Studies', 10, 12], ['Gym', 'Personal', 18, 19]],
      [['Dentist', 'Personal', 9, 10]],
      [['Weekend trip prep', 'Personal', 17, 18]],
      [['Hiking: Ridge Trail', 'Personal', 8, 16]],
      [['Project sync', 'Work', 11, 12], ['Kinesiology exam prep', 'Studies', 15, 17]],
    ];
    plan.forEach(function (list, i) {
      var off = i + 2, d = addDays(NOW, off);
      upcoming.push({ date: ymd(d), dayLabel: DOW[d.getDay()],
        events: list.map(function (x) { return ev(off, x[2], 0, x[3], 0, x[0], x[1]); }) });
    });
    return { ok: true, today: today, tomorrow: tomorrow, upcoming: upcoming, todayStr: TODAY,
      tomorrowStr: ymd(addDays(NOW, 1)), warnings: [] };
  }

  // ---------- Tasks (Eisenhower) ----------
  var TASKS = {
    ok: true,
    quarters: [
      { key: 'red', label: 'Pilne + Ważne', emoji: '🔴', qn: 1, items: [
        { text: 'Submit biomechanics lab report', id: 't-red1', subtasks: [{ text: 'Finish data tables', id: 't-red1a', done: true }, { text: 'Write conclusions', id: 't-red1b', done: false }], done: false },
        { text: 'Renew lifeguard certificate', id: 't-red2', subtasks: [], done: false },
      ] },
      { key: 'amber', label: 'Ważne + Niepilne', emoji: '🟠', qn: 2, items: [
        { text: 'Update CV with dashboard project', id: 't-am1', subtasks: [], done: false },
        { text: 'Plan winter training block', id: 't-am2', subtasks: [], done: false },
        { text: 'Read chapter 4: muscle physiology', id: 't-am3', subtasks: [], done: false },
      ] },
      { key: 'yellow', label: 'Pilne + Nieważne', emoji: '🟡', qn: 3, items: [
        { text: 'Reply to housing co-op email', id: 't-ye1', subtasks: [], done: false },
        { text: 'Return library books', id: 't-ye2', subtasks: [], done: false },
      ] },
      { key: 'muted', label: 'Niepilne + Nieważne', emoji: '⚪', qn: 4, items: [
        { text: 'Sort old photos', id: 't-mu1', subtasks: [], done: false },
      ] },
    ],
    week: [
      { text: 'Lab report — final draft', priority: 'red', id: 't-w1', done: false },
      { text: 'Three swim sessions', priority: 'amber', id: 't-w2', done: false },
      { text: 'Call grandma', priority: 'amber', id: 't-w3', done: true },
    ],
    done: [
      { text: 'Book flights for spring break', id: 't-d1', subtasks: [], movable: false, origin: null },
      { text: 'Finish anatomy flashcards (lower limb)', id: 't-d2', subtasks: [], movable: false, origin: null },
      { text: 'Fix bike brakes', id: 't-d3', subtasks: [], movable: false, origin: null },
    ],
    pending: [
      { text: 'Waiting on: professor feedback on project outline' },
      { text: 'Waiting on: refund from online store' },
    ],
  };
  function findTask(tid) {
    for (var i = 0; i < TASKS.quarters.length; i++) {
      var q = TASKS.quarters[i];
      for (var j = 0; j < q.items.length; j++) if (q.items[j].id === tid) return { q: q, idx: j, item: q.items[j] };
    }
    return null;
  }

  // ---------- Mail ----------
  function mailDate(hoursAgo) { return new Date(NOW.getTime() - hoursAgo * 3600e3).toUTCString().replace('GMT', '+0000'); }
  var GMAIL = {
    ok: true, account: 'demo@example.com', shown: 7, filteredTotal: 7, totalUnread: 42, noise: 35,
    messages: [
      { from: 'Alex Morgan <alex@example.com>', subject: 'Climbing tonight?', date: mailDate(1), snippet: 'Hey! Are we still on for 18:30? I can bring the extra rope.', link: '#', cat: '', personal: true },
      { from: 'Dr. Kowalski <prof@example.edu>', subject: 'Re: Project outline', date: mailDate(3), snippet: 'Thanks for sending it over. A few notes on the methodology section…', link: '#', cat: '', personal: true },
      { from: 'Aquatics Centre <shifts@example.com>', subject: 'Shift schedule for next week', date: mailDate(5), snippet: 'Please confirm your availability for the Thursday evening slot.', link: '#', cat: '', personal: true },
      { from: 'Bank <noreply@bank.example>', subject: 'Your monthly statement is ready', date: mailDate(9), snippet: 'Your statement for last month is now available in online banking.', link: '#', cat: 'finanse', personal: false },
      { from: 'Dev Weekly <news@devweekly.example>', subject: 'Issue #212: Three.js tips', date: mailDate(14), snippet: 'This week: instanced meshes, bloom on a budget, and force-directed layouts.', link: '#', cat: 'newsletter', personal: false },
      { from: 'Sam Lee <sam@example.com>', subject: 'Notes from Tuesday', date: mailDate(20), snippet: 'Attaching my notes from the physiology seminar, see page 3.', link: '#', cat: '', personal: true },
      { from: 'Community Forum <digest@forum.example>', subject: 'Weekly digest', date: mailDate(30), snippet: '5 new replies in threads you follow.', link: '#', cat: 'social', personal: false },
    ],
  };

  // ---------- Morning brief ----------
  var BRIEF = {
    ok: true, date: TODAY, dateLabel: NOW.getDate() + ' ' + MONTHS_PL[NOW.getMonth()] + ' ' + NOW.getFullYear(), fileBase: 'aktualny',
    headline: 'A focused day with one hard edge: the lab report is due tomorrow, then a short portfolio call at 14:00 and climbing in the evening.',
    acts: [
      { label: '00:00–12:00', text: 'Swim, then the anatomy lecture. Use the gap before noon to finish the lab report tables.' },
      { label: '12:00–18:00', text: 'Portfolio review call at 14:00. Afterwards, conclusions section of the report.' },
      { label: 'po 18:00', text: 'Climbing at 18:30. Pack chalk and the spare rope for Alex.' },
    ],
    attention: [
      { title: 'Lab report due tomorrow', text: 'Two subtasks left; conclusions are the bigger one.' },
      { title: 'Lifeguard certificate', text: 'Expires in 3 weeks — renewal course needs booking.' },
      { title: 'Shift confirmation', text: 'Aquatics Centre is waiting for your Thursday availability.' },
    ],
    resolved: [],
    world: [
      { num: '01', region: 'Science', text: 'New study links short high-intensity sessions with better cardiovascular adaptation in students.', source: '' },
      { num: '02', region: 'Tech', text: 'Browser vendors ship faster WebGPU paths for 3D visualisations.', source: '' },
      { num: '03', region: 'Local', text: 'City pool extends evening opening hours through winter.', source: '' },
    ],
    invest: { blocks: [], disclaimer: 'Demo data — not financial advice.' },
    weather: { city: 'Warsaw', lat: 52.23, lon: 21.01, text: 'Cool and mostly cloudy, around 4°C in the afternoon with a light westerly wind.',
      lines: ['Cool and mostly cloudy, around 4°C.'], dayTemp: 4, minTemp: 0, sunrise: '07:12', sunset: '15:31' },
  };
  // The Brief tab itself shows demo-brief.html (same layout as the real brief); this JSON feeds the other tabs.

  // ---------- Ideas ----------
  var IDEAS = { ok: true, ideas: [
    { id: 'i1', text: 'Short video: how the rotator cuff stabilises the shoulder', status: 'szkic', date: '' },
    { id: 'i2', text: 'Carousel: 5 swim drills for better catch', status: 'nagranie', date: '' },
    { id: 'i3', text: 'Post: what building a personal dashboard taught me', status: 'opublikowane', date: ymd(addDays(NOW, -6)) },
    { id: 'i4', text: 'Explainer: knee ligaments in 60 seconds', status: 'szkic', date: '' },
  ] };
  var POMYSLY = { ok: true, pomysly: [
    { id: 'p1', text: 'Voice assistant that reads the morning brief aloud', tag: 'jarvis', date: ymd(addDays(NOW, -2)) },
    { id: 'p2', text: 'Ski touring weekend in February', tag: 'narty', date: ymd(addDays(NOW, -5)) },
    { id: 'p3', text: 'Watch list: classic sci-fi from the 80s', tag: 'filmy', date: ymd(addDays(NOW, -8)) },
    { id: 'p4', text: 'Desk setup: wall-mounted shelf for books', tag: 'wnętrza', date: ymd(addDays(NOW, -10)) },
    { id: 'p5', text: 'Dashboard: dark/light toggle for the brief tab', tag: 'bug', date: ymd(addDays(NOW, -12)) },
  ] };

  // ---------- Finance ----------
  var CATS = ['Groceries', 'Eating out', 'Rent & utilities', 'Transport', 'Health', 'Education', 'Sport', 'Subscriptions', 'Clothes', 'Gifts', 'Savings', 'Other'];
  function monthBlock(offset, factor) {
    var d = new Date(NOW.getFullYear(), NOW.getMonth() + offset, 1);
    var budgets = [700, 250, 1400, 180, 120, 150, 200, 90, 150, 100, 600, 150];
    var cats = CATS.map(function (n, i) { return { name: n, budget: budgets[i], actual: Math.round(budgets[i] * factor * (0.7 + ((i * 37) % 50) / 100)) }; });
    var tb = cats.reduce(function (s, c) { return s + c.budget; }, 0), ta = cats.reduce(function (s, c) { return s + c.actual; }, 0);
    return { month: d.getMonth() + 1, year: d.getFullYear(), label: MONTHS_NOM[d.getMonth()] + ' ' + d.getFullYear(),
      income: { budget: 4200, actual: 4350 }, categories: cats, hasData: true, totalBudget: tb, totalActual: ta };
  }
  function dueIn(days) { var d = addDays(NOW, days); return d.getDate() + ' ' + MONTHS_PL[d.getMonth()]; }
  var FINANCE = {
    ok: true,
    goals: [{ name: 'Emergency fund', target: 10000, saved: 6400, deadline: (NOW.getFullYear() + 1) + '-06-30' },
            { name: 'New road bike', target: 3500, saved: 1200, deadline: (NOW.getFullYear() + 1) + '-04-01' }],
    payments: [
      { name: 'Phone plan', amount: 45, day: addDays(NOW, 4).getDate(), category: 'Subscriptions', daysUntil: 4, dueDate: dueIn(4) },
      { name: 'Rent', amount: 1400, day: addDays(NOW, 8).getDate(), category: 'Rent & utilities', daysUntil: 8, dueDate: dueIn(8) },
      { name: 'Gym membership', amount: 99, day: addDays(NOW, 12).getDate(), category: 'Sport', daysUntil: 12, dueDate: dueIn(12) },
    ],
    months: [monthBlock(0, 0.55), monthBlock(-1, 0.95)],
    current: null,
    quarters: [],
  };
  (function () {
    var qn = Math.floor(NOW.getMonth() / 3) + 1, y = NOW.getFullYear();
    [[y, qn - 1 > 0 ? qn - 1 : 4], [y, qn]].forEach(function (p, i) {
      var m = monthBlock(i - 3, 2.9);
      FINANCE.quarters.push({ year: p[0], q: p[1], label: 'Q' + p[1] + ' ' + p[0] + ' (demo)', categories: m.categories,
        income: { budget: 12600, actual: 13050 }, totalActual: m.totalActual, source: 'explicit', monthsIncluded: null, complete: i === 0 });
    });
  })();
  var WYDATKI = { ok: true, file: 'demo', exists: true, categories: CATS.slice(),
    current: { year: NOW.getFullYear(), month: NOW.getMonth() + 1, label: MONTHS_NOM[NOW.getMonth()] + ' ' + NOW.getFullYear(), entries: [], total: 0, byCategory: {} },
    older: [{ label: 'Previous month', count: 14, total: 612 }] };
  function addExpense(amount, category, note) {
    var e = { id: id('w'), date: TODAY, amount: amount, category: category, note: note || '' };
    WYDATKI.current.entries.unshift(e);
    WYDATKI.current.total = WYDATKI.current.entries.reduce(function (s, x) { return s + x.amount; }, 0);
    WYDATKI.current.byCategory[category] = (WYDATKI.current.byCategory[category] || 0) + amount;
  }
  addExpense(23.5, 'Groceries', 'Weekly veg box');
  addExpense(14, 'Eating out', 'Coffee with Sam');
  addExpense(39.99, 'Subscriptions', 'Design tool');

  // ---------- Job search (Werbunek) ----------
  var COMPANIES = ['Northwind', 'Contoso', 'Fabrikam', 'Tailspin', 'Litware', 'Adventure Works', 'Wide World', 'Proseware', 'Lucerne', 'Fourth Coffee', 'Margie Travel', 'Woodgrove', 'Alpine Ski House', 'Blue Yonder', 'Coho Winery', 'Humongous Ins.', 'Trey Research', 'Wingtip Toys'];
  var ROLES = [['Junior Frontend Developer', 'zdalna'], ['Customer Support Specialist', 'zdalna'], ['Swim Instructor', 'basen'], ['IT Help Desk', 'hybryda'], ['Back Office Assistant', 'wroclaw'], ['Research Assistant', 'zdalna'], ['Lifeguard', 'basen'], ['Data Entry Specialist', 'legnica'], ['UI Developer (intern)', 'hybryda']];
  var TIERS = ['S', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'D', 'F', 'X'];
  var BUCKETS = ['dzis', 'tydzien', 'tydzien', 'pozniej', 'pozniej', 'bez-terminu'];
  var OFERTY = [];
  for (var oi = 0; oi < 42; oi++) {
    var r = ROLES[oi % ROLES.length], tier = TIERS[(oi * 7) % TIERS.length], bucket = BUCKETS[(oi * 5) % BUCKETS.length];
    var tOff = bucket === 'dzis' ? 0 : bucket === 'tydzien' ? 2 + (oi % 5) : bucket === 'pozniej' ? 9 + (oi % 20) : null;
    var tDate = tOff == null ? null : addDays(NOW, tOff);
    var score = Math.max(1, 9 - TIERS.indexOf(tier) + (oi % 2));
    var sent = oi % 6 === 1;
    OFERTY.push({
      id: 'demo-offer-' + oi, nazwa: COMPANIES[oi % COMPANIES.length], rola: r[0], tier: tier,
      grupa: r[1] === 'basen' ? 'Pool instructor (on site)' : r[1] === 'zdalna' ? 'Remote' : 'On site / hybrid',
      filtr: tier !== 'F' && tier !== 'X', umowa: ['B2B', 'contract of employment', 'mandate contract'][oi % 3],
      kasa: (4000 + (oi % 9) * 450) + '–' + (5200 + (oi % 9) * 500) + ' PLN', grafik: ['Mon–Fri 9–17', 'flexible', 'shifts'][oi % 3],
      termin: tDate ? ymd(tDate) : '', terminOpis: tDate ? pad(tDate.getDate()) + '.' + pad(tDate.getMonth() + 1) : null,
      url: 'https://example.com/jobs/' + oi, url2: null, cv: sent ? 'CV_demo.pdf' : null,
      wyslane: sent ? { data: ymd(addDays(NOW, -(oi % 10) - 1)), uwaga: 'sent via job board' } : null,
      etap: sent ? 'wyslane' : null, etapUwaga: null, uwaga: null, nowa: ymd(addDays(NOW, -(oi % 12))), martwa: false,
      ocena: score + '/10', opis: 'Fictional listing for the demo. ' + r[0] + ' at ' + COMPANIES[oi % COMPANIES.length] + '.',
      dni: tOff == null ? null : tOff, sciezka: r[1], bucket: bucket, ocenaN: score, wyslana: sent, poTerminie: false,
      kolejka: !sent && tier !== 'F' && tier !== 'X' && tier !== 'D',
    });
  }
  function pracaBlock() {
    var kolejka = OFERTY.filter(function (o) { return o.kolejka; }).map(function (o) { return o.id; });
    var wysl = OFERTY.filter(function (o) { return o.wyslana; }).map(function (o) { return o.id; });
    return {
      ok: true, today: TODAY, zaktualizowano: TODAY,
      tiery: [{ k: 'S', opis: 'wyślij dziś' }, { k: 'A', opis: 'w tym tygodniu' }, { k: 'B', opis: 'warto' }, { k: 'C', opis: 'z zastrzeżeniem' }, { k: 'D', opis: 'odpada' }, { k: 'F', opis: 'nie wysyłać' }, { k: 'X', opis: 'poza zasięgiem' }],
      kryteria: { cel: 'Part-time role that fits around studies, ideally tech-adjacent.', twarde: ['Max 25 h/week during semester', 'No cold-call sales', 'Remote or < 40 min commute', 'Student-friendly contract'], przelicznik: 'Score = fit × pay × schedule' },
      kryteriaPlik: 'demo', grupaBasen: 'Pool instructor (on site)', kryteriaBasen: { twarde: ['Valid lifeguard certificate', 'Evening shifts OK'] },
      grupaWroclaw: 'On site / hybrid', kryteriaWroclaw: { twarde: ['Full-time Mon–Fri'] },
      grupaHybryda: 'On site / hybrid', kryteriaHybryda: { twarde: ['2–3 office days'] },
      grupaLegnica: 'On site / hybrid', kryteriaLegnica: { twarde: ['Full-time Mon–Fri'] },
      ostatniPrzeglad: { data: TODAY, kanaly: 6, nowe: 4, notatka: 'Demo review: 4 new listings across 6 job boards.' },
      historiaPrzegladow: [0, 1, 2, 3, 4, 5, 6].map(function (i) { return { data: ymd(addDays(NOW, -i)), kanaly: 6, nowe: (i * 3) % 7, odrzucone: i % 3, notatka: 'Daily scan' }; }),
      oferty: OFERTY, kolejkaIds: kolejka, wyslaneIds: wysl,
      stats: { wszystkie: OFERTY.length, przechodziFiltr: OFERTY.filter(function (o) { return o.filtr; }).length, kolejka: kolejka.length,
        wyslane: wysl.length, pilne: OFERTY.filter(function (o) { return o.bucket === 'dzis'; }).length, doPotwierdzenia: 3, poTerminie: 0 },
    };
  }

  // ---------- Projects (Kanban) ----------
  var PROJEKTY = { todo: [
      { id: 'pr1', nazwa: 'Poster: gait analysis of runners', przedmiot: 'biomechanics', termin: ymd(addDays(NOW, 21)), tryb: 'zespołowy' },
    ], doing: [
      { id: 'pr2', nazwa: 'Lab report: knee joint forces', przedmiot: 'biomechanics', termin: ymd(addDays(NOW, 1)), tryb: 'indywidualny' },
      { id: 'pr3', nazwa: 'Presentation: active listening', przedmiot: 'communication', termin: ymd(addDays(NOW, 9)), tryb: 'zespołowy' },
    ], submit: [
      { id: 'pr4', nazwa: 'Essay: history of physiotherapy', przedmiot: 'history of medicine', termin: ymd(addDays(NOW, -1)), tryb: 'indywidualny' },
    ], done: [
      { id: 'pr5', nazwa: 'Muscle atlas: upper limb', przedmiot: 'anatomy', termin: 'brak', tryb: 'indywidualny' },
    ] };

  // ---------- Portfolio (investing) ----------
  function pos(i, instr, ticker, cat, vol, open, value, net, closed) {
    return { id: i, source_ref: 'DEMO' + i, account: i % 2 ? 'IKE' : 'Standard', product: i % 2 ? 'IKE' : 'Standard', status: closed ? 'closed' : 'open',
      instrument: instr, ticker: ticker, category: cat, side: 'BUY', volume: vol, open_price: open, open_time: iso(at(-40 - i * 9, 9, 5)),
      close_price: closed ? open * 1.08 : null, close_time: closed ? iso(at(-5 - i, 15, 30)) : null, value: value, gross_pl: net + 2, net_pl: net,
      commission: closed ? 0 : null, swap: null, currency: 'PLN', imported_at: iso(at(-1, 20, 0)) };
  }
  var hist = []; for (var hi = 16; hi >= 0; hi--) { var hd = new Date(NOW.getFullYear(), NOW.getMonth() - hi, 1); hist.push({ month: hd.getFullYear() + '-' + pad(hd.getMonth() + 1), zwykle: hi % 3 ? 200 : 0, ike: hi % 2 ? 400 : 300, empty: false }); }
  var PORTFOLIO = { ok: true, hasData: true, currentYear: NOW.getFullYear(), contributionsThisYear: { zwykle: 1400, ike: 3900 }, ikeLimit: 28560,
    ikeRemaining: 24660, monthsLeftInYear: 12 - NOW.getMonth(), daysLeftInYear: 30, ikePerMonthToUseLimit: 2055, monthlyHistory: hist,
    openPositions: [pos(1, 'Global All-World ETF', 'VWCE', 'ETF', 12, 480, 6120, 360), pos(2, 'Europe 600 ETF', 'EXSA', 'ETF', 20, 210, 4380, 180), pos(3, 'Emerging Mkts ETF', 'EIMI', 'ETF', 30, 128, 3990, 150)],
    closedPositions: [pos(4, 'Gold ETC', 'GOLD', 'ETF', 5, 300, 1620, 120, true)],
    summary: { openValue: 14490, openNetPl: 690, openCommission: 0, closedNetPl: 120, closedCommission: 0 } };

  // ---------- Vault graph (Nexus) ----------
  var WS = [['Tasks HQ', '#7fbf7f'], ['Calendar', '#7fa8c9'], ['Study', '#b98af2'], ['Finance', '#4fc9a8'], ['Ideas', '#e8c547'], ['Career', '#e8a33d'], ['Research', '#d98fd9'], ['Dashboard', '#9b9b9b'], ['Resources', '#8a877d']];
  var TOPICS = {
    'Tasks HQ': ['Tasks', 'Weekly review', 'Someday list', 'Habits', 'Errands'],
    'Calendar': ['Morning briefs', 'Semester plan', 'Trip: mountains', 'Shift schedule', 'Exam session'],
    'Study': ['Shoulder girdle', 'Rotator cuff', 'Knee ligaments', 'Hip flexors', 'Spine anatomy', 'Gait cycle', 'Muscle physiology', 'Biomechanics lab', 'Flashcards: upper limb', 'Flashcards: lower limb', 'Communication skills', 'Active listening', 'Exam notes', 'Reading list', 'Ankle complex', 'Elbow joint', 'Wrist & hand', 'Posture', 'Breathing mechanics', 'Motor control'],
    'Finance': ['Budget & goals', 'Monthly spending', 'Investing plan', 'Subscriptions audit'],
    'Ideas': ['Ideas inbox', 'Video scripts', 'Side projects', 'Content calendar'],
    'Career': ['CV', 'Job criteria', 'Applications log', 'Interview prep', 'Cover letter template', 'Portfolio'],
    'Research': ['Swim technique sources', 'Sleep & recovery', 'Learning methods'],
    'Dashboard': ['Dashboard', 'Design notes', 'Nexus 3D'],
    'Resources': ['Voice principles', 'Vault map', 'Weekly audit'],
  };
  var TAGS = ['#anatomy', '#exam', '#idea', '#swim', '#career', '#finance', '#weekly'];
  function buildGraph() {
    var nodes = [], links = [], wsOut = [], dayMs = 864e5, k = 0;
    WS.forEach(function (w) {
      var list = TOPICS[w[0]];
      wsOut.push({ key: w[0], color: w[1], count: list.length });
      list.forEach(function (t, i) {
        k++;
        nodes.push({ id: w[0] + '/' + t + '.md', name: t, type: 'note', ws: w[0], deg: 0, mtime: NOW.getTime() - ((k * 13) % 40) * dayMs,
          ex: 'Demo note “' + t + '” in ' + w[0] + '. Fictional content for the portfolio version of the dashboard.' });
      });
    });
    TAGS.forEach(function (t) { nodes.push({ id: 'tag:' + t, name: t, type: 'tag', ws: '', deg: 0, mtime: 0, ex: '' }); });
    nodes.push({ id: 'Study/Study Resources/Muscle atlas.pdf', name: 'Muscle atlas.pdf', type: 'file', ws: 'Study', deg: 0, mtime: NOW.getTime() - 9 * dayMs, ex: '' });
    nodes.push({ id: 'Career/Career Resources/CV_demo.pdf', name: 'CV_demo.pdf', type: 'file', ws: 'Career', deg: 0, mtime: NOW.getTime() - 3 * dayMs, ex: '' });
    var notes = nodes.filter(function (n) { return n.type === 'note'; });
    function link(a, b) { if (a && b && a !== b) links.push({ source: a.id, target: b.id }); }
    WS.forEach(function (w) {
      var group = notes.filter(function (n) { return n.ws === w[0]; });
      group.forEach(function (n, i) { if (i > 0) link(group[0], n); if (i > 2 && i % 3 === 0) link(group[i - 1], n); });
    });
    var hub = notes.find(function (n) { return n.name === 'Dashboard'; });
    WS.forEach(function (w) { link(hub, notes.find(function (n) { return n.ws === w[0]; })); });
    notes.forEach(function (n, i) {
      if (i % 4 === 0) link(n, notes[(i * 7 + 3) % notes.length]);
      var tag = nodes.find(function (x) { return x.id === 'tag:' + TAGS[i % TAGS.length]; });
      if (i % 2 === 0) link(n, tag);
    });
    link(notes.find(function (n) { return n.name === 'Muscle atlas.pdf'; }) || nodes.find(function (n) { return n.name === 'Muscle atlas.pdf'; }), notes.find(function (n) { return n.name === 'Shoulder girdle'; }));
    link(nodes.find(function (n) { return n.name === 'CV_demo.pdf'; }), notes.find(function (n) { return n.name === 'CV'; }));
    var deg = {}; links.forEach(function (l) { deg[l.source] = (deg[l.source] || 0) + 1; deg[l.target] = (deg[l.target] || 0) + 1; });
    nodes.forEach(function (n) { n.deg = deg[n.id] || 0; });
    return { generatedAt: new Date().toISOString(), vault: 'DEMO_VAULT', nodes: nodes, links: links, workstations: wsOut, unresolved: [] };
  }
  var GRAPH = buildGraph();

  // ---------- System ----------
  function system() {
    var files = ['Tasks', 'Projects', 'Job offers', 'Budget', 'Expenses', 'Ideas', 'Morning brief', 'Memory'].map(function (l, i) {
      var t = iso(at(-(i % 3), 8 + i, 0));
      return { key: 'f' + i, label: l, path: 'DEMO_VAULT/' + l + '.md', exists: true, mtime: t, lastUpdated: t };
    });
    return {
      server: { pid: 4321, node: 'v22 (demo, no server)', port: 0, startedAt: iso(at(0, 7, 30)), uptimeS: Math.round((Date.now() - at(0, 7, 30).getTime()) / 1000), rssMb: 0 },
      tokens: { calendar: { exists: true, hasRefresh: true, mtime: iso(at(-3, 10, 0)) }, mail: { exists: true, hasRefresh: true, mtime: iso(at(-3, 10, 0)) } },
      keys: { ai: true, tts: false }, files: files,
      graph: { nodes: GRAPH.nodes.length, links: GRAPH.links.length, scannedAt: GRAPH.generatedAt },
      summaries: { engine: 'demo', detail: 'canned summaries', checkedAt: new Date().toISOString(), cached: GRAPH.nodes.length, notes: GRAPH.nodes.length, queued: 0 },
      hygiene: { score: 92, counts: { err: 0, warn: 2, info: 3 }, issues: [
        { rule: 'stale-memory', sev: 'warn', path: 'Career/MEMORY.md', msg: 'Last updated 34 days ago' },
        { rule: 'root-file', sev: 'warn', path: 'Untitled.md', msg: 'Loose note in vault root' },
        { rule: 'pdf-next-to-md', sev: 'info', path: 'Study/Exam notes.pdf', msg: 'Export lives next to its source note' },
      ], exceptions: [], checkedAt: new Date().toISOString(), scannedFiles: GRAPH.nodes.length },
    };
  }

  // ---------- Dashboard payload ----------
  function dashboard() {
    var doneSeries = [];
    for (var i = 6; i >= 0; i--) { var d = addDays(NOW, -i); doneSeries.push({ day: DOW[d.getDay()], date: ymd(d), count: [2, 4, 1, 3, 5, 2, 3][i] }); }
    return {
      calendar: buildCalendar(), tasks: TASKS, gmail: GMAIL, brief: BRIEF, ideas: IDEAS, finance: FINANCE, pomysly: POMYSLY,
      filmy: { ok: true, filmy: [] }, praca: pracaBlock(),
      memoryLog: { ok: true, entries: [
        { date: TODAY, text: 'Demo: added the portfolio version of the dashboard.', scope: 'Dashboard · MEMORY.md' },
        { date: ymd(addDays(NOW, -3)), text: 'Moved the brief into an embedded tab.', scope: 'Dashboard · MEMORY.md' },
      ] },
      portfolio: PORTFOLIO,
      eventContext: { ok: true, generatedAt: new Date().toISOString(), stale: false, horizonDays: 14, stats: { scanned: 9, enriched: 0, skipped: 9 }, events: [] },
      projekty: { ok: true, projekty: PROJEKTY }, wydatki: WYDATKI,
      countdowns: [{ name: 'Exam session', date: ymd(addDays(NOW, 45)), days: 45 }, { name: 'Ski trip', date: ymd(addDays(NOW, 74)), days: 74 }],
      doneSeries: doneSeries, generatedAt: new Date().toISOString(), cached: false,
    };
  }

  // ---------- Write handlers (in-memory only) ----------
  function moveTask(body) {
    var hit = findTask(body.id);
    if (hit && body.done) {
      hit.q.items.splice(hit.idx, 1);
      TASKS.done.unshift({ text: hit.item.text, id: hit.item.id, subtasks: hit.item.subtasks, movable: true, origin: { qn: hit.q.qn } });
      return { ok: true };
    }
    if (!body.done) {
      var j = TASKS.done.findIndex(function (t) { return t.id === body.id; });
      if (j >= 0) {
        var t = TASKS.done.splice(j, 1)[0], qn = (t.origin && t.origin.qn) || 2;
        TASKS.quarters[qn - 1].items.push({ text: t.text, id: t.id, subtasks: t.subtasks || [], done: false });
        return { ok: true };
      }
    }
    for (var w = 0; w < TASKS.week.length; w++) if (TASKS.week[w].id === body.id) { TASKS.week[w].done = !!body.done; return { ok: true }; }
    for (var q = 0; q < TASKS.quarters.length; q++) for (var k = 0; k < TASKS.quarters[q].items.length; k++) {
      var subs = TASKS.quarters[q].items[k].subtasks;
      for (var s = 0; s < subs.length; s++) if (subs[s].id === body.id) { subs[s].done = !!body.done; return { ok: true }; }
    }
    return { ok: true };
  }
  function offer(idv) { return OFERTY.find(function (o) { return o.id === idv; }); }
  var POST = {
    '/api/task': moveTask,
    '/api/task/add': function (b) { var q = TASKS.quarters[((b.qn || b.quarter || 2) - 1) % 4] || TASKS.quarters[1]; var t = { text: b.text || 'New task', id: id('t'), subtasks: [], done: false }; q.items.push(t); return { ok: true, id: t.id, undo: 'demo' }; },
    '/api/idea/cycle': function (b) { var S = ['szkic', 'nagranie', 'opublikowane']; var it = IDEAS.ideas.find(function (x) { return x.id === b.id; }); if (it) { it.status = S[(S.indexOf(it.status) + 1) % 3]; it.date = it.status === 'opublikowane' ? TODAY : ''; } return { ok: true, status: it && it.status }; },
    '/api/idea': function (b) { var it = { id: id('i'), text: b.text || 'New idea', status: 'szkic', date: '' }; IDEAS.ideas.unshift(it); return { ok: true, id: it.id, undo: 'demo' }; },
    '/api/pomysl': function (b) { var it = { id: id('p'), text: b.text || 'New idea', tag: b.tag || 'kontent', date: TODAY }; POMYSLY.pomysly.unshift(it); return { ok: true, id: it.id, undo: 'demo' }; },
    '/api/projekt/add': function (b) { var p = { id: id('pr'), nazwa: b.nazwa || b.name || 'New project', przedmiot: b.przedmiot || '', termin: b.termin || 'brak', tryb: b.tryb || 'indywidualny' }; PROJEKTY[b.column || 'todo'].push(p); return { ok: true, id: p.id, undo: 'demo' }; },
    '/api/projekt/move': function (b) {
      ['todo', 'doing', 'submit', 'done'].forEach(function (c) { var i = PROJEKTY[c].findIndex(function (p) { return p.id === b.id; }); if (i >= 0 && c !== b.column) PROJEKTY[b.column].push(PROJEKTY[c].splice(i, 1)[0]); });
      return { ok: true, id: b.id, column: b.column, undo: 'demo' };
    },
    '/api/praca/tier': function (b) { var o = offer(b.id); if (o) o.tier = b.tier; return { ok: true, tier: b.tier, undo: 'demo' }; },
    '/api/praca/filtr': function (b) { var o = offer(b.id); if (o) o.filtr = !!b.filtr; return { ok: true, filtr: !!b.filtr, undo: 'demo' }; },
    '/api/praca/wyslane': function (b) {
      var o = offer(b.id); if (!o) return { ok: true };
      var on = b.wyslane !== false && b.cofnij !== true && b.undo !== true;
      o.wyslana = on; o.wyslane = on ? { data: b.data || TODAY, uwaga: b.uwaga || b.kanal || '' } : null; o.etap = on ? 'wyslane' : null; o.kolejka = !on && o.filtr;
      return { ok: true, undo: 'demo' };
    },
    '/api/praca/oferta': function () { return { ok: true, undo: 'demo' }; },
    '/api/praca/usun': function (b) { var i = OFERTY.findIndex(function (o) { return o.id === b.id; }); if (i >= 0) OFERTY.splice(i, 1); return { ok: true, undo: 'demo' }; },
    '/api/wydatek': function (b) { addExpense(Number(b.amount) || 0, b.category || 'Other', b.note || b.opis || ''); return { ok: true, wydatki: WYDATKI }; },
    '/api/wydatek/usun': function (b) {
      var c = WYDATKI.current, i = c.entries.findIndex(function (e) { return e.id === b.id; });
      if (i >= 0) { var e = c.entries.splice(i, 1)[0]; c.total -= e.amount; c.byCategory[e.category] -= e.amount; }
      return { ok: true, wydatki: WYDATKI };
    },
    '/api/ai-query': function (b) {
      return { ok: true, text: 'This is the portfolio demo, so I am not connected to a real model. In the live version this panel sends your question and the context of the current tab to Claude and answers here.' + (b && b.question ? '\n\nYou asked: “' + String(b.question).slice(0, 200) + '”' : '') };
    },
    '/api/tts': function () { return { ok: false, error: 'Text-to-speech is disabled in the demo.' }; },
    '/api/claude-login': function () { return { ok: false, error: 'Not available in the demo.' }; },
    '/api/portfolio/import': function () { return { ok: false, error: 'Import is disabled in the demo.' }; },
    '/api/portfolio/settings': function () { return { ok: true }; },
  };
  function get(path, q) {
    if (path === '/api/dashboard') return dashboard();
    if (path === '/api/system') return system();
    if (path === '/api/vault-graph') return GRAPH;
    if (path === '/api/models') return { files: [], cfg: {} };
    if (path === '/api/tts-status') return { available: false };
    if (path === '/api/claude-login/status') return { ok: true, loggedIn: true };
    if (path === '/api/note-summary') {
      var n = GRAPH.nodes.find(function (x) { return x.id === q.get('id'); });
      var name = n ? n.name : 'this note';
      return { status: 'fresh', summary: { hash: 'demo', at: new Date().toISOString(), model: 'demo',
        lead: 'Demo summary of “' + name + '”.', points: ['Fictional note created for the portfolio demo.', 'In the live version Claude summarises the real note.', 'Summaries are cached and refreshed when the note changes.'] } };
    }
    if (/^\/api\/reconnect\/[^/]+\/status$/.test(path)) return { ok: true, state: 'done' };
    if (path.indexOf('/api/wojna/') === 0) return { error: 'Not part of the demo.' };
    return null;
  }

  // ---------- fetch override ----------
  var realFetch = window.fetch.bind(window);
  function json(obj, status) {
    return new Response(JSON.stringify(obj), { status: status || 200, headers: { 'Content-Type': 'application/json' } });
  }
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var u;
    try { u = new URL(url, location.href); } catch (e) { return realFetch(input, init); }
    var m = u.pathname.match(/\/api\/.*$/);
    if (u.origin !== location.origin || !m) return realFetch(input, init);
    var path = m[0], method = ((init && init.method) || 'GET').toUpperCase();
    var body = {};
    try { if (init && typeof init.body === 'string') body = JSON.parse(init.body); } catch (e) {}
    return new Promise(function (resolve) {
      setTimeout(function () {
        if (method === 'GET') { var g = get(path, u.searchParams); resolve(g ? json(g) : json({ error: 'Not available in the demo.' }, 404)); return; }
        var h = POST[path];
        if (!h && /^\/api\/reconnect\//.test(path)) h = function () { return { ok: true }; };
        if (!h && path.indexOf('/api/wojna/') === 0) { resolve(json({ error: 'Not part of the demo.' }, 404)); return; }
        resolve(json(h ? h(body) : { ok: true, undo: 'demo' }));
      }, 120);
    });
  };

  // ---------- JARVIS (simulated) ----------
  // The real assistant is a separate local process the dashboard reaches at ws://127.0.0.1:4330/events.
  // Here an in-browser fake speaks the same protocol: it "connects", shows its status panels, goes
  // through listening / thinking / speaking states and streams a reply — always the same demo notice.
  var JV_REPLY = 'This is only a demo, so I can\'t actually do that. In the live version I\'m a voice assistant ' +
    'running on the owner\'s computer: I answer with the context of the current tab, add events to the calendar, ' +
    'draft e-mails, set reminders and make notes in the vault — and I ask for a yes before anything is saved.';
  var JV_HEARD = 'What does my day look like?';
  var jvMin = 0, jvId = 0, jvPrivate = false;
  function jvStatus() {
    return {
      model: 'claude (demo)', stage: 'demo', dry_run: true, telegram: true, wake: true,
      uptime_min: 47 + jvMin, exchanges: 3 + jvMin, tainted: [], cost_today: 0.18, threshold: 1.5,
      usage: '', private: jvPrivate, controls: { private: true, jobs: true }, state: 'czuwa',
      jobs: [
        { id: 7, title: 'Summarise new notes in the Study folder', status: 'gotowe', started: iso(at(0, 7, 2)), finished: iso(at(0, 7, 4)), note: 'Study/Rotator cuff.md' },
        { id: 8, title: 'Check the inbox for replies from people', status: 'trwa', started: new Date(Date.now() - 90e3).toISOString() },
      ],
      reminders: [
        { id: 1, text: 'Pack the spare rope for Alex', due: iso(at(0, 17, 45)) },
        { id: 2, text: 'Book the lifeguard renewal course', due: iso(at(1, 9, 0)), repeat: false },
      ],
      undo: [],
      actions: [
        { ts: iso(at(0, 7, 4)), tool: 'vault.note', outcome: 'wykonane' },
        { ts: iso(at(0, 7, 31)), tool: 'calendar.read', outcome: 'wykonane' },
        { ts: iso(at(0, 8, 50)), tool: 'reminder.add', outcome: 'wykonane' },
      ],
      notebook: ['Prefers short answers in the morning.', 'Lab report deadline is the priority this week.'],
      reports: [], reports_open: 0,
      proactive: [{ ts: iso(at(0, 7, 0)), rule: 'morning brief', text: 'Morning brief is ready', channel: 'telegram', outcome: 'doręczone' }],
    };
  }
  function jvEntry(role, text, extra) {
    jvId += 1;
    var e = { type: 'chat', id: 'demo' + jvId, role: role, channel: 'dashboard', ts: new Date().toISOString(), text: text };
    for (var k in extra || {}) e[k] = extra[k];
    return e;
  }
  function FakeJarvis(url) {
    var self = this;
    self.url = url; self.readyState = 0; self._busy = false;
    setTimeout(function () {
      self.readyState = 1;
      if (self.onopen) self.onopen(new Event('open'));
      self._emit({ type: 'status', data: jvStatus() });
      self._emit({ type: 'state', state: 'czuwa' });
      self._emit({ type: 'history', items: [
        { id: 'h1', role: 'user', channel: 'głos', ts: iso(at(0, 7, 30)), text: 'Hey Jarvis, what\'s first today?' },
        { id: 'h2', role: 'jarvis', channel: 'głos', ts: iso(at(0, 7, 30)), text: 'Morning swim at eight, then the anatomy lecture at quarter past ten.' },
      ] });
    }, 350);
    self._tick = setInterval(function () { jvMin += 0; self._emit({ type: 'status', data: jvStatus() }); }, 5000);
  }
  FakeJarvis.prototype._emit = function (obj) {
    if (this.readyState !== 1 || !this.onmessage) return;
    this.onmessage({ data: JSON.stringify(obj) });
  };
  FakeJarvis.prototype._answer = function () {
    var self = this, stream = 's' + Date.now().toString(36), words = JV_REPLY.split(' '), i = 0;
    self._busy = true;
    self._emit({ type: 'state', state: 'myśli' });
    self._emit({ type: 'chat_stream', stream: stream, checking: true, text: '' });
    setTimeout(function () {
      self._emit({ type: 'state', state: 'mówi' });
      var t = setInterval(function () {
        i = Math.min(words.length, i + 3);
        self._emit({ type: 'chat_stream', stream: stream, text: words.slice(0, i).join(' ') });
        if (i >= words.length) {
          clearInterval(t);
          var e = jvEntry('jarvis', JV_REPLY);
          self._emit(e);
          self._emit({ type: 'reply', text: JV_REPLY });
          self._emit({ type: 'chat_stream', stream: stream, done: true });
          jvMin += 1;
          self._emit({ type: 'status', data: jvStatus() });
          setTimeout(function () { self._emit({ type: 'state', state: 'czuwa' }); self._busy = false; }, 600);
        }
      }, 70);
    }, 1100);
  };
  FakeJarvis.prototype.send = function (raw) {
    var self = this, msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }
    if (msg.type === 'chat') {
      self._emit({ type: 'chat_ack', cid: msg.cid });
      self._emit(jvEntry('user', msg.text, { cid: msg.cid, about: msg.context && msg.context.body ? (msg.context.panel || 'zakładka ' + msg.context.tab) : undefined }));
      self._answer();
    } else if (msg.type === 'listen') {
      if (self._busy) return;
      self._busy = true;
      self._emit({ type: 'state', state: 'słucha' });
      setTimeout(function () {
        self._emit({ type: 'heard', text: JV_HEARD });
        var e = jvEntry('user', JV_HEARD); e.channel = 'głos'; self._emit(e);
        self._answer();
      }, 1800);
    } else if (msg.type === 'private') {
      jvPrivate = !!msg.on;
      self._emit({ type: 'status', data: jvStatus() });
      self._emit({ type: 'state', state: jvPrivate ? 'prywatny' : 'czuwa' });
    }
  };
  FakeJarvis.prototype.close = function () { clearInterval(this._tick); this.readyState = 3; if (this.onclose) this.onclose(new Event('close')); };
  FakeJarvis.prototype.addEventListener = function () {};
  FakeJarvis.prototype.removeEventListener = function () {};

  var RealWS = window.WebSocket;
  window.WebSocket = function (url, p) {
    if (/^wss?:\/\/127\.0\.0\.1/.test(String(url))) return new FakeJarvis(url);
    return new RealWS(url, p);
  };
  window.WebSocket.prototype = RealWS.prototype;
  ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function (k, i) { window.WebSocket[k] = i; });
})();
