/* global wpcomGutenberg */

/**
 * External dependencies
 */
import { compose, ifCondition } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { RichTextToolbarButton } from '@wordpress/editor';
import { toggleFormat, registerFormatType } from '@wordpress/rich-text';
import { get } from 'lodash';

registerFormatType( 'wpcom/underline', {
	title: wpcomGutenberg.richTextToolbar.underline,
	tagName: 'span',
	className: null,
	attributes: { style: 'style' },
	edit( { isActive, value, onChange } ) {
		const onToggle = () =>
			onChange(
				toggleFormat( value, {
					type: 'wpcom/underline',
					attributes: {
						style: 'text-decoration: underline;',
					},
				} )
			);

		return (
			<RichTextToolbarButton
				icon="editor-underline"
				title={ wpcomGutenberg.richTextToolbar.underline }
				onClick={ onToggle }
				isActive={ isActive }
			/>
		);
	},
} );

const RichTextJustifyButton = ( { blockId, isBlockJustified, updateBlockAttributes } ) => {
	const onToggle = () =>
		updateBlockAttributes( blockId, { align: isBlockJustified ? null : 'justify' } );

	return (
		<RichTextToolbarButton
			icon="editor-justify"
			title={ wpcomGutenberg.richTextToolbar.justify }
			onClick={ onToggle }
			isActive={ isBlockJustified }
		/>
	);
};

const ConnectedRichTextJustifyButton = compose(
	withSelect( select => {
		const selectedBlock = select( 'core/editor' ).getSelectedBlock();
		if ( ! selectedBlock ) {
			return {};
		}
		return {
			blockId: selectedBlock.clientId,
			blockName: selectedBlock.name,
			isBlockJustified: 'justify' === get( selectedBlock, 'attributes.align' ),
		};
	} ),
	withDispatch( dispatch => ( {
		updateBlockAttributes: dispatch( 'core/editor' ).updateBlockAttributes,
	} ) ),
	ifCondition( props => 'core/paragraph' === props.blockName )
)( RichTextJustifyButton );

registerFormatType( 'wpcom/justify', {
	title: wpcomGutenberg.richTextToolbar.justify,
	tagName: 'p',
	className: null,
	attributes: { style: 'style' },
	edit: ConnectedRichTextJustifyButton,
} );
