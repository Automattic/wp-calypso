import { formatExcerpt } from 'calypso/lib/post-normalizer/rule-create-better-excerpt';
import { keyForPost, keyToString } from 'calypso/reader/post-key';
import { getPostUrl } from 'calypso/reader/route';
import type { ReadPost, ReadStreamPost } from '@automattic/api-core';

/**
 * The card's input: a client-normalized post from the cache (`useCachedPost` returns
 * `Post`, which is assignable to this). Typed as `Partial<ReadPost>` so the display
 * fields read as their real types rather than `unknown`.
 */
type NormalizedPost = Partial< ReadPost >;

/**
 * Day buckets the standard list groups by. The layout maps these to translated
 * labels (the mapping can't live here — this is a plain, non-component helper).
 */
export type SpaceFeedDayGroup = 'today' | 'yesterday' | 'earlier' | 'older' | '';

/**
 * Display fields a card reads off its post. Cards feed the fully client-normalized
 * post from the cache (`useCachedPost`), so most fields are taken as-is: entity
 * decoding and the canonical image are already resolved by the Reader post
 * normalizer — re-doing them here would just duplicate that work.
 */
export interface SpaceFeedPostFields {
	title: string;
	/** Sanitized excerpt HTML from the API excerpt; render with `dangerouslySetInnerHTML`. */
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
	return dayGroupOf( post.date );
}

/** The blog's domain from `feed_URL` (fallback the post URL), `www.` stripped. */
function domainOf( post: NormalizedPost ): string | undefined {
	const url = post.feed_URL || post.URL;
	if ( ! url ) {
		return undefined;
	}
	try {
		return new URL( url ).hostname.replace( /^www\./, '' );
	} catch {
		return undefined;
	}
}

function imageOf( post: NormalizedPost ): string | undefined {
	// The normalizer already folds the featured image into `canonical_media` (and
	// drops non-image URLs), so this is the resolved image — no fallback needed.
	const media = post.canonical_media;
	if ( media?.src && ( media.mediaType === undefined || media.mediaType === 'image' ) ) {
		return media.src;
	}
	return undefined;
}

/** Stable identity key for a stream post — React keys and day-group boundaries. */
export function getPostFieldKey( post: ReadStreamPost ): string {
	return (
		keyToString( keyForPost( post ) ) ??
		post.global_ID ??
		`post-${ post.site_ID ?? '' }-${ post.feed_ID ?? '' }-${ post.feed_item_ID ?? '' }-${ post.ID }`
	);
}

export function getPostFields( post: NormalizedPost ): SpaceFeedPostFields {
	return {
		title: post.title || post.site_name || '',
		// The API excerpt (a short summary), sanitized to p/br/sup/sub. Not
		// `better_excerpt` — that's built from the post content (first paragraphs) and
		// runs much longer, closer to the whole post.
		excerptHtml: formatExcerpt( post.excerpt || post.description || '' ),
		sourceName: post.site_name ?? '',
		authorName: post.author?.name,
		imageUrl: imageOf( post ),
		siteIconUrl: post.site_icon?.ico,
		siteDomain: domainOf( post ),
		publishedDate: post.date,
		postHref: getPostUrl( post ),
		isUnread: post.is_seen === false,
	};
}
