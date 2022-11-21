import { __ } from '@wordpress/i18n';

export const SUPPORT_PAGE_PATTERN =
	/^https?:\/\/wordpress\.com\/((?<lang>[a-z]{2})\/)?support\/(?<slug>\S+)$/i;
export const FORUM_TOPIC_PATTERN =
	/^https?:\/\/wordpress\.com\/((?<lang>[a-z]{2})\/)?forums\/topic\/(?<slug>\S+)$/i;
const EMBED_CONTENT_MAXLENGTH = 400;
const AVERAGE_READING_SPEED = 250; // words per minute

/** Attributes of the Block */
export type SupportContentBlockAttributes = {
	url: string;
	title: string;
	content: string;
	source: string;
	minutesToRead?: number | null;
	likes?: number;
	status?: string;
	author?: number;
	created?: string;
};

/**
 * Fetch the support page via API and parse its data into block attributes
 */
export async function fetchSupportPageAttributes(
	url: string
): Promise< SupportContentBlockAttributes > {
	const { blog, slug } = getSupportPageSlugFromUrl( url );

	const apiUrl = `https://public-api.wordpress.com/rest/v1.1/sites/${ blog }/posts/slug:${ encodeURIComponent(
		slug
	) }`;
	const response = await fetch( apiUrl );

	if ( ! response.ok ) {
		throw new Error( __( 'Failed to load the page. Check URL', 'happy-blocks' ) );
	}

	const page = await response.json();

	const title = page.parent?.title ? `${ page.parent.title } » ${ page.title }` : page.title;

	let content = stripHtml( page.content );

	const words = content.trim().split( /\s+/ );
	const minutesToRead = words.length ? Math.ceil( words.length / AVERAGE_READING_SPEED ) : null;

	if ( content.length > EMBED_CONTENT_MAXLENGTH ) {
		content = content.substring( 0, EMBED_CONTENT_MAXLENGTH );
	}

	return { url, content, title, source: 'WordPress.com Guide', minutesToRead };
}

/**
 * Fetch forum topic via API and parse its data into block attributes
 */
export async function fetchForumTopicAttributes(
	url: string
): Promise< SupportContentBlockAttributes > {
	const { blog, slug } = getForumTopicSlugFromUrl( url );

	const apiUrl = `https://public-api.wordpress.com/wp/v2/sites/${ blog }/topic?slug=${ encodeURIComponent(
		slug
	) }`;
	const response = await fetch( apiUrl );

	if ( ! response.ok ) {
		throw new Error( __( 'Failed to load the page. Check URL', 'happy-blocks' ) );
	}

	const topic = ( await response.json() )[ 0 ];

	const title = stripHtml( topic.title.rendered );

	let content = stripHtml( topic.content.rendered );

	if ( content.length > EMBED_CONTENT_MAXLENGTH ) {
		content = content.substring( 0, EMBED_CONTENT_MAXLENGTH );
	}

	return {
		url,
		content,
		title,
		source: 'WordPress.com Forums',
		status: topic.status,
		created: topic.date,
	};
}

/**
 * Get WP blog & slug from the support page URL
 */
function getSupportPageSlugFromUrl( url: string ): { blog: string; slug: string } {
	const urlMatches = url.match( SUPPORT_PAGE_PATTERN );
	const lang = urlMatches?.groups?.lang ?? 'en';
	let slug = urlMatches?.groups?.slug ?? '';

	if ( slug.endsWith( '/' ) ) {
		slug = slug.slice( 0, -1 );
	}

	return {
		blog: `${ lang }.support.wordpress.com`,
		slug,
	};
}

/**
 * Get WP blog & slug from the forum topic URL
 */
function getForumTopicSlugFromUrl( url: string ): { blog: string; slug: string } {
	const urlMatches = url.match( FORUM_TOPIC_PATTERN );
	const lang = urlMatches?.groups?.lang ?? 'en';
	let slug = urlMatches?.groups?.slug ?? '';

	if ( slug.indexOf( '/' ) >= 0 ) {
		slug = slug.slice( 0, slug.indexOf( '/' ) );
	}

	return {
		blog: `${ lang }.forums.wordpress.com`,
		slug,
	};
}

function stripHtml( html: string ): string {
	const doc = new DOMParser().parseFromString( html, 'text/html' );
	return doc.body.textContent || '';
}
