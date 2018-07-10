/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import MetaBoxesArea from './meta-boxes-area';
import MetaBoxesPanel from './meta-boxes-panel';

function MetaBoxes( { location, isActive, usePanel = false } ) {
	if ( ! isActive ) {
		return null;
	}

	const element = <MetaBoxesArea location={ location } />;

	if ( ! usePanel ) {
		return element;
	}

	return (
		<MetaBoxesPanel>
			{ element }
		</MetaBoxesPanel>
	);
}

export default withSelect(
	( select, ownProps ) => ( {
		isActive: select( 'core/edit-post' ).getMetaBox( ownProps.location ).isActive,
	} ),
)( MetaBoxes );
