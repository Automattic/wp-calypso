import { Railcar } from '@automattic/calypso-analytics';
import { Reader } from '@automattic/data-stores';

export type WpcomFeedItem = {
	blog_ID: string;
} & Reader.FeedItem;

export const isWpcomFeedItem = ( item: Reader.FeedItem ): item is WpcomFeedItem => {
	return Reader.isValidId( item.blog_ID );
};

export type NonWpcomFeedItem = {
	subscribe_URL: string;
	feed_ID?: string;
	railcar?: Railcar | undefined;
	meta: {
		links?: {
			feed?: string;
		};
	};
};

export const isNonWpcomFeedItem = ( item: Reader.FeedItem ): item is NonWpcomFeedItem => {
	return ! Reader.isValidId( item.blog_ID ) && item.subscribe_URL !== undefined;
};
