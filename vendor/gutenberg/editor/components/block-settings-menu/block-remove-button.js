/**
 * External dependencies
 */
import { castArray, flow, noop, some } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { compose } from '@wordpress/element';
import { withDispatch, withSelect } from '@wordpress/data';

export function BlockRemoveButton( { onRemove, onClick = noop, isLocked, role, ...props } ) {
	if ( isLocked ) {
		return null;
	}

	const label = __( 'Remove Block' );

	return (
		<IconButton
			className="editor-block-settings-menu__control"
			onClick={ flow( onRemove, onClick ) }
			icon="trash"
			label={ label }
			role={ role }
			{ ...props }
		>
			{ label }
		</IconButton>
	);
}

export default compose(
	withDispatch( ( dispatch, { uids } ) => ( {
		onRemove() {
			dispatch( 'core/editor' ).removeBlocks( uids );
		},
	} ) ),
	withSelect( ( select, { uids } ) => {
		const { getBlockRootUID, getTemplateLock } = select( 'core/editor' );
		return {
			isLocked: some( castArray( uids ), ( uid ) => {
				const rootUID = getBlockRootUID( uid );
				const templateLock = getTemplateLock( rootUID );
				return templateLock === 'all';
			} ),
		};
	} ),
)( BlockRemoveButton );
