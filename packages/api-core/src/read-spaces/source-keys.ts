import type { SiteSubscriptionItem } from '../read-follows';
import type { SpaceSource } from './types';

export const normalizeReadSpaceSourceUrl = ( url?: string | null ): string =>
	( url ?? '' ).trim().toLowerCase().replace( /\/+$/, '' );

export const getReadSpaceSourceKey = (
	source: Pick< SpaceSource, 'feedId' | 'blogId' | 'feedUrl' >
): string => {
	if ( source.feedId !== null && typeof source.feedId !== 'undefined' ) {
		return `feed:${ source.feedId }`;
	}
	if ( source.blogId !== null && typeof source.blogId !== 'undefined' ) {
		return `blog:${ source.blogId }`;
	}
	return `url:${ normalizeReadSpaceSourceUrl( source.feedUrl ) }`;
};

export const getSiteSubscriptionSourceKey = (
	subscription: Pick< SiteSubscriptionItem, 'feed_ID' | 'blog_ID' | 'feed_URL' >
): string => {
	if ( subscription.feed_ID !== null && typeof subscription.feed_ID !== 'undefined' ) {
		return `feed:${ subscription.feed_ID }`;
	}
	if ( subscription.blog_ID !== null && typeof subscription.blog_ID !== 'undefined' ) {
		return `blog:${ subscription.blog_ID }`;
	}
	return `url:${ normalizeReadSpaceSourceUrl( subscription.feed_URL ) }`;
};
