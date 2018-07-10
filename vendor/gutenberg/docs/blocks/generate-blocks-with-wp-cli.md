# Generate Blocks with WP-CLI

It turns out that writing the simplest possible block which contains only static content might not be the easiest task. It requires to follow closely the steps described in the documentation. It stems from the fact that you need to create at least 2 files and integrate your code with the existing APIs. One way to mitigate this inconvenience is to copy the source code of the existing block from one of the repositories that share working examples:
- [WordPress/gutenberg-examples](https://github.com/WordPress/gutenberg-examples) - the official examples for extending Gutenberg with plugins which create blocks
- [zgordon/gutenberg-course](https://github.com/zgordon/gutenberg-course) - a repository for Zac Gordon's Gutenberg Development Course
- [ahmadawais/create-guten-block](https://github.com/ahmadawais/create-guten-block) - A zero-configuration developer toolkit for building WordPress Gutenberg block plugins

It might be also a good idea to browse the folder with [all core blocks](https://github.com/WordPress/gutenberg/tree/master/core-blocks) to see how they are implemented.

## WP-CLI

Another way of making developer's life easier is to use [WP-CLI](http://wp-cli.org/), which provides a command-line interface for many actions you might perform on the WordPress instance. One of the commands generates all the code required to register a Gutenberg block for a plugin or theme.

### Installing

Before installing `WP-CLI`, please make sure your environment meets the minimum requirements:

* UNIX-like environment (OS X, Linux, FreeBSD, Cygwin); limited support in Windows environment
* PHP 5.3.29 or later
* WordPress 3.7 or later

Once you’ve verified requirements, you should follow the [installation instructions](http://wp-cli.org/#installing). Downloading the Phar file is the recommended installation method for most users. Should you need, see also the documentation on [alternative installation methods](https://make.wordpress.org/cli/handbook/installing/).

### Using `wp scaffold block`

The following command generates PHP, JS and CSS code for registering a Gutenberg block.

```bash
wp scaffold block <slug> [--title=<title>] [--dashicon=<dashicon>] [--category=<category>] [--theme] [--plugin=<plugin>] [--force]
```

Please refer to the [command documentation](https://github.com/wp-cli/scaffold-command#wp-scaffold-block) to learn more about the available options for the block.

When you scaffold a block you must provide at least a `slug` name and either the `theme` or `plugin` name. In most cases, we recommended pairing blocks with plugins rather than themes, because only using plugin ensures that all blocks will still work when your theme changes.

### Examples

Here are some examples using `wp scaffold block` in action.

#### Create a block inside the plugin

The following command generates a `movie` block with the `My movie block` title for the existing plugin named `movies`:

```bash
$ wp scaffold block movie --title="My movie block" --plugin=movies
Success: Created block 'My movie block'.
```

This will generate 4 files inside the `movies` plugin directory. All files contain inline documentation that will help to apply any further customizations to the block. It's worth mentioning that it is currently possible to scaffold only blocks containing static content and JavaScript code is written using ECMAScript 5 (ES5) standard which works with all modern browsers.

`movies/blocks/movie.php` - you will have to manually include this file in your main plugin file:
```php
<?php
/**
 * Functions to register client-side assets (scripts and stylesheets) for the
 * Gutenberg block.
 *
 * @package movies
 */

/**
 * Registers all block assets so that they can be enqueued through Gutenberg in
 * the corresponding context.
 *
 * @see https://wordpress.org/gutenberg/handbook/blocks/writing-your-first-block-type/#enqueuing-block-scripts
 */
function movie_block_init() {
	$dir = dirname( __FILE__ );

	$block_js = 'movie/block.js';
	wp_register_script(
		'movie-block-editor',
		plugins_url( $block_js, __FILE__ ),
		array(
			'wp-blocks',
			'wp-i18n',
			'wp-element',
		),
		filemtime( "$dir/$block_js" )
	);

	$editor_css = 'movie/editor.css';
	wp_register_style(
		'movie-block-editor',
		plugins_url( $editor_css, __FILE__ ),
		array(),
		filemtime( "$dir/$editor_css" )
	);

	$style_css = 'movie/style.css';
	wp_register_style(
		'movie-block',
		plugins_url( $style_css, __FILE__ ),
		array(),
		filemtime( "$dir/$style_css" )
	);

	register_block_type( 'movies/movie', array(
		'editor_script' => 'movie-block-editor',
		'editor_style'  => 'movie-block-editor',
		'style'         => 'movie-block',
	) );
}
add_action( 'init', 'movie_block_init' );
```

`movies/blocks/movie/block.js`:
```js
( function( wp ) {
	/**
	 * Registers a new block provided a unique name and an object defining its behavior.
	 * @see https://github.com/WordPress/gutenberg/tree/master/blocks#api
	 */
	var registerBlockType = wp.blocks.registerBlockType;
	/**
	 * Returns a new element of given type. Element is an abstraction layer atop React.
	 * @see https://github.com/WordPress/gutenberg/tree/master/packages/element#element
	 */
	var el = wp.element.createElement;
	/**
	 * Retrieves the translation of text.
	 * @see https://github.com/WordPress/gutenberg/tree/master/i18n#api
	 */
	var __ = wp.i18n.__;

	/**
	 * Every block starts by registering a new block type definition.
	 * @see https://wordpress.org/gutenberg/handbook/block-api/
	 */
	registerBlockType( 'movies/movie', {
		/**
		 * This is the display title for your block, which can be translated with `i18n` functions.
		 * The block inserter will show this name.
		 */
		title: __( 'My movie block' ),

		/**
		 * Blocks are grouped into categories to help users browse and discover them.
		 * The categories provided by core are `common`, `embed`, `formatting`, `layout` and `widgets`.
		 */
		category: 'widgets',

		/**
		 * Optional block extended support features.
		 */
		supports: {
			// Removes support for an HTML mode.
			html: false,
		},

		/**
		 * The edit function describes the structure of your block in the context of the editor.
		 * This represents what the editor will render when the block is used.
		 * @see https://wordpress.org/gutenberg/handbook/block-edit-save/#edit
		 *
		 * @param {Object} [props] Properties passed from the editor.
		 * @return {Element}       Element to render.
		 */
		edit: function( props ) {
			return el(
				'p',
				{ className: props.className },
				__( 'Hello from the editor!' )
			);
		},

		/**
		 * The save function defines the way in which the different attributes should be combined
		 * into the final markup, which is then serialized by Gutenberg into `post_content`.
		 * @see https://wordpress.org/gutenberg/handbook/block-edit-save/#save
		 *
		 * @return {Element}       Element to render.
		 */
		save: function() {
			return el(
				'p',
				{},
				__( 'Hello from the saved content!' )
			);
		}
	} );
} )(
	window.wp
);
```

`movies/blocks/movie/editor.css`:
```css
/**
 * The following styles get applied inside the editor only.
 *
 * Replace them with your own styles or remove the file completely.
 */

.wp-block-movies-movie {
	border: 1px dotted #f00;
}
```

`movies/blocks/movie/style.css`:
```css
/**
 * The following styles get applied both on the front of your site and in the editor.
 *
 * Replace them with your own styles or remove the file completely.
 */

.wp-block-movies-movie {
	background-color: #000;
	color: #fff;
	padding: 2px;
}
```

#### Create a block inside the theme

It is also possible to scaffold the same `movie` block and include it into the existing theme, e.g. `simple-life`:

```bash
$ wp scaffold block movie --theme=simple-life
 Success: Created block 'Movie block'.
```

#### Create a plugin and add two blocks

If you don't have an existing plugin you can create a new one and add two blocks with `WP-CLI` as follows:

```bash
# Create plugin called books
$ wp scaffold plugin books
# Add a block called book to plugin books
$ wp scaffold block book --title="Book" --plugin=books
# Add a second block to plugin called books.
$ wp scaffold block books --title="Book List" --plugin=books
```
