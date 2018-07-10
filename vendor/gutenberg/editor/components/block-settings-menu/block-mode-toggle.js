/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { getBlockType, hasBlockSupport } from '@wordpress/blocks';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/element';

export function BlockModeToggle( { blockType, mode, onToggleMode, small = false, role } ) {
	if ( ! hasBlockSupport( blockType, 'html', true ) ) {
		return null;
	}

	const label = mode === 'visual' ?
		__( 'Edit as HTML' ) :
		__( 'Edit visually' );

	return (
		<IconButton
			className="editor-block-settings-menu__control"
			onClick={ onToggleMode }
			icon="html"
			label={ small ? label : undefined }
			role={ role }
		>
			{ ! small && label }
		</IconButton>
	);
}

export default compose( [
	withSelect( ( select, { uid } ) => {
		const { getBlock, getBlockMode } = select( 'core/editor' );
		const block = getBlock( uid );

		return {
			mode: getBlockMode( uid ),
			blockType: block ? getBlockType( block.name ) : null,
		};
	} ),
	withDispatch( ( dispatch, { onToggle = noop, uid } ) => ( {
		onToggleMode() {
			dispatch( 'core/editor' ).toggleBlockMode( uid );
			onToggle();
		},
	} ) ),
] )( BlockModeToggle );
