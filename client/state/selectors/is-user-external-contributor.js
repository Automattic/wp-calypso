/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param  {Object}  state       global state
 * @param  {Number}  siteId      the site id
 * @param  {Number}  userId      the user id
 * @returns {Boolean} if a user is a external contributor for a site
 */
export const isUserExternalContributor = ( state, siteId, userId ) => {
	const externalContributors = get(
		state,
		[ 'sites', 'items', siteId, 'options', 'external_contributors' ],
		[]
	);
	return externalContributors.includes( userId );
};
