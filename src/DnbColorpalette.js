const DEFAULT_FORMAT = 'lines';
const DEFAULT_MIN_HEIGHT = '50px';
const DEFAULT_MIN_COLUMN_WIDTH = '0';

const attributeNames = [
  'format',
  'outer-class',
  'max-width',
  'min-column-width',
  'min-height',
  'max-height',
  'border-class',
  'copy',
  'copy-label',
];

export class DnbColorpalette extends HTMLElement {
  static get observedAttributes() {
    return attributeNames;
  }

  constructor() {
    super();
    this.sourceContent = '';
    this.colors = [];
    this.copyPalette = this.copyPalette.bind(this);
    this.inputObserver = null;
  }

  connectedCallback() {
    this.observeInputContent();

    queueMicrotask(() => {
      this.captureInputContent();
    });
  }


  observeInputContent() {
    if (this.sourceContent || this.inputObserver) {
      return;
    }

    this.inputObserver = new MutationObserver(() => {
      this.captureInputContent();
    });
    this.inputObserver.observe(this, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  captureInputContent() {
    if (this.sourceContent || this.textContent.trim().length === 0) {
      return false;
    }

    this.sourceContent = this.textContent;

    if (this.inputObserver) {
      this.inputObserver.disconnect();
      this.inputObserver = null;
    }

    this.render();

    return true;
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }

    if (this.sourceContent) {
      this.render();
    } else {
      this.captureInputContent();
    }
  }

  get format() {
    return this.getAttribute('format') || DEFAULT_FORMAT;
  }

  get outerClass() {
    return this.getAttribute('outer-class') || '';
  }

  get maxWidth() {
    return this.getAttribute('max-width') || '';
  }

  get minColumnWidth() {
    return this.getAttribute('min-column-width') || DEFAULT_MIN_COLUMN_WIDTH;
  }

  get minHeight() {
    return this.getAttribute('min-height') || DEFAULT_MIN_HEIGHT;
  }

  get maxHeight() {
    return this.getAttribute('max-height') || '';
  }

  get borderClass() {
    return this.getAttribute('border-class') || 'border border-slate-200';
  }

  get shouldRenderCopyButton() {
    return this.hasAttribute('copy');
  }

  get copyLabel() {
    return this.getAttribute('copy-label') || 'Copy palette';
  }

  get parsedColors() {
    return DnbColorpalette.parseColors(this.sourceContent, this.format);
  }

  static parseColors(content, format = DEFAULT_FORMAT) {
    if (format !== DEFAULT_FORMAT) {
      return [];
    }

    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !DnbColorpalette.isComment(line))
      .filter((line) => DnbColorpalette.isValidColor(line));
  }

  static isComment(line) {
    return line.startsWith('//') || line.startsWith('/*') || line.startsWith('*');
  }

  static isValidColor(color) {
    if (globalThis.CSS?.supports) {
      return CSS.supports('color', color);
    }

    if (!globalThis.document) {
      return true;
    }

    const testElement = document.createElement('span');
    testElement.style.color = '';
    testElement.style.color = color;

    return testElement.style.color !== '';
  }

  render() {
    this.colors = this.parsedColors;
    const container = document.createElement('div');
    const outerClasses = ['is-component', 'dnb-wc-colorpalette', this.outerClass]
      .join(' ')
      .trim()
      .replace(/\s+/g, ' ');

    container.className = outerClasses;

    if (this.maxWidth) {
      container.style.maxWidth = this.maxWidth;
    }

    const grid = document.createElement('div');
    grid.className = [
      'grid',
      'w-full',
      'overflow-hidden',
      'rounded',
      this.borderClass,
    ]
      .join(' ')
      .trim()
      .replace(/\s+/g, ' ');
    grid.style.gridTemplateColumns = `repeat(${this.colors.length}, minmax(${this.minColumnWidth}, 1fr))`;
    grid.style.minHeight = this.minHeight;

    if (this.maxHeight) {
      grid.style.maxHeight = this.maxHeight;
    }

    for (const color of this.colors) {
      grid.append(this.createColumn(color));
    }

    container.append(grid);

    if (this.shouldRenderCopyButton) {
      container.append(this.createCopyButton());
    }

    this.replaceChildren(container);
  }

  createColumn(color) {
    const column = document.createElement('div');
    column.className = 'flex min-h-full items-end justify-center p-2 text-center text-xs font-medium';
    column.style.backgroundColor = color;
    column.style.minWidth = this.minColumnWidth;
    column.dataset.color = color;

    const label = document.createElement('span');
    label.className = 'rounded bg-white/70 px-2 py-1 text-slate-950 backdrop-blur-sm';
    label.textContent = color;

    column.append(label);

    return column;
  }

  createCopyButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mt-2 rounded border border-slate-300 px-3 py-1 text-sm font-medium hover:bg-slate-100';
    button.textContent = this.copyLabel;
    button.addEventListener('click', this.copyPalette);

    return button;
  }

  async copyPalette() {
    if (!globalThis.navigator?.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(this.colors.join('\n'));
  }
}

if (!customElements.get('dnb-colorpalette')) {
  customElements.define('dnb-colorpalette', DnbColorpalette);
}
