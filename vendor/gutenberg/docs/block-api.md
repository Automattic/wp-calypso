# Block API

Blocks are the fundamental element of the Gutenberg editor. They are the primary way in which plugins and themes can register their own functionality and extend the capabilities of the editor. This document covers the main properties of block registration.

## Register Block Type

* **Type:** `Function`

Every block starts by registering a new block type definition. The function `registerBlockType` takes two arguments, a block `name` and a block configuration object.

### Block Name

* **Type:** `String`

The name for a block is a unique string that identifies a block. Names have to be structured as `namespace/block-name`, where namespace is the name of your plugin or theme.

```js
// Registering my block with a unique name
registerBlockType( 'my-plugin/book', {} );
```

*Note:* A block name can only contain lowercase alphanumeric characters and dashes, and must begin with a letter.

*Note:* This name is used on the comment delimiters as `<!-- wp:my-plugin/book -->`. Those blocks provided by core don't include a namespace when serialized.

### Block Configuration

* **Type:** `{ key: value }`

A block requires a few properties to be specified before it can be registered successfully. These are defined through a configuration object, which includes the following:

#### Title

* **Type:** `String`

This is the display title for your block, which can be translated with our translation functions. The block inserter will show this name.

```js
// Our data object
title: 'Book'
```

#### Description (optional)

* **Type:** `String`

This is a short description for your block, which can be translated with our translation functions. This will be shown in the block inspector.

```js
description: 'Block showing a Book card.'
```

#### Category

* **Type:** `String [ common | formatting | layout | widgets | embed ]`

Blocks are grouped into categories to help users browse and discover them. The core provided categories are `common`, `formatting`, `layout`, `widgets`, and `embed`.

```js
// Assigning to the 'widgets' category
category: 'widgets',
```

#### Icon (optional)

An icon property should be specified to make it easier to identify a block. These can be any of [WordPress' Dashicons](https://developer.wordpress.org/resource/dashicons/), or a custom `svg` element.

```js
// Specifying a dashicon for the block
icon: 'book-alt',
```

An object can also be passed as icon, in this case, icon, as specified above, should be included in the src property.
Besides src the object can contain background and foreground colors, this colors will appear with the icon
when they are applicable e.g.: in the inserter.

```js

icon: {
	// Specifying a background color to appear with the icon e.g.: in the inserter.
	background: '#7e70af',
	// Specifying a color for the icon (optional: if not set, a readable color will be automatically defined)
	foreground: '#fff',
	// Specifying a dashicon for the block
	src: 'book-alt',
} ,
```


#### Keywords (optional)

Sometimes a block could have aliases that help users discover it while searching. For example, an `image` block could also want to be discovered by `photo`. You can do so by providing an array of terms (which can be translated). It is only allowed to add as much as three terms per block.

```js
// Make it easier to discover a block with keyword aliases
keywords: [ __( 'read' ) ],
```

#### Attributes (optional)

* **Type:** `{ attr: {} }`

Attributes provide the structured data needs of a block. They can exist in different forms when they are serialized, but they are declared together under a common interface.

```js
// Specifying my block attributes
attributes: {
	cover: {
		type: 'string',
		source: 'attribute',
		selector: 'img',
		attribute: 'src',
	},
	author: {
		type: 'string',
		source: 'children',
		selector: '.book-author',
	},
	pages: {
		type: 'number',
	},
},
```

* **See: [Attributes](../docs/block-api/attributes.md).**

#### Transforms (optional)

* **Type:** `Array`

Transforms provide rules for what a block can be transformed from and what it can be transformed to. A block can be transformed from another block, a shortcode, a regular expression or a raw DOM node.

For example, a paragraph block can be transformed into a heading block.

{% codetabs %}
{% ES5 %}
```js
transforms: {
    from: [
        {
            type: 'block',
            blocks: [ 'core/paragraph' ],
            transform: function ( content ) {
                return createBlock( 'core/heading', {
                    content,
                } );
            },
        },
    ]
},
```
{% ESNext %}
```js
transforms: {
    from: [
        {
            type: 'block',
            blocks: [ 'core/paragraph' ],
            transform: ( { content } ) => {
                return createBlock( 'core/heading', {
                    content,
                } );
            },
        },
    ]
},
```
{% end %}

An existing shortcode can be transformed into its block counterpart.

{% codetabs %}
{% ES5 %}
```js
transforms: {
    from: [
        {
            type: 'shortcode',
            // Shortcode tag can also be an array of shortcode aliases
            tag: 'caption',
            attributes: {
                // An attribute can be source from a tag attribute in the shortcode content
                url: {
                    type: 'string',
                    source: 'attribute',
                    attribute: 'src',
                    selector: 'img',
                },
                // An attribute can be source from the shortcode attributes
                align: {
                    type: 'string',
                    shortcode: function( named ) {
                        var align = named.align ? named.align : 'alignnone';
                        return align.replace( 'align', '' );
                    },
                },
            },
        },
    ]
},
```
{% ESNext %}
```js
transforms: {
    from: [
        {
            type: 'shortcode',
            // Shortcode tag can also be an array of shortcode aliases
            tag: 'caption',
            attributes: {
                // An attribute can be source from a tag attribute in the shortcode content
                url: {
                    type: 'string',
                    source: 'attribute',
                    attribute: 'src',
                    selector: 'img',
                },
                // An attribute can be source from the shortcode attributes
                align: {
                    type: 'string',
                    shortcode: ( { named: { align = 'alignnone' } } ) => {
                        return align.replace( 'align', '' );
                    },
                },
            },
        },
    ]
},

```
{% end %}

A block can also be transformed into another block type. For example, a heading block can be transformed into a paragraph block.

{% codetabs %}
{% ES5 %}
```js
transforms: {
    to: [
        {
            type: 'block',
            blocks: [ 'core/paragraph' ],
            transform: function( content ) {
                return createBlock( 'core/paragraph', {
                    content,
                } );
            },
        },
    ],
},
```
{% ESNext %}
```js
transforms: {
    to: [
        {
            type: 'block',
            blocks: [ 'core/paragraph' ],
            transform: ( { content } ) => {
                return createBlock( 'core/paragraph', {
                    content,
                } );
            },
        },
    ],
},
```
{% end %}

An optional `isMatch` function can be specified on a transform object. This provides an opportunity to perform additional checks on whether a transform should be possible. Returning `false` from this function will prevent the transform from being displayed as an option to the user.

{% codetabs %}
{% ES5 %}
```js
transforms: {
    to: [
        {
            type: 'block',
			blocks: [ 'core/paragraph' ],
			isMatch: function( attribute ) {
				return attributes.isText;
			},
            transform: function( content ) {
                return createBlock( 'core/paragraph', {
                    content,
                } );
            },
        },
    ],
},
```
{% ESNext %}
```js
transforms: {
    to: [
        {
            type: 'block',
			blocks: [ 'core/paragraph' ],
			isMatch: ( { isText } ) => isText,
            transform: ( { content } ) => {
                return createBlock( 'core/paragraph', {
                    content,
                } );
            },
        },
    ],
},
```
{% end %}

To control the priority with which a transform is applied, define a `priority` numeric property on your transform object, where a lower value will take precedence over higher values. This behaves much like a [WordPress hook](https://codex.wordpress.org/Plugin_API#Hook_to_WordPress). Like hooks, the default priority is `10` when not otherwise set.


#### parent (optional)

* **Type:** `Array`

Blocks are able to be inserted into blocks that use [`InnerBlocks`](https://github.com/WordPress/gutenberg/blob/master/editor/components/inner-blocks/README.md) as nested content. Sometimes it is useful to restrict a block so that it is only available as a nested block. For example, you might want to allow an 'Add to Cart' block to only be available within a 'Product' block.

Setting `parent` lets a block require that it is only available when nested within the specified blocks.

```js
// Only allow this block when it is nested in a Columns block
parent: [ 'core/columns' ],
```

#### supports (optional)

* **Type:** `Object`

Optional block extended support features. The following options are supported, and should be specified as a boolean `true` or `false` value:

- `anchor` (default `false`): Anchors let you link directly to a specific block on a page. This property adds a field to define an id for the block and a button to copy the direct link.

```js
// Add the support for an anchor link.
anchor: true,
```

- `customClassName` (default `true`): This property adds a field to define a custom className for the block's wrapper.

```js
// Remove the support for the custom className.
customClassName: false,
```

- `className` (default `true`): By default, Gutenberg adds a class with the form `.wp-block-your-block-name` to the root element of your saved markup. This helps having a consistent mechanism for styling blocks that themes and plugins can rely on. If for whatever reason a class is not desired on the markup, this functionality can be disabled.

```js
// Remove the support for the generated className.
className: false,
```

- `html` (default `true`): By default, Gutenberg will allow a block's markup to be edited individually. To disable this behavior, set `html` to `false`.

```js
// Remove support for an HTML mode.
html: false,
```

- `inserter` (default `true`): By default, all blocks will appear in the Gutenberg inserter. To hide a block so that it can only be inserted programatically, set `inserter` to `false`.

```js
// Hide this block from the inserter.
inserter: false,
```

- `multiple` (default `true`): A non-multiple block can be inserted into each post, one time only. For example, the built-in 'More' block cannot be inserted again if it already exists in the post being edited. A non-multiple block's icon is automatically dimmed (unclickable) to prevent multiple instances.

```js
// Use the block just once per post
multiple: false,
```

## Edit and Save

The `edit` and `save` functions define the editor interface with which a user would interact, and the markup to be serialized back when a post is saved. They are the heart of how a block operates, so they are [covered separately](../docs/block-api/block-edit-save.md).
