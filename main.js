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

// 1 · живая схема: 4 сценария сменяют друг друга (заявки, отчёты, документы, 1С)
(() => {
  const inBox = $('#fdIn'), table = $('#fdTable'), node = $('#fdNode'), rail = $('#fdRail'), counter = $('#fdCount');
  const tabsBox = $('#fdTabs'); if (!inBox) return;
  const tabs = [...tabsBox.children];
  const S = [
    { inL: 'Входящие', outL: 'Учёт заявок', feed: [
      ['TG', 'Голосовое · Telegram', '«Нужно 20 коробок на пятницу»', 'Заказ 20 коробок', 'Ольга', 'в работе'],
      ['WEB', 'Форма на сайте', 'Расчёт стоимости доставки', 'Расчёт доставки', 'ООО «Вектор»', 'в работе'],
      ['MAX', 'Сообщение · MAX', 'Скриншот заказа из прошлого месяца', 'Повтор заказа', 'Игорь', 'в работе'],
      ['AV', 'Авито', 'Ещё актуально? Заберу завтра', 'Самовывоз завтра', 'Анна', 'в работе'],
      ['TEL', 'Звонок · запись', 'Пропущенный, перезвонить', 'Перезвонить', 'Клиент с сайта', 'в работе'] ] },
    { inL: 'Источники', outL: 'Отчёты в мессенджер', feed: [
      ['ЯД', 'Яндекс Директ', 'Расход и клики за неделю', 'Сводка по рекламе', 'Пн 8:00 · Telegram', 'готов'],
      ['1С', '1С', 'Продажи за неделю', 'Отчёт по продажам', 'Пн 8:00 · MAX', 'готов'],
      ['МЕТ', 'Метрика', 'Звонки и заявки с сайта', 'Заявки по каналам', 'Пн 8:00 · Telegram', 'готов'],
      ['GS', 'Google Таблицы', 'План на месяц', 'Отчёт собственнику', '1-е число · почта', 'готов'] ] },
    { inL: 'Данные клиента', outL: 'Готовые документы', feed: [
      ['CRM', 'Учёт клиентов', 'Сделка выиграна · ООО «Вектор»', 'Договор поставки', 'ООО «Вектор»', 'PDF'],
      ['ИНН', 'Карточка клиента', 'Реквизиты подтянуты по ИНН', 'Счёт на оплату', 'ООО «Вектор»', 'отправлен'],
      ['CRM', 'Учёт клиентов', 'Заказ отгружен', 'Акт выполненных работ', 'ИП Смирнов', 'готов'],
      ['КП', 'Запрос с сайта', 'Нужно КП на 3 позиции', 'Коммерческое предложение', 'Анна', 'PDF'] ] },
    { inL: 'Файлы и почта', outL: 'Записано в 1С', feed: [
      ['XLS', 'Excel', 'Реализации за день', 'Реализации загружены', '1С · торговля', 'в 1С'],
      ['@', 'Почта', 'Выписка из банка', 'Платежи разнесены', '1С · бухгалтерия', 'в 1С'],
      ['WEB', 'Заказ с сайта', 'Новый заказ интернет-магазина', 'Заказ клиента', '1С · продажи', 'в 1С'],
      ['МП', 'Маркетплейс', 'Отчёт о продажах', 'Отчёт комиссионера', '1С · маркетплейсы', 'в 1С'] ] },
  ];
  let sc = 0, i = 0, n = 0, ticks = 0, manual = false;
  const msg = (f) => { const el = document.createElement('div'); el.className = 'msg'; el.innerHTML = `<i>${f[0]}</i><div>${f[2]}<small>${f[1]}</small></div>`; return el; };
  const row = (f) => { const r = document.createElement('div'); r.className = 'fd-row'; r.innerHTML = `<div><b>${f[3]}</b><br><span>${f[4]}</span></div><em>${f[5]}</em>`; return r; };
  const load = (k) => {
    sc = k; i = 0; ticks = 0;
    tabs.forEach((b, j) => b.classList.toggle('act', j === k));
    $('#fdInL').textContent = S[k].inL; $('#fdOutL').textContent = S[k].outL;
    inBox.innerHTML = ''; table.innerHTML = '';
    S[k].feed.slice(0, 3).forEach((f) => inBox.prepend(msg(f)));
    S[k].feed.slice(-2).forEach((f) => table.prepend(row(f)));
  };
  tabs.forEach((b, k) => b.addEventListener('click', () => { manual = true; tabsBox.classList.add('paused'); load(k); }));
  load(0);
  if (reduce) { S[0].feed.slice(0, 4).forEach((f) => table.prepend(row(f))); counter.textContent = 4; return; }
  const tick = () => {
    const feed = S[sc].feed;
    if (!manual && ticks >= 3) { load((sc + 1) % S.length); return; }
    const oldest = inBox.lastElementChild;
    if (oldest) oldest.classList.add('out');
    rail.classList.remove('go'); void rail.offsetWidth; rail.classList.add('go');
    setTimeout(() => {
      node.classList.remove('ping'); void node.offsetWidth; node.classList.add('ping');
      if (oldest) oldest.remove();
      table.prepend(row(feed[i % feed.length]));
      while (table.children.length > 4) table.lastElementChild.remove();
      inBox.prepend(msg(feed[(i + 3) % feed.length]));
      while (inBox.children.length > 3) inBox.lastElementChild.remove();
      counter.textContent = ++n; i++; ticks++;
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
  const stage = $('#stage'), title = $('#sceneTitle'), num = $('#sceneNum');
  let cur = 0, timer = null;
  const show = (k) => {
    cur = k;
    items.forEach((el, j) => el.classList.toggle('act', j === k));
    stage.innerHTML = document.querySelector(`#scenes [data-k="${k}"]`).innerHTML;
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
      ? 'После автоматизации: рутина уходит в систему, время — на работу с клиентами'
      : 'До автоматизации: половина дня уходит на ручной перенос данных';
  };
  let auto = null;
  btn.addEventListener('click', () => { clearInterval(auto); set(!day.classList.contains('on')); });
  onView(day, () => {
    if (reduce) { set(true); return; }
    setTimeout(() => set(true), 1200);
    auto = setInterval(() => set(!day.classList.contains('on')), 4000);
  }, 0.5);
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
