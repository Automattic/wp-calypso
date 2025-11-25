/* global wpcomGutenberg */
import { RichTextToolbarButton } from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
import { compose, ifCondition } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { registerFormatType } from '@wordpress/rich-text';

const RichTextJustifyButton = ( {
	blockId,
	deprecatedIsBlockJustified,
	styleAttributes,
	updateBlockAttributes,
} ) => {
	const isBlockJustified = 'justify' === styleAttributes.typography?.textAlign;

	const onToggle = () => {
		// TODO: Remove this once we know all Atomic sites are on Gutenberg 22.1 or higher
		const isDeprecatedAlignAttribute =
			getBlockType( 'core/paragraph' ).attributes.align !== undefined;

		if ( isDeprecatedAlignAttribute ) {
			return updateBlockAttributes( blockId, {
				align: deprecatedIsBlockJustified ? null : 'justify',
			} );
		}

		updateBlockAttributes( blockId, {
			style: {
				...styleAttributes,
				typography: {
					...styleAttributes.typography,
					textAlign: isBlockJustified ? null : 'justify',
				},
			},
		} );
	};

	return (
		<RichTextToolbarButton
			icon="editor-justify"
			title={ wpcomGutenberg.richTextToolbar.justify }
			onClick={ onToggle }
			isActive={ deprecatedIsBlockJustified || isBlockJustified }
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
			deprecatedIsBlockJustified: 'justify' === selectedBlock.attributes.align,
			styleAttributes: selectedBlock.attributes.style || EMPTY_STYLES,
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
