import { __ } from '@wordpress/i18n';

export const SUPPORT_PAGE_PATTERN =
	/^https?:\/\/wordpress\.com\/((?<lang>[a-z]{2})\/)?support\/(?<slug>\S+)$/i;
const EMBED_CONTENT_MAXLENGTH = 400;
const AVERAGE_READING_SPEED = 250; // words per minute

export type SupportPageBlockAttributes = {
	url: string;
	title: string;
	content: string;
	minutesToRead: number | null;

	likes?: number;
};

export async function fetchPageAttributes( url: string ): Promise< SupportPageBlockAttributes > {
	const { blog, slug } = getSlugFromUrl( url );

	const apiUrl = `https://public-api.wordpress.com/rest/v1.1/sites/${ blog }/posts/slug:${ encodeURIComponent(
		slug
	) }`;
	const pageResponse = await fetch( apiUrl );

	if ( ! pageResponse.ok ) {
		throw new Error( __( 'Failed to load the page. Check URL', 'happy-blocks' ) );
	}

	const page = await pageResponse.json();

	const title = page.parent?.title ? `${ page.parent.title } » ${ page.title }` : page.title;

	let content = stripHtml( page.content );

	const words = content.trim().split( /\s+/ );
	const minutesToRead = words.length ? Math.ceil( words.length / AVERAGE_READING_SPEED ) : null;

	if ( content.length > EMBED_CONTENT_MAXLENGTH ) {
		content = content.substring( 0, EMBED_CONTENT_MAXLENGTH );
	}

	return { url, content: content, title, minutesToRead };
}

function stripHtml( html: string ): string {
	const doc = new DOMParser().parseFromString( html, 'text/html' );
	return doc.body.textContent || '';
}

function getSlugFromUrl( url: string ): { blog: string; slug: string } {
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
