/** @format */

/**
 * Internal dependencies
 */

import { SITE_LAUNCH } from 'state/action-types';

import 'state/data-layer/wpcom/sites/launch';

export function launchSite( siteId ) {
	return {
		type: SITE_LAUNCH,
		siteId,
	};
}
