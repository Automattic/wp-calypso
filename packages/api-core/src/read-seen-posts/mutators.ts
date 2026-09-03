import { wpcom } from '../wpcom-fetcher';
import type {
	ReadSeenPostsAllParams,
	ReadSeenPostsBlogParams,
	ReadSeenPostsFeedParams,
	ReadSeenPostsResponse,
} from './types';

function post( path: string, body: object ): Promise< ReadSeenPostsResponse > {
	return wpcom.req.post( {
		path,
		apiNamespace: 'wpcom/v2',
		body,
	} );
}

export const markReaderPostsAsSeen = ( {
	feedId,
	feedItemIds,
	source,
}: ReadSeenPostsFeedParams ): Promise< ReadSeenPostsResponse > =>
	post( '/seen-posts/seen/new', {
		feed_id: feedId,
		feed_item_ids: feedItemIds,
		source,
	} );

export const markReaderPostsAsUnseen = ( {
	feedId,
	feedItemIds,
	source,
}: ReadSeenPostsFeedParams ): Promise< ReadSeenPostsResponse > =>
	post( '/seen-posts/seen/delete', {
		feed_id: feedId,
		feed_item_ids: feedItemIds,
		source,
	} );

export const markReaderWpcomPostsAsSeen = ( {
	blogId,
	postIds,
	source,
}: ReadSeenPostsBlogParams ): Promise< ReadSeenPostsResponse > =>
	post( '/seen-posts/seen/blog/new', {
		blog_id: blogId,
		post_ids: postIds,
		source,
	} );

export const markReaderWpcomPostsAsUnseen = ( {
	blogId,
	postIds,
	source,
}: ReadSeenPostsBlogParams ): Promise< ReadSeenPostsResponse > =>
	post( '/seen-posts/seen/blog/delete', {
		blog_id: blogId,
		post_ids: postIds,
		source,
	} );

export const markAllReaderPostsAsSeen = ( {
	feedIds,
	source,
}: ReadSeenPostsAllParams ): Promise< ReadSeenPostsResponse > =>
	post( '/seen-posts/seen/all/new', {
		feed_ids: feedIds,
		source,
	} );
