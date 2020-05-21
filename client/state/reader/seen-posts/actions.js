/**
 * Internal Dependencies
 */
import {
	READER_SEEN_UNSEEN_STATUS_ALL_RECEIVE,
	READER_SEEN_UNSEEN_STATUS_ALL_REQUEST,
} from 'state/reader/action-types';

/**
 * Load data layer dependencies
 */
import 'state/data-layer/wpcom/seen-posts/status/unseen/all/index';

/**
 * Request unseen status for all sections
 *
 * @param showSubsections flag
 * @returns {{showSubsections, type: string}} redux action
 */
export const requestUnseenStatusAll = ( { showSubsections = false } = {} ) => ( {
	type: READER_SEEN_UNSEEN_STATUS_ALL_REQUEST,
	showSubsections,
} );

/**
 * Receive unseen status for all sections
 *
 * @param sections unseen status
 * @returns {{type: string, sections: *}} redux action
 */
export const receiveUnseenStatusAll = ( { sections } ) => ( {
	type: READER_SEEN_UNSEEN_STATUS_ALL_RECEIVE,
	sections,
} );
