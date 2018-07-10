# Block Controls: Toolbars and Inspector

To simplify block customization and ensure a consistent experience for users, there are a number of built-in UI patterns to help generate the editor preview. Like with the `RichText` component covered in the previous chapter, the `wp.editor` global includes a few other common components to render editing interfaces. In this chapter, we'll explore toolbars and the block inspector.

## Toolbar

<img src="https://cldup.com/jUslj672CK.png" width="391" height="79" alt="toolbar">

When the user selects a block, a number of control buttons may be shown in a toolbar above the selected block. Some of these block-level controls are included automatically if the editor is able to transform the block to another type, or if the focused element is an RichText component.

You can also customize the toolbar to include controls specific to your block type. If the return value of your block type's `edit` function includes a `BlockControls` element, those controls will be shown in the selected block's toolbar.

{% codetabs %}
{% ES5 %}
```js
var el = wp.element.createElement,
	registerBlockType = wp.blocks.registerBlockType,
	RichText = wp.editor.RichText,
	BlockControls = wp.editor.BlockControls,
	AlignmentToolbar = wp.editor.AlignmentToolbar;

registerBlockType( 'gutenberg-boilerplate-es5/hello-world-step-04', {
	title: 'Hello World (Step 4)',

	icon: 'universal-access-alt',

	category: 'layout',

	attributes: {
		content: {
			type: 'array',
			source: 'children',
			selector: 'p',
		},
		alignment: {
			type: 'string',
		},
	},

	edit: function( props ) {
		var content = props.attributes.content,
			alignment = props.attributes.alignment;

		function onChangeContent( newContent ) {
			props.setAttributes( { content: newContent } );
		}

		function onChangeAlignment( newAlignment ) {
			props.setAttributes( { alignment: newAlignment } );
		}

		return [
			el(
				BlockControls,
				{ key: 'controls' },
				el(
					AlignmentToolbar,
					{
						value: alignment,
						onChange: onChangeAlignment
					}
				)
			),
			el(
				RichText,
				{
					key: 'editable',
					tagName: 'p',
					className: props.className,
					style: { textAlign: alignment },
					onChange: onChangeContent,
					value: content,
				}
			)
		];
	},

	save: function( props ) {
		var content = props.attributes.content,
			alignment = props.attributes.alignment;

		return el( RichText.Content, {
			className: props.className,
			style: { textAlign: alignment },
			value: content
		} );
	},
} );
```
{% ESNext %}
```js
const { registerBlockType } = wp.blocks;
const {
	RichText,
	BlockControls,
	AlignmentToolbar,
} = wp.editor;

registerBlockType( 'gutenberg-boilerplate-esnext/hello-world-step-04', {
	title: 'Hello World (Step 4)',

	icon: 'universal-access-alt',

	category: 'layout',

	attributes: {
		content: {
			type: 'array',
			source: 'children',
			selector: 'p',
		},
		alignment: {
			type: 'string',
		},
	},

	edit( { attributes, className, setAttributes } ) {
		const { content, alignment } = attributes;

		function onChangeContent( newContent ) {
			setAttributes( { content: newContent } );
		}

		function onChangeAlignment( newAlignment ) {
			setAttributes( { alignment: newAlignment } );
		}

		return [
			<BlockControls key="controls">
				<AlignmentToolbar
					value={ alignment }
					onChange={ onChangeAlignment }
				/>
			</BlockControls>,
			<RichText
				key="editable"
				tagName="p"
				className={ className }
				style={ { textAlign: alignment } }
				onChange={ onChangeContent }
				value={ content }
			/>
		];
	},

	save( { attributes, className } ) {
		const { content, alignment } = attributes;

		return (
			<RichText.Content
				className={ className }
				style={ { textAlign: alignment } }
				value={ content }
				tagName="p"
			/>
		);
	},
} );
```
{% end %}

Note that `BlockControls` is only visible when the block is currently selected.

## Inspector

While the toolbar area is useful for displaying controls to toggle attributes of a block, sometimes you will find that you need more screen space for form fields. The inspector region is shown in place of the post settings sidebar when a block is selected.

Similar to rendering a toolbar, if you include an `InspectorControls` element in the return value of your block type's `edit` function, those controls will be shown in the inspector region.
