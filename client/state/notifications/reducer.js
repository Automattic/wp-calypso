/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { NOTIFICATIONS_UNSEEN_COUNT_SET } from 'calypso/state/action-types';

const unseenCount = ( state = null, action ) =>
	NOTIFICATIONS_UNSEEN_COUNT_SET === action.type ? action.unseenCount : state;

export default withStorageKey( 'notificationsUnseenCount', unseenCount );
