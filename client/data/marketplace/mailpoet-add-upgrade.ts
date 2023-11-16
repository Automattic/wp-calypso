import wpcom from 'calypso/lib/wp';
import type { AddPluginUpgrade } from './types';

/**
 * Calls the API to add an upgrade to mailpoet given a site id.
 * @param {number} siteId Site ID.
 * @returns {Promise} Promise object represents the result of the request.
 */
export const addMailPoetUpgrade = ( siteId: number ): Promise< AddPluginUpgrade > => {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/mailpoet/add-upgrade`,
		apiNamespace: 'wpcom/v2',
	} );
};
