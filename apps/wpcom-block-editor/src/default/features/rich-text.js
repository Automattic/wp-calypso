/* global wpcomGutenberg */
import { RichTextToolbarButton } from '@wordpress/block-editor';
import { compose, ifCondition } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { registerFormatType } from '@wordpress/rich-text';
import { get } from 'lodash';

const RichTextJustifyButton = ( { blockId, styleAttributes, updateBlockAttributes } ) => {
	const isBlockJustified = 'justify' === get( styleAttributes, 'typography.textAlign' );

	const onToggle = () =>
		updateBlockAttributes( blockId, {
			style: {
				...styleAttributes,
				typography: {
					...styleAttributes.typography,
					textAlign: isBlockJustified ? null : 'justify',
				},
			},
		} );

	return (
		<RichTextToolbarButton
			icon="editor-justify"
			title={ wpcomGutenberg.richTextToolbar.justify }
			onClick={ onToggle }
			isActive={ isBlockJustified }
		/>
	);
};

const EMPTY_STYLES = {};

const ConnectedRichTextJustifyButton = compose(
	withSelect( ( wpSelect ) => {
		const selectedBlock = wpSelect( 'core/block-editor' ).getSelectedBlock();
		if ( ! selectedBlock ) {
			return {};
		}
		return {
			blockId: selectedBlock.clientId,
			blockName: selectedBlock.name,
			styleAttributes: get( selectedBlock.attributes, 'style', EMPTY_STYLES ),
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
