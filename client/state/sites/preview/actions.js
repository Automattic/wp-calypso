/** @format */

/**
 * Internal dependencies
 */

import { SITES_DISABLE_PREVIEW } from 'state/action-types';

export function disableSitePreview( siteId ) {
	return {
		type: SITES_DISABLE_PREVIEW,
		payload: {
			siteId,
		},
	};
}
