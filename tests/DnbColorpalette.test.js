import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DnbColorpalette } from '../src/DnbColorpalette.js';
import {
  lines,
  paletteCssCustomProperties,
  paletteCssHslCustomProperties,
  paletteHexValues,
  paletteHslaValues,
  paletteRgbaValues,
  paletteScssHexVariables,
  paletteScssHslVariables,
  paletteScssRgbaVariables,
  paletteValues,
} from './color-palette-fixtures.js';

describe('DnbColorpalette', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('registers the dnb-colorpalette custom element', () => {
    expect(customElements.get('dnb-colorpalette')).toBe(DnbColorpalette);
  });

  it('parses one CSS color per line and trims empty lines', () => {
    const [firstColor, secondColor, thirdColor] = paletteValues;
    const colors = DnbColorpalette.parseColors(`
      ${firstColor}

      ${secondColor}
      ${thirdColor}
    `);

    expect(colors).toEqual([firstColor, secondColor, thirdColor]);
  });

  it('ignores comment lines without treating hex colors as comments', () => {
    const [firstColor, secondColor] = paletteHexValues;
    const colors = DnbColorpalette.parseColors(`
      // design note
      /* another note */
      * list note
      ${firstColor}
      ${secondColor}
    `);

    expect(colors).toEqual([firstColor, secondColor]);
  });

  it('parses normal hex colors from the shared test palette', () => {
    const colors = DnbColorpalette.parseColors(lines(paletteHexValues));

    expect(colors).toEqual(paletteHexValues);
  });

  it('parses eight-digit hex colors with opacity from the shared test palette', () => {
    const colors = DnbColorpalette.parseColors(lines(paletteValues));

    expect(colors).toEqual(paletteValues);
  });

  it('parses colors with semicolons and inline comments', () => {
    const [firstColor, secondColor, thirdColor, fourthColor, fifthColor] = paletteValues;
    const colors = DnbColorpalette.parseColors(`
      ${firstColor};
      ${secondColor} // second color
      ${thirdColor}; # third color
      ${fourthColor} /* another color */
      /* and now the last color
      with a multiline comment */
      ${fifthColor}
    `);

    expect(colors).toEqual(paletteValues);
  });

  it('parses CSS custom property color declarations', () => {
    const colors = DnbColorpalette.parseColors(lines(paletteCssCustomProperties));

    expect(colors).toEqual(paletteValues);
  });

  it('parses HSL CSS custom property color declarations', () => {
    const colors = DnbColorpalette.parseColors(`
      /* CSS HSL */
      ${lines(paletteCssHslCustomProperties)}
    `);

    expect(colors).toEqual(paletteHslaValues);
  });

  it('parses SCSS hex color declarations', () => {
    const colors = DnbColorpalette.parseColors(`
      /* SCSS HEX */
      ${lines(paletteScssHexVariables)}
    `);

    expect(colors).toEqual(paletteValues);
  });

  it('parses SCSS HSL color declarations', () => {
    const colors = DnbColorpalette.parseColors(`
      /* SCSS HSL */
      ${lines(paletteScssHslVariables)}
    `);

    expect(colors).toEqual(paletteHslaValues);
  });

  it('parses SCSS RGBA color declarations', () => {
    const colors = DnbColorpalette.parseColors(`
      /* SCSS RGB */
      ${lines(paletteScssRgbaVariables)}
    `);

    expect(colors).toEqual(paletteRgbaValues);
  });

  it('parses supported comment types without treating hex colors as comments', () => {
    const [firstColor, secondColor, thirdColor] = paletteHexValues;
    const colors = DnbColorpalette.parseColors(`
      # palette note
      // design note
      /* another note
      with more text */
      ${firstColor}
      ${secondColor} # muted teal
      ${thirdColor} // jasmine
    `);

    expect(colors).toEqual([firstColor, secondColor, thirdColor]);
  });

  it('renders one equal grid column for every parsed color', async () => {
    document.body.innerHTML = `
      <dnb-colorpalette min-column-width="4rem">
        ${lines(paletteValues)}
      </dnb-colorpalette>
    `;

    await Promise.resolve();

    const element = document.querySelector('dnb-colorpalette');
    const grid = element.querySelector('.grid');
    const columns = element.querySelectorAll('[data-color]');

    expect(grid.getAttribute('style')).toContain('min-height: 50px');
    expect(columns).toHaveLength(paletteValues.length);
    expect(Array.from(columns).map((column) => column.dataset.color)).toEqual(paletteValues);
    expect(Array.from(columns).map((column) => column.textContent)).toEqual(paletteValues);
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
        ${paletteValues[0]}
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
        ${lines(paletteValues)}
      </dnb-colorpalette>
    `;

    await Promise.resolve();

    const element = document.querySelector('dnb-colorpalette');
    const button = element.querySelector('button');

    expect(button.textContent).toBe('Copy colors');

    button.click();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith(lines(paletteValues));

    vi.unstubAllGlobals();
  });
});
