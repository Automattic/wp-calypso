/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Types
 */
import { SiteId, UserId } from 'types';
import { ExternalContributor } from 'state/sites/external-contributors/types';

/**
 * @param  {Object}  state       global state
 * @param  {Number}  siteId      the site id
 * @param  {Number}  userId      the user id
 * @returns {Boolean} if a user is a external contributor for a site
 */
export const isUserExternalContributor = (
	state: any,
	siteId: SiteId,
	userId: UserId
): boolean => {
	const externalContributors: ExternalContributor | null = get(
		state,
		[ 'sites', 'externalContributors', siteId, 'items' ],
		[]
	);

	return externalContributors ? externalContributors.includes( userId ) : false;
};
