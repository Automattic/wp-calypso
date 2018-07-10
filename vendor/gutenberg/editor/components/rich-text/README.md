# `RichText`

Render a rich [`contenteditable` input](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Editable_content), providing users the option to add emphasis to content or links to content. It behaves similarly to a [controlled component](https://facebook.github.io/react/docs/forms.html#controlled-components), except that `onChange` is triggered less frequently than would be expected from a traditional `input` field, usually when the user exits the field.

## Properties

### `format: String`

*Optional.* Format of the RichText provided value prop. It can be `element` or `string`.

*Default: `element`*.

### `value: Array|String`

*Required.* Depending on the format prop, this value could be an array of React DOM to make editable or an HTML string. The rendered HTML should be valid, and valid with respect to the `tagName` and `inline` property.

### `onChange( value: Array|String ): Function`

*Required.* Called when the value changes.

### `tagName: String`

*Default: `div`.* The [tag name](https://www.w3.org/TR/html51/syntax.html#tag-name) of the editable element.

### `placeholder: String`

*Optional.* Placeholder text to show when the field is empty, similar to the
  [`input` and `textarea` attribute of the same name](https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/HTML5_updates#The_placeholder_attribute).

### `multiline: String`

*Optional.* By default, a line break will be inserted on <kbd>Enter</kbd>. If the editable field can contain multiple paragraphs, this property can be set to `p` to create new paragraphs on <kbd>Enter</kbd>.

### `onSplit( before: Array|String, after: Array|String, ...blocks: Object ): Function`

*Optional.* Called when the content can be split with `before` and `after`. There might be blocks present, which should be inserted in between.

### `onReplace( blocks: Array ): Function`

*Optional.* Called when the `RichText` instance is empty and it can be replaced with the given blocks.

### `onMerge( forward: Boolean ): Function`

*Optional.* Called when blocks can be merged. `forward` is true when merging with the next block, false when merging with the previous block.

### `onRemove( forward: Boolean ): Function`

*Optional.* Called when the block can be removed. `forward` is true when the selection is expected to move to the next block, false to the previous block.

### `formattingControls: Array`

*Optional.* By default, all formatting controls are present. This setting can be used to fine-tune formatting controls. Possible items: `[ 'bold', 'italic', 'strikethrough', 'link' ]`.

### `isSelected: Boolean`

*Optional.* Whether to show the input is selected or not in order to show the formatting controls. By default it renders the controls when the block is selected.

### `keepPlaceholderOnFocus: Boolean`

*Optional.* By default, the placeholder will hide as soon as the editable field receives focus. With this setting it can be be kept while the field is focussed and empty.

### `autocompleters: Array<Completer>`

*Optional.* A list of autocompleters to use instead of the default.

## RichText.Content

When using RichText in the edit function of blocks, the usage of `RichText.Content` is recommended in the save function of your blocks to save the correct HTML.


## Example

{% codetabs %}
{% ES5 %}
```js
wp.blocks.registerBlockType( /* ... */, {
	// ...

	attributes: {
		content: {
			type: 'array',
			source: 'children',
			selector: 'h2',
		},
	},

	edit: function( props ) {
		return wp.element.createElement( wp.editor.RichText, {
			tagName: 'h2',
			className: props.className,
			value: props.attributes.content,
			onChange: function( content ) {
				props.setAttributes( { content: content } );
			}
		} );
	},

	save: function() {
		return wp.element.createElement( wp.editor.RichText.Content, {
			tagName: 'h2', value: props.attributes.content
		} );
	}
} );
```
{% ESNext %}
```js
const { registerBlockType } = wp.blocks;
const { RichText } = wp.editor;

registerBlockType( /* ... */, {
	// ...

	attributes: {
		content: {
			type: 'array',
			source: 'children',
			selector: 'h2',
		},
	},

	edit( { className, attributes, setAttributes } ) {
		return (
			<RichText
				tagName="h2"
				className={ className }
				value={ attributes.content }
				onChange={ ( content ) => setAttributes( { content } ) }
			/>
		);
	},

	save( { attributes } ) {
		return <RichText.Content tagName="h2" value={ attributes.content } />;
	}
} );
```
{% end %}
