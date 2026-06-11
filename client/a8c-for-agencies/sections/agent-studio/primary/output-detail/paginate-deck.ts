// Fit the WHOLE deck once, then return the resulting pages.
//
// The deck's inlined `fit.js` reflows any section that overflows its grid
// cell onto a continuation `.ela-page` — but only when it can see the whole
// deck (it inserts a new page and renumbers footers across all pages). The
// preview otherwise splits the deck into one card per page *before* fitting
// (`splitIntoPages`), so a continuation inserted at fit-time lands inside a
// fixed-height card host and is clipped, and per-card footer renumbering
// can't see global order.
//
// This mirrors the Browserless/PDF path: mount the whole deck off-screen,
// run the fitter once, and read back the final page set (originals +
// continuations, footers already renumbered). The caller then splits that
// final set into per-card srcDocs exactly as before, so each continuation
// becomes its own card and the preview matches the PDF.
//
// Falls back to a plain `splitIntoPages` when the DOM/fitter isn't available
// (SSR, fitter failed to load) so the preview still renders.

import { rewriteRootSelectors, hoistFontFaces } from './pdf-viewer';
import { splitIntoPages, type SplitPage } from './split-pages';

export async function paginateDeck( html: string ): Promise< SplitPage[] > {
	if ( typeof window === 'undefined' || ! html ) {
		return splitIntoPages( html );
	}

	const doc = new DOMParser().parseFromString( html, 'text/html' );
	const head = doc.head.innerHTML;

	// Inline `<body>`-level scripts (the deck's fit.js) — snapshot, then strip
	// so they don't get serialized back into every per-card srcDoc twice.
	const bodyScripts = Array.from( doc.body.children )
		.filter( ( c ): c is HTMLScriptElement => c.tagName === 'SCRIPT' )
		.map( ( s ) => s.textContent ?? '' )
		.filter( Boolean );
	doc.body.querySelectorAll( 'script' ).forEach( ( s ) => s.remove() );

	// Same style handling as the per-card preview: rewrite root selectors to
	// `:host` and hoist `@font-face` to the document so text measures with the
	// real fonts (fit.js waits on `document.fonts`).
	const styleMarkup = Array.from(
		doc.head.querySelectorAll< HTMLElement >( 'style, link[rel="stylesheet"]' )
	)
		.map( ( node ) =>
			node.tagName === 'STYLE'
				? `<style>${ rewriteRootSelectors( hoistFontFaces( node.textContent ?? '' ) ) }</style>`
				: node.outerHTML
		)
		.join( '' );

	// Off-screen host holding the WHOLE deck (all pages stacked, unclipped) so
	// the fitter can measure every page. Each `.ela-page` carries its own fixed
	// 816×1056 size from the deck CSS, so an `auto`-height host doesn't distort
	// measurement.
	const host = document.createElement( 'div' );
	host.style.cssText =
		'position:fixed;left:-99999px;top:0;width:816px;height:auto;opacity:0;pointer-events:none;z-index:-1;';
	document.body.appendChild( host );
	const shadow = host.attachShadow( { mode: 'open' } );
	shadow.innerHTML = '<style>:host{display:block;width:816px;}</style>' + styleMarkup + doc.body.innerHTML;

	// Load the fitter once per tab (same marker the per-card viewer uses), then
	// run it on the whole deck.
	if ( ! window.applyA4aFit ) {
		const fitter = bodyScripts.find( ( s ) => s.includes( 'applyA4aFit' ) );
		if ( fitter ) {
			const el = document.createElement( 'script' );
			el.textContent = fitter;
			document.head.appendChild( el );
		}
	}

	try {
		if ( window.applyA4aFit ) {
			await window.applyA4aFit( shadow );
		}
	} catch {
		// Fitter threw — fall through and read whatever pages exist.
	}

	const pages = Array.from( shadow.querySelectorAll< HTMLElement >( '.ela-page' ) ).map(
		( page ) => ( { head, body: page.outerHTML, bodyScripts } )
	);
	host.remove();

	return pages.length > 0 ? pages : splitIntoPages( html );
}
