/**
 * Internal Dependencies
 */
import {
	READER_SEEN_MARK_AS_SEEN_REQUEST,
	READER_SEEN_MARK_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_UNSEEN_REQUEST,
	READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
	READER_SEEN_MARK_ALL_AS_SEEN_REQUEST,
	READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_SEEN_BLOG_REQUEST,
	READER_SEEN_MARK_AS_UNSEEN_BLOG_REQUEST,
} from 'calypso/state/reader/action-types';
import { SOURCE_READER_WEB } from 'calypso/state/reader/seen-posts/constants';

/**
 * Load data layer dependencies
 */
import 'calypso/state/data-layer/wpcom/seen-posts/seen/new/index';
import 'calypso/state/data-layer/wpcom/seen-posts/seen/delete/index';
import 'calypso/state/data-layer/wpcom/seen-posts/seen/all/new/index';
import 'calypso/state/data-layer/wpcom/seen-posts/seen/blog/new/index';
import 'calypso/state/data-layer/wpcom/seen-posts/seen/blog/delete/index';

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
	source: SOURCE_READER_WEB,
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
	source: SOURCE_READER_WEB,
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
 * Request mark all as seen
 *
 * @param {object} payload method
 * @param payload.identifier given Reader section
 * @param payload.feedIds list of feed identifiers
 * @param payload.feedUrls list of feed urls
 *
 * @returns {{section: string, type: string}} redux action
 */
export const requestMarkAllAsSeen = ( { identifier, feedIds, feedUrls } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_SEEN_REQUEST,
	identifier,
	feedIds,
	feedUrls,
	source: SOURCE_READER_WEB,
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
export const receiveMarkAllAsSeen = ( { feedIds, feedUrls, globalIds } ) => ( {
	type: READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE,
	feedIds,
	feedUrls,
	globalIds,
} );

/**
 * Request mark as seen for given blog and post id
 *
 * @param {object} payload method
 * @param payload.blogId identifier of the blog
 * @param payload.postIds list of blog post ids
 * @param payload.feedId identifier of the feed
 * @param payload.feedUrl url of the feed
 * @param payload.globalIds list of Calypso Reader specific global ids
 *
 * @returns {{seenIds: *, globalIds: *, source: *, type: string}} redux action
 */
export const requestMarkAsSeenBlog = ( { blogId, postIds, feedId, feedUrl, globalIds } ) => ( {
	type: READER_SEEN_MARK_AS_SEEN_BLOG_REQUEST,
	blogId,
	postIds,
	feedId,
	feedUrl,
	source: SOURCE_READER_WEB,
	globalIds,
} );

/**
 * Request mark as unseen for given blog and post ids
 *
 * @param {object} payload method
 * @param payload.blogId identifier of the blog
 * @param payload.feedId identifier of the feed
 * @param payload.feedUrl url of the feed
 * @param payload.postIds list of blog post ids
 * @param payload.globalIds list of Calypso Reader specific global ids
 *
 * @returns {{seenIds: *, globalIds: *, type: string}} redux action
 */
export const requestMarkAsUnseenBlog = ( { blogId, postIds, feedId, feedUrl, globalIds } ) => ( {
	type: READER_SEEN_MARK_AS_UNSEEN_BLOG_REQUEST,
	blogId,
	postIds,
	feedId,
	feedUrl,
	source: SOURCE_READER_WEB,
	globalIds,
} );
