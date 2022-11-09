export const SUPPORT_PAGE_PATTERN = /^http[s]?:\/\/(?:www\.)?wordpress\.com(?:.*)?/i;

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

	return { url, content: stripHtml( page.content ), title };
}

function stripHtml( html: string ): string {
	const doc = new DOMParser().parseFromString( html, 'text/html' );
	return doc.body.textContent || '';
}
