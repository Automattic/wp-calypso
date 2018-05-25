/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export function recordTracksEventWithLocationCounts( stateProps, dispatchProps, eventName, path ) {
	const { locations } = stateProps;

	const locationCount = locations.length;

	const verifiedLocationCount = locations.filter( location =>
		get( location, 'meta.state.isVerified', false )
	).length;

	dispatchProps.recordTracksEvent( eventName, {
		location_count: locationCount,
		path,
		verified_location_count: verifiedLocationCount,
	} );
}
