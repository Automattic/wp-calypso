/**
 * Internal dependencies
 */
import { NOTIFICATIONS_UNSEEN_COUNT_SET } from 'calypso/state/action-types';
import { withStorageKey } from 'calypso/state/utils';

const unseenCount = ( state = null, action ) =>
	NOTIFICATIONS_UNSEEN_COUNT_SET === action.type ? action.unseenCount : state;

export default withStorageKey( 'notificationsUnseenCount', unseenCount );
