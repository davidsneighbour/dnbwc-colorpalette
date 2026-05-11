import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DnbColorpalette } from '../src/DnbColorpalette.js';

describe('DnbColorpalette', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('registers the dnb-colorpalette custom element', () => {
    expect(customElements.get('dnb-colorpalette')).toBe(DnbColorpalette);
  });

  it('parses one CSS color per line and trims empty lines', () => {
    const colors = DnbColorpalette.parseColors(`
      #ff0000

      hsl(120 100% 50%)
      rebeccapurple
    `);

    expect(colors).toEqual(['#ff0000', 'hsl(120 100% 50%)', 'rebeccapurple']);
  });

  it('ignores comment lines without treating hex colors as comments', () => {
    const colors = DnbColorpalette.parseColors(`
      // design note
      /* another note */
      * list note
      #abc
      tomato
    `);

    expect(colors).toEqual(['#abc', 'tomato']);
  });

  it('parses normal hex colors from TODO examples', () => {
    const colors = DnbColorpalette.parseColors(`
      #001427
      #708d81
      #f4d58d
      #bf0603
      #8d0801
    `);

    expect(colors).toEqual(['#001427', '#708d81', '#f4d58d', '#bf0603', '#8d0801']);
  });

  it('parses eight-digit hex colors with opacity from TODO examples', () => {
    const colors = DnbColorpalette.parseColors(`
      #001427ff
      #708d81ff
      #f4d58dff
      #bf0603ff
      #8d0801ff
    `);

    expect(colors).toEqual(['#001427ff', '#708d81ff', '#f4d58dff', '#bf0603ff', '#8d0801ff']);
  });

  it('parses colors with semicolons and inline comments', () => {
    const colors = DnbColorpalette.parseColors(`
      #001427ff;
      #708d81ff // second color
      #f4d58dff; # third color
      #bf0603ff /* another color */
      /* and now the last color
      with a multiline comment */
      #8d0801ff
    `);

    expect(colors).toEqual(['#001427ff', '#708d81ff', '#f4d58dff', '#bf0603ff', '#8d0801ff']);
  });

  it('parses CSS custom property color declarations', () => {
    const colors = DnbColorpalette.parseColors(`
      --prussian-blue: #001427ff;
      --deep-teal: #708d81ff;
      --jasmine: #f4d58dff;
      --brick-ember: #bf0603ff;
      --blood-red: #8d0801ff;
    `);

    expect(colors).toEqual(['#001427ff', '#708d81ff', '#f4d58dff', '#bf0603ff', '#8d0801ff']);
  });

  it('parses HSL CSS custom property color declarations', () => {
    const colors = DnbColorpalette.parseColors(`
      /* CSS HSL */
      --prussian-blue: hsla(209, 100%, 8%, 1);
      --deep-teal: hsla(155, 11%, 50%, 1);
      --jasmine: hsla(42, 82%, 75%, 1);
      --brick-ember: hsla(1, 97%, 38%, 1);
      --blood-red: hsla(3, 99%, 28%, 1);
    `);

    expect(colors).toEqual([
      'hsla(209, 100%, 8%, 1)',
      'hsla(155, 11%, 50%, 1)',
      'hsla(42, 82%, 75%, 1)',
      'hsla(1, 97%, 38%, 1)',
      'hsla(3, 99%, 28%, 1)',
    ]);
  });

  it('parses SCSS hex color declarations', () => {
    const colors = DnbColorpalette.parseColors(`
      /* SCSS HEX */
      $prussian-blue: #001427ff;
      $deep-teal: #708d81ff;
      $jasmine: #f4d58dff;
      $brick-ember: #bf0603ff;
      $blood-red: #8d0801ff;
    `);

    expect(colors).toEqual(['#001427ff', '#708d81ff', '#f4d58dff', '#bf0603ff', '#8d0801ff']);
  });

  it('parses SCSS HSL color declarations', () => {
    const colors = DnbColorpalette.parseColors(`
      /* SCSS HSL */
      $prussian-blue: hsla(209, 100%, 8%, 1);
      $deep-teal: hsla(155, 11%, 50%, 1);
      $jasmine: hsla(42, 82%, 75%, 1);
      $brick-ember: hsla(1, 97%, 38%, 1);
      $blood-red: hsla(3, 99%, 28%, 1);
    `);

    expect(colors).toEqual([
      'hsla(209, 100%, 8%, 1)',
      'hsla(155, 11%, 50%, 1)',
      'hsla(42, 82%, 75%, 1)',
      'hsla(1, 97%, 38%, 1)',
      'hsla(3, 99%, 28%, 1)',
    ]);
  });

  it('parses SCSS RGBA color declarations', () => {
    const colors = DnbColorpalette.parseColors(`
      /* SCSS RGB */
      $prussian-blue: rgba(0, 20, 39, 1);
      $deep-teal: rgba(112, 141, 129, 1);
      $jasmine: rgba(244, 213, 141, 1);
      $brick-ember: rgba(191, 6, 3, 1);
      $blood-red: rgba(141, 8, 1, 1);
    `);

    expect(colors).toEqual([
      'rgba(0, 20, 39, 1)',
      'rgba(112, 141, 129, 1)',
      'rgba(244, 213, 141, 1)',
      'rgba(191, 6, 3, 1)',
      'rgba(141, 8, 1, 1)',
    ]);
  });

  it('parses supported comment types without treating hex colors as comments', () => {
    const colors = DnbColorpalette.parseColors(`
      # palette note
      // design note
      /* another note
      with more text */
      #001427
      #708d81 # muted teal
      #f4d58d // jasmine
    `);

    expect(colors).toEqual(['#001427', '#708d81', '#f4d58d']);
  });

  it('renders one equal grid column for every parsed color', async () => {
    document.body.innerHTML = `
      <dnb-colorpalette min-column-width="4rem">
        #ff0000
        rgb(0 255 0)
        blue
      </dnb-colorpalette>
    `;

    await Promise.resolve();

    const element = document.querySelector('dnb-colorpalette');
    const grid = element.querySelector('.grid');
    const columns = element.querySelectorAll('[data-color]');

    expect(grid.getAttribute('style')).toContain('min-height: 50px');
    expect(columns).toHaveLength(3);
    expect(Array.from(columns).map((column) => column.dataset.color)).toEqual([
      '#ff0000',
      'rgb(0 255 0)',
      'blue',
    ]);
    expect(Array.from(columns).map((column) => column.textContent)).toEqual([
      '#ff0000',
      'rgb(0 255 0)',
      'blue',
    ]);
  });

  it('applies configurable container, size, and border attributes', async () => {
    document.body.innerHTML = `
      <dnb-colorpalette
        outer-class="my-palette"
        max-width="48rem"
        min-height="80px"
        max-height="12rem"
        border-class="border-4 border-black"
      >
        gold
      </dnb-colorpalette>
    `;

    await Promise.resolve();

    const element = document.querySelector('dnb-colorpalette');
    const container = element.querySelector('.dnb-wc-colorpalette');
    const grid = element.querySelector('.grid');

    expect(container.classList.contains('is-component')).toBe(true);
    expect(container.classList.contains('dnb-wc-colorpalette')).toBe(true);
    expect(container.classList.contains('my-palette')).toBe(true);
    expect(container.style.maxWidth).toBe('48rem');
    expect(grid.classList.contains('border-4')).toBe(true);
    expect(grid.classList.contains('border-black')).toBe(true);
    expect(grid.style.minHeight).toBe('80px');
    expect(grid.style.maxHeight).toBe('12rem');
  });

  it('renders an optional palette copy button', async () => {
    const writeText = vi.fn().mockResolvedValue();
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    document.body.innerHTML = `
      <dnb-colorpalette copy copy-label="Copy colors">
        red
        white
        blue
      </dnb-colorpalette>
    `;

    await Promise.resolve();

    const element = document.querySelector('dnb-colorpalette');
    const button = element.querySelector('button');

    expect(button.textContent).toBe('Copy colors');

    button.click();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith('red\nwhite\nblue');

    vi.unstubAllGlobals();
  });
});
