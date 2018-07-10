/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Fragment, compose } from '@wordpress/element';
import { IconButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { isSharedBlock } from '@wordpress/blocks';
import { withSelect, withDispatch } from '@wordpress/data';

export function SharedBlockConvertButton( {
	isVisible,
	isStaticBlock,
	onConvertToStatic,
	onConvertToShared,
	itemsRole,
} ) {
	if ( ! isVisible ) {
		return null;
	}

	return (
		<Fragment>
			{ isStaticBlock && (
				<IconButton
					className="editor-block-settings-menu__control"
					icon="controls-repeat"
					onClick={ onConvertToShared }
					role={ itemsRole }
				>
					{ __( 'Convert to Shared Block' ) }
				</IconButton>
			) }
			{ ! isStaticBlock && (
				<IconButton
					className="editor-block-settings-menu__control"
					icon="controls-repeat"
					onClick={ onConvertToStatic }
					role={ itemsRole }
				>
					{ __( 'Convert to Regular Block' ) }
				</IconButton>
			) }
		</Fragment>
	);
}

export default compose( [
	withSelect( ( select, { uid } ) => {
		const { getBlock, getSharedBlock } = select( 'core/editor' );
		const { getFallbackBlockName } = select( 'core/blocks' );

		const block = getBlock( uid );
		if ( ! block ) {
			return { isVisible: false };
		}

		return {
			// Hide 'Convert to Shared Block' on Classic blocks. Showing it causes a
			// confusing UX, because of its similarity to the 'Convert to Blocks' button.
			isVisible: block.name !== getFallbackBlockName(),
			isStaticBlock: ! isSharedBlock( block ) || ! getSharedBlock( block.attributes.ref ),
		};
	} ),
	withDispatch( ( dispatch, { uid, onToggle = noop } ) => {
		const {
			convertBlockToShared,
			convertBlockToStatic,
		} = dispatch( 'core/editor' );

		return {
			onConvertToStatic() {
				convertBlockToStatic( uid );
				onToggle();
			},
			onConvertToShared() {
				convertBlockToShared( uid );
				onToggle();
			},
		};
	} ),
] )( SharedBlockConvertButton );
