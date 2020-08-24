/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getProfileLinks from 'state/selectors/get-profile-links';

/**
 * Whether the site with the domain in question is currently in the user's profile links.
 * Will return null if profile links have not been loaded yet.
 *
 * @param {object}   state      Global state tree
 * @param {string}   siteDomain Site domain
 * @returns {?boolean}           True if the site is in the user's profile links, false otherwise.
 */
export default createSelector(
	( state, siteDomain ) => {
		const profileLinks = getProfileLinks( state );
		if ( profileLinks === null ) {
			return null;
		}

		return some( profileLinks, ( profileLink ) => {
			// the regex below is used to strip any leading scheme from the profileLink's URL
			return siteDomain === profileLink.value.replace( /^.*:\/\//, '' );
		} );
	},
	[ getProfileLinks ]
);
