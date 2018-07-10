# Edit and Save

When registering a block, the `edit` and `save` functions provide the interface for how a block is going to be rendered within the editor, how it will operate and be manipulated, and how it will be saved.

## Edit

The `edit` function describes the structure of your block in the context of the editor. This represents what the editor will render when the block is used.

```js
// Defining the edit interface
edit() {
	return <hr />;
}
```

// Todo: for more advanced uses, `edit` can return a component with lifecycle.

The function receives the following properties through an object argument.

### attributes

This property surfaces all the available attributes and their corresponding values, as described by the `attributes` property when the block type was registered. In this case, assuming we had defined an attribute of `content` during block registration, we would receive and use that value in our edit function:

```js
// Defining the edit interface
edit( { attributes } ) {
	return <div>{ attributes.content }</div>;
}
```

The value of `attributes.content` will be displayed inside the `div` when inserting the block in the editor.

### className

This property returns the class name for the wrapper element. This is automatically added in the `save` method, but not on `edit`, as the root element may not correspond to what is _visually_ the main element of the block. You can request it to add it to the correct element in your function.

```js
// Defining the edit interface
edit( { attributes, className } ) {
	return <div className={ className }>{ attributes.content }</div>;
}
```

### isSelected

The isSelected property is an object that communicates whether the block is currently selected.

```js
// Defining the edit interface
edit( { attributes, className, isSelected } ) {
	return (
		<div className={ className }>
			{ attributes.content }
			{ isSelected &&
				<span>Shows only when the block is selected.</span>
			}
		</div>
	);
}
```

### setAttributes

This function allows the block to update individual attributes based on user interactions.

```js
// Defining the edit interface
edit( { attributes, setAttributes, className, isSelected } ) {
	// Simplify access to attributes
	const { content, mySetting } = attributes;

	// Toggle a setting when the user clicks the button
	const toggleSetting = () => setAttributes( { mySetting: ! mySetting } );
	return (
		<div className={ className }>
			{ content }
			{ isSelected &&
				<button onClick={ toggleSetting }>Toggle setting</button>
			}
		</div>
	);
}
```

## Save

The `save` function defines the way in which the different attributes should be combined into the final markup, which is then serialized by Gutenberg into `post_content`.

{% codetabs %}
{% ES5 %}
```js
save() {
	return wp.element.createElement( 'hr' );
}
```
{% ESNext %}
```jsx
save() {
	return <hr />;
}
```
{% end %}

For most blocks, the return value of `save` should be an [instance of WordPress Element](https://github.com/WordPress/gutenberg/blob/master/packages/element/README.md) representing how the block is to appear on the front of the site.

_Note:_ While it is possible to return a string value from `save`, it _will be escaped_. If the string includes HTML markup, the markup will be shown on the front of the site verbatim, not as the equivalent HTML node content. If you must return raw HTML from `save`, use `wp.element.RawHTML`. As the name implies, this is prone to [cross-site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting) and therefore is discouraged in favor of a WordPress Element hierarchy whenever possible.

For [dynamic blocks](../../docs/blocks/creating-dynamic-blocks.md), the return value of `save` could either represent a cached copy of the block's content to be shown only in case the plugin implementing the block is ever disabled. Alternatively, return a `null` (empty) value to save no markup in post content for the dynamic block, instead deferring this to always be calculated when the block is shown on the front of the site.

### attributes

As with `edit`, the `save` function also receives an object argument including attributes which can be inserted into the markup.

{% codetabs %}
{% ES5 %}
```js
save( props ) {
	return wp.element.createElement(
		'div',
		null,
		props.attributes.content
	);
}
```
{% ESNext %}
```jsx
save( { attributes } ) {
	return <div>{ attributes.content }</div>;
}
```
{% end %}

## Validation

When the editor loads, all blocks within post content are validated to determine their accuracy in order to protect against content loss. This is closely related to the saving implementation of a block, as a user may unintentionally remove or modify their content if the editor is unable to restore a block correctly. During editor initialization, the saved markup for each block is regenerated using the attributes that were parsed from the post's content. If the newly-generated markup does not match what was already stored in post content, the block is marked as invalid. This is because we assume that unless the user makes edits, the markup should remain identical to the saved content.

If a block is detected to be invalid, the user will be prompted to choose how to handle the invalidation:

![Invalid block prompt](https://user-images.githubusercontent.com/1779930/35637234-a6a7a18a-0681-11e8-858b-adfc1c6f47da.png)

- **Overwrite**: Ignores the warning and treats the newly generated markup as correct. As noted in the behavior described above, this can result in content loss since it will overwrite the markup saved in post content.
- **Convert to Classic**: Protects the original markup from the saved post content as correct. Since the block will be converted from its original type to the Classic block type, it will no longer be possible to edit the content using controls available for the original block type.
- **Edit as HTML block**: Similar to _Convert to Classic_, this will protect the original markup from the saved post content and convert the block from its original type to the HTML block type, enabling the user to modify the HTML markup directly.

### Validation FAQ

**How do blocks become invalid?**

The two most common sources of block invalidations are:

1. A flaw in a block's code would result in unintended content modifications. See the question below on how to debug block invalidation as a plugin author.
2. You or an external editor changed the HTML markup of the block in such a way that it is no longer considered correct.

**I'm a plugin author. What should I do to debug why my blocks are being marked as invalid?**

Before starting to debug, be sure to familiarize yourself with the validation step described above documenting the process for detecting whether a block is invalid. A block is invalid if its regenerated markup does not match what is saved in post content, so often this can be caused by the attributes of a block being parsed incorrectly from the saved content.

If you're using [attribute sources](../../docs/block-api/attributes.md), be sure that attributes sourced from markup are saved exactly as you expect, and in the correct type (usually a `'string'` or `'number'`).

When a block is detected as invalid, a warning will be logged into your browser's developer tools console. The warning will include specific details about the exact point at which a difference in markup occurred. Be sure to look closely at any differences in the expected and actual markups to see where problems are occurring.

**I've changed my block's `save` behavior and old content now includes invalid blocks. How can I fix this?**

Refer to the guide on [Deprecated Blocks](../../docs/block-api/deprecated-blocks.md) to learn more about how to accommodate legacy content in intentional markup changes.
