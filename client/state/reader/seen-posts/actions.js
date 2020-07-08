/**
 * Internal Dependencies
 */
import {
	READER_SEEN_MARK_AS_SEEN_REQUEST,
	READER_SEEN_MARK_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_UNSEEN_REQUEST,
	READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
	READER_SEEN_MARK_ALL_AS_SEEN_SECTION_REQUEST,
	READER_SEEN_MARK_ALL_AS_SEEN_SECTION_RECEIVE,
	READER_SEEN_MARK_ALL_AS_SEEN_FEED_REQUEST,
	READER_SEEN_MARK_ALL_AS_SEEN_FEED_RECEIVE,
} from 'state/reader/action-types';

/**
 * Request mark as seen for given seenIds
 *
 * @param {object} payload method
 * @param payload.feedId identifier of the feed
 * @param payload.feedUrl url of the feed
 * @param payload.feedItemIds list of feed item ids
 * @param payload.globalIds list of Calypso Reader specific global ids
 *
 * @returns {{seenIds: *, globalIds: *, source: *, type: string}} redux action
 */
export const requestMarkAsSeen = ( { feedId, feedUrl, feedItemIds, globalIds } ) => ( {
	type: READER_SEEN_MARK_AS_SEEN_REQUEST,
	feedId,
	feedUrl,
	feedItemIds,
	globalIds,
} );

/**
 * Receive mark as seen for successful requests
 *
 * @param {object} payload method
 * @param payload.feedId identifier of the feed
 * @param payload.feedUrl url of the feed
 * @param payload.globalIds list of Calypso Reader specific global ids
 *
 * @returns {{globalIds: *, type: string}} redux action
 */
export const receiveMarkAsSeen = ( { feedId, feedUrl, globalIds } ) => ( {
	type: READER_SEEN_MARK_AS_SEEN_RECEIVE,
	feedId,
	feedUrl,
	globalIds,
} );

/**
 * Request mark as unseen for given seenIds
 *
 * @param {object} payload method
 * @param payload.feedId identifier of the feed
 * @param payload.feedUrl url of the feed
 * @param payload.feedItemIds list of feed item ids
 * @param payload.globalIds list of Calypso Reader specific global ids
 *
 * @returns {{seenIds: *, globalIds: *, type: string}} redux action
 */
export const requestMarkAsUnseen = ( { feedId, feedUrl, feedItemIds, globalIds } ) => ( {
	type: READER_SEEN_MARK_AS_UNSEEN_REQUEST,
	feedId,
	feedUrl,
	feedItemIds,
	globalIds,
} );

/**
 * Receive mark as unseen for successful requests
 *
 * @param {object} payload method
 * @param payload.feedId identifier of the feed
 * @param payload.feedUrl url of the feed
 * @param payload.globalIds list of Calypso Reader specific global ids
 *
 * @returns {{globalIds: *, type: string}} redux action
 */
export const receiveMarkAsUnseen = ( { feedId, feedUrl, globalIds } ) => ( {
	type: READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
	feedId,
	feedUrl,
	globalIds,
} );

/**
 * Request mark all as seen for given section
 *
 * @param {object} payload method
 * @param payload.section given Reader section
 * @param payload.feedIds list of feed identifiers
 *
 * @returns {{section: string, type: string}} redux action
 */
export const requestMarkAllAsSeenSection = ( { identifier, feedIds, feedUrls } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_SEEN_SECTION_REQUEST,
	identifier,
	feedIds,
	feedUrls,
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
export const receiveMarkAllAsSeenSection = ( { feedIds, feedUrls, globalIds } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_SEEN_SECTION_RECEIVE,
	feedIds,
	feedUrls,
	globalIds,
} );

/**
 * Request mark all as seen for given section
 *
 * @param {object} payload method
 * @param payload.section given Reader section
 * @param payload.feedIds list of feed identifiers
 *
 * @returns {{section: string, type: string}} redux action
 */
export const requestMarkAllAsSeenFeed = ( { identifier, feedId, feedUrl } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_SEEN_FEED_REQUEST,
	identifier,
	feedId,
	feedUrl,
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
export const receiveMarkAllAsSeenFeed = ( { feedId, feedUrl, globalIds } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_SEEN_FEED_RECEIVE,
	feedId,
	feedUrl,
	globalIds,
} );
