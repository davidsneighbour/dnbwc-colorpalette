# TODO

## Prototype follow-up

* Add parser formats beyond `lines`.
* Decide whether invalid color lines should be ignored, rendered with warnings, or exposed through an event.
* Add automated browser tests for modern color functions that jsdom may not fully validate.
* Add stronger accessibility semantics for the palette, swatches, and optional copy button.
* Add contrast-aware label styling.
* Add custom label support separate from the CSS color value.
* Add copy success and copy failure UI states.
* Add an event API for palette parsing and swatch interactions.
* Add TypeScript declarations.
* Add documentation examples for Astro, Vite, and plain HTML.
* Add a release workflow and npm publishing notes.

## Testing

Make sure the following formats are working:

### normal hex

```html
<dnb-colorpalette>
#001427
#708d81
#f4d58d
#bf0603
#8d0801
</dnb-colorpalette>
```

### hex with opacity

```html
<dnb-colorpalette>
#001427ff
#708d81ff
#f4d58dff
#bf0603ff
#8d0801ff
</dnb-colorpalette>
```

### hex with semicolon or comments

```html
<dnb-colorpalette>
#001427ff;
#708d81ff // second color
#f4d58dff; # third color
#bf0603ff /* another color */
/* and now the last color
with a multiline comment */
#8d0801ff
</dnb-colorpalette>
```

### CSS variables

```html
<dnb-colorpalette>
--prussian-blue: #001427ff;
--deep-teal: #708d81ff;
--jasmine: #f4d58dff;
--brick-ember: #bf0603ff;
--blood-red: #8d0801ff;
</dnb-colorpalette>
```

### hsl in CSS variables

```html
<dnb-colorpalette>
/* CSS HSL */
--prussian-blue: hsla(209, 100%, 8%, 1);
--deep-teal: hsla(155, 11%, 50%, 1);
--jasmine: hsla(42, 82%, 75%, 1);
--brick-ember: hsla(1, 97%, 38%, 1);
--blood-red: hsla(3, 99%, 28%, 1);

</dnb-colorpalette>
```

### SCSS notation

```html
<dnb-colorpalette>
/* SCSS HEX */
$prussian-blue: #001427ff;
$deep-teal: #708d81ff;
$jasmine: #f4d58dff;
$brick-ember: #bf0603ff;
$blood-red: #8d0801ff;

</dnb-colorpalette>
```

### SCSS with HSL

```html
<dnb-colorpalette>
/* SCSS HSL */
$prussian-blue: hsla(209, 100%, 8%, 1);
$deep-teal: hsla(155, 11%, 50%, 1);
$jasmine: hsla(42, 82%, 75%, 1);
$brick-ember: hsla(1, 97%, 38%, 1);
$blood-red: hsla(3, 99%, 28%, 1);
</dnb-colorpalette>
```

### SCSS with RGBA

```html
<dnb-colorpalette>
/* SCSS RGB */
$prussian-blue: rgba(0, 20, 39, 1);
$deep-teal: rgba(112, 141, 129, 1);
$jasmine: rgba(244, 213, 141, 1);
$brick-ember: rgba(191, 6, 3, 1);
$blood-red: rgba(141, 8, 1, 1);
</dnb-colorpalette>
```

## comment types

Make sure the following comment types are parsed out:

* `# (.*)` --- (a hashtag followed by a string, NOT a hashtag without space behind it and a string, that one is always a hex code) comment, single line
* `//(.*)` --- comment, single line
* `/*(.*)*/` --- block comment, can be multiline
