/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import MetaBoxesArea from './meta-boxes-area';

function MetaBoxes( { location, isActive } ) {
	if ( ! isActive ) {
		return null;
	}

	return <MetaBoxesArea location={ location } />;
}

export default withSelect(
	( select, ownProps ) => ( {
		isActive: select( 'core/edit-post' ).getMetaBox( ownProps.location ).isActive,
	} ),
)( MetaBoxes );
