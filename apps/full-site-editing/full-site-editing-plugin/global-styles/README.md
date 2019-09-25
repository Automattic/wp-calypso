# Global Styles plugin

This plugin enables global styling for the block editor. At the moment it supports setting the base and headings fonts to be applied site-wide. It also comes with a sidebar for the block editor that users can use to change these values.

Read below for learning:

* How it works
* How to use it
* How to use a fallback stylesheet (experimental)
* FAQ

## How it works

The Global Styles plugin embeds an inline stylesheet into the post/page that adds the available fonts and the following CSS custom properties:

- `--font-headings`
- `--font-base`
- `--font-headings-default`
- `--font-base-default`

The values of `--font-base-default` and `--font-headings-default` are set to the system font, unless themes provide values for them using `add_theme_support`. If they do, a new option called "Theme Default" will be shown in the font selector.

Initially, `--font-base` and `--font-headings` value is `unset`. These values change as the user selects new fonts via the sidebar. If the "Theme Default" option is present and is selected by the user, the values of `--font-base` and `--font-headings` will be reset to `unset`.

Note that, the Global Styles plugin enqueues the CSS custom properties and the fonts. The theme needs to enqueue a stylesheet that uses them to take any effect.

## How to use it

The first step to use Global Styles is to declare support via `add_theme_support`:

```php
add_theme_support(
	'a8c-global-styles',
	[
		'font_base'     => 'One of the available font families',
		'font_headings' => 'One of the available font families',
	]
);
```

Note that `font_base` and `font_headings` are optional. If the theme doesn't provide them, the `Theme Default` option won't be shown in the sidebar and its default values will be the system fonts.


After declaring support, the theme needs to enqueue the stylesheets that use these variables. For example, it could do:

```css
body {
	font-family: var(--font-base, var(--font-base-default) );
}
```

Note how we suggest working with defaults:

- `--font-base` value is going to be what the user selects in the sidebar, or `unset` (initially and when the user chooses "Theme Default").
- `--font-base-default` value is going to be what the theme declared via `add_theme_support` or the system font if none was provided.

Using the custom properties like this, the base font for the site will be the value of `--font-base` unless it is `unset`, in which case it'll be the value of `--font-base-default`.

**Fallback for browsers that don't support CSS Custom Properties**

If you have to provide fallbacks for browsers that don't support CSS custom properties, you need to create a new rule:

```css
body {
	font-family: 'one of the available font families as fallback';
	font-family: var(--font-base, var(--font-base-default) );
}
```

## How to use a fallback stylesheet (experimental)

As an experimental feature, the Global Styles plugin can provide a fallback stylesheet that uses the CSS custom properties. This is so themes can use Global Styles without introducing any changes to its own stylesheet.

```php
add_theme_support(
	'a8c-global-styles',
	[
		'enqueue_styles' => true, // Note this.
		'font_base'      => 'One of the available font families',
		'font_headings'  => 'One of the available font families',
	]
);
```

Note the `enqueue_styles` parameter. It's optional. If present and `true`, in addition to the CSS custom properties and fonts, the plugin will enqueue a fallback stylesheet that overrides the theme's.

This feature is experimental. The overrides can't take into account all the ways that themes can present information (different tags, classes, etc.), so themes are responsible to check these are enough for its use case.

## FAQ

### Which fonts are available?

These are the fonts available via the font selector in the sidebar and for the themes to set as defaults:

- Arvo
- Cabin
- Chivo
- Domine
- Fira Sans
- Libre Baskerville
- Libre Franklin
- Lora
- Merriweather
- Montserrat
- Open Sans
- Playfair Display
- Poppins
- Roboto
- Roboto Slab
- Rubik
- Source Sans Pro
- Source Serif Pro
- Space Mono
- Work Sans

### What will happen when the user changes to another theme that supports GlobalStyles?

Everything will continue to work as expected. If the user had selected:

* A custom font, it'll still be used in the new theme.
* The "Theme Default" option, the new theme's font will be used instead of the old one.

### What will happen when the user changes to a theme that doesn't support Global Styles?

The new theme's font selection will be used.
