// Splits the rendered HTML doc into per-page entries, each carrying
// the shared `<head>` so the page renders standalone. Tries known
// page selectors first, then `<!-- PAGE -->` markers, then a single
// page as a last resort.

const PAGE_SELECTORS = [ '.ela-page', '.collateral-page', '.b-page', '.page' ];

export interface SplitPage {
	head: string;
	body: string;
}

export const splitIntoPages = ( html: string ): SplitPage[] => {
	const doc = new DOMParser().parseFromString( html, 'text/html' );
	const head = doc.head.innerHTML;

	for ( const selector of PAGE_SELECTORS ) {
		const matches = doc.querySelectorAll< HTMLElement >( selector );
		if ( matches.length > 0 ) {
			return Array.from( matches ).map( ( el ) => ( { head, body: el.outerHTML } ) );
		}
	}

	const bodyHtml = doc.body.innerHTML;
	const segments = bodyHtml
		.split( /<!--\s*PAGE\s*-->/ )
		.map( ( segment ) => segment.trim() )
		.filter( Boolean );

	if ( segments.length > 1 ) {
		return segments.map( ( body ) => ( { head, body } ) );
	}

	return [ { head, body: bodyHtml } ];
};

export const wrapAsDocument = ( page: SplitPage ): string =>
	`<!doctype html><html><head>${ page.head }</head><body>${ page.body }</body></html>`;
