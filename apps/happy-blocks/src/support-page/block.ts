export const SUPPORT_PAGE_PATTERN = /^http[s]?:\/\/(?:www\.)?wordpress\.com(?:.*)?/i;
const EMBED_CONTENT_MAXLENGTH = 400;

export type SupportPageBlockAttributes = {
	url: string;
	title: string;
	content: string;

	timeToRead?: string;
	likes?: number;
};

export async function fetchPageAttributes( url: string ): Promise< SupportPageBlockAttributes > {
	// http://en.support.wordpress.com/domains/change-a-domain/
	const blog = 'en.support.wordpress.com';
	const slug = 'domains/change-a-domain';

	const apiUrl = `https://public-api.wordpress.com/rest/v1.1/sites/${ blog }/posts/slug:${ encodeURIComponent(
		slug
	) }`;
	const pageResponse = await fetch( apiUrl );

	if ( ! pageResponse.ok ) {
		throw new Error( 'Failed to load the page. Check URL' );
	}

	const page = await pageResponse.json();

	const title = page.parent?.title ? `${ page.parent.title } » ${ page.title }` : page.title;

	let content = stripHtml( page.content );
	if ( content.length > EMBED_CONTENT_MAXLENGTH ) {
		content = content.substring( 0, EMBED_CONTENT_MAXLENGTH );
	}

	return { url, content: content, title };
}

function stripHtml( html: string ): string {
	const doc = new DOMParser().parseFromString( html, 'text/html' );
	return doc.body.textContent || '';
}
