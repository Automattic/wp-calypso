import { type ReaderPost } from './types';

type PostTracksProperties = {
	blog_id?: number;
	post_id?: number;
	feed_id?: number;
	feed_item_id?: number;
	is_jetpack?: boolean;
};

export function getTracksPropertiesForPost( post: ReaderPost ): PostTracksProperties {
	if ( ! post ) {
		return {
			is_jetpack: false,
		};
	}
	return {
		blog_id: ! post.is_external && post.site_ID > 0 ? post.site_ID : undefined,
		post_id: ! post.is_external && post.ID > 0 ? post.ID : undefined,
		feed_id: post.feed_ID > 0 ? post.feed_ID : undefined,
		feed_item_id: post.feed_item_ID > 0 ? post.feed_item_ID : undefined,
		is_jetpack: post.is_jetpack,
	};
}
