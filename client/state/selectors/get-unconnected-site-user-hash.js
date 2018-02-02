/** @format */
/**
 * External dependencies
 */
import sha1 from 'hash.js/lib/hash/sha/1';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getUnconnectedSite } from 'state/selectors';

/**
 * Returns a hashed userEmail of a Jetpack onboarding site indexed by the siteID.
 * Returns null if no email has been provided.
 *
 * @param  {Object}   state 		Global state tree.
 * @param  {Integer}  siteId		SiteId of the unconnected site.
 * @return {?String}						Hashed userEmail of the unconnected site.
 */
export default createSelector(
	( state, siteId ) => {
		const site = getUnconnectedSite( state, siteId );
		if ( ! site ) {
			return null;
		}
		const userId = get( site, 'userEmail' );
		if ( ! userId ) {
			return null;
		}
		const hash = sha1();
		hash.update( userId );

		return hash.digest( 'hex' );
	},
	( state, siteId ) => [ getUnconnectedSite( state, siteId ) ]
);
