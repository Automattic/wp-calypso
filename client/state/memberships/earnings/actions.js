/**
 * Internal dependencies
 */
import { MEMBERSHIPS_EARNINGS_GET } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/memberships';
import 'calypso/state/memberships/init';

export const requestEarnings = ( siteId ) => ( {
	siteId,
	type: MEMBERSHIPS_EARNINGS_GET,
} );
