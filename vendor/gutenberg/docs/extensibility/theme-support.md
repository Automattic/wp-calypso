# Theme Support

By default, blocks provide their styles to enable basic support for blocks in themes without any change. Themes can add/override these styles, or they can provide no styles at all, and rely fully on what the theme provides.

Some advanced block features require opt-in support in the theme itself as it's difficult for the block to provide these styles, they may require some architecting of the theme itself, in order to work well.

To opt-in for one of these features, call `add_theme_support` in the `functions.php` file of the theme. For example:

```php
function mytheme_setup_theme_supported_features() {
	add_theme_support( 'editor-color-palette', array(
		array(
			'name' => __( 'strong magenta', 'themeLangDomain' ),
			'slug' => 'strong-magenta',
			'color' => '#a156b4',
		),
		array(
			'name' => __( 'light grayish magenta', 'themeLangDomain' ),
			'slug' => 'light-grayish-magenta',
			'color' => '#d0a5db',
		),
		array(
			'name' => __( 'very light gray', 'themeLangDomain' ),
			'slug' => 'very-light-gray',
			'color' => '#eee',
		),
		array(
			'name' => __( 'very dark gray', 'themeLangDomain' ),
			'slug' => 'very-dark-gray',
			'color' => '#444',
		),
	) );
}

add_action( 'after_setup_theme', 'mytheme_setup_theme_supported_features' );
```

## Opt-in features

### Wide Alignment:

Some blocks such as the image block have the possibility to define a "wide" or "full" alignment by adding the corresponding classname to the block's wrapper ( `alignwide` or `alignfull` ). A theme can opt-in for this feature by calling:

```php
add_theme_support( 'align-wide' );
```

### Block Color Palettes:

Different blocks have the possibility of customizing colors. Gutenberg provides a default palette, but a theme can overwrite it and provide its own:

```php
add_theme_support( 'editor-color-palette', array(
	array(
		'name' => __( 'strong magenta', 'themeLangDomain' ),
		'slug' => 'strong-magenta',
		'color' => '#a156b4',
	),
	array(
		'name' => __( 'light grayish magenta', 'themeLangDomain' ),
		'slug' => 'light-grayish-magenta',
		'color' => '#d0a5db',
	),
	array(
		'name' => __( 'very light gray', 'themeLangDomain' ),
		'slug' => 'very-light-gray',
		'color' => '#eee',
	),
	array(
		'name' => __( 'very dark gray', 'themeLangDomain' ),
		'slug' => 'very-dark-gray',
		'color' => '#444',
	),
) );
```

The colors will be shown in order on the palette, and there's no limit to how many can be specified.

Themes are responsible for creating the classes that apply the colors in different contexts. Core blocks use "color" and "background-color" contexts. So to correctly apply "strong magenta" to all contexts of core blocks a theme should implement the following classes:

```css
.has-strong-magenta-background-color {
	background-color: #313131;
}

.has-strong-magenta-color {
	color: #f78da7;
}
```

The class name is built appending 'has-', followed by the class name *using* kebab case and ending with the context name.

### Disabling custom colors in block Color Palettes

By default, the color palette offered to blocks, allows the user to select a custom color different from the editor or theme default colors.
Themes can disable this feature using:
```php
add_theme_support( 'disable-custom-colors' );
```

This flag will make sure users are only able to choose colors from the `editor-color-palette` the theme provided or from the editor default colors if the theme did not provide one.

## Editor styles

A theme can provide a stylesheet that will change the editor's appearance. You can use this to change colors, fonts, and any other visual aspect of the editor.

### Add the stylesheet

The first thing to do is to create a new stylesheet file in your theme directory. We'll assume the file is named `style-editor.css`.

Next, load your newly-created editor stylesheet in your theme:

```php
/**
 * Enqueue block editor style
 */
function mytheme_block_editor_styles() {
	wp_enqueue_style( 'mytheme-block-editor-styles', get_theme_file_uri( '/style-editor.css' ), false, '1.0', 'all' );
}

add_action( 'enqueue_block_editor_assets', 'mytheme_block_editor_styles' );
```

### Basic colors

You can style the editor like any other webpage. Here's how to change the background color and the font color to blue:

```css
/* Add this to your `style-editor.css` file */
body.gutenberg-editor-page {
	background-color: #d3ebf3;
	color: #00005d;
}
```

### Changing the width of the editor

To change the main column width of the editor, add the following CSS to `style-editor.css`:

```css
/* Main column width */
body.gutenberg-editor-page .editor-post-title__block,
body.gutenberg-editor-page .editor-default-block-appender,
body.gutenberg-editor-page .editor-block-list__block {
	max-width: 720px;
}

/* Width of "wide" blocks */
body.gutenberg-editor-page .editor-block-list__block[data-align="wide"] {
	max-width: 1080px;
}

/* Width of "full-wide" blocks */
body.gutenberg-editor-page .editor-block-list__block[data-align="full"] {
	max-width: none;
}
```

You can use those editor widths to match those in your theme. You can use any CSS width unit, including `%` or `px`.

Further reading: [Applying Styles with Stylesheets](https://wordpress.org/gutenberg/handbook/blocks/applying-styles-with-stylesheets/).

## Default block styles

Core blocks include default styles. The styles are enqueued for editing but are not enqueued for viewing unless the theme opts-in to the core styles. If you'd like to use default styles in your theme, add theme support for `wp-block-styles`:

```php
add_theme_support( 'wp-block-styles' );
```
