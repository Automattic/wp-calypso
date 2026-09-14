// Splits the rendered HTML doc into per-page entries, each carrying
// the shared `<head>` so the page renders standalone. Tries known
// page selectors first, then `<!-- PAGE -->` markers, then a single
// page as a last resort. Body-level `<script>` tags (the deck's
// inlined fit.js sits as a `</body>` sibling, not inside any page
// container) are pulled out and re-emitted on every per-page srcDoc
// so each page can run the fitter.

const PAGE_SELECTORS = [ '.ela-page', '.collateral-page', '.b-page', '.page' ];

export interface SplitPage {
	head: string;
	body: string;
	bodyScripts: string[];
}

export const splitIntoPages = ( html: string ): SplitPage[] => {
	const doc = new DOMParser().parseFromString( html, 'text/html' );
	const head = doc.head.innerHTML;

	// Inline `<script>` children of `<body>` (e.g. the deck's fit.js).
	// Snapshot before any serialization, then strip from the parsed
	// doc so the fallback `doc.body.innerHTML` path doesn't double them.
	const bodyScripts = Array.from( doc.body.children )
		.filter( ( c ): c is HTMLScriptElement => c.tagName === 'SCRIPT' )
		.map( ( s ) => s.textContent ?? '' )
		.filter( Boolean );
	Array.from( doc.body.children )
		.filter( ( c ) => c.tagName === 'SCRIPT' )
		.forEach( ( s ) => s.remove() );

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

export const wrapAsDocument = ( page: SplitPage ): string => {
	const scripts = page.bodyScripts.map( ( s ) => `<script>${ s }</script>` ).join( '' );
	return `<!doctype html><html><head>${ page.head }</head><body>${ page.body }${ scripts }</body></html>`;
};
