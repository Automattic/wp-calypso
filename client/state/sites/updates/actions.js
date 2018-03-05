/** @format */

/**
 * Internal dependencies
 */

import { SITE_PLUGIN_UPDATED } from 'state/action-types';

export const sitePluginUpdated = siteId => ( {
	type: SITE_PLUGIN_UPDATED,
	siteId,
} );
