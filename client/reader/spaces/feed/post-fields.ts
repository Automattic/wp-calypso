import { formatExcerpt } from 'calypso/lib/post-normalizer/rule-create-better-excerpt';
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
	timeLabel?: string;
	dayGroup: SpaceFeedDayGroup;
	/** Reader full-post page path, e.g. `/reader/feeds/:feed/posts/:post`. */
	postHref: string;
	isUnread: boolean;
}

const asString = ( value: unknown ): string | undefined =>
	typeof value === 'string' && value ? value : undefined;

const MS_PER_DAY = 86_400_000;

const startOfDay = ( date: Date ): number =>
	new Date( date.getFullYear(), date.getMonth(), date.getDate() ).getTime();

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

function timeLabelOf( dateIso?: string ): string | undefined {
	if ( ! dateIso ) {
		return undefined;
	}
	const date = new Date( dateIso );
	if ( Number.isNaN( date.getTime() ) ) {
		return undefined;
	}
	const hours = String( date.getHours() ).padStart( 2, '0' );
	const minutes = String( date.getMinutes() ).padStart( 2, '0' );
	return `${ hours }:${ minutes }`;
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

export function getPostFields( post: ReadStreamPost ): SpaceFeedPostFields {
	const date = asString( post.date );
	return {
		id: post.ID,
		title: asString( post.title ) ?? asString( post.site_name ) ?? '',
		excerptHtml: formatExcerpt( asString( post.excerpt ) ?? post.description ?? '' ),
		sourceName: asString( post.site_name ) ?? '',
		authorName: authorOf( post ),
		imageUrl: imageOf( post ),
		siteIconUrl: asString( post.site_icon?.ico ),
		timeLabel: timeLabelOf( date ),
		dayGroup: dayGroupOf( date ),
		postHref: getPostUrl( post ),
		isUnread: post.is_seen === false,
	};
}
