/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/element';
import { IconButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { isSharedBlock } from '@wordpress/blocks';
import { withSelect, withDispatch } from '@wordpress/data';

export function SharedBlockDeleteButton( { sharedBlock, onDelete, itemsRole } ) {
	if ( ! sharedBlock ) {
		return null;
	}

	return (
		<IconButton
			className="editor-block-settings-menu__control"
			icon="no"
			disabled={ sharedBlock.isTemporary }
			onClick={ () => onDelete( sharedBlock.id ) }
			role={ itemsRole }
		>
			{ __( 'Delete Shared Block' ) }
		</IconButton>
	);
}

export default compose( [
	withSelect( ( select, { uid } ) => {
		const { getBlock, getSharedBlock } = select( 'core/editor' );
		const block = getBlock( uid );
		return {
			sharedBlock: block && isSharedBlock( block ) ? getSharedBlock( block.attributes.ref ) : null,
		};
	} ),
	withDispatch( ( dispatch, { onToggle = noop } ) => {
		const {
			deleteSharedBlock,
		} = dispatch( 'core/editor' );

		return {
			onDelete( id ) {
				// TODO: Make this a <Confirm /> component or similar
				// eslint-disable-next-line no-alert
				const hasConfirmed = window.confirm( __(
					'Are you sure you want to delete this Shared Block?\n\n' +
					'It will be permanently removed from all posts and pages that use it.'
				) );

				if ( hasConfirmed ) {
					deleteSharedBlock( id );
					onToggle();
				}
			},
		};
	} ),
] )( SharedBlockDeleteButton );
