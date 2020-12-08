/**
 * Internal dependencies
 */
import { NOTIFICATIONS_UNSEEN_COUNT_SET } from 'calypso/state/action-types';

export const unseenCount = ( state = null, action ) =>
	NOTIFICATIONS_UNSEEN_COUNT_SET === action.type ? action.unseenCount : state;

export const setUnseenCount = ( count ) => ( {
	type: NOTIFICATIONS_UNSEEN_COUNT_SET,
	unseenCount: count,
} );
