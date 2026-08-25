import type { SiteSubscriptionItem } from '../read-follows';

export const normalizeReadShelfSourceUrl = ( url?: string | null ): string =>
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

const buildReadShelfSourceKey = (
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
	return `url:${ normalizeReadShelfSourceUrl( url ) }`;
};

// Loosely typed (not `Pick<ShelfSource>`): the real `ShelfSource.feedId` is now
// always a number, but this helper also keys partial/edge inputs (null/string
// ids), so it accepts the lenient shape `buildReadShelfSourceKey` already handles.
export const getReadShelfSourceKey = ( source: {
	feedId?: number | string | null;
	blogId?: number | string | null;
	feedUrl?: string | null;
} ): string => buildReadShelfSourceKey( source.feedId, source.blogId, source.feedUrl );

export const getSiteSubscriptionSourceKey = (
	subscription: Pick< SiteSubscriptionItem, 'feed_ID' | 'blog_ID' | 'feed_URL' >
): string =>
	buildReadShelfSourceKey( subscription.feed_ID, subscription.blog_ID, subscription.feed_URL );
