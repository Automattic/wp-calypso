/**
 * Internal dependencies
 */
import { WHATS_NEW_LIST_REQUEST, WHATS_NEW_LIST_SET } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/whats-new/list';
import 'calypso/state/whats-new/init';

export const requestWhatsNewList = ( siteId ) => ( {
	type: WHATS_NEW_LIST_REQUEST,
	siteId,
} );

export const setWhatsNewList = ( siteId, list ) => ( {
	type: WHATS_NEW_LIST_SET,
	siteId,
	list,
} );
