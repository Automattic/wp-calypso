/**
 * Internal dependencies
 */
import { NOTIFICATIONS_UNSEEN_COUNT_SET } from 'calypso/state/action-types';

import 'calypso/state/notifications/init';

export const setUnseenCount = ( count ) => ( {
	type: NOTIFICATIONS_UNSEEN_COUNT_SET,
	unseenCount: count,
} );
