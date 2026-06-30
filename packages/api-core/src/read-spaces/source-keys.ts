import type { SiteSubscriptionItem } from '../read-follows';

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

// Loosely typed (not `Pick<SpaceSource>`): the real `SpaceSource.feedId` is now
// always a number, but this helper also keys partial/edge inputs (null/string
// ids), so it accepts the lenient shape `buildReadSpaceSourceKey` already handles.
export const getReadSpaceSourceKey = ( source: {
	feedId?: number | string | null;
	blogId?: number | string | null;
	feedUrl?: string | null;
} ): string => buildReadSpaceSourceKey( source.feedId, source.blogId, source.feedUrl );

export const getSiteSubscriptionSourceKey = (
	subscription: Pick< SiteSubscriptionItem, 'feed_ID' | 'blog_ID' | 'feed_URL' >
): string =>
	buildReadSpaceSourceKey( subscription.feed_ID, subscription.blog_ID, subscription.feed_URL );
