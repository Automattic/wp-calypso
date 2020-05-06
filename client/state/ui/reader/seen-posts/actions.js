/**
 * Internal Dependencies
 */
import {
	READER_UNSEEN_STATUS_ANY_REQUEST,
	READER_UNSEEN_STATUS_ANY_RECEIVE,
} from 'state/action-types';

/**
 * Load data layer dependencies
 */
import 'state/data-layer/wpcom/seen-posts/status/unseen/any/index';

export const requestUnseenStatusAny = () => ( {
	type: READER_UNSEEN_STATUS_ANY_REQUEST,
} );

export const receiveUnseenStatusAny = ( status ) => ( {
	type: READER_UNSEEN_STATUS_ANY_RECEIVE,
	status,
} );
