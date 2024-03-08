import wpcom from 'calypso/lib/wp';
import type { ReinstallPluginsResponse } from './types';

/**
 * Calls the API to reinstall all the subscriptions given a site id.
 * @param {number} siteId Site ID.
 * @returns {Promise} Promise object represents the result of the request.
 */
const reinstallPlugins = ( siteId: number ): Promise< ReinstallPluginsResponse > => {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/marketplace/products/reinstall`,
		apiNamespace: 'wpcom/v2',
	} );
};

export default reinstallPlugins;
