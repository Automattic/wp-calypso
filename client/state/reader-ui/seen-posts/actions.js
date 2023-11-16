import {
	READER_UNSEEN_STATUS_REQUEST,
	READER_UNSEEN_STATUS_RECEIVE,
} from 'calypso/state/reader-ui/action-types';

import 'calypso/state/data-layer/wpcom/seen-posts/unseen/status';
import 'calypso/state/reader-ui/init';

/**
 * Request unseen status for any section
 * @returns {{type: string}} redux action
 */
export const requestUnseenStatus = () => ( {
	type: READER_UNSEEN_STATUS_REQUEST,
} );

/**
 * Receive unseen status for any section
 */
export const receiveUnseenStatus = ( { status } ) => ( {
	type: READER_UNSEEN_STATUS_RECEIVE,
	status,
} );
