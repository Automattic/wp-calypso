/**
 * @format
 */

/**
 * Internal dependencies
 */
import { READER_SITE_BLOCK, READER_SITE_UNBLOCK } from 'state/action-types';

import 'state/data-layer/wpcom/me/block/sites/delete';
import 'state/data-layer/wpcom/me/block/sites/new';

export function blockSite( siteId ) {
	return {
		type: READER_SITE_BLOCK,
		payload: {
			siteId,
		},
	};
}

export function unblockSite( siteId ) {
	return {
		type: READER_SITE_UNBLOCK,
		payload: {
			siteId,
		},
	};
}
