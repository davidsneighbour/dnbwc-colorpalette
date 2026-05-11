import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const colorPalettePath = join(process.cwd(), 'tests', 'color-palette.json');

export const colorPalette = JSON.parse(readFileSync(colorPalettePath, 'utf8'));
export const paletteValues = colorPalette.map(({ value }) => value);
export const paletteHexValues = paletteValues.map((value) => value.replace(/ff$/iu, ''));
export const paletteCssCustomProperties = colorPalette.map(
  ({ label, value }) => `--${label}: ${value};`,
);
export const paletteScssHexVariables = colorPalette.map(
  ({ label, value }) => `$${label}: ${value};`,
);
export const paletteRgbaValues = colorPalette.map(({ value }) => formatRgba(value));
export const paletteHslaValues = colorPalette.map(({ value }) => formatHsla(value));
export const paletteCssHslCustomProperties = colorPalette.map(
  ({ label }, index) => `--${label}: ${paletteHslaValues[index]};`,
);
export const paletteScssHslVariables = colorPalette.map(
  ({ label }, index) => `$${label}: ${paletteHslaValues[index]};`,
);
export const paletteScssRgbaVariables = colorPalette.map(
  ({ label }, index) => `$${label}: ${paletteRgbaValues[index]};`,
);

export function lines(values) {
  return values.join('\n');
}

function parseHexColor(value) {
  const match = value.match(
    /^#(?<red>[\da-f]{2})(?<green>[\da-f]{2})(?<blue>[\da-f]{2})(?<alpha>[\da-f]{2})?$/iu,
  );

  if (!match?.groups) {
    throw new Error(`Expected a six- or eight-digit hex color, received ${value}`);
  }

  const { red, green, blue, alpha = 'ff' } = match.groups;

  return {
    red: Number.parseInt(red, 16),
    green: Number.parseInt(green, 16),
    blue: Number.parseInt(blue, 16),
    alpha: Number.parseInt(alpha, 16) / 255,
  };
}

function formatAlpha(alpha) {
  return Number.isInteger(alpha)
    ? String(alpha)
    : alpha.toFixed(3).replace(/0+$/u, '').replace(/\.$/u, '');
}

function formatRgba(value) {
  const { red, green, blue, alpha } = parseHexColor(value);

  return `rgba(${red}, ${green}, ${blue}, ${formatAlpha(alpha)})`;
}

function formatHsla(value) {
  const { red, green, blue, alpha } = parseHexColor(value);
  const redRatio = red / 255;
  const greenRatio = green / 255;
  const blueRatio = blue / 255;
  const max = Math.max(redRatio, greenRatio, blueRatio);
  const min = Math.min(redRatio, greenRatio, blueRatio);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    if (max === redRatio) {
      hue = 60 * (((greenRatio - blueRatio) / delta) % 6);
    } else if (max === greenRatio) {
      hue = 60 * ((blueRatio - redRatio) / delta + 2);
    } else {
      hue = 60 * ((redRatio - greenRatio) / delta + 4);
    }
  }

  if (hue < 0) {
    hue += 360;
  }

  return `hsla(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(
    lightness * 100,
  )}%, ${formatAlpha(alpha)})`;
}
