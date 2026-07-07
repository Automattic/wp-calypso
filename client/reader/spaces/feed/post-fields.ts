import { keyForPost, keyToString } from 'calypso/reader/post-key';
import { getPostUrl } from 'calypso/reader/route';
import type { ReadStreamPost } from '@automattic/api-core';
import type { Post } from 'calypso/reader/data/post/cache';

/**
 * Day buckets the standard list groups by. The layout maps these to translated
 * labels (the mapping can't live here — this is a plain, non-component helper).
 */
export type SpaceFeedDayGroup = 'today' | 'yesterday' | 'earlier' | 'older' | '';

/**
 * Display fields a card reads off its post. Cards feed the fully client-normalized
 * post from the cache (`useCachedPost`), so these are taken as-is: entity decoding,
 * the excerpt (`better_excerpt`) and the canonical image are already resolved by the
 * Reader post normalizer — re-doing them here would just duplicate that work.
 */
export interface SpaceFeedPostFields {
	title: string;
	/** Sanitized excerpt HTML (`post.better_excerpt`); render with `dangerouslySetInnerHTML`. */
	excerptHtml: string;
	sourceName: string;
	authorName?: string;
	imageUrl?: string;
	/** Blog/site icon URL (`post.site_icon.ico`); empty falls back to a globe. */
	siteIconUrl?: string;
	/** The blog's domain (host of `feed_URL`), e.g. `example.wordpress.com`. */
	siteDomain?: string;
	/** Raw ISO publish date, for a relative `<TimeSince>` (e.g. "6h ago"). */
	publishedDate?: string;
	/** Reader full-post page path, e.g. `/reader/feeds/:feed/posts/:post`. */
	postHref: string;
	isUnread: boolean;
}

const asString = ( value: unknown ): string | undefined =>
	typeof value === 'string' && value ? value : undefined;

const MS_PER_DAY = 86_400_000;

const startOfDay = ( date: Date ): number =>
	Date.UTC( date.getFullYear(), date.getMonth(), date.getDate() );

function dayGroupOf( dateIso?: string ): SpaceFeedDayGroup {
	if ( ! dateIso ) {
		return '';
	}
	const time = new Date( dateIso ).getTime();
	if ( Number.isNaN( time ) ) {
		return '';
	}
	const diffDays = Math.round(
		( startOfDay( new Date() ) - startOfDay( new Date( time ) ) ) / MS_PER_DAY
	);
	if ( diffDays <= 0 ) {
		return 'today';
	}
	if ( diffDays === 1 ) {
		return 'yesterday';
	}
	if ( diffDays < 7 ) {
		return 'earlier';
	}
	return 'older';
}

/** The day bucket a stream post falls into, for the standard list's date headers. */
export function getPostDayGroup( post: ReadStreamPost ): SpaceFeedDayGroup {
	return dayGroupOf( asString( post.date ) );
}

/** The blog's domain from `feed_URL` (fallback the post URL), `www.` stripped. */
function domainOf( post: Post ): string | undefined {
	const url = asString( post.feed_URL ) ?? asString( post.URL );
	if ( ! url ) {
		return undefined;
	}
	try {
		return new URL( url ).hostname.replace( /^www\./, '' );
	} catch {
		return undefined;
	}
}

function imageOf( post: Post ): string | undefined {
	// The normalizer already folds the featured image into `canonical_media` (and
	// drops non-image URLs), so this is the resolved image — no fallback needed.
	const media = post.canonical_media;
	if ( media && typeof media === 'object' ) {
		const { src, mediaType } = media as { src?: unknown; mediaType?: unknown };
		if ( typeof src === 'string' && src && ( mediaType === undefined || mediaType === 'image' ) ) {
			return src;
		}
	}
	return undefined;
}

function authorOf( post: Post ): string | undefined {
	const author = post.author;
	if ( author && typeof author === 'object' ) {
		return asString( ( author as { name?: unknown } ).name );
	}
	return undefined;
}

/** Stable identity key for a stream post — React keys and day-group boundaries. */
export function getPostFieldKey( post: ReadStreamPost ): string {
	return (
		keyToString( keyForPost( post ) ) ??
		asString( post.global_ID ) ??
		`post-${ post.site_ID ?? '' }-${ post.feed_ID ?? '' }-${ post.feed_item_ID ?? '' }-${ post.ID }`
	);
}

export function getPostFields( post: Post ): SpaceFeedPostFields {
	return {
		title: asString( post.title ) ?? asString( post.site_name ) ?? '',
		excerptHtml: asString( post.better_excerpt ) ?? '',
		sourceName: asString( post.site_name ) ?? '',
		authorName: authorOf( post ),
		imageUrl: imageOf( post ),
		siteIconUrl: asString( ( post.site_icon as { ico?: unknown } | undefined )?.ico ),
		siteDomain: domainOf( post ),
		publishedDate: asString( post.date ),
		postHref: getPostUrl( post ),
		isUnread: post.is_seen === false,
	};
}
