/**
 * Internal dependencies
 */

import { MEMBERSHIPS_SETTINGS } from 'state/action-types';

import 'state/data-layer/wpcom/sites/memberships';

export const requestSettings = siteId => ( {
	siteId,
	type: MEMBERSHIPS_SETTINGS,
} );
