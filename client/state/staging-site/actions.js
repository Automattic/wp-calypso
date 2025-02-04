import { SITE_STAGING_STATUS_SET } from 'calypso/state/action-types';

import 'calypso/state/staging-site/init';

/**
 * Sets the status of sync for a particular site.
 * @see state/staging-site/constants#StagingSiteAction
 * @param {number} siteId The site id to which the status belongs
 * @param {string | null } status The new status of the staging site
 * @returns {Object} An action object
 */
export const setStagingSiteStatus = ( siteId, status ) => ( {
	type: SITE_STAGING_STATUS_SET,
	siteId,
	status,
} );
