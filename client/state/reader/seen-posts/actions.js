/**
 * Internal Dependencies
 */
import {
	READER_SEEN_UNSEEN_STATUS_ALL_RECEIVE,
	READER_SEEN_UNSEEN_STATUS_ALL_REQUEST,
	READER_SEEN_MARK_AS_SEEN_REQUEST,
	READER_SEEN_MARK_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_UNSEEN_REQUEST,
	READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
	READER_SEEN_MARK_ALL_AS_SEEN_REQUEST,
	READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_ALL_AS_UNSEEN_REQUEST,
	READER_SEEN_MARK_ALL_AS_UNSEEN_RECEIVE,
} from 'state/reader/action-types';

/**
 * Load data layer dependencies
 */
import 'state/data-layer/wpcom/seen-posts/seen/new/index';
import 'state/data-layer/wpcom/seen-posts/seen/delete/index';
import 'state/data-layer/wpcom/seen-posts/seen/all/new/index';
import 'state/data-layer/wpcom/seen-posts/seen/all/delete/index';
import 'state/data-layer/wpcom/seen-posts/status/unseen/all/index';

/**
 * Request unseen status for all sections
 *
 * @param {object} payload method
 * @param payload.showSubsections flag
 * @returns {{showSubsections, type: string}} redux action
 */
export const requestUnseenStatusAll = ( { showSubsections = true } = {} ) => ( {
	type: READER_SEEN_UNSEEN_STATUS_ALL_REQUEST,
	showSubsections,
} );

/**
 * Receive unseen status for all sections
 *
 * @param {object} payload method
 * @param payload.sections unseen status
 * @returns {{type: string, sections: *}} redux action
 */
export const receiveUnseenStatusAll = ( { sections } ) => ( {
	type: READER_SEEN_UNSEEN_STATUS_ALL_RECEIVE,
	sections,
} );

/**
 * Request mark as seen for given seenIds
 *
 * @param {object} payload method
 * @param payload.seenIds list of {feed_id, blog_id, post_id, feed_item_id}
 * @param payload.globalIds list of Calypso Reader specific global ids
 * @param payload.source of the seen entry (web)
 *
 * @returns {{seenIds: *, globalIds: *, source: *, type: string}} redux action
 */
export const requestMarkAsSeen = ( { seenIds, globalIds, source } ) => ( {
	type: READER_SEEN_MARK_AS_SEEN_REQUEST,
	seenIds,
	globalIds,
	source,
} );

/**
 * Receive mark as seen for successful requests
 *
 * @param {object} payload method
 * @param payload.globalIds list of Calypso Reader specific global ids
 *
 * @returns {{globalIds: *, type: string}} redux action
 */
export const receiveMarkAsSeen = ( { globalIds } ) => ( {
	type: READER_SEEN_MARK_AS_SEEN_RECEIVE,
	globalIds,
} );

/**
 * Request mark as unseen for given seenIds
 *
 * @param {object} payload method
 * @param payload.seenIds list of {feed_id, blog_id, post_id, feed_item_id}
 * @param payload.globalIds list of Calypso Reader specific global ids
 *
 * @returns {{seenIds: *, globalIds: *, type: string}} redux action
 */
export const requestMarkAsUnseen = ( { seenIds, globalIds } ) => ( {
	type: READER_SEEN_MARK_AS_UNSEEN_REQUEST,
	seenIds,
	globalIds,
} );

/**
 * Receive mark as unseen for successful requests
 *
 * @param {object} payload method
 * @param payload.globalIds list of Calypso Reader specific global ids
 *
 * @returns {{globalIds: *, type: string}} redux action
 */
export const receiveMarkAsUnseen = ( { globalIds } ) => ( {
	type: READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
	globalIds,
} );

/**
 * Request mark all as seen for given section
 *
 * @param {object} payload method
 * @param payload.section given Reader section
 *
 * @returns {{section: string, type: string}} redux action
 */
export const requestMarkAllAsSeen = ( { section } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_SEEN_REQUEST,
	section,
} );

/**
 * Receive mark all as seen for successful requests
 *
 * @param {object} payload method
 * @param payload.section given Reader section
 * @param payload.globalIds list of Calypso Reader specific global ids
 *
 * @returns {{section: string, globalIds: *, type: string}} redux action
 */
export const receiveMarkAllAsSeen = ( { section, globalIds } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE,
	section,
	globalIds,
} );

/**
 * Request mark all as unseen for given section
 *
 * @param {object} payload method
 * @param payload.section given Reader section
 *
 * @returns {{section: string, type: string}} redux action
 */
export const requestMarkAllAsUnseen = ( { section } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_UNSEEN_REQUEST,
	section,
} );

/**
 * Receive mark all as unseen for successful requests
 *
 * @param {object} payload method
 * @param payload.section given Reader section
 * @param payload.globalIds list of Calypso Reader specific global ids
 *
 * @returns {{section: string, globalIds: *, type: string}} redux action
 */
export const receiveMarkAllAsUnseen = ( { section, globalIds } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_UNSEEN_RECEIVE,
	section,
	globalIds,
} );
