/** @format */

/**
 * Internal dependencies
 */
import { CONCIERGE_INFO_UPDATE } from 'state/action-types';

export const updateConciergeInfo = ( siteId, info ) => ( {
	type: CONCIERGE_INFO_UPDATE,
	siteId,
	info,
} );
