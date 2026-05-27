// Splits the rendered HTML doc into per-page entries, each carrying
// the shared `<head>` so the page renders standalone. Tries known
// page selectors first, then `<!-- PAGE -->` markers, then a single
// page as a last resort.
//
// Body-level <script> tags (notably the inlined fit.js the wpcom
// marketing-collateral shell appends before </body>) are carried into
// each per-page document so the iframe preview runs the same content
// fitter Browserless does before snapshotting the PDF. Without this,
// the preview shows raw pre-fit HTML while the downloaded PDF shows
// post-fit output and the two diverge visibly.

const PAGE_SELECTORS = [ '.ela-page', '.collateral-page', '.b-page', '.page' ];

export interface SplitPage {
	head: string;
	body: string;
	bodyScripts: string;
}

const collectBodyScripts = ( doc: Document ): string =>
	Array.from( doc.body.querySelectorAll( 'script' ) )
		.map( ( el ) => el.outerHTML )
		.join( '\n' );

export const splitIntoPages = ( html: string ): SplitPage[] => {
	const doc = new DOMParser().parseFromString( html, 'text/html' );
	const head = doc.head.innerHTML;
	const bodyScripts = collectBodyScripts( doc );

	for ( const selector of PAGE_SELECTORS ) {
		const matches = doc.querySelectorAll< HTMLElement >( selector );
		if ( matches.length > 0 ) {
			return Array.from( matches ).map( ( el ) => ( {
				head,
				body: el.outerHTML,
				bodyScripts,
			} ) );
		}
	}

	const bodyHtml = doc.body.innerHTML;
	const segments = bodyHtml
		.split( /<!--\s*PAGE\s*-->/ )
		.map( ( segment ) => segment.trim() )
		.filter( Boolean );

	if ( segments.length > 1 ) {
		return segments.map( ( body ) => ( { head, body, bodyScripts } ) );
	}

	return [ { head, body: bodyHtml, bodyScripts } ];
};

export const wrapAsDocument = ( page: SplitPage ): string =>
	`<!doctype html><html><head>${ page.head }</head><body>${ page.body }${ page.bodyScripts }</body></html>`;
