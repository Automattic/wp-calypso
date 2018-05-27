/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getGoogleMyBusinessLocations from 'state/selectors/get-google-my-business-locations';
import { ANALYTICS_EVENT_RECORD } from 'state/action-types';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Enhances any Redux action that aims at recording an analytics event with two additional properties which specify the
 * number of verified and unverified locations of the Google My Business account currently connected.
 *
 * @param {Object} action - Redux action as a plain object
 * @param {Function} getState - Redux function that can be used to retrieve the current state tree
 * @returns {Object|null} a set of properties that should be merged into the original Redux action, or null otherwise
 * @see client/state/analytics/actions/withEnhancers
 */
export const enhanceWithLocationCounts = ( action, getState ) => {
	if ( action.type === ANALYTICS_EVENT_RECORD ) {
		const siteId = getSelectedSiteId( getState() );

		if ( siteId !== null ) {
			const locations = getGoogleMyBusinessLocations( getState(), siteId );

			const verifiedLocationCount = locations.filter( location =>
				get( location, 'meta.state.isVerified', false )
			).length;

			return {
				meta: {
					analytics: [ {
						payload: {
							properties: {
								location_count: locations.length,
								verified_location_count: verifiedLocationCount,
							}
						}
					} ]
				}
			};
		}
	}

	return null;
};
