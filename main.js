// Анимации автоматизаций на главной. Без библиотек.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// появление блоков и запуск сцен при прокрутке
const onView = (el, fn, threshold = 0.25) => {
  if (!el) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
  }, { threshold });
  io.observe(el);
};
document.querySelectorAll('.reveal').forEach((el) => onView(el, (t) => t.classList.add('in'), 0.12));

// 1 · живая схема: заявки из каналов → система → учёт
(() => {
  const inBox = document.getElementById('fdIn');
  const table = document.getElementById('fdTable');
  const node = document.getElementById('fdNode');
  const rail = document.getElementById('fdRail');
  const counter = document.getElementById('fdCount');
  if (!inBox) return;
  const feed = [
    { ch: 'TG', from: 'Голосовое · Telegram', text: '«Нужно 20 коробок на пятницу»', row: 'Заказ 20 коробок', who: 'Ольга' },
    { ch: 'WEB', from: 'Форма на сайте', text: 'Расчёт стоимости доставки', row: 'Расчёт доставки', who: 'ООО «Вектор»' },
    { ch: 'MAX', from: 'Сообщение · MAX', text: 'Скриншот заказа из прошлого месяца', row: 'Повтор заказа', who: 'Игорь' },
    { ch: 'AV', from: 'Авито', text: 'Ещё актуально? Хочу забрать завтра', row: 'Самовывоз завтра', who: 'Анна' },
    { ch: 'TEL', from: 'Звонок · запись', text: 'Пропущенный, перезвонить', row: 'Перезвонить', who: '+7 9•• •••-12-40' },
  ];
  let i = 0, n = 0;
  const addMsg = (m) => {
    const el = document.createElement('div');
    el.className = 'msg';
    el.innerHTML = `<i>${m.ch}</i><div>${m.text}<small>${m.from}</small></div>`;
    inBox.prepend(el);
    while (inBox.children.length > 4) inBox.lastElementChild.remove();
    return el;
  };
  const addRow = (m) => {
    const r = document.createElement('div');
    r.className = 'fd-row';
    r.innerHTML = `<div><b>${m.row}</b><br><span>${m.who}</span></div><em>в работе</em>`;
    table.prepend(r);
    while (table.children.length > 5) table.lastElementChild.remove();
  };
  // стартовое состояние
  feed.slice(0, 3).forEach(addMsg);
  if (reduce) { feed.forEach(addRow); counter.textContent = feed.length; return; }
  const tick = () => {
    const m = feed[i % feed.length];
    const oldest = inBox.lastElementChild;
    if (oldest) oldest.classList.add('out');
    rail.classList.remove('go'); void rail.offsetWidth; rail.classList.add('go');
    setTimeout(() => {
      node.classList.remove('ping'); void node.offsetWidth; node.classList.add('ping');
      addRow(feed[(i + 2) % feed.length]);
      counter.textContent = ++n;
      if (oldest) oldest.remove();
      addMsg(feed[(i + 3) % feed.length]);
      i++;
    }, 700);
  };
  setTimeout(() => { tick(); setInterval(tick, 2400); }, 900);
})();

// 4 · тумблер «ручной → авто»
(() => {
  const box = document.getElementById('switcher');
  const btn = document.getElementById('toggle');
  if (!box) return;
  const hand = box.querySelectorAll('.mode-hand .tasks li');
  const outs = ['сами', 'по расписанию', 'за минуту', 'сами'];
  const set = (on) => {
    box.classList.toggle('switch-on', on);
    btn.setAttribute('aria-pressed', on);
    hand.forEach((li, k) => setTimeout(() => li.classList.toggle('done', on), on ? k * 180 : 0));
    outs.forEach((v, k) => { document.getElementById('t' + (k + 1)).textContent = on ? v : '—'; });
  };
  btn.addEventListener('click', () => set(!box.classList.contains('switch-on')));
  onView(box, () => setTimeout(() => set(true), reduce ? 0 : 900), 0.5);
})();

// 7 · кейс: 40 таблиц заполняются, цифры считаются
(() => {
  const sheets = document.getElementById('sheets');
  const label = document.getElementById('sheetsN');
  if (!sheets) return;
  for (let k = 0; k < 40; k++) sheets.appendChild(document.createElement('i'));
  const cells = [...sheets.children];
  onView(document.getElementById('caseFlow'), () => {
    cells.forEach((c, k) => setTimeout(() => {
      c.classList.add('on'); if (k === 0) c.classList.add('first');
      label.textContent = k + 1;
    }, reduce ? 0 : 400 + k * 45));
  }, 0.4);
  document.querySelectorAll('[data-count]').forEach((el) => onView(el, () => {
    const end = +el.dataset.count;
    if (reduce) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, 0.6));
})();

// 10 · этапы: полоса прогресса
onView(document.getElementById('stepsBox'), (el) => el.classList.add('in'), 0.4);

// 12 · форма: обработчик заявок подключается при деплое (пересылка в Telegram без хранения)
(() => {
  const form = document.getElementById('leadForm');
  const note = document.getElementById('formNote');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      if (!r.ok) throw new Error();
      form.reset();
      note.textContent = 'Заявка отправлена. Напишу вам в ближайшее время';
    } catch {
      note.innerHTML = 'Не получилось отправить. Напишите, пожалуйста, в <a href="https://t.me/ivan_web_1">Telegram</a>';
    }
  });
})();
