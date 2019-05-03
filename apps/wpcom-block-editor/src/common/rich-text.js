/* global wpcomGutenberg */

/**
 * External dependencies
 */
import { compose, ifCondition } from '@wordpress/compose';
import { withSelect, withDispatch, select as baseSelect } from '@wordpress/data';
import { RichTextToolbarButton } from '@wordpress/editor';
import { toggleFormat, registerFormatType, unregisterFormatType } from '@wordpress/rich-text';
import { get, find } from 'lodash';

// trying to wait until core registers their keyboard-only underline,
// then unregistering it and registering our own so they don't collide
let times = 0;
const maxTimes = 10;
const { getFormatTypes } = baseSelect( 'core/rich-text' );
const interval = setInterval( () => {
	times = times + 1;
	if ( times > maxTimes ) {
		clearInterval( interval );
		return;
	}
	if ( ! find( getFormatTypes(), { name: 'core/underline' } ) ) {
		return;
	}

	unregisterFormatType( 'core/underline' );
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
}, 500 );

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
