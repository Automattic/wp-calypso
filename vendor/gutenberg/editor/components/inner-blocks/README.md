InnerBlocks
===========

InnerBlocks exports a pair of components which can be used in block implementations to enable nested block content.

Refer to the [implementation of the Columns block](https://github.com/WordPress/gutenberg/tree/master/core-blocks/columns) as an example resource.

## Usage

In a block's `edit` implementation, render `InnerBlocks`, optionally with `layouts` of available nest areas:

Then, in the `save` implementation, render `InnerBlocks.Content`. This will be replaced automatically with the content of the nested blocks.

```jsx
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/editor';

registerBlockType( 'my-plugin/my-block', {
	// ...

	edit( { className } ) {
		return (
			<div className={ className }>
				<InnerBlocks />
			</div>
		);
	},

	save() {
		return (
			<div>
				<InnerBlocks.Content />
			</div>
		);
	}
} );
```

_Note:_ A block can render at most a single `InnerBlocks` and `InnerBlocks.Content` element in `edit` and `save` respectively. To create distinct arrangements of nested blocks, refer to the `layouts` prop documented below.

_Note:_ Because the save step will automatically apply props to the element returned by `save`, it is important to include the wrapping `div` in the above simple example even though we are applying no props of our own. In a real-world example, you may have your own attributes to apply to the saved markup, or sibling content adjacent to the rendered nested blocks.

## Props

### `allowedBlocks`
* **Type:** `Array<String>`

Allowed blocks prop should contain an array of strings, each string should contain the identifier of a block. When allowedBlocks is set it is only possible to insert blocks part of the set specified in the array.
```jsx
const ALLOWED_BLOCKS = [ 'core/image', 'core/paragraph' ];
...
<InnerBlocks
    allowedBlocks={ ALLOWED_BLOCKS }
/>
```
The previous code block creates an `InnerBlocks` area where only image and paragraph blocks can be inserted.

Child blocks that have marked themselves as compatible are not excluded from the allowed blocks. Even if `allowedBlocks` doesn't specify a child block, a registered child block will still appear on the inserter for this block.

```jsx
const ALLOWED_BLOCKS = [];
...
<InnerBlocks
    allowedBlocks={ ALLOWED_BLOCKS }
/>
```
The previous code block restricts all blocks, so only child blocks explicitly registered as compatible with this block can be inserted. If no child blocks are available: it will be impossible to insert any inner blocks.

### `template`
* **Type:** `Array<Array<Object>>`

The template is defined as a list of block items. Such blocks can have predefined attributes, placeholder, content, etc. Block templates allow specifying a default initial state for an InnerBlocks area.
More information about templates can be found in [template docs](https://wordpress.org/gutenberg/handbook/templates/).

```jsx
const TEMPLATE = [ [ 'core/columns', {}, [
    [ 'core/column', {}, [
        [ 'core/image' ],
    ] ],
    [ 'core/column', {}, [
        [ 'core/paragraph', { placeholder: 'Enter side content...' } ],
    ] ],
] ] ];
...
<InnerBlocks
    template={ TEMPLATE }
/>
```
The previous example creates an InnerBlocks area containing two columns one with an image and the other with a paragraph.

### `templateLock`
* **Type:** `String|Boolean`

Template locking of `InnerBlocks` is similar to [Custom Post Type templates locking](https://wordpress.org/gutenberg/handbook/templates/#locking).

Template locking allows locking the `InnerBlocks` area for the current template.
*Options:*

- `all` — prevents all operations. It is not possible to insert new blocks. Move existing blocks or delete them.
- `insert` — prevents inserting new blocks, but allows moving or removing existing ones.
- `false` — prevents locking from being applied to an `InnerBlocks` area even if a parent block contains locking.

If locking is not set in an `InnerBlocks` area: the locking of the parent `InnerBlocks` area is used.

If the block is a top level block: the locking of the Custom Post Type is used.

### `layouts`
* **Type:** `Array<Object>|Object`

To achieve distinct arrangements of nested blocks, you may assign layout as an array of objects, or an object. When assigned, a user will be provided with the option to move blocks between layouts, and the rendered output will assign a layout-specific class which can be used in your block stylesheet to effect the visual arrangement of nested blocks.

Because `InnerBlocks.Content` will generate a single continuous flow of block markup for nested content, it may be advisable to use [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout) to assign layout positions. Be aware that CSS grid is [not suported in legacy browsers](https://caniuse.com/#feat=css-grid), and therefore you should consider how this might impact your block's appearance when viewed on the front end of a site in such browsers.

Layouts can be assigned either as an object (ungrouped layouts) or an array of objects (grouped layouts). These are documented below.

In both cases, each layout consists of:

- Name: A slug to use in generating the layout class applied to nested blocks
- Icon (`icon: string`): The slug of the Dashicon to use in controls presented to the user in moving between layouts
   - Reference: https://developer.wordpress.org/resource/dashicons/
- Label (`label: string`): The text to display in the controls presented to the user in moving between layouts

_Ungrouped Layouts:_

If you do not depend on a particular order of markup for your nested content and need merely to assign a layout class to each nested block, you should assign `layouts` as an object, where each key is the name of a layout:

```jsx
<InnerBlocks layouts={ {
	normal: { label: 'Normal Width', icon: 'align-center' },
	wide: { label: 'Width Width', icon: 'align-wide' },
} } />
```

_Grouped Layouts:_

If your nested content depends on having each layout grouped in its markup, you should assign `layouts` as an array of layout objects, where the name of the layout is set as a property of the object:

```jsx
<InnerBlocks layouts={ [
	{ name: 'column-1', label: 'Column 1', icon: 'columns' },
	{ name: 'column-2', label: 'Column 2', icon: 'columns' },
] } />
```

Consider a Columns block. When the user changes the layout of a block from one column to another, it is not sufficient to simply reassign the class name of the block to the new layout, as the user may then proceed to attempt to move the block up or down within the new column. The expected behavior here requires that the markup of the block itself be moved in relation to blocks already present in the new layout.

```html
<!-- wp:columns -->
<div class="wp-block-columns">
	<!-- wp:paragraph {"layout":"column-1"} -->
	<p>First Paragraph</p>
	<!-- /wp:paragraph -->

	<!-- wp:paragraph {"layout":"column-1"} -->
	<p>Second Paragraph</p>
	<!-- /wp:paragraph -->

	<!-- wp:paragraph {"layout":"column-2"} -->
	<p>Third Paragraph</p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:columns -->
```

In the above example markup, if the user moved the first nested paragraph block to the second column, we must ensure that if they then proceed to move the block down, that the block would be the last item in the markup, otherwise it would not appear to move because it would still exist in markup prior to the third paragraph.

_Bad:_

```html
<!-- wp:columns -->
<div class="wp-block-columns">
	<!-- wp:paragraph {"layout":"column-2"} -->
	<p>First Paragraph</p>
	<!-- /wp:paragraph -->

	<!-- wp:paragraph {"layout":"column-1"} -->
	<p>Second Paragraph</p>
	<!-- /wp:paragraph -->

	<!-- wp:paragraph {"layout":"column-2"} -->
	<p>Third Paragraph</p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:columns -->
```

We achieve this by ensuring that the markup of each layout is kept grouped together.

_Good:_

```html
<!-- wp:columns -->
<div class="wp-block-columns">
	<!-- wp:paragraph {"layout":"column-1"} -->
	<p>Second Paragraph</p>
	<!-- /wp:paragraph -->

	<!-- wp:paragraph {"layout":"column-2"} -->
	<p>First Paragraph</p>
	<!-- /wp:paragraph -->

	<!-- wp:paragraph {"layout":"column-2"} -->
	<p>Third Paragraph</p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:columns -->
```
