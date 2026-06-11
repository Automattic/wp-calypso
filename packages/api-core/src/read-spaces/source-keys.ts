import type { SiteSubscriptionItem } from '../read-follows';
import type { SpaceSource } from './types';

export const normalizeReadSpaceSourceUrl = ( url?: string | null ): string =>
	( url ?? '' ).trim().toLowerCase().replace( /\/+$/, '' );

// Feed/blog IDs arrive as either numbers or numeric strings depending on the
// endpoint (see `read-follows`, which coerces with `Number()` for the same
// reason). Coerce here so a feed represented as `'456'` in one place and `456`
// in another produce the same key, and treat anything that isn't a real,
// positive ID as absent so it falls through to the URL.
const toSourceId = ( value: number | string | null | undefined ): number | null => {
	if ( value === null || typeof value === 'undefined' ) {
		return null;
	}
	const id = Number( value );
	return Number.isFinite( id ) && id > 0 ? id : null;
};

const buildReadSpaceSourceKey = (
	feed: number | string | null | undefined,
	blog: number | string | null | undefined,
	url: string | null | undefined
): string => {
	const feedId = toSourceId( feed );
	if ( feedId !== null ) {
		return `feed:${ feedId }`;
	}
	const blogId = toSourceId( blog );
	if ( blogId !== null ) {
		return `blog:${ blogId }`;
	}
	return `url:${ normalizeReadSpaceSourceUrl( url ) }`;
};

export const getReadSpaceSourceKey = (
	source: Pick< SpaceSource, 'feedId' | 'blogId' | 'feedUrl' >
): string => buildReadSpaceSourceKey( source.feedId, source.blogId, source.feedUrl );

export const getSiteSubscriptionSourceKey = (
	subscription: Pick< SiteSubscriptionItem, 'feed_ID' | 'blog_ID' | 'feed_URL' >
): string =>
	buildReadSpaceSourceKey( subscription.feed_ID, subscription.blog_ID, subscription.feed_URL );
