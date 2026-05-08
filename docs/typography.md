# Typography

## Interface Typography

We use sans-serif system fonts with weights of 400 or greater as the default for UI. This includes UI elements like buttons, notices, and navigation. System fonts improve the page-rendering speed.

```
-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen-Sans", "Ubuntu", "Cantarell", "Helvetica Neue", sans-serif
```

### How to use

The `$sans` Sass variable will output the sans-serif font stack.

```scss
.design__typography-sans {
	font-family: $sans;
	font-size: $font-body;
	font-weight: 400;
	color: var( --color-neutral-70 );
}
```

## Content Typography

We mostly use `Noto Serif` with weights of 400 or greater in reading and writing contexts, like the Reader. Use your best judgment when using Noto Serif for a UI element. Does it add valuable context for the person using our products?

### How to use

The `$serif` Sass variable will output the serif font stack.

```scss
.design__typography-serif {
	font-family: $serif;
}
```

## Brand Typography

We use Recoleta sparingly to add our brand's flavor to select headings. In general, Recoleta should be used for main page titles (linked from the main sidebar navigation) and no more than one main heading per page. It looks best at sizes 24px or greater, or `$font-title-medium` in our type scale.

Recoleta should not be used for UI elements, such as buttons or navigation.

Since Recoleta is not compatible with some languages, we use a special class that targets specific locales, and falls back to the `$serif` stack when necessary.

### How to use

Extend the `.wp-brand-font` selector in your SCSS:

```scss
.design__typography-branded {
	@extend .wp-brand-font;
	font-size: $font-title-medium;
}
```

Or add the class directly to the element on which you want the brand font to show:

```html
<h1 className="wp-brand-font">Branded heading</h1>
```

## Code Typography

We use monospace fonts for code blocks, sized at 15px.

```
Monaco, Consolas, "Andale Mono", "DejaVu Sans Mono", "Courier 10 Pitch", Courier, monospace
```

### How to use

The `$code` Sass variable will output the monospaced font stack.

```scss
.design__typography-code {
	font-family: $code;
	font-size: $font-code;
}
```

## Typographic Scale

A harmonic ratio helps in creating a more harmonious design. If we use the same scale across WordPress.com, things feel more cohesive — it's as much about consistency as it is about harmony. Instead of using arbitrary numbers, we conform to the WordPress core typescale.

### How to use

The following variables adhere to the type scale and save you from having to calculate the corresponding ems or rems:

| Sass Variable            | Pixels | Rems  |
| ------------------------ | ------ | ----- |
| `$font-headline-large`   | 54     | 3.375 |
| `$font-headline-medium`  | 48     | 3     |
| `$font-headline-small`   | 36     | 2.25  |
| `$font-title-large`      | 32     | 2     |
| `$font-title-medium`     | 24     | 1.5   |
| `$font-title-small`      | 20     | 1.25  |
| `$font-body`             | 16     | 1     |
| `$font-body-small`       | 14     | 0.875 |
| `$font-body-extra-small` | 12     | 0.75  |
