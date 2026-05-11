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
