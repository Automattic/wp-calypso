/**
 * External dependencies
 */
import { get, merge } from 'lodash';

/**
 * Internal dependencies
 */
import getGoogleMyBusinessLocations from 'state/selectors/get-google-my-business-locations';
import getGoogleMyBusinessStatsNudgeDismissCount from 'state/selectors/get-google-my-business-stats-nudge-dismiss-count';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Enhances any Redux action that denotes the recording of an analytics event with an additional property which
 * specifies the number of times the Google My Business nudge has been dismissed by the user on the Stats page.
 *
 * @param {object} action - Redux action as a plain object
 * @param {Function} getState - Redux function that can be used to retrieve the current state tree
 * @returns {object} the new Redux action
 * @see client/state/utils/withEnhancers
 */
export const enhanceWithDismissCount = ( action, getState ) => {
	const siteId = getSelectedSiteId( getState() );

	if ( siteId !== null ) {
		const dismissCount = getGoogleMyBusinessStatsNudgeDismissCount( getState(), siteId );

		return merge( action, {
			meta: {
				analytics: [
					{
						payload: {
							properties: {
								dismiss_count: dismissCount,
							},
						},
					},
				],
			},
		} );
	}

	return action;
};

/**
 * Enhances any Redux action that denotes the recording of an analytics event with two additional properties which
 * specify the number of verified and unverified locations of the Google My Business account currently connected.
 *
 * @param {object} action - Redux action as a plain object
 * @param {Function} getState - Redux function that can be used to retrieve the current state tree
 * @returns {object} the new Redux action
 * @see client/state/utils/withEnhancers
 */
export const enhanceWithLocationCounts = ( action, getState ) => {
	const siteId = getSelectedSiteId( getState() );

	if ( siteId !== null ) {
		const locations = getGoogleMyBusinessLocations( getState(), siteId );

		const verifiedLocationCount = locations.filter( ( location ) =>
			get( location, 'meta.state.isVerified', false )
		).length;

		return merge( action, {
			meta: {
				analytics: [
					{
						payload: {
							properties: {
								location_count: locations.length,
								verified_location_count: verifiedLocationCount,
							},
						},
					},
				],
			},
		} );
	}

	return action;
};
