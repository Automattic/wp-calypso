/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Types
 */
import { SiteId } from 'types';

/**
 * @param  {Object}  state       global state
 * @param  {Number}  siteId      the site id
 * @returns {Boolean} if a request is currently active for the site
 */
export const isRequestingExternalContributors = ( state: any, siteId: SiteId ): boolean => {
	return get( state, [ 'sites', 'externalContributors', siteId, 'requesting' ], false );
};
