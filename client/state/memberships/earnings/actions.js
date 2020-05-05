/**
 * Internal dependencies
 */

import { MEMBERSHIPS_EARNINGS_GET } from 'state/action-types';

import 'state/data-layer/wpcom/sites/memberships';

export const requestEarnings = ( siteId ) => ( {
	siteId,
	type: MEMBERSHIPS_EARNINGS_GET,
} );
