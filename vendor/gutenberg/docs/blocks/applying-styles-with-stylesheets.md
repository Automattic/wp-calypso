# Applying Styles From a Stylesheet

In the previous section, the block had applied its own styles by an inline `style` attribute. While this might be adequate for very simple components, you will quickly find that it becomes easier to write your styles by extracting them to a separate stylesheet file.

The editor will automatically generate a class name for each block type to simplify styling. It can be accessed from the object argument passed to the edit and save functions:

{% codetabs %}
{% ES5 %}
```js
var el = wp.element.createElement,
	registerBlockType = wp.blocks.registerBlockType;

registerBlockType( 'gutenberg-boilerplate-es5/hello-world-step-02', {
	title: 'Hello World (Step 2)',

	icon: 'universal-access-alt',

	category: 'layout',

	edit: function( props ) {
		return el( 'p', { className: props.className }, 'Hello editor.' );
	},

	save: function( props ) {
		return el( 'p', { className: props.className }, 'Hello saved content.' );
	},
} );
```
{% ESNext %}
```js
const { registerBlockType } = wp.blocks;

registerBlockType( 'gutenberg-boilerplate-esnext/hello-world-step-02', {
	title: 'Hello World (Step 2)',

	icon: 'universal-access-alt',

	category: 'layout',

	edit( { className } ) {
		return <p className={ className }>Hello editor.</p>;
	},

	save( { className } ) {
		return <p className={ className }>Hello saved content.</p>;
	},
} );
```
{% end %}

The class name is generated using the block's name prefixed with `wp-block-`, replacing the `/` namespace separator with a single `-`.

```css
.wp-block-gutenberg-boilerplate-es5-hello-world-step-02 {
	color: green;
	background: #cfc;
	border: 2px solid #9c9;
	padding: 20px;
}
```

## Enqueueing Editor-only Block Assets

Like scripts, your block's editor-specific styles should be enqueued by assigning the `editor_styles` setting of the registered block type:

```php
<?php

function gutenberg_boilerplate_block() {
	wp_register_script(
		'gutenberg-boilerplate-es5-step02-editor',
		plugins_url( 'step-02/block.js', __FILE__ ),
		array( 'wp-blocks', 'wp-element' )
	);
	wp_register_style(
		'gutenberg-boilerplate-es5-step02-editor',
		plugins_url( 'step-02/editor.css', __FILE__ ),
		array( 'wp-edit-blocks' ),
		filemtime( plugin_dir_path( __FILE__ ) . 'step-02/editor.css' )
	);

	register_block_type( 'gutenberg-boilerplate-esnext/hello-world-step-02', array(
		'editor_script' => 'gutenberg-boilerplate-es5-step02-editor',
		'editor_style'  => 'gutenberg-boilerplate-es5-step02-editor',
	) );
}
add_action( 'init', 'gutenberg_boilerplate_block' );
```

## Enqueueing Editor and Front end Assets

While a block's scripts are usually only necessary to load in the editor, you'll want to load styles both on the front of your site and in the editor. You may even want distinct styles in each context.

When registering a block, you can assign one or both of `style` and `editor_style` to respectively assign styles always loaded for a block or styles only loaded in the editor.

```php
<?php

function gutenberg_boilerplate_block() {
	wp_register_style(
		'gutenberg-boilerplate-es5-step02',
		plugins_url( 'step-02/style.css', __FILE__ ),
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'step-02/style.css' )
	);

	register_block_type( 'gutenberg-boilerplate-esnext/hello-world-step-02', array(
		'style' => 'gutenberg-boilerplate-es5-step02',
	) );
}
add_action( 'init', 'gutenberg_boilerplate_block' );
```

Since your block is likely to share some styles in both contexts, you can consider `style.css` as the base stylesheet, placing editor-specific styles in `editor.css`.
