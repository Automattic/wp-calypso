/**
 * Internal dependencies
 */

import { MEMBERSHIPS_SUBSCRIBERS_LIST } from 'state/action-types';

import 'state/data-layer/wpcom/sites/memberships';

export const requestSubscribers = ( siteId, offset ) => ( {
	siteId,
	type: MEMBERSHIPS_SUBSCRIBERS_LIST,
	offset,
} );
