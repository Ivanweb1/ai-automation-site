// Анимации автоматизаций на главной. Без библиотек.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s) => document.querySelector(s);

const onView = (el, fn, threshold = 0.25) => {
  if (!el) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
  }, { threshold });
  io.observe(el);
};
document.querySelectorAll('.reveal').forEach((el) => onView(el, (t) => t.classList.add('in'), 0.1));

// счётчики
document.querySelectorAll('[data-count]').forEach((el) => onView(el, () => {
  const end = +el.dataset.count;
  if (reduce) { el.textContent = end; return; }
  const t0 = performance.now(), dur = 1500;
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}, 0.6));

// бегущая строка: дублируем фишки для бесшовной прокрутки
(() => { const t = $('#marquee'); if (t && !reduce) t.innerHTML += t.innerHTML; })();

// 1 · живая схема заявок
(() => {
  const inBox = $('#fdIn'), table = $('#fdTable'), node = $('#fdNode'), rail = $('#fdRail'), counter = $('#fdCount');
  if (!inBox) return;
  const feed = [
    { ch: 'TG', from: 'Голосовое · Telegram', text: '«Нужно 20 коробок на пятницу»', row: 'Заказ 20 коробок', who: 'Ольга' },
    { ch: 'WEB', from: 'Форма на сайте', text: 'Расчёт стоимости доставки', row: 'Расчёт доставки', who: 'ООО «Вектор»' },
    { ch: 'MAX', from: 'Сообщение · MAX', text: 'Скриншот заказа из прошлого месяца', row: 'Повтор заказа', who: 'Игорь' },
    { ch: 'AV', from: 'Авито', text: 'Ещё актуально? Заберу завтра', row: 'Самовывоз завтра', who: 'Анна' },
    { ch: 'TEL', from: 'Звонок · запись', text: 'Пропущенный, перезвонить', row: 'Перезвонить', who: '+7 9•• •••-12-40' },
  ];
  let i = 0, n = 0;
  const addMsg = (m) => {
    const el = document.createElement('div');
    el.className = 'msg';
    el.innerHTML = `<i>${m.ch}</i><div>${m.text}<small>${m.from}</small></div>`;
    inBox.prepend(el);
    while (inBox.children.length > 4) inBox.lastElementChild.remove();
  };
  const addRow = (m) => {
    const r = document.createElement('div');
    r.className = 'fd-row';
    r.innerHTML = `<div><b>${m.row}</b><br><span>${m.who}</span></div><em>в работе</em>`;
    table.prepend(r);
    while (table.children.length > 4) table.lastElementChild.remove();
  };
  feed.slice(0, 3).forEach(addMsg);
  if (reduce) { feed.slice(0, 4).forEach(addRow); counter.textContent = 4; return; }
  const tick = () => {
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

// 1 · тумблер в bento
(() => {
  const t = $('#heroTog'); if (!t) return;
  const set = (on) => {
    t.classList.toggle('on', on); t.setAttribute('aria-pressed', on);
    $('#heroTogLbl').textContent = on ? 'После запуска' : 'Сейчас';
    $('#heroTogState').textContent = on ? 'Автоматически' : 'Ручной режим';
  };
  t.addEventListener('click', () => set(!t.classList.contains('on')));
  t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); } });
  if (!reduce) setInterval(() => { if (!t.matches(':hover')) set(!t.classList.contains('on')); }, 3200);
})();

// 3 · боли: список переключает сцену, сам листается пока не кликнули
(() => {
  const list = $('#pains'); if (!list) return;
  const items = [...list.querySelectorAll('.pain')];
  const svg = $('#sceneSvg'), title = $('#sceneTitle'), num = $('#sceneNum');
  let cur = 0, timer = null;
  const show = (k) => {
    cur = k;
    items.forEach((el, j) => el.classList.toggle('act', j === k));
    svg.replaceChildren(...[...document.getElementById('sc' + k).childNodes].map((c) => c.cloneNode(true)));
    svg.classList.remove('swap'); void svg.offsetWidth; svg.classList.add('swap');
    title.textContent = items[k].querySelector('h3').textContent;
    num.textContent = `0${k + 1} / 06`;
  };
  const auto = () => { timer = setInterval(() => show((cur + 1) % items.length), 4500); };
  items.forEach((el, k) => el.addEventListener('click', () => {
    clearInterval(timer); list.classList.add('paused'); show(k);
  }));
  show(0);
  if (!reduce) onView(list, auto, 0.3); else list.classList.add('paused');
})();

// 4 · день сотрудника: ручной → авто
(() => {
  const day = $('#day'), btn = $('#dayTog'); if (!day) return;
  const set = (on) => {
    day.classList.toggle('on', on); btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on);
    $('#dayLbl').textContent = on ? 'Автоматически' : 'Ручной режим';
    $('#dayNote').textContent = on
      ? 'Рутина уходит в систему, освободившееся время — на работу с клиентами'
      : 'Нажмите на тумблер, чтобы увидеть тот же день после автоматизации';
  };
  btn.addEventListener('click', () => set(!day.classList.contains('on')));
  onView(day, () => setTimeout(() => set(true), reduce ? 0 : 1400), 0.6);
})();

// 6 · чат → заявка в карточке услуги
(() => {
  const chat = $('#chat'); if (!chat) return;
  const script = [
    '<div class="bub voice"><i style="height:8px"></i><i style="height:16px;animation-delay:.2s"></i><i style="height:11px;animation-delay:.4s"></i><i style="height:18px;animation-delay:.6s"></i><i style="height:9px;animation-delay:.8s"></i><i style="height:14px;animation-delay:1s"></i>&nbsp;0:12</div>',
    '<div class="bub me">Распознал: 20 коробок, доставка в пятницу. Верно?</div>',
    '<div class="bub">Да, всё так</div>',
  ];
  const run = () => {
    chat.innerHTML = '';
    script.forEach((h, k) => setTimeout(() => chat.insertAdjacentHTML('beforeend', h), reduce ? 0 : k * 900));
  };
  run(); if (!reduce) setInterval(run, 4000);
})();

// 7 · примеры: вкладки до/после
(() => {
  const tabs = [...document.querySelectorAll('#tabs .tab')]; if (!tabs.length) return;
  const data = [
    ['Заказы в Telegram голосовыми и скриншотами. Менеджер сверяет их руками', 'Бот распознаёт заказ, сверяет с каталогом и создаёт заявку'],
    ['Раз в месяц данные выгружают из нескольких систем и сводят вручную', 'Отчёт собирается сам и приходит в мессенджер в назначенный день'],
    ['Договор копируют из прошлого и правят реквизиты руками', 'Менеджер вводит данные клиента и получает готовый документ'],
  ];
  const now = $('#baNow'), auto = $('#baAuto');
  const show = (k) => {
    tabs.forEach((t, j) => t.classList.toggle('act', j === k));
    now.querySelector('p').textContent = data[k][0];
    auto.querySelector('p').textContent = data[k][1];
    [now, auto].forEach((el) => { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); });
  };
  tabs.forEach((t, k) => t.addEventListener('click', () => show(k)));
  show(0);
})();

// 8 · кейс: 40 таблиц заполняются
(() => {
  const sheets = $('#sheets'), label = $('#sheetsN'); if (!sheets) return;
  for (let k = 0; k < 40; k++) sheets.appendChild(document.createElement('i'));
  const cells = [...sheets.children];
  onView($('#pipe'), () => {
    cells.forEach((c, k) => setTimeout(() => {
      c.classList.add('on'); if (k === 0) c.classList.add('first');
      label.textContent = k + 1;
    }, reduce ? 0 : 500 + k * 45));
  }, 0.4);
})();

// 10 · этапы
onView($('#stepsBox'), (el) => el.classList.add('in'), 0.4);

// 12 · форма: обработчик подключается при деплое (пересылка в Telegram без хранения)
(() => {
  const form = $('#leadForm'), note = $('#formNote'); if (!form) return;
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
