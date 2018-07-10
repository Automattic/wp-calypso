# Extending Blocks (Experimental)

[Hooks](https://developer.wordpress.org/plugins/hooks/) are a way for one piece of code to interact/modify another piece of code. They make up the foundation for how plugins and themes interact with Gutenberg, but they’re also used extensively by WordPress Core itself. There are two types of hooks: [Actions](https://developer.wordpress.org/plugins/hooks/actions/) and [Filters](https://developer.wordpress.org/plugins/hooks/filters/). They were initially implemented in PHP, but for the purpose of Gutenberg they were ported to JavaScript and published to npm as [@wordpress/hooks](https://www.npmjs.com/package/@wordpress/hooks) package for general purpose use. You can also learn more about both APIs: [PHP](https://codex.wordpress.org/Plugin_API/) and [JavaScript](https://github.com/WordPress/packages/tree/master/packages/hooks).

## Modifying Blocks

To modify the behavior of existing blocks, Gutenberg exposes the following Filters:

#### `blocks.registerBlockType`

Used to filter the block settings. It receives the block settings and the name of the block the registered block as arguments.

#### `blocks.getSaveElement`

A filter that applies to the result of a block's `save` function. This filter is used to replace or extend the element, for example using `wp.element.cloneElement` to modify the element's props or replace its children, or returning an entirely new element.

#### `blocks.getSaveContent.extraProps`
 
A filter that applies to all blocks returning a WP Element in the `save` function. This filter is used to add extra props to the root element of the `save` function. For example: to add a className, an id, or any valid prop for this element. It receives the current props of the `save` element, the block type and the block attributes as arguments.

_Example:_

Adding a background by default to all blocks.

```js
function addBackgroundColorStyle( props ) {
	return Object.assign( props, { style: { backgroundColor: 'red' } } );
}

wp.hooks.addFilter(
	'blocks.getSaveContent.extraProps',
	'my-plugin/add-background-color-style',
	addBackgroundColorStyle
);
```

_Note:_ This filter must always be run on every page load, and not in your browser's developer tools console. Otherwise, a [block validation](../../docs/block-api/block-edit-save.md#validation) error will occur the next time the post is edited. This is due to the fact that block validation occurs by verifying that the saved output matches what is stored in the post's content during editor initialization. So, if this filter does not exist when the editor loads, the block will be marked as invalid.

#### `blocks.getBlockDefaultClassName`

Generated HTML classes for blocks follow the `wp-block-{name}` nomenclature. This filter allows to provide an alternative class name.

_Example:_

```js
// Our filter function
function setBlockCustomClassName( className, blockName ) {
	return blockName === 'core/code' ?
		'my-plugin-code' :
		className;
}

// Adding the filter
wp.hooks.addFilter(
	'blocks.getBlockDefaultClassName',
	'my-plugin/set-block-custom-class-name',
	setBlockCustomClassName
);
```

#### `blocks.isUnmodifiedDefaultBlock.attributes`

Used internally by the default block (paragraph) to exclude the attributes from the check if the block was modified.

#### `blocks.switchToBlockType.transformedBlock`

Used to filters an individual transform result from block transformation. All of the original blocks are passed, since transformations are many-to-many, not one-to-one.

#### `blocks.getBlockAttributes`

Called immediately after the default parsing of a block's attributes and before validation to allow a plugin to manipulate attribute values in time for validation and/or the initial values rendering of the block in the editor.

#### `editor.BlockEdit`

Used to modify the block's `edit` component. It receives the original block `BlockEdit` component and returns a new wrapped component.

_Example:_

```js
var el = wp.element.createElement;

var withInspectorControls = wp.element.createHigherOrderComponent( function( BlockEdit ) {
	return function( props ) {
		return el(
			wp.element.Fragment,
			{},
			el(
				BlockEdit,
				props
			),
			el(
				wp.editor.InspectorControls,
				{},
				el(
					wp.components.PanelBody,
					{},
					'My custom control'
				)
			)
		);
	};
}, 'withInspectorControls' );

wp.hooks.addFilter( 'editor.BlockEdit', 'my-plugin/with-inspector-controls', withInspectorControls );
```

#### `editor.BlockListBlock`

Used to modify the block's wrapper component containing the block's `edit` component and all toolbars. It receives the original `BlockListBlock` component and returns a new wrapped component.

_Example:_

```js
var el = wp.element.createElement;

var withDataAlign = wp.element.createHigherOrderComponent( function( BlockListBlock ) {
	return function( props ) {
		var newProps = Object.assign(
			{},
			props,
			{
				wrapperProps: Object.assign(
					{},
					props.wrapperProps,
					{
						'data-align': props.block.attributes.align
					}
				)
			}
		);

		return el(
			BlockListBlock,
			newProps
		);
	};
}, 'withAlign' );

wp.hooks.addFilter( 'editor.BlockListBlock', 'my-plugin/with-data-align', withDataAlign );
```

## Removing Blocks

### Using a blacklist

Adding blocks is easy enough, removing them is as easy. Plugin or theme authors have the possibility to "unregister" blocks.

```js
// myp-lugin.js

wp.blocks.unregisterBlockType( 'core/verse' );
```

and load this script in the Editor

```php
<?php
// my-plugin.php

function my_plugin_blacklist_blocks() {
	wp_enqueue_script(
		'my-plugin-blacklist-blocks',
		plugins_url( 'my-plugin.js', __FILE__ ),
		array( 'wp-blocks' )
	);
}
add_action( 'enqueue_block_editor_assets', 'my_plugin_blacklist_blocks' );
```

### Using a whitelist

If you want to disable all blocks except a whitelisted list, you can adapt the script above like so:

```js
// my-plugin.js

var allowedBlocks = [
	'core/paragraph',
	'core/image',
	'core/html',
	'core/freeform'
];

wp.blocks.getBlockTypes().forEach( function( blockType ) {
	if ( allowedBlocks.indexOf( blockType.name ) === -1 ) {
		wp.blocks.unregisterBlockType( blockType.name );
	}
} );
```

## Hiding blocks from the inserter

On the server, you can filter the list of blocks shown in the inserter using the `allowed_block_types` filter. You can return either true (all block types supported), false (no block types supported), or an array of block type names to allow. You can also use the second provided param `$post` to filter block types based on its content.

```php
<?php
// my-plugin.php

function my_plugin_allowed_block_types( $allowed_block_types, $post ) {
	if ( $post->post_type !== 'post' ) {
	    return $allowed_block_types;
	}
	return array( 'core/paragraph' );
}

add_filter( 'allowed_block_types', 'my_plugin_allowed_block_types', 10, 2 );
```

## Managing block categories

It is possible to filter the list of default block categories using the `block_categories` filter. You can do it on the server by implementing a function which returns a list of categories. It is going to be used during blocks registration and to group blocks in the inserter. You can also use the second provided param `$post` to generate a different list depending on the post's content.

```php
<?php
// my-plugin.php

function my_plugin_block_categories( $categories, $post ) {
	if ( $post->post_type !== 'post' ) {
		return $categories;
	}
	return array_merge(
		$categories,
		array(
			array(
				'slug' => 'my-category',
				'title' => __( 'My category', 'my-plugin' ),
			),
		)
	);
}
add_filter( 'block_categories', 'my_plugin_block_categories', 10, 2 );
```
