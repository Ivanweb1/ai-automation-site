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
  const bars = $('#fdBars');
  const H = [42, 64, 38, 80, 56, 90, 48, 72, 60, 100, 52, 84, 66, 94];
  const bar = (k, isNew) => { const b = document.createElement('i'); b.style.height = H[k % H.length] + '%'; if (isNew) b.className = 'new'; return b; };
  if (bars) for (let k = 0; k < 24; k++) bars.append(bar(k));
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
  const LOGO = { TG: 'telegram', MAX: 'max', AV: 'avito', 'ЯД': 'yandex-direct', 'МЕТ': 'yandex-metrika', '1С': '1c', GS: 'google-sheets', CRM: 'amocrm', 'МП': 'wildberries', WEB: 'tilda', '@': 'yandex-mail' };
  const ico = (c) => LOGO[c] ? `<i class="lgo"><img src="img/logos/${LOGO[c]}.svg" alt=""></i>` : `<i>${c}</i>`;
  const msg = (f) => { const el = document.createElement('div'); el.className = 'msg'; el.innerHTML = `${ico(f[0])}<div>${f[2]}<small>${f[1]}</small></div>`; return el; };
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
      if (bars) { bars.append(bar(n + 3, true)); while (bars.children.length > 24) bars.firstElementChild.remove(); }
    }, 700);
  };
  setTimeout(() => { tick(); setInterval(tick, 2400); }, 900);
})();

// 1 · тумблер в bento
(() => {
  const t = $('#heroTog'); if (!t) return;
  const set = (on) => {
    t.classList.toggle('on', on); t.setAttribute('aria-pressed', on);
    $('#heroTogLbl').textContent = on ? 'После запуска' : 'Сейчас: рутина за день';
    $('#heroTogState').textContent = on ? 'свободны для работы с клиентами' : 'уходят на ручную работу';
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
    // подписи шагов: что приходит → что делают руками
    const mk = stage.querySelector('.mk[data-steps]');
    if (mk) {
      const names = mk.dataset.steps.split('|'); let s = 0;
      [...mk.children].filter((c) => !c.classList.contains('paste')).forEach((c) => {
        const col = document.createElement('div'); col.className = 'col';
        col.innerHTML = `<div class="step-l${s ? ' hand' : ''}"><b>${s + 1}</b>${names[s] || ''}</div>`;
        c.replaceWith(col); col.append(c); s++;
      });
    }
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

// 7 · примеры: вкладки до/после с визуализацией
(() => {
  const tabs = [...document.querySelectorAll('#tabs .tab')]; if (!tabs.length) return;
  const win = (title, body) => `<div class="win"><div class="tb"><i></i><i></i><i></i><span>${title}</span></div><div class="body">${body}</div></div>`;
  const wave = '<span class="wave"><i></i><i></i><i></i><i></i><i></i><i></i></span>';
  const data = [
    ['Заказы в Telegram голосовыми и скриншотами. Менеджер сверяет их руками',
     win('Telegram · Заказы', `<div class="chat"><div class="bub v"><b class="pl"></b>${wave}0:42</div><div class="bub shot"><span></span><span></span><span class="s"></span>скриншот заказа</div><div class="bub">Как в прошлый раз, только больше</div></div>`),
     'Бот распознаёт заказ, сверяет с каталогом и создаёт заявку',
     win('Бот заказов', `<div class="chat"><div class="bub v"><b class="pl"></b>${wave}0:42</div><div class="bub me">Коробки × 20, скотч × 10 — всё есть в каталоге</div><div class="okline"><i></i>Заявка №128 создана в учёте</div></div>`)],
    ['Раз в месяц данные выгружают из нескольких систем и сводят вручную',
     win('Отчёт.xlsx', `<div class="sheet"><div class="r h"><span>Показатель</span><span>Месяц</span><span></span></div><div class="r"><span>Выручка</span><span>из 1С</span><span>Ctrl+V</span></div><div class="r"><span>Реклама</span><span>из Директа</span><span>Ctrl+V</span></div><div class="r typing"><span>Заявки</span><span><em class="caret"></em></span><span></span></div></div>`),
     'Отчёт собирается сам и приходит в мессенджер в назначенный день',
     win('Telegram · Отчёты', `<div class="chat"><div class="bub me">Отчёт за октябрь: выручка 5,1 млн ₽, заявки 1 240, реклама 380 тыс ₽</div><div class="chart" style="min-height:70px"><i style="height:50%"></i><i style="height:70%;animation-delay:.3s"></i><i style="height:60%;animation-delay:.6s"></i><i class="b" style="height:90%;animation-delay:.9s"></i></div><div class="okline"><i></i>1-е число · 9:00 · пришло само</div></div>`)],
    ['Договор копируют из прошлого и правят реквизиты руками',
     `<div class="paper" style="margin:0"><div class="ttl">Договор № <s>187</s> <u>214<em class="caret"></em></u></div><p><s>ООО «Ромашка»</s> <u>ООО «Вектор»</u></p><span class="ln"></span><span class="ln s"></span><p>ИНН <s>7701 ••• 112</s> <u>5032 ••• 908</u></p></div>`,
     'Менеджер вводит данные клиента и получает готовый документ',
     win('Карточка клиента', `<div class="fm"><label>Компания<span>ООО «Вектор»</span></label><label>ИНН<span>5032 ••• 908</span></label></div><div class="okline"><i></i>Договор_Вектор.pdf готов</div>`)],
  ];
  const now = $('#baNow'), auto = $('#baAuto');
  const show = (k) => {
    tabs.forEach((t, j) => { t.classList.remove('act'); if (j === k) { void t.offsetWidth; t.classList.add('act'); } });
    now.querySelector('p').textContent = data[k][0]; now.querySelector('.ba-viz').innerHTML = data[k][1];
    auto.querySelector('p').textContent = data[k][2]; auto.querySelector('.ba-viz').innerHTML = data[k][3];
  };
  let cur = 0, timer = null;
  const box = $('#tabs');
  const play = (k) => { cur = k; show(k); };
  tabs.forEach((t, k) => t.addEventListener('click', () => { clearInterval(timer); box.classList.add('paused'); play(k); }));
  play(0);
  if (!reduce) timer = setInterval(() => play((cur + 1) % tabs.length), 6000);
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

// 10 · этапы: подсвечиваются по очереди, полоса идёт к активному шагу
(() => {
  const box = $('#stepsBox'); if (!box) return;
  const steps = [...box.querySelectorAll('.step')];
  steps.forEach((st) => st.insertAdjacentHTML('beforeend', '<span class="bar-p"><i></i></span>'));
  let k = -1, timer = null;
  const go = () => {
    k = (k + 1) % steps.length;
    steps.forEach((st, j) => { st.classList.toggle('act', j === k); st.classList.toggle('done', j < k); });
    box.style.setProperty('--p', (k / (steps.length - 1) * 100) + '%');
  };
  onView(box, () => { box.classList.add('in'); if (reduce) { steps.forEach((st) => st.classList.add('done')); box.style.setProperty('--p', '100%'); return; } go(); timer = setInterval(go, 2400); }, 0.4);
})();

// 9 · рилсы: превью при наведении, по клику — со звуком в окне
(() => {
  const row = $('#reelsRow'); if (!row) return;
  const modal = $('#vmodal'), mv = modal.querySelector('video');
  row.querySelectorAll('.reel').forEach((r) => {
    const v = r.querySelector('video');
    r.addEventListener('mouseenter', () => { if (reduce) return; if (!v.src) v.src = r.dataset.src; v.play().then(() => r.classList.add('playing')).catch(() => {}); });
    r.addEventListener('mouseleave', () => { v.pause(); r.classList.remove('playing'); });
    r.addEventListener('click', () => { mv.src = r.dataset.src; modal.hidden = false; mv.play().catch(() => {}); });
  });
  const close = () => { mv.pause(); modal.hidden = true; };
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target.classList.contains('vclose')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
  document.querySelectorAll('.rn').forEach((b) => b.addEventListener('click', () => row.scrollBy({ left: +b.dataset.d * row.clientWidth * 0.8, behavior: 'smooth' })));
})();

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

// 6 · стопка услуг: нижняя карточка уменьшается и темнеет, пока следующая на неё наезжает
(() => {
  const cards = [...document.querySelectorAll('.scard')]; if (!cards.length || reduce) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) { card.style.transform = ''; card.style.filter = ''; return; }
      const top = parseFloat(getComputedStyle(card).top);
      const h = card.offsetHeight;
      const p = Math.min(1, Math.max(0, 1 - (next.getBoundingClientRect().top - top) / h));
      card.style.transform = `scale(${1 - 0.05 * p})`;
      card.style.filter = '';
    });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update); update();
})();
