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

/**
 * Request unseen status for any section
 *
 * @returns {{type: string}} redux action
 */
export const requestUnseenStatusAny = () => ( {
	type: READER_UNSEEN_STATUS_ANY_REQUEST,
} );

/**
 * Receive unseen status for any section
 *
 * @param status whether or not we have unseen content in any section
 * @returns {{type: string, status: *}} redux action
 */
export const receiveUnseenStatusAny = ( { status } ) => ( {
	type: READER_UNSEEN_STATUS_ANY_RECEIVE,
	status,
} );
