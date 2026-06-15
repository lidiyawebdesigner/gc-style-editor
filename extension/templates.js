/* ============================================================
   GetCourse Style Editor — Библиотека блоков (v0.9.10)
   Self-contained HTML-блоки для вставки в HTML-блок GetCourse.
   Каждый блок несёт свой <style> внутри — отдельно CSS подключать не надо.
   templates.js грузится ПЕРЕД content.js (см. manifest) — общий scope
   контент-скриптов, доступен как глобальная GSE_TEMPLATES.
   ============================================================ */
const GSE_TEMPLATES = [
  {
    id: 'glossary-dark',
    category: 'faq',
    name: 'Глоссарий терминов',
    meta: 'аккордеон · без JS',
    html: `<!-- ============================================================
  Блок: Глоссарий терминов (нативный аккордеон, без JS)
  Источник: zerocoder.ru/pervyy-praktikum-po-vaybkodingu (page133374436, rec2141965061)
  Пересобран из Tilda t668 в нативный <details> — адаптивный, GC-ready, без Tilda-скриптов.
  Каждый термин = своя раскрывающаяся карточка. Стиль самодостаточный (scoped .zc-glossary).
============================================================ -->
<section class="zc-glossary">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap');
    .zc-glossary{
      --zc-bg:#141414;
      --zc-card:#ffffff;
      --zc-text:#1a1a1a;
      --zc-muted:#4a4a4a;
      --zc-accent:#da7756;          /* акцент как на оригинале (Claude-оранжевый). Под бренд можно сменить на #9f7bf6 */
      --zc-radius:16px;
      background:var(--zc-bg);
      padding:clamp(40px,6vw,80px) clamp(16px,4vw,40px);
      font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      box-sizing:border-box;
    }
    .zc-glossary *{box-sizing:border-box}
    .zc-glossary__inner{max-width:900px;margin:0 auto}
    .zc-glossary__title{
      margin:0 0 clamp(20px,3vw,36px);
      color:#fff;
      font-weight:800;
      font-size:clamp(28px,5vw,48px);
      line-height:1.1;
      letter-spacing:-0.01em;
    }
    .zc-glossary__list{display:flex;flex-direction:column;gap:clamp(10px,1.4vw,16px)}

    /* Карточка-аккордеон на нативном <details> */
    .zc-term{
      background:var(--zc-card);
      border-radius:var(--zc-radius);
      overflow:hidden;
      transition:box-shadow .25s ease;
    }
    .zc-term[open]{box-shadow:0 12px 32px rgba(0,0,0,.18)}

    .zc-term__summary{
      list-style:none;
      cursor:pointer;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
      padding:clamp(18px,2.4vw,26px) clamp(20px,3vw,32px);
      font-weight:700;
      font-size:clamp(17px,2.2vw,22px);
      color:var(--zc-text);
      line-height:1.3;
      user-select:none;
    }
    .zc-term__summary::-webkit-details-marker{display:none}  /* убираем дефолтный треугольник */

    /* Круглая иконка + → × при раскрытии */
    .zc-term__icon{
      flex:0 0 auto;
      width:clamp(30px,4vw,40px);
      height:clamp(30px,4vw,40px);
      border-radius:50%;
      background:var(--zc-accent);
      position:relative;
      transition:transform .3s ease;
    }
    .zc-term__icon::before,
    .zc-term__icon::after{
      content:'';
      position:absolute;
      top:50%;left:50%;
      width:45%;height:2px;
      background:#fff;
      transform:translate(-50%,-50%);
      transition:transform .3s ease;
    }
    .zc-term__icon::after{transform:translate(-50%,-50%) rotate(90deg)}
    .zc-term[open] .zc-term__icon{transform:rotate(135deg)}

    .zc-term__body{
      padding:0 clamp(20px,3vw,32px) clamp(20px,2.6vw,28px);
      color:var(--zc-muted);
      font-size:clamp(15px,1.8vw,17px);
      line-height:1.6;
      font-weight:400;
    }
    .zc-term__body b{color:var(--zc-text);font-weight:700}
  </style>

  <div class="zc-glossary__inner">
    <h2 class="zc-glossary__title">Глоссарий</h2>
    <div class="zc-glossary__list">

      <details class="zc-term">
        <summary class="zc-term__summary"><span>Claude Code</span><span class="zc-term__icon" aria-hidden="true"></span></summary>
        <div class="zc-term__body"><b>Claude Code</b> — это агентный инструмент командной строки (CLI) от компании Anthropic. Он позволяет нейросети не просто предлагать фрагменты кода, а полноценно «работать» в вашем проекте: запускать тесты, искать файлы, исправлять ошибки и выполнять терминальные команды, действуя как автономный ИИ-программист.</div>
      </details>

      <details class="zc-term">
        <summary class="zc-term__summary"><span>MVP</span><span class="zc-term__icon" aria-hidden="true"></span></summary>
        <div class="zc-term__body"><b>MVP (Minimum Viable Product — минимально жизнеспособный продукт)</b> — это ранняя версия продукта с набором только ключевых функций, достаточных для удовлетворения потребностей первых пользователей и проверки бизнес-гипотез с минимальными затратами.</div>
      </details>

      <details class="zc-term">
        <summary class="zc-term__summary"><span>Вайбкодинг</span><span class="zc-term__icon" aria-hidden="true"></span></summary>
        <div class="zc-term__body"><b>Вайбкодинг (Vibe Coding)</b> — стиль разработки, ориентированный на передачу ИИ общего намерения, логики и «вайба» проекта вместо ручного написания строк кода. При таком подходе человек выступает в роли дирижёра или архитектора смыслов, а техническую реализацию (синтаксис, функции, багфикс) доверяет нейросетям.</div>
      </details>

      <details class="zc-term">
        <summary class="zc-term__summary"><span>SMM-специалист</span><span class="zc-term__icon" aria-hidden="true"></span></summary>
        <div class="zc-term__body"><b>SMM-специалист (Social Media Marketing)</b> — это маркетолог, который продвигает бизнес, бренд или эксперта в социальных сетях.</div>
      </details>

    </div>
  </div>
</section>`
  },
  {
    id: 'gifts',
    category: 'gifts',
    name: 'Подарки за участие',
    meta: 'список · без JS',
    html: `<!-- ============================================================
  Блок: Подарки за участие в эфире
  Источник: Tilda T396 rec2141766771 — пересобран в нативный flex, GC-ready, без Tilda-скриптов.
  Композиция 1-в-1: светлая карточка, слева заголовок, справа две плитки-подарка с номерами.
  Самодостаточный (scoped .zc-gifts). Тексты и цвета — из оригинала.
============================================================ -->
<section class="zc-gifts">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap');
    .zc-gifts{
      --zc-bg:#141414;
      --zc-card:#faf9f5;
      --zc-border:#e9e7dd;
      --zc-tile:#f0eee6;
      --zc-ink:#141414;
      --zc-tile-ink:#2c2c2c;
      --zc-dark:#141414;
      background:var(--zc-bg);
      padding:0 clamp(16px,4vw,40px) clamp(40px,5vw,100px);
      font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      box-sizing:border-box;
    }
    .zc-gifts *{box-sizing:border-box}
    .zc-gifts__inner{max-width:1200px;margin:0 auto}

    /* Карточка-обёртка */
    .zc-gifts__card{
      display:flex;
      flex-wrap:wrap;
      align-items:center;
      gap:clamp(16px,2vw,24px);
      background:var(--zc-card);
      border:2px solid var(--zc-border);
      border-radius:20px;
      padding:clamp(16px,2.2vw,24px);
    }
    .zc-gifts__title{
      flex:0 0 auto;
      max-width:230px;
      margin:0;
      color:var(--zc-ink);
      font-weight:700;
      font-size:clamp(18px,1.9vw,24px);
      line-height:1.1;
      letter-spacing:-.3px;
      text-transform:uppercase;
    }

    /* Список плиток */
    .zc-gifts__list{
      flex:1 1 480px;
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:clamp(16px,1.5vw,20px);
    }

    /* Плитка-подарок */
    .zc-gift{
      display:flex;
      align-items:center;
      gap:clamp(14px,1.4vw,20px);
      background:var(--zc-tile);
      border-radius:15px;
      padding:20px;
    }
    .zc-gift__num{
      flex:0 0 auto;
      width:35px;height:35px;
      display:flex;align-items:center;justify-content:center;
      border-radius:30px;
      background:var(--zc-dark);
      color:#fff;
      font-weight:600;
      font-size:15px;
    }
    .zc-gift__text{
      margin:0;
      color:var(--zc-tile-ink);
      font-weight:600;
      font-size:clamp(14px,1.4vw,18px);
      line-height:1.4;
    }

    /* h-tablet/v-tablet — заголовок над плитками */
    @media (max-width:959px){
      .zc-gifts__title{max-width:100%;width:100%}
    }
    /* mobile — всё в столбец */
    @media (max-width:639px){
      .zc-gifts__card{flex-direction:column;align-items:stretch}
      .zc-gifts__list{grid-template-columns:1fr}
      .zc-gift{padding:15px;align-items:flex-start}
      .zc-gift__num{width:30px;height:30px;font-size:14px}
    }
  </style>

  <div class="zc-gifts__inner">
    <div class="zc-gifts__card">
      <h2 class="zc-gifts__title"><strong>Всем, кто придет на&nbsp;эфир подарим:</strong></h2>

      <div class="zc-gifts__list">
        <div class="zc-gift">
          <span class="zc-gift__num">01</span>
          <p class="zc-gift__text"><strong>Чек-лист «Мой первый сайт на&nbsp;вайбкодинге»</strong></p>
        </div>
        <div class="zc-gift">
          <span class="zc-gift__num">02</span>
          <p class="zc-gift__text"><strong>Шаблон сайта из&nbsp;практикума</strong></p>
        </div>
      </div>
    </div>
  </div>
</section>`
  },
  {
    id: 'pricing',
    category: 'pricing',
    name: 'Варианты участия',
    meta: '2 тарифа · без JS',
    html: `<!-- ============================================================
  Блок: Варианты участия (тарифы)
  Источник: Tilda T396 rec2141769211 — пересобран в нативный grid, GC-ready, без Tilda-скриптов.
  Композиция 1-в-1: заголовок + 2 карточки (БЕСПЛАТНЫЙ светлая / БИЗНЕС оранжевая), у каждой бейдж-заголовок, список, кнопка.
  Самодостаточный (scoped .zc-pricing). Тексты, цены и цвета — из оригинала.
============================================================ -->
<section class="zc-pricing">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    .zc-pricing{
      --zc-bg:#141414;
      --zc-accent:#db7856;       /* Claude-оранжевый */
      --zc-light:#faf9f5;
      --zc-dark:#141414;
      --zc-ink-free:#39280b;
      background:var(--zc-bg);
      padding:clamp(32px,4vw,60px) clamp(16px,4vw,40px) clamp(40px,6vw,90px);
      font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      box-sizing:border-box;
    }
    .zc-pricing *{box-sizing:border-box}
    .zc-pricing__inner{max-width:1200px;margin:0 auto}
    .zc-pricing__title{
      margin:0 0 clamp(20px,3vw,36px);
      color:var(--zc-light);
      font-weight:800;
      font-size:clamp(26px,4.4vw,48px);
      line-height:1.05;
      letter-spacing:-.02em;
    }

    /* Сетка тарифов */
    .zc-pricing__grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:clamp(16px,2vw,30px);
      align-items:stretch;
    }

    /* Карточка тарифа */
    .zc-tariff{
      display:flex;
      flex-direction:column;
      gap:clamp(16px,1.8vw,24px);
      border-radius:20px;
      padding:clamp(22px,2.6vw,34px);
    }
    .zc-tariff--free{background:var(--zc-light)}
    .zc-tariff--biz{background:var(--zc-accent)}

    /* Бейдж-заголовок тарифа */
    .zc-tariff__badge{
      align-self:flex-start;
      margin:0;
      padding:8px 22px;
      border-radius:15px;
      font-weight:700;
      font-size:clamp(18px,2.2vw,25px);
      line-height:1.1;
    }
    .zc-tariff--free .zc-tariff__badge{background:var(--zc-accent);color:#fff}
    .zc-tariff--biz  .zc-tariff__badge{background:#fff;color:var(--zc-accent)}

    /* Список выгод */
    .zc-tariff__list{
      margin:0;
      flex:1 1 auto;
      font-weight:600;
      font-size:clamp(13px,1.2vw,15px);
      line-height:1.55;
    }
    .zc-tariff__list p{margin:0 0 6px}
    .zc-tariff__list p:last-child{margin-bottom:0}
    .zc-tariff__list .spacer{height:10px;margin:0}
    .zc-tariff--free .zc-tariff__list{color:var(--zc-ink-free)}
    .zc-tariff--biz  .zc-tariff__list{color:#fff}

    /* Кнопка */
    .zc-tariff__btn{
      display:flex;align-items:center;justify-content:center;
      width:100%;
      min-height:60px;
      padding:0 20px;
      background:#141414;
      color:#fff;
      font-weight:700;
      font-size:clamp(12px,1.2vw,15px);
      text-transform:uppercase;
      text-decoration:none;
      text-align:center;
      border-radius:10px;
      line-height:1.3;
      transition:transform .3s ease, box-shadow .3s ease;
    }
    .zc-tariff__btn:hover{transform:scale(1.05);box-shadow:0 12px 30px rgba(0,0,0,.4)}

    /* mobile — карточки в столбец */
    @media (max-width:639px){
      .zc-pricing__grid{grid-template-columns:1fr}
      .zc-tariff{border-radius:15px}
      .zc-tariff__btn{min-height:48px;border-radius:8px}
    }
  </style>

  <div class="zc-pricing__inner">
    <h2 class="zc-pricing__title">Варианты участия</h2>

    <div class="zc-pricing__grid">

      <!-- Тариф БЕСПЛАТНЫЙ -->
      <div class="zc-tariff zc-tariff--free">
        <h3 class="zc-tariff__badge"><strong>БЕСПЛАТНЫЙ</strong></h3>
        <div class="zc-tariff__list">
          <p><strong>▸ Участие в практикуме</strong></p>
          <p><strong>▸ Возможность задать вопросы онлайн</strong></p>
        </div>
        <a class="zc-tariff__btn" href="#popup:free">Зарегистрироваться бесплатно</a>
      </div>

      <!-- Тариф БИЗНЕС -->
      <div class="zc-tariff zc-tariff--biz">
        <h3 class="zc-tariff__badge"><strong>БИЗНЕС</strong></h3>
        <div class="zc-tariff__list">
          <p><strong>Все, что входит в тариф БЕСПЛАТНЫЙ +</strong></p>
          <p class="spacer"></p>
          <p><strong>▸ Стратегическая сессия с экспертом Университета (обычная стоимость 10 000₽)</strong></p>
          <p><strong>▸ Запись эфира</strong></p>
          <p><strong>▸ Доступ в НЕЙРОКЛУБ на 1 месяц</strong></p>
        </div>
        <a class="zc-tariff__btn" href="#popup:business">Зарегистрироваться за 499₽</a>
      </div>

    </div>
  </div>
</section>`
  },
  {
    id: 'speaker',
    category: 'speaker',
    name: 'Карточка спикера',
    meta: 'фото + регалии',
    html: `<!-- ============================================================
  Блок: Спикер (карточка эксперта)
  Источник: Tilda T396 rec2141731101 — пересобран в нативный flex/grid, GC-ready, без Tilda-скриптов.
  Композиция 1-в-1: фото слева + имя/регалии справа, две колонки буллетов, кнопка CTA.
  Самодостаточный (scoped .zc-speaker). Тексты и цвета — из оригинала.
============================================================ -->
<section class="zc-speaker">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    .zc-speaker{
      --zc-bg:#141414;
      --zc-card:#faf9f5;
      --zc-border:#e9e7dd;
      --zc-ink:#141414;
      --zc-accent:#db7856;       /* Claude-оранжевый из оригинала */
      --zc-violet:#8f00ff;
      background:var(--zc-bg);
      padding:clamp(24px,4vw,60px) clamp(16px,4vw,40px) clamp(40px,6vw,100px);
      font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      box-sizing:border-box;
    }
    .zc-speaker *{box-sizing:border-box}
    .zc-speaker__inner{max-width:1200px;margin:0 auto}
    .zc-speaker__title{
      margin:0 0 clamp(16px,2.5vw,28px);
      color:#faf9f5;
      font-weight:700;
      font-size:clamp(24px,4.6vw,55px);
      line-height:.95;
      letter-spacing:-.04em;
      text-transform:uppercase;
    }

    /* Карточка */
    .zc-speaker__card{
      display:grid;
      grid-template-columns:293px 1fr;
      gap:clamp(20px,2.6vw,34px);
      align-items:start;
      background:var(--zc-card);
      border:2px solid var(--zc-border);
      border-radius:20px;
      padding:clamp(18px,2.4vw,28px);
    }

    /* Фото */
    .zc-speaker__photo{
      width:100%;
      aspect-ratio:293/300;
      border-radius:20px;
      background:#e9e7dd url('https://static.tildacdn.com/tild3563-3166-4664-a262-316232333737/image.png') right top / cover no-repeat;
    }

    .zc-speaker__body{display:flex;flex-direction:column;gap:clamp(16px,2vw,24px)}
    .zc-speaker__name{
      margin:0;
      color:var(--zc-ink);
      font-weight:600;
      font-size:clamp(18px,2.4vw,25px);
      line-height:1.2;
    }

    /* Две колонки регалий */
    .zc-speaker__cols{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:clamp(18px,2.6vw,40px);
    }
    .zc-speaker__list{
      margin:0;
      color:var(--zc-ink);
      font-size:clamp(13px,1vw,15px);
      font-weight:500;
      line-height:1.3;
    }
    .zc-speaker__list p{margin:0 0 14px}
    .zc-speaker__list p:last-child{margin-bottom:0}
    .zc-speaker__list .marker{color:var(--zc-ink);font-weight:700;margin-right:4px}
    .zc-speaker__list b{color:var(--zc-accent);font-weight:700}
    .zc-speaker__list .v{color:var(--zc-violet)}

    /* Кнопка */
    .zc-speaker__btn{
      display:flex;align-items:center;justify-content:center;
      align-self:flex-start;
      width:clamp(260px,40%,336px);
      max-width:100%;
      min-height:55px;
      margin-top:clamp(6px,1vw,10px);
      padding:0 24px;
      background:#141414;
      color:#fff;
      font-weight:700;
      font-size:clamp(13px,1.1vw,16px);
      text-transform:uppercase;
      text-decoration:none;
      border-radius:10px;
      line-height:1.4;
      text-align:center;
      transition:transform .3s ease, box-shadow .3s ease;
    }
    .zc-speaker__btn:hover{transform:scale(1.04);box-shadow:0 10px 28px rgba(0,0,0,.35)}

    /* h-tablet / v-tablet */
    @media (max-width:959px){
      .zc-speaker__card{grid-template-columns:220px 1fr}
      .zc-speaker__cols{grid-template-columns:1fr}
    }
    /* mobile */
    @media (max-width:639px){
      .zc-speaker__card{grid-template-columns:1fr;justify-items:center;text-align:left;border-radius:14px}
      .zc-speaker__photo{width:min(260px,80%);aspect-ratio:1/1}
      .zc-speaker__body{width:100%}
      .zc-speaker__cols{grid-template-columns:1fr;gap:0}
      .zc-speaker__cols .zc-speaker__list:first-child p:last-child{margin-bottom:14px}
      .zc-speaker__btn{width:100%;border-radius:1000px;min-height:44px}
    }
  </style>

  <div class="zc-speaker__inner">
    <h2 class="zc-speaker__title">Спикер</h2>

    <div class="zc-speaker__card">
      <div class="zc-speaker__photo" role="img" aria-label="Фото спикера"></div>

      <div class="zc-speaker__body">
        <h3 class="zc-speaker__name"><strong>Зайцева Ксения</strong></h3>

        <div class="zc-speaker__cols">
          <div class="zc-speaker__list">
            <p><span class="marker">▸</span>Главный методист взрослых курсов университета <b>Зерокодер</b></p>
            <p><span class="marker">▸</span>Эксперт по&nbsp;нейросетям</p>
            <p><span class="marker">▸</span>Руководитель направления <b>Промпт-инжиниринга</b></p>
            <p><span class="marker">▸</span>Создала <b>уникальный курс по Промпт-инжинирингу</b><span class="v">,</span> не&nbsp;имеющий аналогов на&nbsp;российском рынке</p>
            <p><span class="marker">▸</span>Более 10 лет работает в&nbsp;сфере образования, из&nbsp;них свыше 7 лет&nbsp;— в&nbsp;создании образовательных продуктов для аудитории от&nbsp;10 до&nbsp;55+ лет</p>
            <p><span class="marker">▸</span>Совмещает руководство детским направлением с&nbsp;позицией главного методиста по&nbsp;взрослым курсам. За&nbsp;2 года её&nbsp;программы прошли более 8000 студентов</p>
            <p><span class="marker">▸</span>Регулярно выступает на&nbsp;крупных вебинарах по&nbsp;нейросетям, в&nbsp;том числе с&nbsp;аудиторией более 2000 человек</p>
          </div>
          <div class="zc-speaker__list">
            <p><span class="marker">▸</span>С&nbsp;момента появления технологии успешно продаёт видео, сгенерированные нейросетями. Первое видео продала за&nbsp;3000 рублей за&nbsp;минуту ролика</p>
            <p><span class="marker">▸</span>Почти 3 года ежедневно использует нейросети в&nbsp;работе и&nbsp;быту: от&nbsp;генерации контента до&nbsp;автоматизации задач. Реализует проекты на&nbsp;базе no-code решений и&nbsp;Python</p>
            <p><span class="marker">▸</span>Создала свыше 10 000 изображений и&nbsp;сотни видеороликов с&nbsp;помощью ИИ</p>
            <p><span class="marker">▸</span>Имеет 10-летний опыт видеомонтажа: начинала с <b>Pinnacle Studio, сейчас работает в&nbsp;CapCut и&nbsp;DaVinci Resolve</b></p>
            <p><span class="marker">▸</span>Монтировала обучающие видео на&nbsp;испанском, португальском и&nbsp;индонезийском языках для Яндекс Практикума, применяя ИИ-озвучку</p>
            <p><span class="marker">▸</span>Перевела более 20 видео на&nbsp;английский язык с&nbsp;помощью нейросетей для проекта в&nbsp;Иннополисе</p>
            <p><span class="marker">▸</span>Провела более 100 вебинаров и&nbsp;онлайн-уроков</p>
          </div>
        </div>

        <a class="zc-speaker__btn" href="#tariff">Посетить урок</a>
      </div>
    </div>
  </div>
</section>`
  },
  {
    id: 'webinar-agenda',
    category: 'webinar',
    name: 'Что будет на вебинаре',
    meta: 'программа · без JS',
    html: `<!-- ============================================================
  Блок: Что будет на вебинаре (программа)
  Источник: Tilda T396 rec2141731451 — пересобран в нативный flex/grid, GC-ready, без Tilda-скриптов.
  Композиция 1-в-1: слева оранжевая колонка (буллет 80/20 + обещание + фото),
  справа светлая карточка с пунктами «Все на понятных примерах» / «А еще» + кнопка.
  Самодостаточный (scoped .zc-webinar). Тексты и цвета — из оригинала.
============================================================ -->
<section class="zc-webinar">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    .zc-webinar{
      --zc-bg:#141414;
      --zc-accent:#db7856;       /* Claude-оранжевый */
      --zc-card:#f0eee6;
      --zc-chip:#e9e7dd;
      --zc-ink:#222222;
      background:var(--zc-bg);
      padding:clamp(24px,4vw,60px) clamp(16px,4vw,40px) clamp(40px,6vw,100px);
      font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      box-sizing:border-box;
    }
    .zc-webinar *{box-sizing:border-box}
    .zc-webinar__inner{max-width:1200px;margin:0 auto}

    /* Оболочка-карточка (оранжевая) */
    .zc-webinar__shell{
      background:var(--zc-accent);
      border-radius:20px;
      padding:clamp(20px,2.6vw,30px);
    }
    .zc-webinar__title{
      margin:0 0 clamp(18px,2.5vw,30px);
      color:#fff;
      font-weight:700;
      font-size:clamp(24px,4.6vw,55px);
      line-height:1;
      letter-spacing:-.02em;
    }

    /* Сетка: левая колонка + правая карточка */
    .zc-webinar__grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:clamp(20px,2.6vw,40px);
      align-items:start;
    }

    /* Левая колонка */
    .zc-webinar__left{display:flex;flex-direction:column;gap:clamp(16px,2vw,24px)}
    .zc-webinar__hl{
      margin:0;
      display:inline-block;
      background:var(--zc-accent);
      color:#fff;
      font-weight:700;
      font-size:clamp(16px,1.7vw,22px);
      line-height:1.25;
      filter:brightness(.92);
      padding:6px 0;
    }
    .zc-webinar__lead{
      margin:0;
      color:#fff;
      font-weight:700;
      font-size:clamp(15px,1.6vw,22px);
      line-height:1.35;
    }
    .zc-webinar__photo{
      width:100%;
      aspect-ratio:477/360;
      border-radius:14px;
      background:#e9e7dd url('https://static.tildacdn.com/tild3030-6334-4334-b337-356363343264/photo.jpg') center / cover no-repeat;
      margin-top:auto;
    }

    /* Правая светлая карточка */
    .zc-webinar__right{
      background:var(--zc-card);
      border-radius:15px;
      padding:clamp(18px,2.4vw,30px);
      display:flex;
      flex-direction:column;
      gap:clamp(8px,1vw,10px);
    }
    .zc-webinar__sub{
      margin:0 0 4px;
      color:var(--zc-bg);
      font-weight:700;
      font-size:clamp(16px,1.7vw,22px);
      line-height:1.1;
      letter-spacing:-.01em;
    }
    .zc-webinar__sub + .zc-webinar__sub{margin-top:clamp(10px,1.4vw,18px)}

    /* Плашка-пункт */
    .zc-webinar__item{
      display:flex;
      align-items:flex-start;
      gap:12px;
      border-radius:10px;
      padding:10px 15px;
      color:var(--zc-ink);
      font-weight:600;
      font-size:clamp(13px,1vw,15px);
      line-height:1.3;
    }
    .zc-webinar__item--accent{background:var(--zc-accent);color:#fff}
    .zc-webinar__item--chip{background:var(--zc-chip)}
    .zc-webinar__item::before{
      content:"";
      flex:0 0 auto;
      width:14px;height:14px;
      margin-top:3px;
      border-radius:3px;
      background:currentColor;
      clip-path:polygon(15% 0, 100% 50%, 15% 100%, 15% 65%, 60% 50%, 15% 35%);
      opacity:.85;
    }
    .zc-webinar__item--chip::before{background:var(--zc-accent);opacity:1}

    /* Кнопка */
    .zc-webinar__btn{
      display:flex;align-items:center;justify-content:center;
      width:100%;
      min-height:55px;
      margin-top:clamp(8px,1.2vw,14px);
      padding:0 24px;
      background:var(--zc-bg);
      color:#fff;
      font-weight:700;
      font-size:clamp(13px,1.1vw,15px);
      letter-spacing:.3px;
      text-transform:uppercase;
      text-decoration:none;
      border-radius:10px;
      line-height:1.4;
      text-align:center;
      transition:transform .3s ease, box-shadow .3s ease;
    }
    .zc-webinar__btn:hover{transform:scale(1.04);box-shadow:0 10px 28px rgba(0,0,0,.35)}

    /* h-tablet / v-tablet — схлопываем в одну колонку */
    @media (max-width:959px){
      .zc-webinar__grid{grid-template-columns:1fr;gap:clamp(18px,3vw,28px)}
      .zc-webinar__photo{aspect-ratio:477/300;margin-top:0}
    }
    /* mobile */
    @media (max-width:639px){
      .zc-webinar__shell{border-radius:16px}
      .zc-webinar__photo{aspect-ratio:3/2}
      .zc-webinar__btn{border-radius:1000px;min-height:48px}
    }
  </style>

  <div class="zc-webinar__inner">
    <div class="zc-webinar__shell">
      <h2 class="zc-webinar__title">Что будет на&nbsp;вебинаре:</h2>

      <div class="zc-webinar__grid">
        <!-- Левая колонка -->
        <div class="zc-webinar__left">
          <p class="zc-webinar__hl">80% практики и&nbsp;демонстрации результата / 20% самой важной теории</p>
          <p class="zc-webinar__lead">Обещаем: мы&nbsp;«на&nbsp;понятном» объясним и&nbsp;покажем что из&nbsp;себя представляет вайбкодинг на&nbsp;хайповом Claude Code и&nbsp;как обычному «не&nbsp;технарю» без стресса и&nbsp;страданий начать вайб-кодить!</p>
          <div class="zc-webinar__photo" role="img" aria-label="Демонстрация вайбкодинга"></div>
        </div>

        <!-- Правая карточка -->
        <div class="zc-webinar__right">
          <h3 class="zc-webinar__sub">Все на понятных примерах:</h3>
          <div class="zc-webinar__item zc-webinar__item--accent">Разработаем красивый, продающий сайт: 0 понимания кода, только наши запросы на&nbsp;русском языке! 100% убедишься&nbsp;— с&nbsp;этим справится любой!</div>
          <div class="zc-webinar__item zc-webinar__item--accent">Покажем решение, которое навайбкодили для себя буквально за&nbsp;час и&nbsp;которое заменило нам штат презентологов и&nbsp;экономит более 300 т.р. в&nbsp;месяц!</div>

          <h3 class="zc-webinar__sub">А еще:</h3>
          <div class="zc-webinar__item zc-webinar__item--chip">Сломаем барьер, который мешает большинству людей даже попробовать вайбкодинг!</div>
          <div class="zc-webinar__item zc-webinar__item--chip">Покажем живые примеры проектов, созданных без единого разработчика&nbsp;— для маркетолога, предпринимателя, дизайнера, продюсера.</div>
          <div class="zc-webinar__item zc-webinar__item--chip">Покажем Claude Code изнутри&nbsp;— как он&nbsp;выглядит, как с&nbsp;ним говорить и&nbsp;почему даже человек без технического бэкграунда справится с&nbsp;первого раза.</div>
          <div class="zc-webinar__item zc-webinar__item--chip">Ты&nbsp;поймёшь, как использовать вайбкодинг в&nbsp;реальной жизни: для лендингов, проектов, рабочих задач, упаковки услуг, быстрых MVP и&nbsp;автоматизации рутины.</div>

          <a class="zc-webinar__btn" href="#tariff">ПРИСОЕДИНИТЬСЯ</a>
        </div>
      </div>
    </div>
  </div>
</section>`
  },
  {
    id: 'target-audience',
    category: 'audience',
    name: 'Кому стоит быть',
    meta: '5 карточек ЦА',
    html: `<!-- ============================================================
  Блок: Кому точно стоит быть (целевая аудитория)
  Источник: Tilda T396 rec2141949971 — пересобран в нативный grid, GC-ready, без Tilda-скриптов.
  Композиция 1-в-1: заголовок по центру + 5 карточек (3 в ряд / 2 в ряд),
  у каждой картинка-шапка, оранжевый подзаголовок и описание.
  Самодостаточный (scoped .zc-audience). Тексты и цвета — из оригинала.
============================================================ -->
<section class="zc-audience">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    .zc-audience{
      --zc-bg:#141414;
      --zc-shell:#2c2c2c;
      --zc-card:#faf9f5;
      --zc-accent:#db7856;       /* Claude-оранжевый */
      --zc-ink:#222222;
      background:var(--zc-bg);
      padding:clamp(24px,4vw,60px) clamp(16px,4vw,40px) clamp(40px,6vw,80px);
      font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      box-sizing:border-box;
    }
    .zc-audience *{box-sizing:border-box}
    .zc-audience__inner{max-width:1200px;margin:0 auto}

    /* Оболочка-карточка (тёмно-серая) */
    .zc-audience__shell{
      background:var(--zc-shell);
      border-radius:20px;
      padding:clamp(20px,2.6vw,30px);
    }
    .zc-audience__title{
      margin:0 0 clamp(20px,3vw,40px);
      color:#fff;
      font-weight:700;
      font-size:clamp(24px,4.6vw,55px);
      line-height:1.05;
      letter-spacing:-.01em;
      text-align:center;
    }

    /* Сетка карточек: 3 в ряд */
    .zc-audience__grid{
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:clamp(16px,2vw,20px);
    }

    /* Карточка */
    .zc-audience__card{
      display:flex;
      flex-direction:column;
      gap:clamp(14px,1.6vw,20px);
      background:var(--zc-card);
      border-radius:15px;
      padding:clamp(18px,2vw,30px);
    }
    .zc-audience__img{
      width:100%;
      aspect-ratio:291/160;
      border-radius:10px;
      background:#ffffff center / cover no-repeat;
    }
    .zc-audience__cap{margin:0;display:flex;flex-direction:column;gap:10px}
    .zc-audience__role{
      margin:0;
      color:var(--zc-accent);
      font-weight:600;
      font-size:clamp(16px,1.5vw,20px);
      line-height:1.2;
    }
    .zc-audience__desc{
      margin:0;
      color:var(--zc-ink);
      font-weight:600;
      font-size:clamp(13px,1vw,15px);
      line-height:1.3;
    }

    /* h-tablet / v-tablet — 2 колонки, чтобы не было тесноты, потом 1 */
    @media (max-width:959px){
      .zc-audience__grid{grid-template-columns:repeat(2,1fr)}
      .zc-audience__img{aspect-ratio:2/1}
    }
    @media (max-width:639px){
      .zc-audience__shell{border-radius:16px}
      .zc-audience__grid{grid-template-columns:1fr}
      .zc-audience__img{aspect-ratio:3/2}
    }
  </style>

  <div class="zc-audience__inner">
    <div class="zc-audience__shell">
      <h2 class="zc-audience__title">КОМУ ТОЧНО СТОИТ БЫТЬ?</h2>

      <div class="zc-audience__grid">
        <!-- 1 -->
        <article class="zc-audience__card">
          <div class="zc-audience__img" style="background-image:url('https://static.tildacdn.com/tild3731-6638-4630-a265-646633653663/0_0_6.jpeg')" role="img" aria-label="Маркетолог"></div>
          <div class="zc-audience__cap">
            <h3 class="zc-audience__role">Маркетологу и&nbsp;SMM-специалисту</h3>
            <p class="zc-audience__desc">Ты&nbsp;давно хочешь делать нестандартные лендинги под каждую кампанию&nbsp;— но&nbsp;упираешься в&nbsp;шаблоны конструкторов или ждёшь разработчика. После эфира будешь собирать промо-страницы сам: быстро, с&nbsp;уникальным дизайном, без зависимостей.</p>
          </div>
        </article>

        <!-- 2 -->
        <article class="zc-audience__card">
          <div class="zc-audience__img" style="background-image:url('https://static.tildacdn.com/tild6130-6463-4332-b538-623464303536/0_2_10.jpeg')" role="img" aria-label="Предприниматель"></div>
          <div class="zc-audience__cap">
            <h3 class="zc-audience__role">Предпринимателю и&nbsp;фрилансеру</h3>
            <p class="zc-audience__desc">Устал платить за&nbsp;лендинги, ждать подрядчиков и&nbsp;не&nbsp;понимать, что там вообще происходит? Покажем, как собрать MVP или страницу под новый продукт за&nbsp;вечер&nbsp;— самому, без разработчика и&nbsp;без бюджета на&nbsp;старте.</p>
          </div>
        </article>

        <!-- 3 -->
        <article class="zc-audience__card">
          <div class="zc-audience__img" style="background-image:url('https://static.tildacdn.com/tild3166-3333-4638-a166-303732643462/0_0_8.jpeg')" role="img" aria-label="Дизайнер"></div>
          <div class="zc-audience__cap">
            <h3 class="zc-audience__role">Дизайнеру</h3>
            <p class="zc-audience__desc">Твои идеи сильнее любого шаблона&nbsp;— но&nbsp;перевести их&nbsp;в&nbsp;живой сайт без компромиссов пока не&nbsp;получается. Научишься делать именно то, что придумал: без кода, без шаблонных ограничений, с&nbsp;результатом, который можно сразу показать клиенту.</p>
          </div>
        </article>

        <!-- 4 -->
        <article class="zc-audience__card">
          <div class="zc-audience__img" style="background-image:url('https://static.tildacdn.com/tild6635-3262-4833-b136-613335626132/0_3_3.jpeg')" role="img" aria-label="Продюсер онлайн-школы"></div>
          <div class="zc-audience__cap">
            <h3 class="zc-audience__role">Продюсеру онлайн-школы и&nbsp;эдтех-специалисту</h3>
            <p class="zc-audience__desc">Постоянно согласовываешь лендинги и&nbsp;промо-страницы с&nbsp;командой, пока идея ещё горячая? Покажем, как делать рабочий прототип самому&nbsp;— сегодня, за&nbsp;один вечер, не&nbsp;дожидаясь никого.</p>
          </div>
        </article>

        <!-- 5 -->
        <article class="zc-audience__card">
          <div class="zc-audience__img" style="background-image:url('https://static.tildacdn.com/tild6633-3632-4933-b962-613731653162/0_0_7.jpeg')" role="img" aria-label="Всем интересующимся вайбкодингом"></div>
          <div class="zc-audience__cap">
            <h3 class="zc-audience__role">Всем, кто слышал про вайбкодинг, но&nbsp;думает «это не&nbsp;для меня»</h3>
            <p class="zc-audience__desc">Именно для тебя. Никакого кода, никакого технического бэкграунда&nbsp;— только ты&nbsp;и&nbsp;ИИ. Главная цель этого эфира&nbsp;— чтобы ты&nbsp;вышел с&nbsp;первым собственным сайтом и&nbsp;мыслью «оказывается, это просто».</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</section>`
  },
  {
    id: 'hero',
    category: 'hero',
    name: 'Hero — практикум',
    meta: 'обложка · без JS',
    html: `<!-- ============================================================
  Блок: HERO (первый экран практикума по вайбкодингу)
  Источник: Tilda T396 rec2144668501 — пересобран ЗАНОВО в нативный flex/grid,
  GC-ready, без Tilda-артборда и Tilda-скриптов.
  Композиция: слева тёмная карточка (бейдж даты + светлый блок заголовка +
  плашка-оффер + CTA), справа фото спикера с наезжающей карточкой регалий.
  Декор: повёрнутый стикер-фото поверх фото спикера.
  Самодостаточный (scoped .zc-hero). Тексты/цвета/картинки — из оригинала.
============================================================ -->
<section class="zc-hero">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

    .zc-hero{
      --zc-bg:#141414;
      --zc-dark:#2c2c2c;
      --zc-card:#faf9f5;
      --zc-border:#e9e7dd;
      --zc-ink:#141414;
      --zc-ink2:#2c2c2c;
      --zc-accent:#db7857;       /* Claude-оранжевый */
      --zc-accent2:#db7856;      /* оранжевый кнопки */
      background:var(--zc-bg);
      padding:clamp(16px,3vw,40px) clamp(12px,3vw,40px);
      font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      box-sizing:border-box;
    }
    .zc-hero *{box-sizing:border-box}
    .zc-hero__inner{
      max-width:1200px;
      margin:0 auto;
      display:grid;
      grid-template-columns:minmax(0,1.93fr) minmax(0,1fr); /* 770 : 370 ~ оригинал */
      gap:20px;
      align-items:stretch;
    }

    /* ---------- ЛЕВАЯ КАРТОЧКА ---------- */
    .zc-hero__main{
      display:flex;
      flex-direction:column;
      gap:clamp(18px,2vw,25px);
      background:var(--zc-dark);
      border-radius:20px;
      padding:clamp(18px,2.6vw,40px);
    }

    /* Бейдж-пилюля с датой */
    .zc-hero__badge{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      align-self:flex-start;
      min-height:35px;
      padding:0 18px;
      background:var(--zc-card);
      border:1px solid var(--zc-border);
      border-radius:50px;
      color:#0a1320;
      font-weight:600;
      font-size:clamp(11px,1vw,15px);
      line-height:1.4;
      text-transform:uppercase;
      letter-spacing:.01em;
    }

    /* Светлый блок заголовка */
    .zc-hero__titlecard{
      background:var(--zc-card);
      border-radius:20px;
      padding:clamp(18px,2.4vw,30px);
      display:flex;
      flex-direction:column;
      gap:8px;
      align-items:flex-start;
    }
    .zc-hero__chip{
      display:inline-flex;
      background:var(--zc-dark);
      border-radius:12px;
      padding:4px 10px;
      color:var(--zc-accent);
      font-weight:600;
      font-size:clamp(22px,4vw,45px);
      line-height:1.05;
      text-transform:uppercase;
      white-space:nowrap;
    }
    .zc-hero__titletail{
      margin:6px 0 0;
      color:var(--zc-ink2);
      font-weight:600;
      font-size:clamp(20px,3.6vw,45px);
      line-height:1.05;
      text-transform:uppercase;
    }

    /* Плашка-оффер */
    .zc-hero__offer{
      display:flex;
      align-items:center;
      gap:20px;
      background:var(--zc-card);
      border-radius:15px;
      padding:20px 25px;
    }
    .zc-hero__offer-icon{
      flex:0 0 auto;
      width:clamp(18px,2vw,24px);
      height:auto;
    }
    .zc-hero__offer-text{
      margin:0;
      color:#141413;
      font-weight:500;
      font-size:clamp(13px,1.1vw,15px);
      line-height:1.3;
    }

    /* CTA */
    .zc-hero__cta{
      display:flex;
      align-items:center;
      justify-content:center;
      align-self:flex-start;
      width:clamp(240px,55%,300px);
      max-width:100%;
      min-height:55px;
      padding:0 24px;
      background:var(--zc-accent2);
      color:#fff;
      font-weight:700;
      font-size:clamp(13px,1.1vw,15px);
      letter-spacing:-.2px;
      text-transform:uppercase;
      text-decoration:none;
      text-align:center;
      border-radius:10px;
      line-height:1.4;
      transition:transform .3s ease, box-shadow .3s ease;
    }
    .zc-hero__cta:hover{transform:scale(1.05);box-shadow:0 12px 30px rgba(219,120,86,.4)}

    /* ---------- ПРАВАЯ КОЛОНКА: ФОТО + КАРТОЧКА СПИКЕРА ---------- */
    .zc-hero__aside{
      position:relative;
      display:flex;
      flex-direction:column;
      min-width:0;
    }
    .zc-hero__photo{
      width:100%;
      flex:1 1 auto;
      min-height:clamp(360px,42vw,594px);
      border-radius:20px;
      background:var(--zc-border) url('https://static.tildacdn.com/tild3431-6431-4830-b965-653333303333/Slide_16_9_-_1.jpeg') 50% 0 / cover no-repeat;
    }
    /* Карточка регалий — наезжает снизу на фото */
    .zc-hero__speaker{
      position:absolute;
      left:10px;
      right:10px;
      bottom:0;
      background:var(--zc-card);
      border-radius:15px;
      padding:15px;
      display:flex;
      flex-direction:column;
      gap:6px;
    }
    .zc-hero__speaker-name{
      margin:0;
      color:var(--zc-ink);
      font-weight:600;
      font-size:clamp(16px,1.6vw,20px);
      line-height:1.3;
    }
    .zc-hero__speaker-role{
      margin:0;
      color:var(--zc-accent);
      font-weight:500;
      font-size:clamp(13px,1.1vw,16px);
      line-height:1.35;
    }
    .zc-hero__speaker-list{
      margin:8px 0 0;
      padding:0 0 0 18px;
      color:var(--zc-ink);
      font-weight:500;
      font-size:clamp(11px,.95vw,12px);
      line-height:1.35;
    }
    .zc-hero__speaker-list li{margin:0 0 3px}
    .zc-hero__speaker-list li:last-child{margin-bottom:0}

    /* Декор-стикер (повёрнутое фото) поверх */
    .zc-hero__sticker{
      position:absolute;
      top:8%;
      right:-2%;
      width:clamp(60px,9vw,104px);
      height:auto;
      transform:rotate(16deg);
      pointer-events:none;
      z-index:2;
      filter:drop-shadow(0 8px 18px rgba(0,0,0,.35));
    }

    /* ---------- АДАПТИВ ---------- */
    /* h-tablet / v-tablet: колонки в стопку */
    @media (max-width:959px){
      .zc-hero__inner{grid-template-columns:1fr;gap:20px}
      .zc-hero__photo{min-height:clamp(320px,55vw,520px)}
      /* стикер уводим внутрь, чтобы не вылезал за вьюпорт */
      .zc-hero__sticker{right:2%;top:4%}
    }
    /* mobile */
    @media (max-width:639px){
      .zc-hero__main{gap:16px;border-radius:14px}
      .zc-hero__titlecard{border-radius:14px}
      .zc-hero__offer{flex-direction:column;align-items:flex-start;gap:10px;padding:18px}
      .zc-hero__cta{width:100%}
      .zc-hero__photo{min-height:300px;border-radius:14px}
      .zc-hero__speaker{position:static;margin-top:10px;left:auto;right:auto;border-radius:14px}
      .zc-hero__sticker{width:54px;top:auto;bottom:30%;right:6%}
    }
  </style>

  <div class="zc-hero__inner">

    <!-- Левая карточка -->
    <div class="zc-hero__main">
      <span class="zc-hero__badge">{DATETIME} в&nbsp;13:00мск</span>

      <div class="zc-hero__titlecard">
        <span class="zc-hero__chip">Первый практикум</span>
        <span class="zc-hero__chip">по&nbsp;вайбкодингу</span>
        <p class="zc-hero__titletail">на&nbsp;Claude&nbsp;Code для всех, кто «не&nbsp;технарь»!</p>
      </div>

      <div class="zc-hero__offer">
        <img class="zc-hero__offer-icon"
             src="https://static.tildacdn.com/tild3830-3133-4138-a339-626266353464/noroot.png"
             alt="">
        <p class="zc-hero__offer-text"><strong>Обещаем: за&nbsp;2 часа переведем тебя из&nbsp;точки «Это точно не&nbsp;для меня» в&nbsp;точку «Я&nbsp;тоже могу вайб-кодить!»</strong></p>
      </div>

      <a class="zc-hero__cta" href="#tariff">УЧАСТВОВАТЬ</a>
    </div>

    <!-- Правая колонка: фото + карточка спикера + стикер -->
    <div class="zc-hero__aside">
      <div class="zc-hero__photo" role="img" aria-label="Фото спикера"></div>

      <img class="zc-hero__sticker"
           src="https://static.tildacdn.com/tild6338-3233-4064-a336-616330343062/photo.png"
           alt="">

      <div class="zc-hero__speaker">
        <p class="zc-hero__speaker-name"><strong>Ксения Зайцева</strong></p>
        <p class="zc-hero__speaker-role"><strong>Спикер</strong></p>
        <ul class="zc-hero__speaker-list">
          <li>Главный методист взрослых курсов университета Зерокодер</li>
          <li>Более 10 лет работает в&nbsp;сфере образования</li>
          <li>Эксперт по&nbsp;нейросетям</li>
        </ul>
      </div>
    </div>

  </div>
</section>`
  },
  {
    id: 'about-us',
    category: 'about',
    name: 'О нас (7 секций)',
    meta: 'статистика + рейтинги · без JS',
    html: `<!-- ============================================================
  Блок: О НАС (about-us)
  Источник: Tilda Zero Block (T396) rec2141972291…2141972351 — 7 секций-артбордов,
  пересобраны в нативную адаптивную flex/grid-вёрстку, GC-ready, без Tilda-скриптов.
  7 секций стопкой внутри одного <section class="zc-about">:
    1. Образование + статистика (тёмный hero, оранжевые карточки + белые цифры)
    2. Исследования по ИИ (оранжевая карточка + текст)
    3. Обучаем бизнес (ряд лого вузов/партнёров)
    4. Обучаем гос.служащих (партнёрство + регионы)
    5. Публикуемся в (ряд лого прессы — статический flex, БЕЗ JS-галереи)
    6. Наши премии и рейтинги (ряд лого премий)
    7. Рейтинги площадок (карточки: лого + звёзды + рейтинг + отзывы)
  Тексты, цифры и цвета — дословно из оригинала. Картинки → Tilda CDN.
============================================================ -->
<section class="zc-about">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    .zc-about{
      --zc-bg:#141414;
      --zc-ink:#faf9f5;
      --zc-orange:#da7756;     /* фирменный оранжевый карточек */
      --zc-navy:#17194c;       /* тёмно-синий текст статистики */
      --zc-card:#ffffff;
      --zc-card-border:#e9e7dd;
      --zc-grey:#323232;
      background:var(--zc-bg);
      font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      box-sizing:border-box;
      padding:clamp(32px,5vw,80px) 0;
    }
    .zc-about *{box-sizing:border-box}
    .zc-about__sec{
      max-width:1240px;
      margin:0 auto;
      padding:0 clamp(16px,3vw,20px) clamp(40px,6vw,80px);
    }
    .zc-about__sec:last-child{padding-bottom:0}
    .zc-about__title{
      margin:0 0 clamp(20px,3vw,40px);
      color:var(--zc-ink);
      font-weight:700;
      font-size:clamp(22px,3.6vw,37px);
      line-height:1.05;
      letter-spacing:-.04em;
      text-transform:uppercase;
    }

    /* ---------- 1. Образование + статистика ---------- */
    .zc-about__edu-grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:clamp(16px,2vw,20px);
      align-items:stretch;
    }
    .zc-card-orange{
      display:flex;
      flex-direction:column;
      gap:clamp(12px,1.6vw,20px);
      background:var(--zc-orange);
      border-radius:12px;
      padding:clamp(16px,2vw,24px);
      color:#fff;
    }
    .zc-card-orange__head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
    }
    .zc-card-orange__head h3{
      margin:0;
      font-size:clamp(16px,1.8vw,22px);
      font-weight:700;
      line-height:1.1;
    }
    .zc-card-orange__logo{
      flex-shrink:0;
      height:clamp(28px,3.4vw,40px);
      width:auto;
      object-fit:contain;
    }
    .zc-logos-row{
      display:flex;
      flex-wrap:wrap;
      gap:clamp(8px,1.4vw,16px);
    }
    .zc-logos-row img{
      flex:1 1 0;
      min-width:0;
      height:clamp(70px,9vw,110px);
      object-fit:contain;
      border-radius:12px;
      background:#fff;
    }
    .zc-stats{
      display:flex;
      flex-direction:column;
      gap:clamp(16px,2vw,20px);
    }
    .zc-stat{
      display:flex;
      align-items:center;
      gap:clamp(12px,1.6vw,20px);
      background:var(--zc-card);
      border:2px solid var(--zc-card-border);
      border-radius:12px;
      padding:clamp(16px,2vw,20px);
    }
    .zc-stat__icon{flex-shrink:0;width:clamp(44px,5vw,72px);height:auto}
    .zc-stat__text{
      margin:0;
      color:var(--zc-navy);
      font-weight:700;
      font-size:clamp(15px,1.6vw,22px);
      line-height:1.1;
    }

    /* ---------- 2. Исследования ---------- */
    .zc-research{
      display:grid;
      grid-template-columns:1fr 1.4fr;
      gap:clamp(20px,3vw,40px);
      align-items:center;
      background:var(--zc-orange);
      border-radius:12px;
      padding:clamp(20px,3vw,40px);
    }
    .zc-research__h{
      margin:0;
      color:#fff;
      font-size:clamp(18px,2.4vw,28px);
      font-weight:700;
      line-height:1.15;
    }
    .zc-research__body p{margin:0 0 14px;color:#fff}
    .zc-research__lead{
      font-size:clamp(15px,1.5vw,18px);
      font-weight:700;
      line-height:1.25;
    }
    .zc-research__text{
      font-size:clamp(13px,1.1vw,15px);
      line-height:1.45;
      font-weight:400;
    }
    .zc-research__text b{font-weight:700}

    /* ---------- 3 + 4. Бизнес / Госслужащие ---------- */
    .zc-two-col{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:clamp(20px,3vw,40px);
      align-items:start;
    }
    .zc-block-orange-text{
      background:var(--zc-orange);
      border-radius:12px;
      padding:clamp(18px,2.4vw,28px);
      color:#fff;
    }
    .zc-block-orange-text p{margin:0 0 12px;font-size:clamp(13px,1.1vw,15px);line-height:1.45}
    .zc-block-orange-text p:last-child{margin-bottom:0}
    .zc-block-orange-text b{font-weight:700}
    .zc-gov-regions{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:clamp(12px,2vw,24px);
      margin-top:14px;
    }
    .zc-gov-regions p{font-size:clamp(12px,1vw,15px);line-height:1.4}

    /* ---------- 5. Публикуемся в (лого прессы — статический ряд) ---------- */
    .zc-press-row{
      display:flex;
      flex-wrap:wrap;
      justify-content:center;
      align-items:center;
      gap:clamp(12px,2vw,20px);
    }
    .zc-press-row img{
      flex:0 1 auto;
      width:clamp(140px,18vw,216px);
      height:clamp(80px,10vw,110px);
      object-fit:contain;
      background:#fff;
      border:1px solid #ececec;
      border-radius:12px;
      padding:10px;
    }

    /* ---------- 6. Премии (лого) ---------- */
    .zc-awards-row{
      display:flex;
      flex-wrap:wrap;
      justify-content:center;
      gap:clamp(12px,2vw,20px);
    }
    .zc-awards-row img{
      flex:0 1 auto;
      width:clamp(150px,20vw,216px);
      height:clamp(85px,11vw,110px);
      object-fit:contain;
      /* В оригинале (Tilda rec2141972341) бейджи лежат на тёмном фоне секции #141414
         без белой подложки. Светлые лого на #fff сливались — возвращаем тёмный фон. */
      background:var(--zc-bg);
      border:none;
      border-radius:12px;
      padding:10px;
    }

    /* ---------- 7. Рейтинги площадок ---------- */
    .zc-ratings{
      display:grid;
      grid-template-columns:repeat(5,1fr);
      gap:clamp(12px,1.6vw,20px);
    }
    .zc-rating{
      display:flex;
      flex-direction:column;
      gap:8px;
      background:#fff;
      border-radius:10px;
      padding:clamp(14px,1.6vw,18px);
      text-align:center;
      align-items:center;
    }
    .zc-rating__logo{
      height:clamp(28px,3vw,40px);
      width:auto;
      max-width:100%;
      object-fit:contain;
    }
    .zc-rating__stars{color:#ffb400;font-size:clamp(13px,1.3vw,16px);letter-spacing:2px;line-height:1}
    .zc-rating__num{margin:0;color:var(--zc-grey);font-size:clamp(12px,1.1vw,14px);font-weight:700;line-height:1.3}
    .zc-rating__count{margin:0;color:var(--zc-grey);font-size:clamp(11px,1vw,13px);font-weight:400;line-height:1.3}

    /* ================= ADAPTIVE ================= */
    /* h-tablet / v-tablet — схлопываем мультиколонки заранее (<=959) */
    @media (max-width:959px){
      .zc-about__edu-grid{grid-template-columns:1fr}
      .zc-research{grid-template-columns:1fr;gap:20px}
      .zc-two-col{grid-template-columns:1fr}
      .zc-ratings{grid-template-columns:repeat(3,1fr)}
    }
    /* mobile */
    @media (max-width:639px){
      .zc-card-orange__head{flex-direction:column;align-items:flex-start;gap:10px}
      .zc-logos-row img{flex:1 1 40%;height:80px}
      .zc-stat{flex-direction:column;align-items:flex-start;text-align:left}
      .zc-gov-regions{grid-template-columns:1fr;gap:6px}
      .zc-press-row img{width:clamp(120px,42vw,160px)}
      .zc-awards-row img{width:clamp(130px,42vw,170px)}
      .zc-ratings{grid-template-columns:repeat(2,1fr)}
    }
  </style>

  <!-- ===== 1. Образование + статистика ===== -->
  <div class="zc-about__sec">
    <h2 class="zc-about__title">Мы&nbsp;создаем фундаментальное образование в&nbsp;области искусственного интеллекта и&nbsp;разработки</h2>

    <div class="zc-about__edu-grid">
      <!-- левая колонка: лицензия + ряд лого вузов -->
      <div class="zc-card-orange">
        <div class="zc-card-orange__head">
          <h3>Имеем образовательную лицензию и статус Сколково</h3>
          <img class="zc-card-orange__logo" src="https://static.tildacdn.com/tild6361-3763-4534-a239-663636353061/image.png" alt="Сколково" loading="lazy">
        </div>
        <img class="zc-license-img" style="width:100%;border-radius:10px" src="https://static.tildacdn.com/tild6336-3965-4131-b663-356531326436/image.png" alt="Образовательная лицензия" loading="lazy">
      </div>

      <!-- правая колонка: преподаём в вузах -->
      <div class="zc-card-orange">
        <div class="zc-card-orange__head">
          <h3>Преподаем в лучших вузах</h3>
        </div>
        <div class="zc-logos-row">
          <img src="https://static.tildacdn.com/tild3031-3466-4335-b862-363534353266/image_2.png" alt="Вуз-партнёр" loading="lazy">
          <img src="https://static.tildacdn.com/tild3132-3161-4866-a438-646630666165/image-1.png" alt="Вуз-партнёр" loading="lazy">
          <img src="https://static.tildacdn.com/tild3263-6238-4930-b136-633166373666/image-1.png" alt="Вуз-партнёр" loading="lazy">
        </div>
      </div>
    </div>

    <!-- статистика-цифры -->
    <div class="zc-stats" style="margin-top:clamp(16px,2vw,20px)">
      <div class="zc-stat">
        <!-- иконка-сертификат -->
        <svg class="zc-stat__icon" viewBox="0 0 79 79" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#faf9f5" stroke="#141413" stroke-width="2" d="M34.83 5.77c2.4-2.97 6.93-2.97 9.33 0l1.37 1.69c1.49 1.85 3.93 2.64 6.22 2.02l2.13-.56c3.69-.99 7.35 1.67 7.55 5.49l.17 3.23c.12 2.37 1.63 4.45 3.85 5.3l2.02.78c3.57 1.37 4.97 5.67 2.88 8.88l-1.76 2.71c-1.29 1.99-1.29 4.56 0 6.55l1.76 2.71c2.09 3.2.69 7.51-2.88 8.88l-2.02.78c-2.22.85-3.73 2.92-3.85 5.3l-.17 3.23c-.2 3.81-3.86 6.48-7.55 5.49l-2.13-.56c-2.29-.62-4.73.17-6.22 2.02l-1.37 1.69c-2.4 2.97-6.93 2.97-9.33 0l-1.37-1.69c-1.49-1.85-3.93-2.64-6.22-2.02l-2.13.56c-3.69.99-7.35-1.67-7.55-5.49l-.17-3.23c-.12-2.37-1.63-4.45-3.85-5.3l-2.02-.78c-3.57-1.37-4.97-5.67-2.88-8.88l1.76-2.71c1.3-1.99 1.3-4.56 0-6.55l-1.76-2.71c-2.09-3.2-.69-7.51 2.88-8.88l2.02-.78c2.22-.85 3.73-2.93 3.85-5.3l.17-3.23c.2-3.81 3.86-6.48 7.55-5.49l2.13.56c2.29.62 4.73-.17 6.22-2.02z"/><path fill="#da7756" d="M17.66 24.01h2.17V26h-2.17zm0-10.97h2.17v9.72h-2.17z"/></svg>
        <p class="zc-stat__text">Более 10 тыс. выпускников платных образовательных программ</p>
      </div>
      <div class="zc-stat">
        <!-- иконка-кошелёк -->
        <svg class="zc-stat__icon" viewBox="0 0 79 79" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#faf9f5" stroke="#141413" stroke-width="2" d="M35.33 6.05c2.4-2.97 6.93-2.97 9.33 0l1.37 1.69c1.49 1.85 3.93 2.64 6.22 2.02l2.13-.56c3.69-.99 7.35 1.67 7.55 5.49l.17 3.23c.12 2.37 1.63 4.45 3.85 5.3l2.02.78c3.57 1.37 4.97 5.67 2.88 8.88l-1.76 2.71c-1.29 1.99-1.29 4.56 0 6.55l1.76 2.71c2.09 3.2.69 7.51-2.88 8.88l-2.02.78c-2.22.85-3.73 2.92-3.85 5.3l-.17 3.23c-.2 3.81-3.86 6.48-7.55 5.49l-2.13-.56c-2.29-.62-4.73.17-6.22 2.02l-1.37 1.69c-2.4 2.97-6.93 2.97-9.33 0l-1.37-1.69c-1.49-1.85-3.93-2.64-6.22-2.02l-2.13.56c-3.69.99-7.35-1.67-7.55-5.49l-.17-3.23c-.12-2.37-1.63-4.45-3.85-5.3l-2.02-.78c-3.57-1.37-4.97-5.67-2.88-8.88l1.76-2.71c1.3-1.99 1.3-4.56 0-6.55l-1.76-2.71c-2.09-3.2-.69-7.51 2.88-8.88l2.02-.78c2.22-.85 3.73-2.93 3.85-5.3l.17-3.23c.2-3.81 3.86-6.48 7.55-5.49l2.13.56c2.29.62 4.73-.17 6.22-2.02z"/><path fill="#da7756" d="M28.75 41.43c0 1.85 0 3.7 0 5.55a4.6 4.6 0 0 0 2.2 3.21 19 19 0 0 0 18.9 0 4.6 4.6 0 0 0 2.2-3.21c0-1.85 0-3.7 0-5.55-7.67 3.24-15.33 3.24-23 0z"/></svg>
        <p class="zc-stat__text">Заказов на&nbsp;300 млн ₽ прошло через наш карьерный центр</p>
      </div>
    </div>
  </div>

  <!-- ===== 2. Исследования ===== -->
  <div class="zc-about__sec">
    <h2 class="zc-about__title">Проводим исследования по&nbsp;ИИ совместно с&nbsp;лучшими вузами страны</h2>
    <div class="zc-research">
      <h3 class="zc-research__h">Работа с&nbsp;умом: каков потенциал генеративного&nbsp;ИИ для роста производительности в&nbsp;России</h3>
      <div class="zc-research__body">
        <p class="zc-research__text">Потенциальная ежегодная экономия от&nbsp;внедрения генеративного&nbsp;ИИ (генИИ, GenAI) в&nbsp;российской экономике может достичь 10,8 трлн рублей к&nbsp;2030 году, при этом ни&nbsp;одна из&nbsp;профессий не&nbsp;подлежит полной автоматизации (максимальный уровень&nbsp;— 85%). GenAI выступает не&nbsp;угрозой, а&nbsp;инструментом трансформации рынка труда&nbsp;— при условии его ответственного и&nbsp;управляемого внедрения. Для устойчивой реализации преимуществ от&nbsp;технологии необходимы инвестиции в&nbsp;переобучение кадров и&nbsp;создание этической нормативной базы. Такие выводы содержатся в&nbsp;исследовании сотрудников Университета Иннополиса, Высшей школы менеджмента СПбГУ, МГУ им.&nbsp;Ломоносова и&nbsp;<b>онлайн-университета Зерокодер.</b></p>
      </div>
    </div>
  </div>

  <!-- ===== 3. Обучаем бизнес ===== -->
  <div class="zc-about__sec">
    <h2 class="zc-about__title">Обучаем бизнес</h2>
    <div class="zc-logos-row">
      <img src="https://static.tildacdn.com/tild6264-6235-4261-b438-363638343137/image.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild3337-3531-4664-a565-346437636662/image-1.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild3366-3961-4330-b863-333338363565/image-2.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild3731-6632-4061-a661-356433323139/image-3.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild6135-6535-4738-a361-333032323166/image-4.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild3762-3561-4362-b431-383037663539/image-5.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild6136-6636-4662-a431-363230323631/image-6.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild3639-3863-4937-a432-346434636137/image-7.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild6635-6566-4234-a365-353235616661/image.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild6465-6338-4364-b236-393738356266/image-1.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild6562-3933-4239-b064-393133653966/image-2.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild3339-6630-4533-a263-646339643865/image-3.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild3766-3565-4162-b339-303266363266/image-4.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild6166-3761-4532-b035-323362333064/image-5.png" alt="Клиент-компания" loading="lazy">
      <img src="https://static.tildacdn.com/tild3761-6134-4938-a130-643430366336/image-7.png" alt="Клиент-компания" loading="lazy">
    </div>
  </div>

  <!-- ===== 4. Обучаем гос.служащих ===== -->
  <div class="zc-about__sec">
    <h2 class="zc-about__title">Обучаем гос.служащих</h2>
    <div class="zc-block-orange-text">
      <p style="font-weight:700;font-size:clamp(15px,1.5vw,18px)">Являемся образовательным партнёром проекта «Цифровая прокачка», АНО «Цифровая экономика»</p>
      <p>В&nbsp;партнёрстве был разработан образовательный интенсив «Нейросети в&nbsp;работе государственного служащего» и&nbsp;уже обучено более 350 чиновников таких регионов как: Республика Алтай, Республика Бурятия, Карачаево-Черкесская Республика, Новосибирская область, Ямало-Ненецкий автономный округ.</p>
      <p>Кроме того, <b>мы&nbsp;обучили владению современными нейросетями более 2000 государственных и&nbsp;муниципальных служащих</b> в&nbsp;следующих муниципалитетах и&nbsp;регионах:</p>
      <div class="zc-gov-regions">
        <p>— Республика Алтай<br>— Республика Бурятия<br>— Карачаево-Черкессия<br>— Саха (Якутия)</p>
        <p>— Новосибирская область<br>— Кировская область<br>— Оренбургская область<br>— Ямало-Ненецкий автономный округ</p>
      </div>
    </div>
  </div>

  <!-- ===== 5. Публикуемся в (лого прессы — статический ряд, без JS-галереи) ===== -->
  <div class="zc-about__sec">
    <h2 class="zc-about__title">Публикуемся в</h2>
    <div class="zc-press-row">
      <img src="https://static.tildacdn.com/tild6366-3439-4861-a363-313436373761/image.png" alt="Издание прессы" loading="lazy">
      <img src="https://static.tildacdn.com/tild3239-6435-4131-b661-333037383362/Group_3.png" alt="Издание прессы" loading="lazy">
      <img src="https://static.tildacdn.com/tild3737-3938-4963-a431-343062663733/Group_2.png" alt="Издание прессы" loading="lazy">
      <img src="https://static.tildacdn.com/tild6335-6363-4363-b334-373165333966/image-1.png" alt="Издание прессы" loading="lazy">
      <img src="https://static.tildacdn.com/tild6435-3364-4662-a563-656530343837/image-2.png" alt="Издание прессы" loading="lazy">
    </div>
  </div>

  <!-- ===== 6. Наши премии и рейтинги (лого) ===== -->
  <div class="zc-about__sec">
    <h2 class="zc-about__title">Наши премии и&nbsp;рейтинги</h2>
    <div class="zc-awards-row">
      <img src="https://static.tildacdn.com/tild3133-6134-4566-a362-616139643935/photo_2026-03-10_163.jpeg" alt="Премия / рейтинг" loading="lazy">
      <img src="https://static.tildacdn.com/tild6263-3030-4437-b766-383666656537/1.png" alt="Премия / рейтинг" loading="lazy">
      <img src="https://static.tildacdn.com/tild3162-3863-4734-a637-353561616131/Frame_591.png" alt="Премия / рейтинг" loading="lazy">
      <img src="https://static.tildacdn.com/tild3539-6337-4231-b435-303631313165/Frame_589.png" alt="Премия / рейтинг" loading="lazy">
    </div>
  </div>

  <!-- ===== 7. Рейтинги площадок (карточки: лого + звёзды + рейтинг + отзывы) ===== -->
  <div class="zc-about__sec">
    <div class="zc-ratings">
      <div class="zc-rating">
        <img class="zc-rating__logo" src="https://static.tildacdn.com/tild3936-3566-4464-b738-323161326231/otzovik-logo.png" alt="Отзовик" loading="lazy">
        <span class="zc-rating__stars">★★★★★</span>
        <p class="zc-rating__num">Рейтинг: 4.7</p>
        <p class="zc-rating__count">252 отзыва</p>
      </div>
      <div class="zc-rating">
        <img class="zc-rating__logo" src="https://static.tildacdn.com/tild3038-3064-4565-b535-343765346633/logo-svg-5b9ab27b.svg" alt="Площадка отзывов" loading="lazy">
        <span class="zc-rating__stars">★★★★★</span>
        <p class="zc-rating__num">Рейтинг: 4.63</p>
        <p class="zc-rating__count">53 отзыва</p>
      </div>
      <div class="zc-rating">
        <img class="zc-rating__logo" src="https://static.tildacdn.com/tild3232-3639-4132-a137-336138653731/tutortop-logo.svg" alt="Tutortop" loading="lazy">
        <span class="zc-rating__stars">★★★★★</span>
        <p class="zc-rating__num">Рейтинг: 4.7</p>
        <p class="zc-rating__count">89 отзывов</p>
      </div>
      <div class="zc-rating">
        <img class="zc-rating__logo" src="https://static.tildacdn.com/tild6537-3666-4635-b336-376464653032/Banner_-_2024-10-24T.png" alt="Площадка отзывов" loading="lazy">
        <span class="zc-rating__stars">★★★★★</span>
        <p class="zc-rating__num">Рейтинг: 4.6</p>
        <p class="zc-rating__count">37 отзывов</p>
      </div>
      <div class="zc-rating">
        <img class="zc-rating__logo" src="https://static.tildacdn.com/tild6263-3030-4437-b766-383666656537/1.png" alt="Площадка отзывов" loading="lazy">
        <span class="zc-rating__stars">★★★★★</span>
        <p class="zc-rating__num">Рейтинг: 4.9</p>
        <p class="zc-rating__count">9 отзывов</p>
      </div>
    </div>
  </div>
</section>`
  }
];
