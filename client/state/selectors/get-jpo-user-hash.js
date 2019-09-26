/**
 * External dependencies
 */
import sha1 from 'hash.js/lib/hash/sha/1';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getCurrentUserEmail } from 'state/current-user/selectors';
import getUnconnectedSite from 'state/selectors/get-unconnected-site';

/**
 * Returns a hashed userEmail of a Jetpack onboarding site indexed by the siteID.
 * If onboarding credentials are missing, will try to retrieve it from the current user.
 * Returns null if no email has been provided.
 *
 * @param  {Object}   state 	Global state tree.
 * @param  {Integer}  siteId	SiteId of the unconnected site.
 * @return {?String}			Hashed email.
 */
export default createSelector(
	( state, siteId ) => {
		let userEmail;

		const site = getUnconnectedSite( state, siteId );
		if ( site ) {
			userEmail = get( site, 'userEmail' );
		} else {
			userEmail = getCurrentUserEmail( state );
		}

		if ( ! userEmail ) {
			return null;
		}

		const hash = sha1();
		hash.update( userEmail );

		return hash.digest( 'hex' );
	},
	( state, siteId ) => [ getCurrentUserEmail, getUnconnectedSite( state, siteId ) ]
);
