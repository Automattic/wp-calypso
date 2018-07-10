/**
 * WordPress Dependencies
 */
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/element';
import { MenuItem } from '@wordpress/components';
import { ifViewportMatches } from '@wordpress/viewport';

function FixedToolbarToggle( { onToggle, isActive } ) {
	return (
		<MenuItem
			icon={ isActive && 'yes' }
			isSelected={ isActive }
			onClick={ onToggle }
		>
			{ __( 'Fix Toolbar to Top' ) }
		</MenuItem>
	);
}

export default compose( [
	withSelect( ( select ) => ( {
		isActive: select( 'core/edit-post' ).isFeatureActive( 'fixedToolbar' ),
	} ) ),
	withDispatch( ( dispatch, ownProps ) => ( {
		onToggle() {
			dispatch( 'core/edit-post' ).toggleFeature( 'fixedToolbar' );
			ownProps.onToggle();
		},
	} ) ),
	ifViewportMatches( 'medium' ),
] )( FixedToolbarToggle );
