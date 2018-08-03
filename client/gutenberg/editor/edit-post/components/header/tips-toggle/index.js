/**
 * WordPress Dependencies
 */
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { MenuItem } from '@wordpress/components';

function TipsToggle( { onToggle, isActive } ) {
	return (
		<MenuItem
			icon={ isActive && 'yes' }
			isSelected={ isActive }
			onClick={ onToggle }
		>
			{ __( 'Show Tips' ) }
		</MenuItem>
	);
}

export default compose( [
	withSelect( ( select ) => ( {
		isActive: select( 'core/nux' ).areTipsEnabled(),
	} ) ),
	withDispatch( ( dispatch, ownProps ) => ( {
		onToggle() {
			const { disableTips, enableTips } = dispatch( 'core/nux' );
			if ( ownProps.isActive ) {
				disableTips();
			} else {
				enableTips();
			}
			ownProps.onToggle();
		},
	} ) ),
] )( TipsToggle );
