import { createSelector } from '@automattic/state-utils';
import { some } from 'lodash';
import getProfileLinks from 'calypso/state/selectors/get-profile-links';

/**
 * Whether the site with the domain in question is currently in the user's profile links.
 * Will return null if profile links have not been loaded yet.
 *
 * @param {Object}   state      Global state tree
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
