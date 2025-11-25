/* global wpcomGutenberg */
import { RichTextToolbarButton } from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
import { compose, ifCondition } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { registerFormatType } from '@wordpress/rich-text';
import clsx from 'clsx';
import { objectHasValues } from '../../utils';

const RichTextJustifyButton = ( {
	blockId,
	deprecatedIsBlockJustified,
	styleAttributes,
	updateBlockAttributes,
	className,
} ) => {
	const isBlockJustified = 'justify' === styleAttributes.typography?.textAlign;

	const onToggle = () => {
		/**
		 * The functionality introduced in Gutenberg 22.1 does not yet support text-align justify,
		 * so we need to introduce the has-text-align-justify class name ourselves.
		 */
		const baseClassName = className.replace( 'has-text-align-justify', '' );

		// TODO: Remove this once we know all Atomic sites are on Gutenberg 22.1 or higher
		const isDeprecatedAlignAttribute =
			getBlockType( 'core/paragraph' ).attributes.align !== undefined;

		if ( isDeprecatedAlignAttribute ) {
			const newAlignValue = deprecatedIsBlockJustified ? undefined : 'justify';

			const newClassName = clsx(
				baseClassName,
				newAlignValue === 'justify' && 'has-text-align-justify'
			);

			return updateBlockAttributes( blockId, {
				align: newAlignValue,
				className: newClassName || undefined,
			} );
		}

		const newTextAlignValue = isBlockJustified ? undefined : 'justify';

		const newClassName = clsx(
			baseClassName,
			newTextAlignValue === 'justify' && 'has-text-align-justify'
		);

		const typographyAttributes = {
			...styleAttributes.typography,
			textAlign: newTextAlignValue,
		};

		const newStyleAttributes = {
			...styleAttributes,
			typography: objectHasValues( typographyAttributes ) ? typographyAttributes : undefined,
		};

		updateBlockAttributes( blockId, {
			style: objectHasValues( newStyleAttributes ) ? newStyleAttributes : undefined,
			className: newClassName || undefined,
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
			className: selectedBlock.attributes.className || '',
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
