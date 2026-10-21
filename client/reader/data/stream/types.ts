import type { ReadPostKey } from '@automattic/api-core';

type ReadPostBlogId = Extract< ReadPostKey, { blogId: number } >[ 'blogId' ];
type ReadPostFeedId = Extract< ReadPostKey, { feedId: number } >[ 'feedId' ];

export interface StreamPostKey {
	blogId?: ReadPostBlogId | string;
	feedId?: ReadPostFeedId | string;
	postId?: ReadPostKey[ 'postId' ] | string;
}

export interface StreamItem extends StreamPostKey {
	feedItemId?: number | string;
	xPostMetadata?: StreamPostKey;
	[ key: string ]: unknown;
}

export interface PaddingStreamItem {
	isPadding: true;
	postId: string;
}

export type StreamListItem = StreamItem | PaddingStreamItem;

export const isPaddingStreamItem = ( item: StreamListItem ): item is PaddingStreamItem =>
	'isPadding' in item;
