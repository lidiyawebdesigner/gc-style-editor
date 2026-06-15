(function () {
  if (document.getElementById('gse-sidebar')) return;

  // ---------- STATE ----------
  let pickerActive = false;
  let hoveredElement = null;
  let selectedElement = null;
  let mirrorToSiblings = false;
  const originalStyles = new WeakMap();
  // Перечислимый набор всех тронутых элементов (WeakMap не итерируется) — источник для persistence.
  const editedElements = new Set();
  let siblingOverlays = [];
  let currentColumnContainer = null;
  let currentForm = null;

  const shadowState = { x: 0, y: 4, blur: 12, color: '#000000', alpha: 20, inset: false };
  const bgState = { mode: 'solid', color: '#ffffff', opacity: 100, gradAngle: 135, gradC1: '#c6ff3a', gradC2: '#7e0fff' };
  const textState = { color: '#000000', opacity: 100 };
  const formState = { font: 'inherit' };

  const FORM_SELECTORS = {
    forms: 'form.lt-form, .lt-form, .lt-normal-form, form.f-form, .modal-form-inner, form.form-block, form.lt-form-block, form[id^="ltForm"]',
    titles: '.f-header, .form-header, .lt-form h1, .lt-form h2, .lt-form h3, .lt-form h4, .form-block h1, .form-block h2, .form-block h3, .form-block h4, .modal-form-inner h1, .modal-form-inner h2, .modal-form-inner h3',
    inputs: 'input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="password"], input[type="url"], input[type="search"], input[type="date"], textarea, select.f-input, input.f-input, .f-input',
    fieldGroups: '.builder-item.part-field, .builder-item.part-button, .builder-item, .field-group, .form-group, .form-field, .field-input, .form-row, .field-text',
    consents: '.global-confirm-checkbox-block, .field-checkbox, .field-confirm, .agreement, .agreement-field, .consent, .checkbox-field, .field-checkbox label, .checkbox label, label.checkbox',
    consentLinks: '.global-confirm-checkbox-block a, .field-checkbox a, .field-confirm a, .agreement a, .consent a',
    buttons: '.f-btn, button[type="submit"], input[type="submit"], .submit-btn, .lt-form .btn, .modal-form-inner button.btn',
    textTargets: 'input:not([type="hidden"]), textarea, select, button, label, .f-btn, .f-input, .f-header, .f-subheader, .f-text, .f-description, .f-name, .form-header, .form-control, h1, h2, h3, h4, h5, h6, p, a'
  };

  const GOOGLE_FONTS = ['Manrope', 'Montserrat', 'Inter', 'Roboto', 'Open Sans'];

  // Служебные элементы GC-редактора (живут в админке, на публичной странице их нет)
  const GC_NOISE_CLASSES = [
    'setting-edit-link', 'add-redesign-subblock', 'sort-item-handler',
    'copy-item-handler', 'delete-item-link', 'add-item-link',
    'common-setting-link', 'form-result-block', 'external-value',
    'fa', 'add-redesign-block', 'remove-redesign-block'
  ];
  const GC_NOISE_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'META', 'TEMPLATE']);
  const GC_NOISE_HIDDEN_INPUT_CLASSES = new Set([
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'utm_term1', 'utm_term2', 'utm_term3', 'alias', 'url_param', 'ym_uid', 'transaction_id'
  ]);

  function isGcNoise(el) {
    if (!el || el.nodeType !== 1) return true;
    if (GC_NOISE_TAGS.has(el.tagName)) return true;
    if (el.tagName === 'INPUT') {
      if (el.type === 'hidden') return true;
      for (const c of el.classList) if (GC_NOISE_HIDDEN_INPUT_CLASSES.has(c)) return true;
    }
    if (el.classList) {
      for (const c of GC_NOISE_CLASSES) if (el.classList.contains(c)) return true;
    }
    if (el.closest && el.closest('.setting-edit-link, .add-redesign-subblock, .sort-item-handler, .copy-item-handler, .delete-item-link, .add-item-link, .common-setting-link, .add-redesign-block')) return true;
    return false;
  }

  const PRESETS = {
    'clean-light': {
      label: 'Чистый минимал',
      styles: {
        background: '#ffffff',
        color: '#1a1a1a',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(24, 17, 34, 0.07)',
        border: '1px solid #f0f0f3'
      }
    },
    'dark-glass': {
      label: 'Тёмное стекло',
      styles: {
        background: 'rgba(24, 17, 34, 0.82)',
        color: '#f0f0f5',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        border: '1px solid rgba(159, 123, 246, 0.18)'
      }
    },
    'brand-violet': {
      label: 'Фиолетовый бренд',
      styles: {
        background: '#9f7bf6',
        color: '#ffffff',
        padding: '32px',
        borderRadius: '18px',
        boxShadow: '0 16px 40px rgba(159, 123, 246, 0.32)',
        border: 'none'
      }
    }
  };

  const SHADOW_PRESETS = {
    'none': { x: 0, y: 0, blur: 0, color: '#000000', alpha: 0, inset: false },
    'soft': { x: 0, y: 4, blur: 12, color: '#000000', alpha: 8, inset: false },
    'medium': { x: 0, y: 8, blur: 24, color: '#000000', alpha: 15, inset: false },
    'deep': { x: 0, y: 20, blur: 48, color: '#000000', alpha: 25, inset: false },
    'lime-glow': { x: 0, y: 0, blur: 32, color: '#c6ff3a', alpha: 40, inset: false }
  };

  // ---------- HELPERS ----------
  function ctrl(label, prop, min, max, value, step, decimal, hint) {
    const stepAttr = step !== undefined ? ` step="${step}"` : '';
    const hintHtml = hint ? ` <small class="gse-hint">${hint}</small>` : '';
    return `
      <div class="gse-control">
        <div class="gse-control-row">
          <span class="gse-control-name">${label}${hintHtml}</span>
          <input type="number" class="gse-num-input" data-num="${prop}" min="${min}" max="${max}" value="${value}"${stepAttr}>
        </div>
        <input type="range" class="gse-range" data-prop="${prop}" min="${min}" max="${max}"${stepAttr} value="${value}">
      </div>
    `;
  }

  // ---------- SIDEBAR HTML ----------
  const sidebar = document.createElement('div');
  sidebar.id = 'gse-sidebar';
  sidebar.innerHTML = `
    <div class="gse-header">
      <div class="gse-title">
        <span class="gse-dot"></span>
        <span>Style Editor</span>
      </div>
      <button class="gse-toggle" type="button" aria-label="Свернуть">›</button>
    </div>
    <div class="gse-restore-notice" hidden></div>
    <div class="gse-tabs">
      <button class="gse-tab gse-active" type="button" data-mode="editor">Редактор</button>
      <button class="gse-tab" type="button" data-mode="library">Библиотека</button>
    </div>
    <div class="gse-body">
      <div class="gse-mode" data-mode="editor">
      <button class="gse-picker-btn" type="button">
        <span class="gse-picker-icon">◎</span>
        <span class="gse-picker-label">Выбрать элемент</span>
      </button>

      <div class="gse-selection" hidden>
        <div class="gse-section-title">Выбрано</div>
        <div class="gse-info">
          <div class="gse-info-row"><span class="gse-info-key">Тип</span><span class="gse-info-val gse-type">—</span></div>
          <div class="gse-info-row"><span class="gse-info-key">Тег</span><span class="gse-info-val gse-tag">—</span></div>
          <div class="gse-info-row"><span class="gse-info-key">ID</span><span class="gse-info-val gse-id">—</span></div>
        </div>
      </div>

      <label class="gse-mirror-wrap" hidden>
        <input type="checkbox" class="gse-mirror-check">
        <span class="gse-mirror-text">
          Применить ко всем <span class="gse-mirror-kind">колонкам</span> в блоке
          <span class="gse-mirror-count">(<span class="gse-mirror-num">0</span>)</span>
        </span>
      </label>

      <div class="gse-controls" hidden>

        <div class="gse-cols-section" hidden>
          <div class="gse-section-title">Колонки</div>
          ${ctrl('Отступ между колонками', 'columnGap', 0, 80, 10, 2)}
        </div>

        <div class="gse-form-section" hidden>
          <div class="gse-section-title gse-section-title-spaced">Форма</div>

          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Шрифт формы</span>
            <select class="gse-form-font gse-form-font-select">
              <option value="inherit">Системный</option>
              <option value="gc-native">Родной шрифт GetCourse (тема лендинга)</option>
              <option value="Manrope" selected>Manrope</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
            </select>
          </div>

          ${ctrl('Размер заголовков', 'formTitleSize', 14, 48, 24, 1)}

          <div class="gse-form-subgroup-title">Поля ввода</div>
          ${ctrl('Ширина полей', 'formInputWidth', 200, 700, 360, 10)}
          <button type="button" class="gse-form-shortcut-btn gse-form-input-fullwidth">Поля на 100%</button>
          ${ctrl('Высота полей', 'formInputHeight', 30, 80, 44, 1)}
          ${ctrl('Размер шрифта в полях', 'formInputFont', 12, 22, 16, 1)}
          ${ctrl('Отступы по бокам', 'formInputPaddingX', 0, 40, 14, 1)}
          ${ctrl('Скругление полей', 'formInputBorderRadius', 0, 30, 8, 1)}
          ${ctrl('Толщина обводки', 'formInputBorderWidth', 0, 6, 1, 1)}
          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Цвет обводки</span>
            <input type="color" class="gse-color gse-form-input-border-color" value="#dddddd">
          </div>
          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Цвет рамки в фокусе</span>
            <input type="color" class="gse-color gse-form-input-focus-color" value="#c6ff3a">
          </div>
          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Цвет текста полей</span>
            <input type="color" class="gse-color gse-form-input-text-color" value="#1f211d">
          </div>
          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Цвет фона полей</span>
            <input type="color" class="gse-color gse-form-input-bg-color" value="#ffffff">
          </div>
          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Цвет подсказки</span>
            <input type="color" class="gse-color gse-form-input-placeholder-color" value="#b7b3b3">
          </div>
          <label class="gse-form-checkbox-row">
            <input type="checkbox" class="gse-form-input-transparent-bg">
            <span>Прозрачный фон полей</span>
          </label>
          <label class="gse-form-checkbox-row">
            <input type="checkbox" class="gse-form-input-autofill-fix" checked>
            <span>Убрать жёлтый автозаполнения Chrome</span>
          </label>
          ${ctrl('Отступ между полями', 'formFieldGap', 0, 40, 16, 1)}

          <div class="gse-form-subgroup-title">Согласие</div>
          ${ctrl('Размер текста согласия', 'formConsentSize', 10, 18, 13, 1)}
          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Цвет ссылки</span>
            <input type="color" class="gse-color gse-form-consent-link-color" value="#db5d44">
          </div>

          <div class="gse-form-subgroup-title">Кнопка</div>
          ${ctrl('Ширина кнопки', 'formBtnWidth', 100, 600, 240, 10)}
          <div class="gse-form-shortcut-row">
            <button type="button" class="gse-form-shortcut-btn gse-form-btn-fullwidth">Кнопка 100%</button>
            <button type="button" class="gse-form-shortcut-btn gse-form-btn-auto">Авто ширина</button>
          </div>
          ${ctrl('Высота кнопки', 'formBtnHeight', 30, 90, 48, 1)}
          ${ctrl('Размер шрифта кнопки', 'formBtnFont', 12, 26, 16, 1)}
          ${ctrl('Скругление кнопки', 'formBtnBorderRadius', 0, 50, 6, 1)}
          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Цвет фона кнопки</span>
            <input type="color" class="gse-color gse-form-btn-bg" value="#4dbee3">
          </div>
          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Цвет текста кнопки</span>
            <input type="color" class="gse-color gse-form-btn-color" value="#ffffff">
          </div>
          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Эффект при наведении</span>
            <select class="gse-form-font gse-form-btn-hover">
              <option value="none">Нет</option>
              <option value="scale">Увеличение</option>
              <option value="lift">Подъём</option>
              <option value="slide">Сдвиг вправо</option>
            </select>
          </div>
          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Область кнопки</span>
            <select class="gse-form-font gse-form-btn-scope">
              <option value="form" selected>Только эта форма</option>
              <option value="global">Все кнопки страницы</option>
            </select>
          </div>
        </div>

        <div class="gse-typography-section" hidden>
          <div class="gse-section-title gse-section-title-spaced">Типографика</div>
          ${ctrl('Размер шрифта', 'fontSize', 10, 96, 16, 1)}

          <div class="gse-control">
            <div class="gse-control-row"><span class="gse-control-name">Жирность</span></div>
            <div class="gse-btn-row gse-fw-row">
              <button type="button" class="gse-mini-btn" data-fw="300">300</button>
              <button type="button" class="gse-mini-btn" data-fw="400">400</button>
              <button type="button" class="gse-mini-btn" data-fw="500">500</button>
              <button type="button" class="gse-mini-btn" data-fw="600">600</button>
              <button type="button" class="gse-mini-btn" data-fw="700">700</button>
              <button type="button" class="gse-mini-btn" data-fw="800">800</button>
            </div>
          </div>

          <div class="gse-control">
            <div class="gse-control-row"><span class="gse-control-name">Регистр</span></div>
            <div class="gse-btn-row gse-tt-row">
              <button type="button" class="gse-mini-btn" data-tt="none" title="Без изменений">Aa</button>
              <button type="button" class="gse-mini-btn" data-tt="uppercase" title="ВСЕ ЗАГЛАВНЫЕ">КАПС</button>
              <button type="button" class="gse-mini-btn" data-tt="lowercase" title="все строчные">aa</button>
            </div>
          </div>

          ${ctrl('Межстрочное', 'lineHeight', 1, 2.5, 1.5, 0.05)}

          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Цвет текста</span>
            <input type="color" class="gse-color gse-text-color" value="#000000">
          </div>
          ${ctrl('Прозрачность текста', 'textOpacity', 0, 100, 100, 1)}
        </div>

        <div class="gse-section-title gse-section-title-spaced">Размеры</div>
        ${ctrl('Ширина', 'width', 0, 1200, 0, 10, false, '0 = auto')}
        ${ctrl('Высота', 'height', 0, 900, 0, 10, false, '0 = auto')}
        ${ctrl('Отступы по бокам', 'paddingX', 0, 120, 0, 2)}
        ${ctrl('Отступы сверху/снизу', 'paddingY', 0, 120, 0, 2)}

        <div class="gse-control">
          <div class="gse-control-row"><span class="gse-control-name">Выравнивание</span></div>
          <div class="gse-btn-row gse-ta-row">
            <button type="button" class="gse-mini-btn" data-ta="left" title="Влево (блок и текст)">⟵</button>
            <button type="button" class="gse-mini-btn" data-ta="center" title="По центру (блок и текст)">⇿</button>
            <button type="button" class="gse-mini-btn" data-ta="right" title="Вправо (блок и текст)">⟶</button>
            <button type="button" class="gse-mini-btn" data-ta="justify" title="По ширине (текст)">☰</button>
          </div>
        </div>

        <div class="gse-section-title gse-section-title-spaced">Оформление</div>

        <div class="gse-control">
          <div class="gse-control-row">
            <span class="gse-control-name">Тип фона</span>
            <div class="gse-bg-modes">
              <button type="button" class="gse-bg-mode-btn gse-active" data-bg-mode="solid">Цвет</button>
              <button type="button" class="gse-bg-mode-btn" data-bg-mode="gradient">Градиент</button>
            </div>
          </div>
        </div>

        <div class="gse-bg-panel gse-bg-solid">
          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Цвет фона</span>
            <input type="color" class="gse-color gse-bg-color" value="#ffffff">
          </div>
          ${ctrl('Прозрачность фона', 'bgOpacity', 0, 100, 100, 1)}
        </div>

        <div class="gse-bg-panel gse-bg-gradient" hidden>
          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Цвет 1</span>
            <input type="color" class="gse-grad-c1" value="#c6ff3a">
          </div>
          <div class="gse-control gse-control-inline">
            <span class="gse-control-name">Цвет 2</span>
            <input type="color" class="gse-grad-c2" value="#7e0fff">
          </div>
          ${ctrl('Угол градиента', 'gradAngle', 0, 360, 135, 1)}
        </div>

        ${ctrl('Скругление', 'borderRadius', 0, 80, 0, 1)}
        ${ctrl('Толщина обводки', 'borderWidth', 0, 12, 0, 1)}

        <div class="gse-control gse-control-inline">
          <span class="gse-control-name">Цвет обводки</span>
          <input type="color" class="gse-color-border" value="#000000">
        </div>

        <div class="gse-control">
          <div class="gse-control-row"><span class="gse-control-name">Тень</span></div>
          <div class="gse-shadow-row">
            <button type="button" class="gse-shadow-btn gse-active" data-shadow="none"><span class="gse-shadow-preview gse-shadow-preview-none"></span><span class="gse-shadow-label">Нет</span></button>
            <button type="button" class="gse-shadow-btn" data-shadow="soft"><span class="gse-shadow-preview gse-shadow-preview-soft"></span><span class="gse-shadow-label">Мягкая</span></button>
            <button type="button" class="gse-shadow-btn" data-shadow="medium"><span class="gse-shadow-preview gse-shadow-preview-medium"></span><span class="gse-shadow-label">Средняя</span></button>
            <button type="button" class="gse-shadow-btn" data-shadow="deep"><span class="gse-shadow-preview gse-shadow-preview-deep"></span><span class="gse-shadow-label">Глубокая</span></button>
            <button type="button" class="gse-shadow-btn" data-shadow="lime-glow"><span class="gse-shadow-preview gse-shadow-preview-lime"></span><span class="gse-shadow-label">Лайм</span></button>
          </div>

          <details class="gse-shadow-manual">
            <summary>Настроить вручную</summary>
            <div class="gse-shadow-manual-body">
              ${ctrl('X сдвиг', 'shadowX', -50, 50, 0, 1)}
              ${ctrl('Y сдвиг', 'shadowY', -50, 50, 4, 1)}
              ${ctrl('Размытие', 'shadowBlur', 0, 80, 12, 1)}
              <div class="gse-control gse-control-inline">
                <span class="gse-control-name">Цвет тени</span>
                <input type="color" class="gse-color-shadow" value="#000000">
              </div>
              ${ctrl('Прозрачность тени', 'shadowAlpha', 0, 100, 20, 1)}
              <label class="gse-inset-label">
                <input type="checkbox" class="gse-shadow-inset">
                <span>Внутренняя тень</span>
              </label>
            </div>
          </details>
        </div>

        <button class="gse-reset-btn" type="button">Сбросить изменения</button>
      </div>

      <div class="gse-presets" hidden>
        <div class="gse-section-title">Пресеты</div>
        <div class="gse-preset-grid">
          <button class="gse-preset-btn" type="button" data-preset="clean-light"><span class="gse-preset-swatch gse-swatch-clean"></span><span>Чистый минимал</span></button>
          <button class="gse-preset-btn" type="button" data-preset="dark-glass"><span class="gse-preset-swatch gse-swatch-glass"></span><span>Тёмное стекло</span></button>
          <button class="gse-preset-btn" type="button" data-preset="brand-violet"><span class="gse-preset-swatch gse-swatch-brand"></span><span>Фиолетовый бренд</span></button>
        </div>
        <p class="gse-soon">Полная библиотека пресетов появится в дне 5.</p>
      </div>

      <div class="gse-export-section" hidden>
        <div class="gse-section-title">Экспорт</div>
        <button class="gse-export-btn" type="button">
          <span class="gse-export-icon">👁</span>
          <span class="gse-export-label">Показать CSS</span>
        </button>
        <div class="gse-export-preview-wrap" hidden>
          <textarea class="gse-export-preview" spellcheck="false" placeholder="Тут появится CSS блока"></textarea>
          <button class="gse-export-copy-btn" type="button">
            <span class="gse-export-copy-icon">📋</span>
            <span class="gse-export-copy-label">Скопировать</span>
          </button>
        </div>
        <p class="gse-export-hint">Голый CSS со всеми настройками блока — вставь в <b>CSS-поле блока GetCourse</b>: Настройки блока → CSS. Без <code>&lt;style&gt;</code> тегов — GC обернёт сам. Можно поправить прямо в окне перед копированием.</p>
        <p class="gse-export-hint">⚠️ Если выбран шрифт — <code>@import</code> идёт первой строкой (так и нужно), но в CSS-поле GC он не всегда подхватывается. Если шрифт не применился — подключи его <code>&lt;link&gt;</code>'ом в отдельном HTML-виджете на странице.</p>
        <p class="gse-export-hint">⚠️ Если правка не применяется к кнопке или блоку — проверь, не задан ли стиль прямо в настройках блока GC (инлайн). Инлайн с <code>!important</code> приоритетнее любого внешнего CSS — убери его в блоке, тогда экспортный стиль сработает.</p>
        <p class="gse-export-status"></p>
      </div>

      <div class="gse-persist-section">
        <div class="gse-section-title">💾 Сохранённые правки</div>
        <p class="gse-persist-hint">Правки авто-сохраняются и восстанавливаются после перезагрузки страницы (привязка к адресу страницы).</p>
        <button class="gse-persist-clear-btn" type="button">🗑 Очистить сохранённое для этой страницы</button>
        <p class="gse-persist-status"></p>
      </div>

      <div class="gse-feedback-section">
        <div class="gse-section-title">📝 Сообщить Клоду</div>
        <textarea class="gse-feedback-textarea" placeholder="Что не так или что хочется? Win+H — голосом. Один Enter — новая строка, не отправка."></textarea>
        <label class="gse-feedback-capture">
          <input type="checkbox" class="gse-feedback-capture-check" checked>
          <span>Добавить контекст выбранного элемента</span>
        </label>
        <div class="gse-feedback-actions">
          <button class="gse-feedback-copy" type="button">📋 Скопировать в чат</button>
          <button class="gse-feedback-download" type="button">💾 В feedback/</button>
        </div>
        <p class="gse-feedback-status"></p>
      </div>

      </div><!-- /gse-mode editor -->

      <div class="gse-mode" data-mode="library" hidden>
        <div class="gse-library">
          <div class="gse-section-title">Библиотека блоков</div>
          <div class="gse-lib-chips"></div>
          <div class="gse-lib-list"></div>
          <p class="gse-lib-foot">Вставь в HTML-блок GetCourse. CSS уже внутри блока — отдельно подключать не надо.</p>
        </div>
      </div><!-- /gse-mode library -->

      <p class="gse-version">v0.9.10 · день 5</p>
    </div>
  `;
  document.body.appendChild(sidebar);

  const hoverOverlay = document.createElement('div');
  hoverOverlay.id = 'gse-hover-overlay';
  document.body.appendChild(hoverOverlay);

  const selectedOverlay = document.createElement('div');
  selectedOverlay.id = 'gse-selected-overlay';
  document.body.appendChild(selectedOverlay);

  // ---------- REFS ----------
  const toggle = sidebar.querySelector('.gse-toggle');
  const pickerBtn = sidebar.querySelector('.gse-picker-btn');
  const pickerLabel = pickerBtn.querySelector('.gse-picker-label');
  const selectionBox = sidebar.querySelector('.gse-selection');
  const controlsBox = sidebar.querySelector('.gse-controls');
  const presetsBox = sidebar.querySelector('.gse-presets');
  const resetBtn = sidebar.querySelector('.gse-reset-btn');
  const mirrorWrap = sidebar.querySelector('.gse-mirror-wrap');
  const mirrorCheck = sidebar.querySelector('.gse-mirror-check');
  const mirrorKind = sidebar.querySelector('.gse-mirror-kind');
  const mirrorNum = sidebar.querySelector('.gse-mirror-num');
  const typographySection = sidebar.querySelector('.gse-typography-section');
  const colsSection = sidebar.querySelector('.gse-cols-section');
  const formSection = sidebar.querySelector('.gse-form-section');
  const formFontSelect = sidebar.querySelector('.gse-form-font-select');
  const formInputFullwidthBtn = sidebar.querySelector('.gse-form-input-fullwidth');
  const formBtnFullwidthBtn = sidebar.querySelector('.gse-form-btn-fullwidth');
  const formBtnAutoBtn = sidebar.querySelector('.gse-form-btn-auto');
  const formInputBorderColor = sidebar.querySelector('.gse-form-input-border-color');
  const formInputFocusColor = sidebar.querySelector('.gse-form-input-focus-color');
  const formInputTextColor = sidebar.querySelector('.gse-form-input-text-color');
  const formInputBgColor = sidebar.querySelector('.gse-form-input-bg-color');
  const formInputPlaceholderColor = sidebar.querySelector('.gse-form-input-placeholder-color');
  const formInputTransparentBg = sidebar.querySelector('.gse-form-input-transparent-bg');
  const formInputAutofillFix = sidebar.querySelector('.gse-form-input-autofill-fix');
  const formConsentLinkColor = sidebar.querySelector('.gse-form-consent-link-color');
  const formBtnBg = sidebar.querySelector('.gse-form-btn-bg');
  const formBtnColor = sidebar.querySelector('.gse-form-btn-color');
  const formBtnHover = sidebar.querySelector('.gse-form-btn-hover');
  const formBtnScope = sidebar.querySelector('.gse-form-btn-scope');
  const bgSolidPanel = sidebar.querySelector('.gse-bg-solid');
  const bgGradientPanel = sidebar.querySelector('.gse-bg-gradient');
  const bgColorInput = sidebar.querySelector('.gse-bg-color');
  const textColorInput = sidebar.querySelector('.gse-text-color');
  const borderColorInput = sidebar.querySelector('.gse-color-border');
  const shadowColorInput = sidebar.querySelector('.gse-color-shadow');
  const shadowInsetCheckbox = sidebar.querySelector('.gse-shadow-inset');
  const gradC1Input = sidebar.querySelector('.gse-grad-c1');
  const gradC2Input = sidebar.querySelector('.gse-grad-c2');
  const exportSection = sidebar.querySelector('.gse-export-section');
  const exportBtn = sidebar.querySelector('.gse-export-btn');
  const exportStatus = sidebar.querySelector('.gse-export-status');
  const exportPreviewWrap = sidebar.querySelector('.gse-export-preview-wrap');
  const exportPreview = sidebar.querySelector('.gse-export-preview');
  const exportCopyBtn = sidebar.querySelector('.gse-export-copy-btn');
  const restoreNotice = sidebar.querySelector('.gse-restore-notice');
  const persistClearBtn = sidebar.querySelector('.gse-persist-clear-btn');
  const persistStatus = sidebar.querySelector('.gse-persist-status');
  const feedbackTextarea = sidebar.querySelector('.gse-feedback-textarea');
  const feedbackCaptureCheck = sidebar.querySelector('.gse-feedback-capture-check');
  const feedbackStatus = sidebar.querySelector('.gse-feedback-status');
  const feedbackCopyBtn = sidebar.querySelector('.gse-feedback-copy');
  const feedbackDownloadBtn = sidebar.querySelector('.gse-feedback-download');
  const tabBtns = [...sidebar.querySelectorAll('.gse-tab')];
  const modePanels = [...sidebar.querySelectorAll('.gse-mode')];
  const libChips = sidebar.querySelector('.gse-lib-chips');
  const libList = sidebar.querySelector('.gse-lib-list');

  // ---------- HELPERS ----------
  function detectElementType(el) {
    if (!el || !el.classList) return el.tagName ? el.tagName.toLowerCase() : '';
    const cl = el.classList;
    if (cl.contains('btn') || cl.contains('f-btn')) return 'Кнопка';
    if (cl.contains('f-header')) return 'Заголовок';
    if (cl.contains('f-subheader')) return 'Подзаголовок';
    if (cl.contains('f-text') || cl.contains('text-normal')) return 'Текст';
    if (cl.contains('f-description') || cl.contains('description')) return 'Описание';
    if (cl.contains('image-card') || cl.contains('image-wrapper') || cl.contains('image-box')) return 'Изображение';
    if (cl.contains('lt-tsr-block')) return 'Карточка';
    if (cl.contains('flex-column')) return 'Колонка';
    if (cl.contains('builder-item')) return 'Элемент блока';
    if (cl.contains('lt-block-wrapper')) return 'Обёртка блока';
    if (cl.contains('block-box')) return 'Контент-контейнер';
    if (cl.contains('lt-block')) return 'Блок GetCourse';
    return el.tagName.toLowerCase();
  }

  function isTextElement(el) {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'BUTTON' || tag === 'P' || tag === 'A' || tag === 'LI' || /^H[1-6]$/.test(tag)) return true;
    if (tag === 'SPAN' && (el.children.length === 0)) return true;
    const cl = el.classList;
    const textClasses = ['f-header', 'f-subheader', 'f-text', 'f-description', 'f-name', 'f-btn', 'text-normal', 'btn', 'description', 'header', 'subheader', 'title', 'lt-tsr-text-part'];
    return textClasses.some(c => cl.contains(c));
  }

  function isImageElement(el) {
    if (!el) return false;
    if (el.tagName === 'IMG') return true;
    const cl = el.classList;
    if (cl.contains('image-card') || cl.contains('image-wrapper') || cl.contains('image-box')) return true;
    return false;
  }

  function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#ffffff';
    const m = rgb.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/);
    if (!m) return '#ffffff';
    const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
    if (a === 0) return '#ffffff';
    const hex = (n) => parseInt(n, 10).toString(16).padStart(2, '0');
    return '#' + hex(m[1]) + hex(m[2]) + hex(m[3]);
  }

  function rgbAlpha(rgb) {
    if (!rgb) return 1;
    const m = rgb.match(/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)$/);
    return m ? parseFloat(m[1]) : 1;
  }

  function hexToRgba(hex, alpha) {
    const m = hex.match(/^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i);
    if (!m) return `rgba(0, 0, 0, ${alpha})`;
    return `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}, ${alpha})`;
  }

  function pxToNum(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function positionOverlay(overlay, el) {
    if (!el || !document.body.contains(el)) { overlay.classList.remove('gse-visible'); return; }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) { overlay.classList.remove('gse-visible'); return; }
    overlay.classList.add('gse-visible');
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
  }

  function isInsideSidebar(el) {
    if (!el) return true;
    if (el.id === 'gse-sidebar' || el.id === 'gse-hover-overlay' || el.id === 'gse-selected-overlay') return true;
    if (el.classList && el.classList.contains('gse-sibling-overlay')) return true;
    return el.closest && el.closest('#gse-sidebar') !== null;
  }

  function swallow(e) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }

  // ---------- SIBLINGS DETECTION ----------
  function findPrimaryClass(el) {
    const cl = [...el.classList];
    const priorityPrefixes = ['f-header', 'f-subheader', 'f-text', 'f-description', 'f-name', 'f-btn', 'lt-tsr-text-part', 'part-', 'image-card', 'image-wrapper', 'image-box'];
    for (const prefix of priorityPrefixes) {
      const match = cl.find(c => c === prefix || c.startsWith(prefix));
      if (match) return match;
    }
    return cl.find(c => !c.match(/^(animated|lazyloaded|gse-|js-|builder|col-md|text-|flex-)/)) || cl[0];
  }

  function findSiblings(el) {
    if (!el) return { siblings: [], kind: '' };
    if (el.classList.contains('lt-tsr-block')) {
      const sibs = [...el.parentElement.querySelectorAll('.lt-tsr-block')].filter(s => s !== el);
      return { siblings: sibs, kind: 'карточкам' };
    }
    if (el.classList.contains('flex-column')) {
      const block = el.closest('.lt-block');
      if (block) {
        const sibs = [...block.querySelectorAll('.flex-column')].filter(s => s !== el);
        if (sibs.length > 0) return { siblings: sibs, kind: 'колонкам' };
      }
    }
    const parentCard = el.closest('.lt-tsr-block');
    if (parentCard) {
      const otherCards = [...parentCard.parentElement.querySelectorAll('.lt-tsr-block')].filter(c => c !== parentCard);
      const primaryClass = findPrimaryClass(el);
      if (primaryClass) {
        const sibs = otherCards.map(c => c.querySelector('.' + primaryClass.split(' ')[0])).filter(Boolean);
        if (sibs.length > 0) return { siblings: sibs, kind: 'таким же элементам в карточках' };
      }
    }
    const parentCol = el.closest('.flex-column');
    if (parentCol) {
      const block = parentCol.closest('.lt-block');
      if (block) {
        const otherCols = [...block.querySelectorAll('.flex-column')].filter(c => c !== parentCol);
        const primaryClass = findPrimaryClass(el);
        if (primaryClass && otherCols.length > 0) {
          const sibs = otherCols.map(c => c.querySelector('.' + primaryClass.split(' ')[0])).filter(Boolean);
          if (sibs.length > 0) return { siblings: sibs, kind: 'таким же элементам в колонках' };
        }
      }
    }
    return { siblings: [], kind: '' };
  }

  // ---------- SIBLING OVERLAYS (mirror visualization) ----------
  function clearSiblingOverlays() {
    siblingOverlays.forEach(({ overlay }) => overlay.remove());
    siblingOverlays = [];
  }

  function showSiblingOverlays() {
    clearSiblingOverlays();
    if (!mirrorToSiblings || !selectedElement) return;
    const { siblings } = findSiblings(selectedElement);
    siblings.forEach(s => {
      const o = document.createElement('div');
      o.className = 'gse-sibling-overlay';
      document.body.appendChild(o);
      positionOverlay(o, s);
      siblingOverlays.push({ el: s, overlay: o });
    });
  }

  function repositionSiblingOverlays() {
    siblingOverlays.forEach(({ el, overlay }) => positionOverlay(overlay, el));
  }

  function pulseSiblingOverlays() {
    siblingOverlays.forEach(({ overlay }) => {
      overlay.classList.remove('gse-pulse');
      void overlay.offsetHeight;
      overlay.classList.add('gse-pulse');
    });
  }

  // ---------- COLUMN CONTAINER ----------
  function findColumnContainer(el) {
    let cur = el;
    while (cur && cur !== document.body) {
      const directCols = [...cur.children].filter(c =>
        c.classList && (c.classList.contains('flex-column') || c.classList.contains('lt-tsr-block'))
      );
      if (directCols.length >= 2) return cur;
      cur = cur.parentElement;
    }
    const innerCols = el.querySelectorAll('.flex-column, .lt-tsr-block');
    if (innerCols.length >= 2 && innerCols[0].parentElement === innerCols[1].parentElement) {
      return innerCols[0].parentElement;
    }
    return null;
  }

  // ---------- FORM HELPERS ----------
  function findForm(el) {
    if (!el) return null;
    if (el.closest) {
      const up = el.closest(FORM_SELECTORS.forms);
      if (up) return up;
    }
    if (el.querySelector) {
      const inner = el.querySelector(FORM_SELECTORS.forms);
      if (inner) return inner;
    }
    return null;
  }

  // Префикс scope для режима «Только эта форма». Строится от РЕАЛЬНОЙ текущей
  // формы, а не хардкодом .lt-form — findForm матчит форму и по другим якорям
  // (.modal-form-inner, form.f-form, form[id^="ltForm"]), где .lt-form промахнётся.
  const FORM_ANCHOR_CLASSES = ['lt-form', 'lt-normal-form', 'modal-form-inner', 'f-form'];
  function formScopePrefix() {
    if (!currentForm) return '.lt-form';
    if (currentForm.id) return '#' + currentForm.id;
    for (const c of FORM_ANCHOR_CLASSES) {
      if (currentForm.classList && currentForm.classList.contains(c)) return '.' + c;
    }
    const stable = pickStableClass(currentForm);
    return stable ? '.' + stable : '.lt-form';
  }

  function ensureFontLoaded(fontName) {
    const clean = (fontName || '').replace(/['"]/g, '').trim();
    if (!GOOGLE_FONTS.includes(clean)) return;
    const id = 'gse-font-' + clean.toLowerCase().replace(/\s/g, '-');
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${clean.replace(/\s/g, '+')}:wght@300;400;500;600;700;800&display=swap`;
    document.head.appendChild(link);
  }

  function applyToFormParts(selector, fn) {
    if (!currentForm) return;
    const list = [...currentForm.querySelectorAll(selector)].filter(el => !isGcNoise(el));
    if (currentForm.matches && currentForm.matches(selector) && !isGcNoise(currentForm)) list.push(currentForm);
    list.forEach(t => {
      if (!originalStyles.has(t)) originalStyles.set(t, t.getAttribute('style') || '');
      fn(t);
      markEdited(t);
    });
  }

  function applyFontToForm(font) {
    if (!currentForm) return;
    ensureFontLoaded(font);
    const value = font === 'inherit' ? '' : `${font.includes(' ') ? `'${font}'` : font}, sans-serif`;
    // Только видимые текстовые элементы + сама форма (без обхода всего DOM)
    const targets = [currentForm, ...currentForm.querySelectorAll(FORM_SELECTORS.textTargets)]
      .filter(el => !isGcNoise(el));
    targets.forEach(el => {
      if (!originalStyles.has(el)) originalStyles.set(el, el.getAttribute('style') || '');
      if (value) el.style.setProperty('font-family', value, 'important');
      else el.style.removeProperty('font-family');
      markEdited(el);
    });
  }

  const FORM_DIRTY_PROPS = ['formTitleSize', 'formInputWidth', 'formInputHeight', 'formInputFont', 'formInputPaddingX', 'formInputBorderRadius', 'formInputBorderWidth', 'formFieldGap', 'formConsentSize', 'formBtnWidth', 'formBtnHeight', 'formBtnFont', 'formBtnBorderRadius'];
  const FORM_DIRTY_COLORS = ['formInputBorderColor', 'formInputFocusColor', 'formInputTextColor', 'formInputBgColor', 'formInputPlaceholderColor', 'formConsentLinkColor', 'formBtnBg', 'formBtnColor'];

  function getDirtyInputs() {
    return [
      formFontSelect, formInputBorderColor, formInputFocusColor, formInputTextColor,
      formInputBgColor, formInputPlaceholderColor, formInputTransparentBg, formInputAutofillFix,
      formConsentLinkColor, formBtnBg, formBtnColor, formBtnHover
    ];
  }

  function clearFormDirty() {
    FORM_DIRTY_PROPS.forEach(prop => {
      const s = sidebar.querySelector(`[data-prop="${prop}"]`);
      if (s) delete s.dataset.dirty;
    });
    getDirtyInputs().forEach(el => { if (el) delete el.dataset.dirty; });
    if (formInputTransparentBg) formInputTransparentBg.checked = false;
    if (formInputAutofillFix) formInputAutofillFix.checked = true;
    if (formBtnHover) formBtnHover.value = 'none';
    if (formBtnScope) formBtnScope.value = 'form';
    const preview = document.getElementById('gse-preview-style');
    if (preview) preview.textContent = '';
  }

  function isFormSliderDirty(prop) {
    const s = sidebar.querySelector(`[data-prop="${prop}"]`);
    return !!(s && s.dataset.dirty === '1');
  }

  function readDirtySlider(prop) {
    if (!isFormSliderDirty(prop)) return null;
    const s = sidebar.querySelector(`[data-prop="${prop}"]`);
    return parseFloat(s.value);
  }

  function syncFormControls() {
    if (!currentForm) return;
    clearFormDirty();
    const ref = currentForm.querySelector(FORM_SELECTORS.inputs) || currentForm;
    const cs = window.getComputedStyle(ref);
    const fontFamilyRaw = (cs.fontFamily.split(',')[0] || '').replace(/['"]/g, '').trim();
    let matched = 'inherit';
    GOOGLE_FONTS.forEach(f => { if (f.toLowerCase() === fontFamilyRaw.toLowerCase()) matched = f; });
    // По умолчанию шрифт формы — Manrope. Если в форме не распознан Google-шрифт
    // (системный/неизвестный), подменяем на Manrope, применяем в превью и метим dirty,
    // чтобы Manrope попал в экспорт без ручного выбора в выпадашке.
    if (matched === 'inherit') {
      matched = 'Manrope';
      applyFontToForm('Manrope');
      if (formFontSelect) formFontSelect.dataset.dirty = '1';
    }
    if (formFontSelect) formFontSelect.value = matched;
    formState.font = matched;

    const titleEl = currentForm.querySelector(FORM_SELECTORS.titles);
    if (titleEl) setSliderPair('formTitleSize', Math.max(14, Math.min(48, pxToNum(getComputedStyle(titleEl).fontSize) || 24)));

    const inputEl = currentForm.querySelector(FORM_SELECTORS.inputs);
    if (inputEl) {
      const ics = getComputedStyle(inputEl);
      const rect = inputEl.getBoundingClientRect();
      // Ширину читаем из computed style — rect.width занижен из-за сжатого сайдбаром вьюпорта
      setSliderPair('formInputWidth', Math.max(200, Math.min(700, Math.round(pxToNum(ics.width)) || 360)));
      setSliderPair('formInputHeight', Math.max(30, Math.min(80, Math.round(rect.height) || 44)));
      setSliderPair('formInputFont', Math.max(12, Math.min(22, pxToNum(ics.fontSize) || 16)));
      setSliderPair('formInputPaddingX', Math.max(0, Math.min(40, pxToNum(ics.paddingLeft) || 14)));
      setSliderPair('formInputBorderRadius', Math.max(0, Math.min(30, pxToNum(ics.borderTopLeftRadius))));
      setSliderPair('formInputBorderWidth', Math.max(0, Math.min(6, pxToNum(ics.borderTopWidth))));
      if (formInputBorderColor) formInputBorderColor.value = rgbToHex(ics.borderTopColor) || '#dddddd';
      if (formInputTextColor) formInputTextColor.value = rgbToHex(ics.color) || '#1f211d';
      if (formInputBgColor) formInputBgColor.value = rgbToHex(ics.backgroundColor) || '#ffffff';
      if (formInputTransparentBg) {
        const a = rgbAlpha(ics.backgroundColor);
        formInputTransparentBg.checked = a === 0 || ics.backgroundColor === 'transparent';
      }
    }

    const groupEl = currentForm.querySelector(FORM_SELECTORS.fieldGroups);
    if (groupEl) setSliderPair('formFieldGap', Math.max(0, Math.min(40, pxToNum(getComputedStyle(groupEl).marginBottom) || 16)));

    const consentEl = currentForm.querySelector(FORM_SELECTORS.consents);
    if (consentEl) setSliderPair('formConsentSize', Math.max(10, Math.min(18, pxToNum(getComputedStyle(consentEl).fontSize) || 13)));

    const btnEl = currentForm.querySelector(FORM_SELECTORS.buttons);
    if (btnEl) {
      const brect = btnEl.getBoundingClientRect();
      const bcs = getComputedStyle(btnEl);
      // Ширину — из computed style (rect.width занижен под сжатым сайдбаром)
      setSliderPair('formBtnWidth', Math.max(100, Math.min(600, Math.round(pxToNum(bcs.width)) || 240)));
      setSliderPair('formBtnHeight', Math.max(30, Math.min(90, Math.round(brect.height) || 48)));
      setSliderPair('formBtnFont', Math.max(12, Math.min(26, pxToNum(bcs.fontSize) || 16)));
      setSliderPair('formBtnBorderRadius', Math.max(0, Math.min(50, pxToNum(bcs.borderTopLeftRadius))));
      if (formBtnBg) formBtnBg.value = rgbToHex(bcs.backgroundColor) || '#4dbee3';
      if (formBtnColor) formBtnColor.value = rgbToHex(bcs.color) || '#ffffff';
    }
  }

  // ---------- PERSISTENCE ----------
  // Ключ страницы без query/hash — чтобы &rand=123 и прочие параметры не плодили разные ключи.
  function pageKey() { return location.hostname + location.pathname; }

  // Регистрируем элемент как тронутый + планируем сохранение.
  function markEdited(el) {
    if (!el || el.nodeType !== 1) return;
    if (isInsideSidebar(el)) return;
    editedElements.add(el);
    scheduleSave();
  }

  // Стабильный селектор для восстановления (та же логика, что в экспорте блока):
  // scope = ближайший .lt-block, внутри — собственный #id, иначе семантический класс.
  // Fallback (контейнер колонок GC — generic-div без id и стабильного класса):
  // строим nth-of-type путь от scope .lt-block.
  function buildPersistSelector(el) {
    if (!el || el.nodeType !== 1) return null;
    const scope = el.closest('.lt-block');
    if (el.id) return scope && scope.id && scope !== el ? `#${scope.id} #${el.id}` : `#${el.id}`;
    const cls = pickStableClass(el);
    if (cls) return scope && scope.id && scope !== el ? `#${scope.id} .${cls}` : `.${cls}`;
    // Нет id и стабильного класса — строим путь от .lt-block через nth-of-type.
    return buildPathSelector(el, scope);
  }

  // Один сегмент пути: tagname[.firstClass]:nth-of-type(N) среди братьев того же тега.
  function pathSegment(el) {
    const tag = el.tagName.toLowerCase();
    let seg = tag;
    // Берём первый класс не из шумного списка — для читаемости/устойчивости.
    if (el.classList) {
      const SKIP = /^(animated|lazyloaded|gse-|js-|active|hover|sibling)/;
      for (const c of el.classList) { if (!SKIP.test(c)) { seg += '.' + CSS.escape(c); break; } }
    }
    const parent = el.parentElement;
    if (parent) {
      const sameTag = [...parent.children].filter(c => c.tagName === el.tagName);
      if (sameTag.length > 1) seg += `:nth-of-type(${sameTag.indexOf(el) + 1})`;
    }
    return seg;
  }

  // Путь-селектор от scope .lt-block до el. Без scope с id — null (как раньше).
  function buildPathSelector(el, scope) {
    if (!scope || !scope.id || scope === el) return null;
    const parts = [];
    let cur = el;
    while (cur && cur !== scope) {
      parts.unshift(pathSegment(cur));
      cur = cur.parentElement;
    }
    if (!parts.length) return null;
    return `#${scope.id} ${parts.join(' > ')}`;
  }

  let saveTimer = null;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveEdits, 400);
  }

  function saveEdits() {
    try {
      if (!chrome.storage || !chrome.storage.local) return;
      const entries = [];
      const seen = new Set();
      editedElements.forEach(el => {
        // Disconnected-узел (откачен/удалён из DOM) — выкидываем, чтобы Set не тёк.
        if (!el.isConnected) { editedElements.delete(el); return; }
        const css = el.getAttribute('style') || '';
        if (!css.trim()) return;
        const selector = buildPersistSelector(el);
        if (!selector || seen.has(selector)) return;
        seen.add(selector);
        entries.push({ selector, css });
      });
      const preview = document.getElementById('gse-preview-style');
      const previewCss = preview ? preview.textContent.trim() : '';
      // Пусто (всё сброшено) → удаляем ключ, чтобы при reload не воскресли старые правки.
      if (entries.length === 0 && !previewCss) {
        chrome.storage.local.remove(pageKey());
        return;
      }
      const data = { v: '0.9.10', ts: Date.now(), entries, previewCss };
      chrome.storage.local.set({ [pageKey()]: data });
    } catch (e) { /* storage недоступен/переполнен — молча, не падаем */ }
  }

  function clearSavedEdits() {
    try {
      if (chrome.storage && chrome.storage.local) chrome.storage.local.remove(pageKey());
    } catch (e) { /* no-op */ }
    editedElements.clear();
  }

  // Применяет сохранённые записи к найденным на странице элементам.
  // Возвращает число восстановленных в этом проходе.
  function applyRestore(entries, restoredSelectors) {
    let count = 0;
    entries.forEach(({ selector, css }) => {
      if (restoredSelectors.has(selector)) return;
      let el;
      try { el = document.querySelector(selector); } catch (e) { return; }
      if (!el || isInsideSidebar(el)) return;
      // Оригинал сохраняем ДО применения правки — чтобы Reset вернул к настоящему исходнику.
      if (!originalStyles.has(el)) originalStyles.set(el, el.getAttribute('style') || '');
      if (css) el.setAttribute('style', css); else el.removeAttribute('style');
      editedElements.add(el);
      restoredSelectors.add(selector);
      count++;
    });
    return count;
  }

  function restoreEdits() {
    try {
      if (!chrome.storage || !chrome.storage.local) return;
      chrome.storage.local.get(pageKey(), (res) => {
        // Async-коллбэк вне внешнего try/catch — проверяем lastError здесь.
        if (chrome.runtime.lastError) return;
        const data = res && res[pageKey()];
        if (!data || !data.entries) return;
        const total = data.entries.length;
        const restoredSelectors = new Set();
        let count = applyRestore(data.entries, restoredSelectors);

        // Preview-стиль (pseudo: ::placeholder, :focus, :hover кнопки)
        if (data.previewCss) {
          let style = document.getElementById('gse-preview-style');
          if (!style) { style = document.createElement('style'); style.id = 'gse-preview-style'; document.head.appendChild(style); }
          style.textContent = data.previewCss;
        }

        // GC рендерит блоки асинхронно (ленивый рендер, длинные формы).
        // MutationObserver доприменяет поздние блоки по мере появления узлов.
        // Плашку показываем один раз — финально, когда observer отработал/истёк таймаут.
        let noticeShown = false;
        const finish = () => {
          if (noticeShown) return;
          noticeShown = true;
          // Финальный пересчёт: текущее число восстановленных селекторов.
          if (restoredSelectors.size > 0) showRestoreNotice(restoredSelectors.size, total);
        };

        // Если уже всё восстановили в первом проходе — observer не нужен.
        if (count >= total) { finish(); return; }

        let debounce = null;
        const observer = new MutationObserver(() => {
          clearTimeout(debounce);
          debounce = setTimeout(() => {
            applyRestore(data.entries, restoredSelectors);
            if (restoredSelectors.size >= total) { clearTimeout(killTimer); observer.disconnect(); finish(); }
          }, 150);
        });
        try { observer.observe(document.body, { childList: true, subtree: true }); } catch (e) { /* body не готов */ }

        // Самоотключение через 5с независимо от того, всё ли догнали.
        const killTimer = setTimeout(() => {
          clearTimeout(debounce);
          applyRestore(data.entries, restoredSelectors);
          observer.disconnect();
          finish();
        }, 5000);
      });
    } catch (e) { /* no-op */ }
  }

  function showRestoreNotice(count, total) {
    if (!restoreNotice) return;
    restoreNotice.textContent = count < total
      ? `🔄 Восстановлено ${count} из ${total} правок`
      : `🔄 Восстановлено ${count} ${plural(count, 'правка', 'правки', 'правок')}`;
    restoreNotice.hidden = false;
    restoreNotice.classList.add('gse-visible');
    setTimeout(() => {
      restoreNotice.classList.remove('gse-visible');
      setTimeout(() => { restoreNotice.hidden = true; }, 300);
    }, 3000);
  }

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  // ---------- APPLY ----------
  function applyToTargets(fn) {
    if (!selectedElement) return;
    fn(selectedElement);
    markEdited(selectedElement);
    if (mirrorToSiblings) {
      const { siblings } = findSiblings(selectedElement);
      siblings.forEach(s => {
        if (!originalStyles.has(s)) originalStyles.set(s, s.getAttribute('style') || '');
        fn(s);
        markEdited(s);
      });
      pulseSiblingOverlays();
    }
  }

  function setStyle(prop, val) { applyToTargets((el) => el.style.setProperty(prop, val, 'important')); }
  function removeStyle(prop) { applyToTargets((el) => el.style.removeProperty(prop)); }

  // ---------- PICKER ----------
  function enterPickerMode() {
    pickerActive = true;
    pickerBtn.classList.add('gse-picker-active');
    pickerLabel.textContent = 'Отмена (Esc)';
    document.body.classList.add('gse-picker-mode');
  }
  function exitPickerMode() {
    pickerActive = false;
    pickerBtn.classList.remove('gse-picker-active');
    pickerLabel.textContent = selectedElement ? 'Сменить элемент' : 'Выбрать элемент';
    document.body.classList.remove('gse-picker-mode');
    hoverOverlay.classList.remove('gse-visible');
    hoveredElement = null;
  }

  document.documentElement.classList.add('gse-active');

  toggle.addEventListener('click', () => {
    const collapsed = sidebar.classList.toggle('gse-collapsed');
    document.documentElement.classList.toggle('gse-collapsed', collapsed);
    toggle.textContent = collapsed ? '‹' : '›';
    toggle.setAttribute('aria-label', collapsed ? 'Развернуть' : 'Свернуть');
  });
  pickerBtn.addEventListener('click', () => pickerActive ? exitPickerMode() : enterPickerMode());

  document.addEventListener('mousemove', (e) => {
    if (!pickerActive) return;
    const target = e.target;
    if (!target || isInsideSidebar(target)) { hoverOverlay.classList.remove('gse-visible'); hoveredElement = null; return; }
    if (target === hoveredElement) return;
    hoveredElement = target;
    positionOverlay(hoverOverlay, target);
  }, true);

  document.addEventListener('mousedown', (e) => {
    if (!pickerActive) return;
    if (isInsideSidebar(e.target)) return;
    swallow(e);
  }, true);
  document.addEventListener('mouseup', (e) => {
    if (!pickerActive) return;
    if (isInsideSidebar(e.target)) return;
    swallow(e);
  }, true);
  document.addEventListener('click', (e) => {
    if (!pickerActive) return;
    const target = e.target;
    if (!target || isInsideSidebar(target)) return;
    swallow(e);
    selectElement(target);
    exitPickerMode();
  }, true);
  document.addEventListener('contextmenu', (e) => {
    if (!pickerActive) return;
    if (isInsideSidebar(e.target)) return;
    swallow(e);
  }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pickerActive) exitPickerMode(); });

  // ---------- SELECTION ----------
  function selectElement(el) {
    selectedElement = el;
    if (!originalStyles.has(el)) originalStyles.set(el, el.getAttribute('style') || '');
    positionOverlay(selectedOverlay, el);

    sidebar.querySelector('.gse-type').textContent = detectElementType(el);
    sidebar.querySelector('.gse-tag').textContent = el.tagName.toLowerCase();
    sidebar.querySelector('.gse-id').textContent = el.id || '—';

    selectionBox.hidden = false;
    controlsBox.hidden = false;
    presetsBox.hidden = false;
    exportSection.hidden = false;

    const { siblings, kind } = findSiblings(el);
    if (siblings.length > 0) {
      mirrorWrap.hidden = false;
      mirrorKind.textContent = kind;
      mirrorNum.textContent = siblings.length;
    } else {
      mirrorWrap.hidden = true;
      mirrorToSiblings = false;
      mirrorCheck.checked = false;
    }

    typographySection.hidden = !isTextElement(el);

    currentColumnContainer = findColumnContainer(el);
    if (currentColumnContainer) {
      colsSection.hidden = false;
      if (!originalStyles.has(currentColumnContainer)) {
        originalStyles.set(currentColumnContainer, currentColumnContainer.getAttribute('style') || '');
      }
      const gap = pxToNum(getComputedStyle(currentColumnContainer).gap || getComputedStyle(currentColumnContainer).columnGap);
      setSliderPair('columnGap', Math.min(80, gap));
    } else {
      colsSection.hidden = true;
    }

    currentForm = findForm(el);
    if (currentForm) {
      formSection.hidden = false;
      if (!originalStyles.has(currentForm)) {
        originalStyles.set(currentForm, currentForm.getAttribute('style') || '');
      }
      syncFormControls();
    } else {
      formSection.hidden = true;
    }

    syncControlsToElement(el);
    showSiblingOverlays();
  }

  function setSliderPair(prop, value) {
    const slider = sidebar.querySelector(`[data-prop="${prop}"]`);
    const input = sidebar.querySelector(`[data-num="${prop}"]`);
    if (slider) slider.value = value;
    if (input) input.value = Math.round(value * 100) / 100;
  }

  function syncControlsToElement(el) {
    const cs = window.getComputedStyle(el);

    // BG
    const bgImg = cs.backgroundImage;
    if (bgImg && bgImg.includes('linear-gradient')) {
      bgState.mode = 'gradient';
      setBgMode('gradient');
    } else {
      bgState.mode = 'solid';
      setBgMode('solid');
      bgState.color = rgbToHex(cs.backgroundColor);
      bgState.opacity = Math.round(rgbAlpha(cs.backgroundColor) * 100);
      bgColorInput.value = bgState.color;
      setSliderPair('bgOpacity', bgState.opacity);
    }

    // Text
    textState.color = rgbToHex(cs.color);
    textState.opacity = Math.round(rgbAlpha(cs.color) * 100);
    textColorInput.value = textState.color;
    setSliderPair('textOpacity', textState.opacity);

    // Dimensions / spacing
    setSliderPair('paddingX', pxToNum(cs.paddingLeft));
    setSliderPair('paddingY', pxToNum(cs.paddingTop));
    setSliderPair('borderRadius', pxToNum(cs.borderTopLeftRadius));
    setSliderPair('fontSize', pxToNum(cs.fontSize));
    const lh = cs.lineHeight;
    const lhNum = lh === 'normal' ? 1.5 : (parseFloat(lh) / pxToNum(cs.fontSize)) || 1.5;
    setSliderPair('lineHeight', Math.max(1, Math.min(2.5, lhNum)));

    setSliderPair('width', el.style.width ? pxToNum(el.style.width) : 0);
    setSliderPair('height', el.style.height ? pxToNum(el.style.height) : 0);

    // Border
    setSliderPair('borderWidth', pxToNum(cs.borderTopWidth));
    borderColorInput.value = rgbToHex(cs.borderTopColor) || '#000000';

    setActiveBtnRow('.gse-fw-row', 'data-fw', String(parseInt(cs.fontWeight, 10) || 400));
    setActiveBtnRow('.gse-ta-row', 'data-ta', cs.textAlign || 'left');
    setActiveBtnRow('.gse-tt-row', 'data-tt', (cs.textTransform === 'uppercase' || cs.textTransform === 'lowercase') ? cs.textTransform : 'none');

    const shadow = el.style.boxShadow || '';
    let activeShadow = 'none';
    if (shadow.includes('198, 255, 58') || shadow.includes('#c6ff3a')) activeShadow = 'lime-glow';
    else if (shadow && shadow !== 'none') activeShadow = '';
    setActiveBtnRow('.gse-shadow-row', 'data-shadow', activeShadow);
  }

  function setActiveBtnRow(rowSelector, attr, value) {
    const row = sidebar.querySelector(rowSelector);
    if (!row) return;
    row.querySelectorAll('button').forEach(b => b.classList.toggle('gse-active', b.getAttribute(attr) === value));
  }

  function setBgMode(mode) {
    bgState.mode = mode;
    bgSolidPanel.hidden = mode !== 'solid';
    bgGradientPanel.hidden = mode !== 'gradient';
    sidebar.querySelectorAll('.gse-bg-mode-btn').forEach(b => b.classList.toggle('gse-active', b.getAttribute('data-bg-mode') === mode));
  }

  // ---------- MIRROR ----------
  mirrorCheck.addEventListener('change', () => {
    mirrorToSiblings = mirrorCheck.checked;
    if (mirrorToSiblings) showSiblingOverlays();
    else clearSiblingOverlays();
  });

  // ---------- NUMBER ↔ SLIDER SYNC ----------
  sidebar.querySelectorAll('.gse-num-input').forEach((input) => {
    const prop = input.getAttribute('data-num');
    const slider = sidebar.querySelector(`[data-prop="${prop}"]`);
    if (!slider) return;
    input.addEventListener('input', () => {
      slider.value = input.value;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  // ---------- SLIDERS ----------
  function applyBg() {
    if (!selectedElement) return;
    if (bgState.mode === 'solid') {
      const rgba = hexToRgba(bgState.color, bgState.opacity / 100);
      setStyle('background-image', 'none');
      setStyle('background-color', rgba);
    } else {
      setStyle('background-color', 'transparent');
      setStyle('background-image', `linear-gradient(${bgState.gradAngle}deg, ${bgState.gradC1}, ${bgState.gradC2})`);
    }
    positionOverlay(selectedOverlay, selectedElement);
  }

  function applyText() {
    if (!selectedElement) return;
    const rgba = hexToRgba(textState.color, textState.opacity / 100);
    setStyle('color', rgba);
  }

  function applyBorder() {
    if (!selectedElement) return;
    const w = parseInt(sidebar.querySelector('[data-prop="borderWidth"]').value, 10);
    const c = borderColorInput.value;
    if (w === 0) setStyle('border', 'none');
    else setStyle('border', `${w}px solid ${c}`);
  }

  sidebar.querySelectorAll('.gse-range').forEach((slider) => {
    const prop = slider.getAttribute('data-prop');
    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      const numInput = sidebar.querySelector(`[data-num="${prop}"]`);
      if (numInput && numInput !== document.activeElement) numInput.value = (slider.step && parseFloat(slider.step) < 1) ? v.toFixed(2) : Math.round(v);
      slider.dataset.dirty = '1';

      if (!selectedElement && prop !== 'columnGap') return;

      switch (prop) {
        case 'width':
          if (v === 0) removeStyle('width'); else setStyle('width', v + 'px');
          break;
        case 'height':
          if (v === 0) removeStyle('height'); else setStyle('height', v + 'px');
          break;
        case 'paddingX':
          setStyle('padding-left', v + 'px'); setStyle('padding-right', v + 'px');
          break;
        case 'paddingY':
          setStyle('padding-top', v + 'px'); setStyle('padding-bottom', v + 'px');
          break;
        case 'borderRadius':
          setStyle('border-radius', v + 'px');
          break;
        case 'borderWidth':
          applyBorder();
          break;
        case 'fontSize':
          setStyle('font-size', v + 'px');
          break;
        case 'lineHeight':
          setStyle('line-height', v);
          break;
        case 'bgOpacity':
          bgState.opacity = v; applyBg();
          break;
        case 'textOpacity':
          textState.opacity = v; applyText();
          break;
        case 'gradAngle':
          bgState.gradAngle = v; applyBg();
          break;
        case 'columnGap':
          if (!currentColumnContainer) return;
          // Только зазор между колонками. НЕ трогаем flex-wrap/max-width/margin детей —
          // иначе на v-tablet/mobile GC-перенос колонок в столбик ломается (overflow).
          if (!originalStyles.has(currentColumnContainer)) {
            originalStyles.set(currentColumnContainer, currentColumnContainer.getAttribute('style') || '');
          }
          currentColumnContainer.style.setProperty('gap', v + 'px', 'important');
          currentColumnContainer.style.setProperty('column-gap', v + 'px', 'important');
          markEdited(currentColumnContainer);
          break;
        case 'shadowX': shadowState.x = v; applyShadow(); break;
        case 'shadowY': shadowState.y = v; applyShadow(); break;
        case 'shadowBlur': shadowState.blur = v; applyShadow(); break;
        case 'shadowAlpha': shadowState.alpha = v; applyShadow(); break;
        case 'formTitleSize':
          applyToFormParts(FORM_SELECTORS.titles, t => t.style.setProperty('font-size', v + 'px', 'important'));
          break;
        case 'formInputWidth':
          applyToFormParts(FORM_SELECTORS.inputs, t => {
            t.style.setProperty('width', v + 'px', 'important');
            t.style.setProperty('max-width', '100%', 'important');
          });
          break;
        case 'formInputHeight':
          applyToFormParts(FORM_SELECTORS.inputs, t => {
            if (t.tagName === 'TEXTAREA') {
              t.style.setProperty('min-height', v + 'px', 'important');
            } else {
              t.style.setProperty('height', v + 'px', 'important');
              t.style.setProperty('line-height', Math.max(16, v - 4) + 'px', 'important');
            }
          });
          break;
        case 'formInputFont':
          applyToFormParts(FORM_SELECTORS.inputs, t => t.style.setProperty('font-size', v + 'px', 'important'));
          break;
        case 'formFieldGap': {
          // Поле = обёртка, у которой class part-field ИЛИ внутри реально есть input/textarea/select.
          // НЕ трогаем кнопку (part-button) и заголовок (part-header) и пустые контейнеры —
          // иначе под ними появляется лишний отступ (это и был смысл BUG-4).
          // На модальных формах GC обёртки полей НЕ имеют part-field — отсюда и регрессия.
          if (!currentForm) break;
          const items = currentForm.querySelectorAll('.builder-item, .field-group, .form-group, .form-field');
          // 1) Сначала собираем валидных кандидатов (поле + не шум/кнопка/заголовок).
          const candidates = [];
          items.forEach(t => {
            if (isGcNoise(t)) return;
            if (t.classList.contains('part-button') || t.classList.contains('part-header')) return;
            const isField = t.classList.contains('part-field') || t.querySelector('input, textarea, select');
            if (!isField) return;
            candidates.push(t);
          });
          // 2) Отсекаем вложенные: если кандидат содержит другого кандидата
          //    (внешняя обёртка над .field-group и т.п.) — пропускаем внешний,
          //    margin едет на самую внутреннюю обёртку поля → ровно один отступ.
          const innermost = candidates.filter(t =>
            !candidates.some(other => other !== t && t.contains(other))
          );
          innermost.forEach(t => {
            if (!originalStyles.has(t)) originalStyles.set(t, t.getAttribute('style') || '');
            t.style.setProperty('margin-bottom', v + 'px', 'important');
            markEdited(t);
          });
          break;
        }
        case 'formConsentSize':
          applyToFormParts(FORM_SELECTORS.consents, t => t.style.setProperty('font-size', v + 'px', 'important'));
          break;
        case 'formBtnWidth':
          applyToFormParts(FORM_SELECTORS.buttons, t => {
            t.style.setProperty('width', v + 'px', 'important');
            t.style.setProperty('max-width', '100%', 'important');
          });
          break;
        case 'formBtnFont':
          applyToFormParts(FORM_SELECTORS.buttons, t => t.style.setProperty('font-size', v + 'px', 'important'));
          break;
        case 'formInputBorderRadius':
          applyToFormParts(FORM_SELECTORS.inputs, t => t.style.setProperty('border-radius', v + 'px', 'important'));
          break;
        case 'formInputBorderWidth': {
          const bc = formInputBorderColor ? formInputBorderColor.value : '#dddddd';
          applyToFormParts(FORM_SELECTORS.inputs, t => {
            if (v === 0) t.style.setProperty('border', 'none', 'important');
            else t.style.setProperty('border', `${v}px solid ${bc}`, 'important');
          });
          break;
        }
        case 'formBtnBorderRadius':
          applyToFormParts(FORM_SELECTORS.buttons, t => t.style.setProperty('border-radius', v + 'px', 'important'));
          break;
        case 'formInputPaddingX':
          applyToFormParts(FORM_SELECTORS.inputs, t => {
            t.style.setProperty('padding-left', v + 'px', 'important');
            t.style.setProperty('padding-right', v + 'px', 'important');
          });
          break;
        case 'formBtnHeight':
          applyToFormParts(FORM_SELECTORS.buttons, t => {
            t.style.setProperty('height', v + 'px', 'important');
            t.style.setProperty('min-height', v + 'px', 'important');
            // Flex-центровка вместо line-height (корректна для многострочного текста)
            t.style.setProperty('display', 'inline-flex', 'important');
            t.style.setProperty('align-items', 'center', 'important');
            t.style.setProperty('justify-content', 'center', 'important');
            t.style.setProperty('padding-top', '0', 'important');
            t.style.setProperty('padding-bottom', '0', 'important');
          });
          break;
      }
      positionOverlay(selectedOverlay, selectedElement);
    });
  });

  // ---------- COLOR INPUTS ----------
  bgColorInput.addEventListener('input', () => { bgState.color = bgColorInput.value; applyBg(); });
  textColorInput.addEventListener('input', () => { textState.color = textColorInput.value; applyText(); });
  borderColorInput.addEventListener('input', applyBorder);

  // ---------- BG MODE ----------
  sidebar.querySelectorAll('.gse-bg-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setBgMode(btn.getAttribute('data-bg-mode'));
      applyBg();
    });
  });

  gradC1Input.addEventListener('input', () => { bgState.gradC1 = gradC1Input.value; if (bgState.mode === 'gradient') applyBg(); });
  gradC2Input.addEventListener('input', () => { bgState.gradC2 = gradC2Input.value; if (bgState.mode === 'gradient') applyBg(); });

  // ---------- FORM CONTROLS ----------
  formFontSelect.addEventListener('change', () => {
    formState.font = formFontSelect.value;
    formFontSelect.dataset.dirty = '1';
    applyFontToForm(formState.font);
  });

  function markFormSliderDirty(prop) {
    const slider = sidebar.querySelector(`[data-prop="${prop}"]`);
    if (slider) slider.dataset.dirty = '1';
  }

  formInputFullwidthBtn.addEventListener('click', () => {
    markFormSliderDirty('formInputWidth');
    applyToFormParts(FORM_SELECTORS.inputs, t => {
      t.style.setProperty('width', '100%', 'important');
      t.style.setProperty('max-width', '100%', 'important');
    });
  });

  formBtnFullwidthBtn.addEventListener('click', () => {
    markFormSliderDirty('formBtnWidth');
    applyToFormParts(FORM_SELECTORS.buttons, t => {
      t.style.setProperty('width', '100%', 'important');
      t.style.setProperty('max-width', '100%', 'important');
    });
  });

  formBtnAutoBtn.addEventListener('click', () => {
    markFormSliderDirty('formBtnWidth');
    applyToFormParts(FORM_SELECTORS.buttons, t => {
      t.style.removeProperty('width');
      t.style.removeProperty('max-width');
      t.style.setProperty('width', 'auto', 'important');
    });
  });

  formInputBorderColor.addEventListener('input', () => {
    formInputBorderColor.dataset.dirty = '1';
    const ws = sidebar.querySelector('[data-prop="formInputBorderWidth"]');
    const w = ws ? parseFloat(ws.value) : 1;
    if (w === 0) return;
    applyToFormParts(FORM_SELECTORS.inputs, t => t.style.setProperty('border', `${w}px solid ${formInputBorderColor.value}`, 'important'));
  });

  formInputFocusColor.addEventListener('input', () => {
    formInputFocusColor.dataset.dirty = '1';
    updatePreviewStyle();
  });

  formInputTextColor.addEventListener('input', () => {
    formInputTextColor.dataset.dirty = '1';
    applyToFormParts(FORM_SELECTORS.inputs, t => t.style.setProperty('color', formInputTextColor.value, 'important'));
  });

  formInputBgColor.addEventListener('input', () => {
    formInputBgColor.dataset.dirty = '1';
    if (formInputTransparentBg.checked) return;
    applyToFormParts(FORM_SELECTORS.inputs, t => {
      t.style.setProperty('background-color', formInputBgColor.value, 'important');
      t.style.setProperty('background-image', 'none', 'important');
    });
    updatePreviewStyle();
  });

  formInputPlaceholderColor.addEventListener('input', () => {
    formInputPlaceholderColor.dataset.dirty = '1';
    updatePreviewStyle();
  });

  formInputTransparentBg.addEventListener('change', () => {
    formInputTransparentBg.dataset.dirty = '1';
    if (formInputTransparentBg.checked) {
      applyToFormParts(FORM_SELECTORS.inputs, t => {
        t.style.setProperty('background-color', 'transparent', 'important');
        t.style.setProperty('background-image', 'none', 'important');
      });
    } else {
      applyToFormParts(FORM_SELECTORS.inputs, t => {
        t.style.removeProperty('background-color');
        t.style.removeProperty('background-image');
      });
    }
    updatePreviewStyle();
  });

  formInputAutofillFix.addEventListener('change', () => {
    formInputAutofillFix.dataset.dirty = '1';
    updatePreviewStyle();
  });

  formConsentLinkColor.addEventListener('input', () => {
    formConsentLinkColor.dataset.dirty = '1';
    updatePreviewStyle();
  });

  formBtnBg.addEventListener('input', () => {
    formBtnBg.dataset.dirty = '1';
    applyToFormParts(FORM_SELECTORS.buttons, t => {
      t.style.setProperty('background-color', formBtnBg.value, 'important');
      t.style.setProperty('background-image', 'none', 'important');
    });
  });

  formBtnColor.addEventListener('input', () => {
    formBtnColor.dataset.dirty = '1';
    applyToFormParts(FORM_SELECTORS.buttons, t => t.style.setProperty('color', formBtnColor.value, 'important'));
  });

  formBtnHover.addEventListener('change', () => {
    formBtnHover.dataset.dirty = '1';
    updatePreviewStyle();
  });

  // ---------- PREVIEW STYLE (для pseudo-элементов: placeholder, focus, autofill, ссылка согласия) ----------
  function getInputBgForExport() {
    if (formInputTransparentBg && formInputTransparentBg.checked) return 'transparent';
    if (formInputBgColor && formInputBgColor.dataset.dirty === '1') return formInputBgColor.value;
    return null;
  }

  function updatePreviewStyle() {
    let style = document.getElementById('gse-preview-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'gse-preview-style';
      document.head.appendChild(style);
    }
    const blocks = [];

    if (formInputPlaceholderColor && formInputPlaceholderColor.dataset.dirty === '1') {
      blocks.push(`.lt-form .f-input::placeholder { color: ${formInputPlaceholderColor.value} !important; }`);
    }
    if (formInputFocusColor && formInputFocusColor.dataset.dirty === '1') {
      blocks.push(`.lt-form .f-input:focus, .lt-form .f-input:focus-visible { outline: 1px solid ${formInputFocusColor.value} !important; }`);
    }
    if (formInputAutofillFix && formInputAutofillFix.checked) {
      const bg = getInputBgForExport() || '#ffffff';
      blocks.push(`input:-webkit-autofill { background-color: ${bg} !important; -webkit-box-shadow: 0 0 0px 1000px ${bg} inset !important; }`);
    }
    if (formConsentLinkColor && formConsentLinkColor.dataset.dirty === '1') {
      blocks.push(`.global-confirm-checkbox-block a, .field-checkbox a, .field-confirm a { color: ${formConsentLinkColor.value} !important; text-decoration: underline; }`);
    }
    if (formBtnHover && formBtnHover.dataset.dirty === '1' && formBtnHover.value !== 'none') {
      const transforms = { scale: 'scale(1.05)', lift: 'translateY(-5px)', slide: 'translateX(10px)' };
      const t = transforms[formBtnHover.value];
      if (t) {
        const pScope = (formBtnScope && formBtnScope.value) === 'form' ? `${formScopePrefix()} .btn.f-btn` : '.btn.f-btn';
        blocks.push(`${pScope} { transition: 0.3s ease-in-out; }`);
        blocks.push(`${pScope}:hover { transform: ${t} !important; transition: 0.5s ease-in-out !important; }`);
      }
    }

    style.textContent = blocks.join('\n');
    scheduleSave();
  }

  // ---------- FW / TA ----------
  sidebar.querySelectorAll('.gse-fw-row .gse-mini-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!selectedElement) return;
      const fw = btn.getAttribute('data-fw');
      setStyle('font-weight', fw);
      setActiveBtnRow('.gse-fw-row', 'data-fw', fw);
    });
  });
  sidebar.querySelectorAll('.gse-ta-row .gse-mini-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!selectedElement) return;
      const ta = btn.getAttribute('data-ta');
      // Рулим И text-align (для текста), И горизонтальные margin (для блока/карточки,
      // которые отцентрованы через width:fit-content + margin:auto — напр. пресет «Плашка»).
      // justify — чисто текстовое, margin не трогаем.
      setStyle('text-align', ta);
      if (ta === 'left') {
        setStyle('margin-left', '0');
        setStyle('margin-right', 'auto');
      } else if (ta === 'center') {
        setStyle('margin-left', 'auto');
        setStyle('margin-right', 'auto');
      } else if (ta === 'right') {
        setStyle('margin-left', 'auto');
        setStyle('margin-right', '0');
      }
      setActiveBtnRow('.gse-ta-row', 'data-ta', ta);
    });
  });
  sidebar.querySelectorAll('.gse-tt-row .gse-mini-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!selectedElement) return;
      const tt = btn.getAttribute('data-tt');
      setStyle('text-transform', tt);
      setStyle('letter-spacing', tt === 'uppercase' ? '0.04em' : 'normal');
      setActiveBtnRow('.gse-tt-row', 'data-tt', tt);
    });
  });

  // ---------- SHADOW ----------
  function applyShadow() {
    if (!selectedElement) return;
    const { x, y, blur, color, alpha, inset } = shadowState;
    if (blur === 0 && x === 0 && y === 0 && alpha === 0) {
      setStyle('box-shadow', 'none');
    } else {
      const rgba = hexToRgba(color, alpha / 100);
      const shadow = `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${rgba}`;
      setStyle('box-shadow', shadow);
    }
    positionOverlay(selectedOverlay, selectedElement);
  }

  function syncShadowControls() {
    setSliderPair('shadowX', shadowState.x);
    setSliderPair('shadowY', shadowState.y);
    setSliderPair('shadowBlur', shadowState.blur);
    setSliderPair('shadowAlpha', shadowState.alpha);
    shadowColorInput.value = shadowState.color;
    shadowInsetCheckbox.checked = shadowState.inset;
  }

  sidebar.querySelectorAll('.gse-shadow-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!selectedElement) return;
      const key = btn.getAttribute('data-shadow');
      const preset = SHADOW_PRESETS[key];
      if (!preset) return;
      Object.assign(shadowState, preset);
      syncShadowControls();
      applyShadow();
      setActiveBtnRow('.gse-shadow-row', 'data-shadow', key);
    });
  });

  shadowColorInput.addEventListener('input', () => {
    shadowState.color = shadowColorInput.value;
    applyShadow();
    setActiveBtnRow('.gse-shadow-row', 'data-shadow', '');
  });

  shadowInsetCheckbox.addEventListener('change', () => {
    shadowState.inset = shadowInsetCheckbox.checked;
    applyShadow();
  });

  // ---------- PRESETS ----------
  sidebar.querySelectorAll('.gse-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!selectedElement) return;
      const preset = PRESETS[btn.getAttribute('data-preset')];
      if (!preset) return;
      Object.keys(preset.styles).forEach((jsProp) => {
        const cssProp = jsProp.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^webkit-/, '-webkit-');
        setStyle(cssProp, preset.styles[jsProp]);
      });
      syncControlsToElement(selectedElement);
      positionOverlay(selectedOverlay, selectedElement);
    });
  });

  // ---------- RESET ----------
  resetBtn.addEventListener('click', () => {
    if (!selectedElement || !originalStyles.has(selectedElement)) return;
    const original = originalStyles.get(selectedElement);
    if (original) selectedElement.setAttribute('style', original); else selectedElement.removeAttribute('style');
    if (mirrorToSiblings) {
      const { siblings } = findSiblings(selectedElement);
      siblings.forEach(s => {
        if (originalStyles.has(s)) {
          const o = originalStyles.get(s);
          if (o) s.setAttribute('style', o); else s.removeAttribute('style');
        }
      });
    }
    if (currentColumnContainer) {
      if (originalStyles.has(currentColumnContainer)) {
        const o = originalStyles.get(currentColumnContainer);
        if (o) currentColumnContainer.setAttribute('style', o); else currentColumnContainer.removeAttribute('style');
      }
      [...currentColumnContainer.children].forEach(child => {
        if (child !== selectedElement && originalStyles.has(child)) {
          const o = originalStyles.get(child);
          if (o) child.setAttribute('style', o); else child.removeAttribute('style');
        }
      });
    }
    if (currentForm) {
      const formAll = [currentForm, ...currentForm.querySelectorAll('*')];
      formAll.forEach(el => {
        if (el !== selectedElement && originalStyles.has(el)) {
          const o = originalStyles.get(el);
          if (o) el.setAttribute('style', o); else el.removeAttribute('style');
        }
      });
      clearFormDirty();
      const preview = document.getElementById('gse-preview-style');
      if (preview) preview.textContent = '';
      syncFormControls();
    }
    syncControlsToElement(selectedElement);
    positionOverlay(selectedOverlay, selectedElement);
    pulseSiblingOverlays();
    // Откатили элемент(ы) → чистим editedElements от записей с пустым style,
    // чтобы Set не тёк и storage не воскресил мёртвые правки.
    pruneEditedElements();
    // Откатили элемент(ы) → пересохраняем storage, чтобы при reload не вернулись старые правки.
    scheduleSave();
  });

  // Убирает из editedElements откаченные/мёртвые элементы (пустой style или вне DOM).
  function pruneEditedElements() {
    editedElements.forEach(el => {
      if (!el.isConnected || !(el.getAttribute('style') || '').trim()) editedElements.delete(el);
    });
  }

  // ---------- RAF ----------
  let rafId = null;
  function rescheduleOverlays() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      if (selectedElement) positionOverlay(selectedOverlay, selectedElement);
      if (hoveredElement && pickerActive) positionOverlay(hoverOverlay, hoveredElement);
      repositionSiblingOverlays();
      rafId = null;
    });
  }
  window.addEventListener('scroll', rescheduleOverlays, true);
  window.addEventListener('resize', rescheduleOverlays);

  // ---------- FEEDBACK PANEL ----------
  function buildFeedbackPayload() {
    const note = feedbackTextarea.value.trim();
    if (!note) return null;
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let out = `## Заметка ${ts}\n\n${note}\n`;
    if (feedbackCaptureCheck.checked) {
      out += `\n**Контекст:**\n`;
      out += `- URL: ${location.href}\n`;
      out += `- Версия расширения: 0.9.10\n`;
      if (selectedElement) {
        const cs = window.getComputedStyle(selectedElement);
        const inline = selectedElement.getAttribute('style') || '(нет)';
        const r = selectedElement.getBoundingClientRect();
        out += `- Тип элемента: ${detectElementType(selectedElement)}\n`;
        out += `- Тег: \`<${selectedElement.tagName.toLowerCase()}>\`\n`;
        out += `- ID: ${selectedElement.id || '—'}\n`;
        out += `- Классы: \`${selectedElement.className || '—'}\`\n`;
        out += `- Размеры: ${Math.round(r.width)}×${Math.round(r.height)}px\n`;
        out += `- Inline-стили: \`${inline}\`\n`;
        out += `- Цвет фона (вычисленный): ${cs.backgroundColor}\n`;
        out += `- Цвет текста (вычисленный): ${cs.color}\n`;
        out += `- Padding: ${cs.padding}\n`;
        out += `- Шрифт: ${cs.fontFamily.split(',')[0]}, ${cs.fontSize}, weight ${cs.fontWeight}\n`;
      } else {
        out += `- Элемент не выбран\n`;
      }
    }
    return out + '\n---\n';
  }

  function flashStatus(text, type) {
    feedbackStatus.textContent = text;
    feedbackStatus.classList.remove('gse-status-ok', 'gse-status-warn');
    feedbackStatus.classList.add(type === 'warn' ? 'gse-status-warn' : 'gse-status-ok');
    setTimeout(() => {
      feedbackStatus.textContent = '';
      feedbackStatus.classList.remove('gse-status-ok', 'gse-status-warn');
    }, type === 'warn' ? 2500 : 4000);
  }

  feedbackCopyBtn.addEventListener('click', () => {
    const payload = buildFeedbackPayload();
    if (!payload) { flashStatus('⚠️ Напиши заметку сначала', 'warn'); return; }
    navigator.clipboard.writeText(payload).then(() => {
      flashStatus('✓ Скопировано — вставь в чат Клоду', 'ok');
      feedbackTextarea.value = '';
    }).catch(() => {
      flashStatus('⚠️ Не получилось скопировать', 'warn');
    });
  });

  feedbackDownloadBtn.addEventListener('click', () => {
    const payload = buildFeedbackPayload();
    if (!payload) { flashStatus('⚠️ Напиши заметку сначала', 'warn'); return; }
    const fname = `feedback-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.md`;
    const blob = new Blob([payload], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 100);
    flashStatus(`✓ Скачано: ${fname}\nПеретащи в work-zone/zerocoder/getcourse-style-editor/feedback/`, 'ok');
    feedbackTextarea.value = '';
  });

  // Prevent picker mode from swallowing typing in textarea
  feedbackTextarea.addEventListener('mousedown', (e) => e.stopPropagation());
  feedbackTextarea.addEventListener('click', (e) => e.stopPropagation());

  // ---------- EXPORT ----------
  function flashExportStatus(text, type) {
    exportStatus.textContent = text;
    exportStatus.classList.remove('gse-status-ok', 'gse-status-warn');
    exportStatus.classList.add(type === 'warn' ? 'gse-status-warn' : 'gse-status-ok');
    setTimeout(() => {
      exportStatus.textContent = '';
      exportStatus.classList.remove('gse-status-ok', 'gse-status-warn');
    }, type === 'warn' ? 3000 : 4500);
  }

  function collectFontImports() {
    const links = document.querySelectorAll('link[id^="gse-font-"]');
    if (links.length === 0) return '';
    return [...links].map(l => `@import url('${l.href}');`).join('\n');
  }

  // Семантические правила по dirty-слайдерам формы + выбранному шрифту.
  // Селекторы — глобальные классы GC, без #ltBlock scope.
  function getFormExportRules() {
    if (!currentForm) return [];
    const rules = [];

    // Шрифт формы (только если выбран не «Системный»)
    const fontVal = formFontSelect && formFontSelect.value;
    if (fontVal && fontVal !== 'inherit' && formFontSelect.dataset.dirty === '1') {
      if (fontVal === 'gc-native') {
        // Родной шрифт темы лендинга через GC var-переменные (эталон «Стилизация Форм»):
        // заголовки/кнопки/текст → var(--font-family), поля ввода → var(--second-family).
        // Для var() НЕ добавляем fallback (, sans-serif).
        rules.push({
          comment: 'Шрифт формы — заголовки/кнопки (родной GC)',
          selectors: ['.f-header', '.f-subheader', '.f-text', '.f-description', '.f-name', '.form-header', '.f-btn', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'label'],
          decls: { 'font-family': 'var(--font-family)' },
          important: false
        });
        rules.push({
          comment: 'Шрифт формы — поля (родной GC)',
          selectors: ['.lt-form .f-input', 'input', 'textarea', 'select'],
          decls: { 'font-family': 'var(--second-family)' },
          important: false
        });
      } else {
        const fontCss = fontVal.includes(' ') ? `'${fontVal}'` : fontVal;
        rules.push({
          comment: 'Шрифт формы',
          selectors: ['p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'label', 'input', 'textarea', 'select', '.f-btn', '.f-input', '.form-control', '.f-header', '.f-subheader', '.f-text', '.f-description', '.f-name', '.html-content'],
          decls: { 'font-family': `${fontCss}, sans-serif` },
          important: false
        });
      }
    }

    // Заголовки формы
    const titleSize = readDirtySlider('formTitleSize');
    if (titleSize !== null) {
      rules.push({
        comment: 'Заголовки формы',
        selectors: ['.f-header', '.form-header'],
        decls: { 'font-size': titleSize + 'px' },
        important: true
      });
    }

    // Поля ввода — селектор .lt-form .f-input по эталону GC
    const inputDecls = {};
    const iw = readDirtySlider('formInputWidth');
    const ih = readDirtySlider('formInputHeight');
    const ifs = readDirtySlider('formInputFont');
    const ipx = readDirtySlider('formInputPaddingX');
    const ibr = readDirtySlider('formInputBorderRadius');
    const ibw = readDirtySlider('formInputBorderWidth');
    if (iw !== null) { inputDecls['width'] = iw + 'px'; inputDecls['max-width'] = '100%'; }
    if (ih !== null) { inputDecls['height'] = ih + 'px'; }
    if (ifs !== null) { inputDecls['font-size'] = ifs + 'px'; }
    if (ipx !== null) { inputDecls['padding'] = `0 ${ipx}px`; }
    if (ibr !== null) { inputDecls['border-radius'] = ibr + 'px'; }
    if (ibw !== null) {
      if (ibw === 0) inputDecls['border'] = 'none';
      else inputDecls['border'] = `${ibw}px solid ${formInputBorderColor ? formInputBorderColor.value : '#dddddd'}`;
    } else if (formInputBorderColor && formInputBorderColor.dataset.dirty === '1') {
      const ws = sidebar.querySelector('[data-prop="formInputBorderWidth"]');
      const w = ws ? parseFloat(ws.value) : 1;
      if (w > 0) inputDecls['border'] = `${w}px solid ${formInputBorderColor.value}`;
    }
    if (formInputTextColor && formInputTextColor.dataset.dirty === '1') {
      inputDecls['color'] = formInputTextColor.value;
    }
    if (formInputTransparentBg && formInputTransparentBg.dataset.dirty === '1' && formInputTransparentBg.checked) {
      inputDecls['background-color'] = 'transparent';
      inputDecls['background-image'] = 'none';
    } else if (formInputBgColor && formInputBgColor.dataset.dirty === '1') {
      inputDecls['background-color'] = formInputBgColor.value;
      inputDecls['background-image'] = 'none';
    }
    if (Object.keys(inputDecls).length > 0) {
      rules.push({
        comment: 'Поля ввода',
        selectors: ['.lt-form .f-input'],
        decls: inputDecls,
        important: true
      });
    }

    // Placeholder (pseudo-element)
    if (formInputPlaceholderColor && formInputPlaceholderColor.dataset.dirty === '1') {
      rules.push({
        comment: 'Цвет подсказки',
        selectors: ['.lt-form .f-input::placeholder'],
        decls: { 'color': formInputPlaceholderColor.value },
        important: true
      });
    }

    // Focus outline. Эталон GC подтверждает outline — оставляем как есть.
    // TODO: для будущего пресета «без обводки с подчёркиванием» здесь понадобится
    // border-bottom вместо outline (тогда учесть, что border на :focus сдвигает контент).
    if (formInputFocusColor && formInputFocusColor.dataset.dirty === '1') {
      rules.push({
        comment: 'Рамка поля при фокусе',
        selectors: ['.lt-form .f-input:focus', '.lt-form .f-input:focus-visible'],
        decls: { 'outline': `1px solid ${formInputFocusColor.value}` },
        important: true
      });
    }

    // Autofill-фикс (анти-жёлтый Chrome)
    if (formInputAutofillFix && formInputAutofillFix.checked) {
      const bg = getInputBgForExport() || '#ffffff';
      rules.push({
        comment: 'Убрать жёлтый автозаполнения',
        selectors: ['input:-webkit-autofill'],
        decls: {
          'background-color': bg,
          '-webkit-box-shadow': `0 0 0px 1000px ${bg} inset`
        },
        important: true
      });
    }

    // Отступ между полями. Покрываем два случая:
    // 1) обычные формы с part-field (классический GC);
    // 2) модальные формы БЕЗ part-field — там целим обёртку .builder-item, внутри которой есть поле,
    //    через :has(...), исключая кнопку и заголовок.
    const gap = readDirtySlider('formFieldGap');
    if (gap !== null) {
      // Классические селекторы (с part-field) — в своём правиле.
      rules.push({
        comment: 'Отступ между полями',
        selectors: [
          '.lt-form .builder-item.part-field',
          '.form-block .builder-item.part-field',
          '.modal-form-inner .builder-item.part-field',
          '.builder-item.part-field'
        ],
        decls: { 'margin-bottom': gap + 'px' },
        important: true
      });
      // :has()-селекторы — ОТДЕЛЬНЫМ правилом (noGroup). В обычном селектор-листе
      // :has() non-forgiving: на движке без поддержки :has() инвалидируется ВСЁ
      // правило. Изоляция гарантирует, что отвал :has() не убьёт классические выше.
      rules.push({
        comment: 'Отступ между полями (модальные формы без part-field)',
        selectors: [
          '.builder-item:not(.part-button):not(.part-header):has(.f-input)',
          '.builder-item:not(.part-button):not(.part-header):has(input)',
          '.builder-item:not(.part-button):not(.part-header):has(textarea)',
          '.builder-item:not(.part-button):not(.part-header):has(select)'
        ],
        decls: { 'margin-bottom': gap + 'px' },
        important: true,
        noGroup: true
      });
    }

    // Согласие — основной селектор .global-confirm-checkbox-block (эталон GC) + fallback
    const cs = readDirtySlider('formConsentSize');
    if (cs !== null) {
      rules.push({
        comment: 'Текст согласия',
        selectors: ['.global-confirm-checkbox-block', '.field-checkbox label', '.field-confirm', '.agreement'],
        decls: { 'font-size': cs + 'px' },
        important: true
      });
    }
    if (formConsentLinkColor && formConsentLinkColor.dataset.dirty === '1') {
      rules.push({
        comment: 'Ссылка в согласии',
        selectors: ['.global-confirm-checkbox-block a', '.field-checkbox a', '.field-confirm a'],
        decls: {
          'color': formConsentLinkColor.value,
          'text-decoration': 'underline'
        },
        important: true
      });
    }

    // Кнопка отправки. Селектор зависит от тумблера «Область кнопки»:
    //   global → .btn.f-btn (один стиль на все кнопки страницы, как у Zerocoder)
    //   form   → <scope> .btn.f-btn (только эта форма; scope бьёт GC-специфичность
    //            mobile). Префикс берётся от реальной формы — см. formScopePrefix().
    const btnScope = (formBtnScope && formBtnScope.value) || 'form';
    const scopePrefix = formScopePrefix();
    const btnSel = btnScope === 'form' ? `${scopePrefix} .btn.f-btn` : '.btn.f-btn';
    const btnHoverSel = btnScope === 'form' ? `${scopePrefix} .btn.f-btn:hover` : '.btn.f-btn:hover';
    const btnDecls = {};
    const bw = readDirtySlider('formBtnWidth');
    const bh = readDirtySlider('formBtnHeight');
    const bfs = readDirtySlider('formBtnFont');
    const bbr = readDirtySlider('formBtnBorderRadius');
    if (bw !== null) { btnDecls['width'] = bw + 'px'; btnDecls['max-width'] = '100%'; }
    if (bh !== null) {
      btnDecls['height'] = bh + 'px';
      btnDecls['min-height'] = bh + 'px';
      // Flex-центровка вместо line-height — корректна для многострочного текста кнопки.
      btnDecls['display'] = 'inline-flex';
      btnDecls['align-items'] = 'center';
      btnDecls['justify-content'] = 'center';
      btnDecls['padding-top'] = '0';
      btnDecls['padding-bottom'] = '0';
    }
    if (bfs !== null) { btnDecls['font-size'] = bfs + 'px'; }
    if (bbr !== null) { btnDecls['border-radius'] = bbr + 'px'; }
    if (formBtnBg && formBtnBg.dataset.dirty === '1') {
      btnDecls['background-color'] = formBtnBg.value;
      btnDecls['background-image'] = 'none';
    }
    if (formBtnColor && formBtnColor.dataset.dirty === '1') {
      btnDecls['color'] = formBtnColor.value;
    }
    if (Object.keys(btnDecls).length > 0) {
      // Перенос длинного текста на следующую строку (эталон «Стилизация кнопок»).
      btnDecls['white-space'] = 'normal';
      rules.push({
        comment: btnScope === 'form' ? 'Кнопка (только форма)' : 'Кнопка (глобально)',
        selectors: [btnSel],
        decls: btnDecls,
        important: true
      });
    }

    // Снять стандартную тень при нажатии (эталон «Стилизация кнопок»: .btn.f-btn:active).
    // Выгружаем, когда кнопка вообще стилизуется или выбран hover.
    const btnHasStyle = Object.keys(btnDecls).length > 0;
    const btnHasHover = formBtnHover && formBtnHover.value !== 'none';
    if (btnHasStyle || btnHasHover) {
      rules.push({
        comment: 'Кнопка — снять стандартную тень при нажатии',
        selectors: [`${btnSel}:active`],
        decls: { 'box-shadow': 'none' },
        important: true
      });
    }

    // Hover-эффект кнопки
    const hover = formBtnHover && formBtnHover.value;
    if (hover && hover !== 'none' && formBtnHover.dataset.dirty === '1') {
      const transforms = {
        scale: 'scale(1.05)',
        lift: 'translateY(-5px)',
        slide: 'translateX(10px)'
      };
      const t = transforms[hover];
      if (t) {
        rules.push({
          comment: 'Кнопка — плавность перехода',
          selectors: [btnSel],
          decls: { 'transition': '0.3s ease-in-out' },
          important: false
        });
        rules.push({
          comment: 'Кнопка при наведении',
          selectors: [btnHoverSel],
          decls: { 'transform': t, 'transition': '0.5s ease-in-out' },
          important: true
        });
      }
    }

    return rules;
  }

  // Индивидуальные правила — для элементов с GC-ID, тронутых через picker.
  // Берём ТЕКУЩИЕ inline-стили (без формовых, чтобы не дублировать).
  const FORM_SCOPED_PROPS = new Set(['font-family', 'font-size', 'width', 'max-width', 'height', 'margin-bottom', 'border-radius', 'border', 'border-color', 'border-width', 'border-style', 'background', 'background-color', 'background-image', 'color']);

  function parseInlineStyles(inlineStr) {
    const out = {};
    if (!inlineStr) return out;
    inlineStr.split(';').forEach(s => {
      const t = s.trim();
      if (!t) return;
      const i = t.indexOf(':');
      if (i < 0) return;
      const prop = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim().replace(/\s*!important$/, '');
      out[prop] = val;
    });
    return out;
  }

  // Подбираем самый стабильный класс GC для элемента (без шума)
  function pickStableClass(el) {
    const SKIP = /^(animated|lazyloaded|gse-|js-|builder$|col-md-|text-(center|left|right)|flex-|active|hover|sibling|tn-)/;
    const PRIORITY = ['f-header', 'f-subheader', 'f-text', 'f-description', 'f-name', 'f-btn', 'f-input', 'lt-block-wrapper', 'block-box', 'cover-wrapper', 'cover-filter', 'lt-tsr-block', 'lt-tsr-content', 'image-card', 'image-wrapper', 'image-box', 'modal-block-content'];
    for (const p of PRIORITY) if (el.classList.contains(p)) return p;
    for (const c of el.classList) if (!SKIP.test(c)) return c;
    return null;
  }

  function getIndividualExportRules() {
    if (!selectedElement) return [];
    const scope = selectedElement.closest('.lt-block') || selectedElement;
    const candidates = [scope, ...scope.querySelectorAll('*')];
    const rules = [];

    candidates.forEach(el => {
      if (isGcNoise(el)) return;
      if (!originalStyles.has(el)) return;
      const inline = el.getAttribute('style') || '';
      if (!inline.trim()) return;

      // Селектор: собственный ID элемента приоритетнее класса.
      // Иначе два элемента с одним классом (.f-text + .f-text) дадут одинаковый
      // селектор с разными телами — groupRules их не сольёт, второй перебьёт первый.
      // Класс-селектор — fallback только когда у элемента нет своего id.
      let selector = null;
      if (el === scope) {
        if (scope.id) selector = `#${scope.id}`;
      } else if (el.id) {
        selector = scope.id ? `#${scope.id} #${el.id}` : `#${el.id}`;
      } else {
        const cls = pickStableClass(el);
        if (cls) selector = scope.id ? `#${scope.id} .${cls}` : `.${cls}`;
      }
      if (!selector) return;

      const decls = parseInlineStyles(inline);
      // Убираем формовые свойства — они уже в getFormExportRules
      if (currentForm && currentForm.contains(el)) {
        Object.keys(decls).forEach(p => {
          if (FORM_SCOPED_PROPS.has(p)) delete decls[p];
        });
      }
      // Лишние сопутствующие
      if (decls['line-height'] === decls['height']) delete decls['line-height'];
      if (Object.keys(decls).length === 0) return;

      rules.push({
        selectors: [selector],
        decls,
        important: true
      });
    });

    return rules;
  }

  function formatRuleBody(decls, important) {
    return Object.entries(decls)
      .map(([p, v]) => `  ${p}: ${v}${important ? ' !important' : ''};`)
      .join('\n');
  }

  // Группировка: правила с одинаковым телом объединяются под один селектор-список
  function groupRules(rules) {
    const map = new Map(); // body -> { comment, selectors[] }
    const standalone = []; // noGroup-правила (например :has-лист) — не сливаем по телу
    rules.forEach(r => {
      const body = formatRuleBody(r.decls, r.important);
      if (r.noGroup) {
        standalone.push({ comment: r.comment, selectors: [...r.selectors], body });
        return;
      }
      const key = body;
      if (!map.has(key)) map.set(key, { comment: r.comment, selectors: [] });
      map.get(key).selectors.push(...r.selectors);
    });
    const grouped = [...map.entries()].map(([body, { comment, selectors }]) => ({
      comment, selectors, body
    }));
    return [...grouped, ...standalone];
  }

  function exportBlockStyles() {
    if (!selectedElement) return null;

    const formRules = getFormExportRules();
    const individualRules = getIndividualExportRules();
    const all = [...formRules, ...individualRules];
    if (all.length === 0) return null;

    const grouped = groupRules(all);
    const imports = collectFontImports();

    const blocks = grouped.map(({ comment, selectors, body }) => {
      const sels = [...new Set(selectors)].join(',\n');
      const head = comment ? `/* ${comment} */\n${sels} {` : `${sels} {`;
      return `${head}\n${body}\n}`;
    });

    // Без <style> обёртки — CSS-поле блока GC ожидает голый CSS.
    const parts = [];
    if (imports) parts.push(imports);
    parts.push(blocks.join('\n\n'));
    return parts.join('\n\n');
  }

  // Последний сгенерированный CSS — чтобы отличить ручные правки от автогенерации.
  let lastGeneratedCss = '';

  // Шаг 1: генерируем CSS в textarea и раскрываем предпросмотр.
  exportBtn.addEventListener('click', () => {
    const payload = exportBlockStyles();
    exportPreviewWrap.hidden = false;
    if (!payload) {
      exportPreview.value = '/* Нет тронутых стилей — выбери блок и измени что-нибудь. */';
      lastGeneratedCss = '';
      flashExportStatus('⚠️ Ничего не стилизовано — настрой что-нибудь сначала', 'warn');
      return;
    }
    // Защита ручных правок: если в окне уже есть текст и он отличается от того,
    // что мы генерировали в прошлый раз — значит Лида правила руками. Не затираем молча.
    const current = (exportPreview.value || '').trim();
    const edited = current && current !== lastGeneratedCss.trim() && !current.startsWith('/* Нет тронутых стилей');
    if (edited) {
      const ok = window.confirm('В окне есть ручные правки. Перегенерировать CSS и потерять их?');
      if (!ok) {
        flashExportStatus('Оставил твою версию без изменений', 'ok');
        return;
      }
    }
    exportPreview.value = payload;
    lastGeneratedCss = payload;
    const lines = payload.split('\n').length;
    flashExportStatus(`✓ CSS готов (${lines} строк). Можно поправить и скопировать.`, 'ok');
  });

  // Шаг 2: копируем то, что сейчас в textarea (с учётом ручных правок).
  exportCopyBtn.addEventListener('click', () => {
    const text = (exportPreview.value || '').trim();
    if (!text || text.startsWith('/* Нет тронутых стилей')) {
      flashExportStatus('⚠️ Нечего копировать — сначала сгенерируй CSS', 'warn');
      return;
    }
    navigator.clipboard.writeText(exportPreview.value).then(() => {
      const original = exportCopyBtn.querySelector('.gse-export-copy-label').textContent;
      exportCopyBtn.querySelector('.gse-export-copy-label').textContent = 'Скопировано ✓';
      exportCopyBtn.classList.add('gse-copied');
      setTimeout(() => {
        exportCopyBtn.querySelector('.gse-export-copy-label').textContent = original;
        exportCopyBtn.classList.remove('gse-copied');
      }, 2000);
      flashExportStatus('✓ Скопировано. Вставь в CSS-поле блока.', 'ok');
    }).catch(() => {
      flashExportStatus('⚠️ Не получилось скопировать в буфер', 'warn');
    });
  });

  // ---------- PERSISTENCE: clear button + init restore ----------
  persistClearBtn.addEventListener('click', () => {
    clearSavedEdits(); // удаляет ключ + чистит трекинг (стили на странице НЕ откатываем)
    persistStatus.textContent = '✓ Очищено — при следующей перезагрузке не восстановится';
    persistStatus.classList.add('gse-status-ok');
    setTimeout(() => { persistStatus.textContent = ''; persistStatus.classList.remove('gse-status-ok'); }, 3500);
  });

  // ---------- LIBRARY (библиотека блоков) ----------
  const CATEGORY_LABELS = {
    all: 'Все', faq: 'FAQ / Глоссарий', gifts: 'Подарки',
    pricing: 'Тарифы', speaker: 'Спикер',
    webinar: 'Вебинар', audience: 'Аудитория',
    hero: 'Обложка', about: 'О нас'
  };
  const LIB_TEMPLATES = (typeof GSE_TEMPLATES !== 'undefined' && Array.isArray(GSE_TEMPLATES)) ? GSE_TEMPLATES : [];
  let activeCategory = 'all';
  let previewOverlay = null;

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Переключение табов Редактор / Библиотека
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      tabBtns.forEach(b => b.classList.toggle('gse-active', b === btn));
      modePanels.forEach(p => { p.hidden = p.dataset.mode !== mode; });
    });
  });

  function renderLibChips() {
    if (!libChips) return;
    const cats = ['all', ...new Set(LIB_TEMPLATES.map(t => t.category))];
    libChips.innerHTML = cats.map(c =>
      `<button type="button" class="gse-lib-chip${c === activeCategory ? ' gse-active' : ''}" data-category="${escapeHtml(c)}">${escapeHtml(CATEGORY_LABELS[c] || c)}</button>`
    ).join('');
    libChips.querySelectorAll('.gse-lib-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeCategory = chip.dataset.category;
        libChips.querySelectorAll('.gse-lib-chip').forEach(c => c.classList.toggle('gse-active', c === chip));
        renderLibCards();
      });
    });
  }

  function renderLibCards() {
    if (!libList) return;
    const list = LIB_TEMPLATES.filter(t => activeCategory === 'all' || t.category === activeCategory);
    if (list.length === 0) {
      libList.innerHTML = '<p class="gse-lib-empty">В этой категории пока пусто.</p>';
      return;
    }
    libList.innerHTML = list.map(t => `
      <div class="gse-lib-card" data-id="${escapeHtml(t.id)}">
        <div class="gse-lib-card-info">
          <span class="gse-lib-card-name">${escapeHtml(t.name)}</span>
          <span class="gse-lib-card-meta">${escapeHtml(t.meta || '')}</span>
        </div>
        <div class="gse-lib-card-actions">
          <button type="button" class="gse-lib-btn gse-lib-preview" data-id="${escapeHtml(t.id)}">👁 Превью</button>
          <button type="button" class="gse-lib-btn gse-lib-copy" data-id="${escapeHtml(t.id)}">📋 Копировать</button>
        </div>
      </div>
    `).join('');

    libList.querySelectorAll('.gse-lib-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const tpl = LIB_TEMPLATES.find(t => t.id === btn.dataset.id);
        if (!tpl) return;
        navigator.clipboard.writeText(tpl.html).then(() => {
          const orig = btn.textContent;
          btn.textContent = 'Скопировано ✓';
          btn.classList.add('gse-copied');
          setTimeout(() => { btn.textContent = orig; btn.classList.remove('gse-copied'); }, 2000);
        }).catch(() => {
          const orig = btn.textContent;
          btn.textContent = '⚠️ Ошибка';
          setTimeout(() => { btn.textContent = orig; }, 2000);
        });
      });
    });

    libList.querySelectorAll('.gse-lib-preview').forEach(btn => {
      btn.addEventListener('click', () => {
        const tpl = LIB_TEMPLATES.find(t => t.id === btn.dataset.id);
        if (tpl) openLibPreview(tpl);
      });
    });
  }

  function openLibPreview(tpl) {
    closeLibPreview();
    const overlay = document.createElement('div');
    overlay.className = 'gse-lib-preview-overlay';
    overlay.innerHTML = `
      <button type="button" class="gse-lib-preview-close" aria-label="Закрыть">✕</button>
      <div class="gse-lib-preview-stage">
        <iframe class="gse-lib-iframe" sandbox="allow-same-origin"></iframe>
      </div>
    `;
    document.body.appendChild(overlay);
    const iframe = overlay.querySelector('.gse-lib-iframe');
    iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=1100"><style>html,body{margin:0;padding:0;background:#141414}</style></head><body>${tpl.html}</body></html>`;

    overlay.querySelector('.gse-lib-preview-close').addEventListener('click', closeLibPreview);
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) closeLibPreview(); });
    previewOverlay = overlay;
  }

  function closeLibPreview() {
    if (previewOverlay) { previewOverlay.remove(); previewOverlay = null; }
  }

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && previewOverlay) closeLibPreview(); });

  renderLibChips();
  renderLibCards();

  // Авто-восстановление сохранённых правок при загрузке страницы.
  restoreEdits();
})();
