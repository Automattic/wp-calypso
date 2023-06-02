# Global Styles plugin <!-- omit in toc -->

Note: as of March 2023, this is still available for older themes which declare support for "jetpack-global-styles". If you activate one of those themes (like "Leven") on a site, you can access and test this feature in both the page and post editor. Look for the typography icon in the top toolbar, or "Global Styles" under the plugins section of the editor more menu.

This plugin creates a new sidebar for the block editor through which the users can update the styles site-wide, if the active theme has declared support. At the moment, users can set the base and headings fonts.

- [How to develop and build the plugin](#how-to-develop-and-build-the-plugin)
- [How it works and how themes can use it](#how-it-works-and-how-themes-can-use-it)
  - [Fallbacks for browsers without support for CSS custom properties](#fallbacks-for-browsers-without-support-for-css-custom-properties)
  - [How to add a "Theme Default" option to the font list](#how-to-add-a-theme-default-option-to-the-font-list)
  - [How to use a fallback stylesheet (experimental)](#how-to-use-a-fallback-stylesheet-experimental)
- [Existing hooks](#existing-hooks)
  - [jetpack_global_styles_data_set_get_data filter](#jetpack_global_styles_data_set_get_data-filter)
  - [jetpack_global_styles_data_set_save_data filter](#jetpack_global_styles_data_set_save_data-filter)
  - [jetpack_global_styles_permission_check_additional filter](#jetpack_global_styles_permission_check_additional-filter)
  - [jetpack_global_styles_settings](#jetpack_global_styles_settings)
- [FAQ](#faq)
  - [Which fonts are available?](#which-fonts-are-available)
  - [What will happen when the user changes to another theme that supports GlobalStyles?](#what-will-happen-when-the-user-changes-to-another-theme-that-supports-globalstyles)
  - [What will happen when the user changes to a theme that doesn't support Global Styles or the plugin is deactivated?](#what-will-happen-when-the-user-changes-to-a-theme-that-doesnt-support-global-styles-or-the-plugin-is-deactivated)

## How to develop and build the plugin

Refer to instructions in the top-level [Editing Toolkit](https://github.com/automattic/wp-calypso/tree/HEAD/apps/editing-toolkit) directory.

## How it works and how themes can use it

This plugin creates a new sidebar for the block editor through which the users can update the styles site-wide. At the moment, users can set the base and headings fonts. For the sidebar to be shown, the active theme needs to have declared support:

```php
add_theme_support( 'jetpack-global-styles' );
```

The user choices are stored using the Options API in the WordPress database, and exposed in the block editor and the front end as CSS custom properties. For example, the base and headings fonts are exposed as `--font-base` and `--font-headings`, respectively.

The theme can then use those variables to set its styles:

```css
body {
	font-family: var( --font-base, serif );
}

h1 {
	font-family: var( --font-headings, sans-serif );
}
```

In the above example, the `body`'s font-family will be what the user selected as the base font, or `serif` if `--font-base` is not set. Likewise, the `h1`'s font-family will be what the user selected as the headings font, or `sans-serif` if `--font-headings` is not set.

### Fallback values for CSS Custom Properties

Note the font-family fallbacks provided for when `--font-base` or `--font-headings` are not set. There are a number of situations where these variables can have the value `unset` or even not being present (which the browsers also consider as being `unset`):

- If the Global Styles plugin is not installed, activated, or the theme didn't declared support.
- If the Global Styles plugin is activated and the theme has declared support but:
  - the user hasn't selected and saved any choice yet.
  - the user has selected _Theme Default_ as the font.

By adding fallbacks for these situations, themes can work with or without Global Styles using the same styles. They also provide a better experience to users with good defaults that are overwritten by user's choices when necessary. This is the recommended way to use the Global Styles plugin.

What would happen if no fallback is provided?

```css
body {
	font-family: var( --font-base );
}

h1 {
	font-family: var( --font-headings );
}
```

In the above example, the `body`'s font-family will be what the user selected as the base font, or `inherit` if `--font-base` is not set. Likewise, the `h1`'s font-family will be what the user selected as the headings font, or `inherit` if `--font-headings` is not set.

For more info on CSS Custom Properties, check out:

- [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*).
- [CSS Working Group specification](https://drafts.csswg.org/css-variables/#defining-variables).
- The [unset](https://drafts.csswg.org/css-cascade-4/#valdef-all-unset) keyword.

### Fallbacks for browsers without support for CSS custom properties

Browsers that don't support CSS custom properties don't know what to do with the `var` statement (neither the fallback within), so they ignore it. We can leverage this to provide fallbacks for them as well:

```css
body {
	font-family: serif; // Fallback for browsers without support.
	font-family: var( --font-base, serif ); // Variable and fallback for browsers with support.
}

h1 {
	font-family: sans-serif; // Fallback for browsers without support.
	font-family: var(
		--font-headings,
		sans-serif
	); // Variable and fallback for browsers with support.
}
```

### How to add a "Theme Default" option to the font list

Themes can opt-in to add a _Theme Default_ option via the `enable_theme_default` parameter:

```php
add_theme_support(
	'jetpack-global-styles',
	[
		'enable_theme_default' => true,
	]
 );
```

This will add a new option in the font picker called _Theme Default_. If the user hasn't selected any yet, it will be the active option by default (if the theme didn't add this option, the _System Font_ will be picked instead). When _Theme Default_ is active, the corresponding CSS custom property value will be `unset`.

For example, if the user selects:

- the base font to _Theme Default_, then `--font-base` value will be `unset`
- the headings font to _Lora_, then `--font-headings` value will be `Lora`

Essentially, the _Theme Default_ option is how an user would reset their choices and get back the theme default styles. We recommend adding this option and using fallbacks in the CSS custom properties declarations.

### How to use a fallback stylesheet (experimental)

As an experimental feature, the Global Styles plugin can provide a fallback stylesheet that uses the CSS custom properties. This is so themes can use Global Styles without introducing any changes to its own stylesheet.

```php
add_theme_support(
	'jetpack-global-styles',
	[
		'enqueue_experimental_styles' => true,
	]
);
```

If the `enqueue_experimental_styles` is present and it's `true`, the plugin will enqueue a fallback stylesheet that overrides the theme's. This feature is experimental. The overrides can't take into account all the ways that themes can present information (different tags, classes, etc.), so themes are responsible to check these are enough for its use case.

Note that if the theme requests enqueueing the experimental stylesheet, the experimental Global Styles styles will override the theme ones once the plugin is activated. By default, until the user makes a font choice, the _System Font_ will be used.

## _Theme Default_ option

Themes that use this experimental feature can also add a _Theme Default_ option in the font picker by setting the `enable_theme_default` property to true. Note that when the user selects _Theme Default_ the font to be used is _System Font_. Per se, this isn't very useful, however, themes can also provide fallback fonts for when the font is `unset` (the user selected _Theme Default_ or hasn't made any choice yet):

```php
add_theme_support(
	'jetpack-global-styles',
	[
		'enqueue_experimental_styles' => true,
		'enable_theme_default'        => true,
		'font_base'                   => 'serif',
		'font_headings'               => 'sans-serif',
	]
);
```

## Existing hooks

### jetpack_global_styles_data_set_get_data filter

See [README-DATA.md](./README-DATA.md).

### jetpack_global_styles_data_set_save_data filter

See [README-DATA.md](./README-DATA.md).

### jetpack_global_styles_permission_check_additional filter

This filter can be used to add _an additional check_ to decide whether 1) the global styles sidebar is enqueued and 2) the REST API endpoint should return the data. Note the existing checks in place:

- The user is logged in and has the `customize` capability.
- The site uses a theme that has declared support for `jetpack-global-styles`.

```php
function permission_check_callback( $has_permissions ) {
	if ( $some_condition ) {
		return false;
	}
	return $has_permissions;
}
add_filter( 'jetpack_global_styles_permission_check_additional', permission_check_callback );
```

### jetpack_global_styles_settings

This filter can be used to configure any of the Global Styles settings.

REST API related:

- `rest_namespace`: REST API namespace.
- `rest_route`: REST API route.
- `rest_path_client`: the path to be used by the client to query the endpoint.

To white-label Global Styles:

- `theme_support`: the name of the theme support feature.
- `option_name`: the name of the option to use in the database.
- `redux_store_name`: the name of the custom Redux store used by the client.
- `plugin_name`: the name of the registered plugin for the block editor.

## FAQ

### Which fonts are available?

These are the fonts available via the font selector in the sidebar and for the themes to set as defaults:

- Arvo
- Bodoni Moda
- Cabin
- Chivo
- DM Sans
- Domine
- Fira Sans
- Inter
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

- The _Theme Default_ option, the new theme's font will be used instead of the old one.
- A _custom font_, it'll still be used in the new theme. Note, however, that themes can make different choices as to what they consider base and font selections. For example: a theme can use the headings font for quotes and another theme can use the base font.

### What will happen when the user changes to a theme that doesn't support Global Styles or the plugin is deactivated?

The theme's font will be used.
