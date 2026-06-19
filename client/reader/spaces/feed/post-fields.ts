import { decodeEntities } from 'calypso/lib/formatting';
import { formatExcerpt } from 'calypso/lib/post-normalizer/rule-create-better-excerpt';
import { keyForPost, keyToString } from 'calypso/reader/post-key';
import { getPostUrl } from 'calypso/reader/route';
import type { ReadStreamPost } from '@automattic/api-core';

/**
 * Day buckets the standard list groups by. The layout maps these to translated
 * labels (the mapping can't live here — this is a plain, non-component helper).
 */
export type SpaceFeedDayGroup = 'today' | 'yesterday' | 'earlier' | 'older' | '';

/**
 * Display fields the layouts read off a real `ReadStreamPost` (from the existing
 * Reader stream query). Most arrive through the type's index signature as
 * `unknown`; narrow them here once so the layout components stay cast-free.
 */
export interface SpaceFeedPostFields {
	id: number;
	key: string;
	title: string;
	/**
	 * Sanitized excerpt HTML (Reader's `formatExcerpt` — same as PostLifecycle's
	 * `better_excerpt`). Render with `dangerouslySetInnerHTML`, not as text, so
	 * `<p>`/entities resolve instead of showing literally.
	 */
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
	dayGroup: SpaceFeedDayGroup;
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

/** The blog's domain from `feed_URL` (fallback the post URL), `www.` stripped. */
function domainOf( post: ReadStreamPost ): string | undefined {
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

function imageOf( post: ReadStreamPost ): string | undefined {
	const media = post.canonical_media;
	if ( media && typeof media === 'object' ) {
		const { src, mediaType } = media as { src?: unknown; mediaType?: unknown };
		if ( typeof src === 'string' && src && ( mediaType === undefined || mediaType === 'image' ) ) {
			return src;
		}
	}
	return asString( post.featured_image );
}

function authorOf( post: ReadStreamPost ): string | undefined {
	const author = post.author;
	if ( author && typeof author === 'object' ) {
		return asString( ( author as { name?: unknown } ).name );
	}
	return undefined;
}

export function getPostFieldKey( post: ReadStreamPost ): string {
	return (
		keyToString( keyForPost( post ) ) ??
		asString( post.global_ID ) ??
		`post-${ post.site_ID ?? '' }-${ post.feed_ID ?? '' }-${ post.feed_item_ID ?? '' }-${ post.ID }`
	);
}

export function getPostFields( post: ReadStreamPost ): SpaceFeedPostFields {
	const date = asString( post.date );
	const author = authorOf( post );
	return {
		id: post.ID,
		key: getPostFieldKey( post ),
		// Title, source and author render as plain text, so decode the HTML
		// entities the raw API title carries (e.g. `&nbsp;`, `&#039;`) — the legacy
		// card gets this for free from the normalized post. Titles are sometimes
		// double-encoded, so decode twice, mirroring the Reader post normalizer
		// (rule-decode-entities). The excerpt is rendered as HTML, so it doesn't
		// need this.
		title: decodeEntities(
			decodeEntities( asString( post.title ) ?? asString( post.site_name ) ?? '' )
		),
		excerptHtml: formatExcerpt( asString( post.excerpt ) ?? post.description ?? '' ),
		sourceName: decodeEntities( asString( post.site_name ) ?? '' ),
		authorName: author ? decodeEntities( author ) : undefined,
		imageUrl: imageOf( post ),
		siteIconUrl: asString( post.site_icon?.ico ),
		siteDomain: domainOf( post ),
		publishedDate: date,
		dayGroup: dayGroupOf( date ),
		postHref: getPostUrl( post ),
		isUnread: post.is_seen === false,
	};
}
