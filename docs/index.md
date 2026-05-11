# Documentation

`dnb-colorpalette` renders a palette from color values pasted into the custom element.
The default `lines` parser accepts plain CSS color lines and common CSS/SCSS palette snippets.
The examples below use the same palette values listed in `tests/color-palette.json`.

## Supported pasted palette formats

### Plain CSS color values

```html
<dnb-colorpalette>
  #001427ff
  #708d81ff
  #f4d58dff
  #bf0603ff
  #8d0801ff
</dnb-colorpalette>
```

### CSS custom properties

Declaration names are stripped and the color value after the colon is rendered.

```html
<dnb-colorpalette>
  --prussian-blue: #001427ff;
  --deep-teal: #708d81ff;
  --jasmine: #f4d58dff;
  --brick-ember: #bf0603ff;
  --blood-red: #8d0801ff;
</dnb-colorpalette>
```

### SCSS variables

SCSS variable names are stripped the same way.

```html
<dnb-colorpalette>
  $prussian-blue: #001427ff;
  $deep-teal: #708d81ff;
  $jasmine: #f4d58dff;
  $brick-ember: #bf0603ff;
  $blood-red: #8d0801ff;
</dnb-colorpalette>
```

## Comment and semicolon handling

The parser removes:

* Optional trailing semicolons.
* `//` comments.
* hash-space comments, including inline comments after a color. Hex values such as `#001427` are preserved because the hash is not followed by whitespace.
* `/* ... */` block comments, including multiline block comments.

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
