/* eslint-disable no-console */
// Inlines a Google Font as a same-origin <style> tag containing @font-face
// rules with data-URL src values. We fetch the Google Fonts CSS, parse out the
// woff2 URLs, fetch each file, base64-encode, and rewrite the CSS to use
// data: URIs. Then inject as a same-origin <style> in document head.
//
// Same-origin inlining keeps the live preview's canvas-based text fitting
// honest: `canvas.measureText` (and the binary-search font sizing it feeds)
// resolves the same family the on-screen DOM does. Some Chromium
// foreignObject rasterization contexts also fail to honor fonts registered
// via cross-origin <link rel="stylesheet">, and the inline path sidesteps
// that.

import { GOOGLE_FONTS } from './googleFonts';

const inlined = new Set< string >();
const inflight = new Map< string, Promise< void > >();

export function inlineGoogleFont( family: string ): Promise< void > {
	if ( inlined.has( family ) ) {
		return Promise.resolve();
	}
	const existing = inflight.get( family );
	if ( existing ) {
		return existing;
	}

	const job = ( async () => {
		const meta = GOOGLE_FONTS.find( ( f ) => f.family === family );
		const weights = ( meta?.weights ?? [ 400, 700 ] ).join( ';' );
		const cssUrl = `https://fonts.googleapis.com/css2?family=${ encodeURIComponent(
			family
		).replace( /%20/g, '+' ) }:wght@${ weights }&display=swap`;

		let cssText: string;
		try {
			const res = await fetch( cssUrl );
			if ( ! res.ok ) {
				throw new Error( `CSS fetch failed with ${ res.status }` );
			}
			cssText = await res.text();
		} catch ( err ) {
			console.warn( `[inlineGoogleFont] CSS fetch failed for ${ family }`, err );
			throw err;
		}

		const urlPattern = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g;
		const matches = Array.from( cssText.matchAll( urlPattern ) );
		if ( matches.length === 0 ) {
			throw new Error( `[inlineGoogleFont] no woff2 URLs found for ${ family }` );
		}

		const replacements = await Promise.all(
			matches.map( async ( m ) => {
				const url = m[ 1 ];
				try {
					const res = await fetch( url );
					const blob = await res.blob();
					const dataUrl: string = await new Promise( ( resolve, reject ) => {
						const reader = new FileReader();
						reader.onload = () => resolve( reader.result as string );
						reader.onerror = reject;
						reader.readAsDataURL( blob );
					} );
					return [ url, dataUrl ] as const;
				} catch ( err ) {
					console.warn( `[inlineGoogleFont] failed to fetch ${ url }`, err );
					return [ url, url ] as const;
				}
			} )
		);

		let inlinedCss = cssText;
		for ( const [ original, replacement ] of replacements ) {
			inlinedCss = inlinedCss.split( original ).join( replacement );
		}

		const style = document.createElement( 'style' );
		style.dataset.inlinedFont = family;
		style.textContent = inlinedCss;
		document.head.appendChild( style );

		if ( document.fonts && document.fonts.ready ) {
			try {
				await document.fonts.ready;
			} catch {
				/* non-fatal */
			}
		}

		inlined.add( family );
	} )();

	inflight.set( family, job );
	job.finally( () => inflight.delete( family ) );
	return job;
}
