/* global wpcomGutenberg */
import { RichTextToolbarButton } from '@wordpress/block-editor';
import { compose, ifCondition } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { registerFormatType } from '@wordpress/rich-text';
import { get } from 'lodash';

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
	withSelect( ( wpSelect ) => {
		const selectedBlock = wpSelect( 'core/block-editor' ).getSelectedBlock();
		if ( ! selectedBlock ) {
			return {};
		}
		return {
			blockId: selectedBlock.clientId,
			blockName: selectedBlock.name,
			isBlockJustified: 'justify' === get( selectedBlock, 'attributes.align' ),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		updateBlockAttributes: dispatch( 'core/editor' ).updateBlockAttributes,
	} ) ),
	ifCondition( ( props ) => 'core/paragraph' === props.blockName )
)( RichTextJustifyButton );

registerFormatType( 'wpcom/justify', {
	title: wpcomGutenberg.richTextToolbar.justify,
	tagName: 'p',
	className: null,
	edit: ConnectedRichTextJustifyButton,
} );
