/**
 * Extract the inlined `applyA4aFit` script from a wpcom-rendered deck
 * HTML and execute it in the OUTER document. Idempotent: if a previous
 * call already loaded the script (or another tab session has), short-
 * circuits.
 *
 * The collateral shell (`Marketing_Collateral_Shell::wrap_html`) appends
 * `fit.js` inside `<script>…</script>` before `</body>` so Browserless
 * runs the fitter before snapshotting the PDF. In the in-app preview,
 * we want the same fitter to run inside each shadow root we build.
 * `shadow.innerHTML = …` does not execute injected script tags, so
 * the script body has to be re-attached via `createElement('script')`
 * in the outer document — that path executes and exposes
 * `window.applyA4aFit`, which `ShadowPage` then calls per shadow root.
 *
 * Returns `true` if the global is available after the call.
 */
declare global {
	interface Window {
		applyA4aFit?: ( root: Document | ShadowRoot ) => Promise< void >;
	}
}

export function loadFitScriptFromDeck( deckHtml: string ): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}
	if ( window.applyA4aFit ) {
		return true;
	}
	const parsed = new DOMParser().parseFromString( deckHtml, 'text/html' );
	const inline = Array.from( parsed.body.querySelectorAll( 'script' ) ).find(
		( s ) => ! s.src && /applyA4aFit/.test( s.textContent ?? '' )
	);
	if ( ! inline?.textContent ) {
		return false;
	}
	const exec = document.createElement( 'script' );
	exec.setAttribute( 'data-a4a-fit', '1' );
	exec.textContent = inline.textContent;
	document.head.appendChild( exec );
	return !! window.applyA4aFit;
}
