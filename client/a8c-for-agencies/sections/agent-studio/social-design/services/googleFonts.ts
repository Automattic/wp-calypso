/* eslint-disable no-console */
// Curated Google Fonts available from the form dropdown.
// Kept small to keep the picker useful. Add more as needed.

export type GoogleFont = {
	family: string;
	category: 'sans' | 'serif' | 'display' | 'condensed' | 'mono';
	weights: number[];
};

export const GOOGLE_FONTS: GoogleFont[] = [
	// Weights span what the Bea renderer asks for (body 400, headline/stat
	// 600) plus the 500/700/900 the capture stylesheet requests, so the
	// browser fit and the Browserless render resolve identical faces.
	{ family: 'Inter', category: 'sans', weights: [ 400, 500, 600, 700, 900 ] },
	{ family: 'Space Grotesk', category: 'sans', weights: [ 400, 500, 700 ] },
	{ family: 'Manrope', category: 'sans', weights: [ 400, 700, 800 ] },
	{ family: 'Archivo Black', category: 'display', weights: [ 400 ] },
	{ family: 'Anton', category: 'condensed', weights: [ 400 ] },
	{ family: 'Bebas Neue', category: 'condensed', weights: [ 400 ] },
	{ family: 'Oswald', category: 'condensed', weights: [ 400, 700 ] },
	{ family: 'Fraunces', category: 'serif', weights: [ 400, 700, 900 ] },
	{ family: 'Playfair Display', category: 'serif', weights: [ 400, 700, 900 ] },
	{ family: 'DM Serif Display', category: 'serif', weights: [ 400 ] },
	{ family: 'Crimson Pro', category: 'serif', weights: [ 400, 700 ] },
	{ family: 'Newsreader', category: 'serif', weights: [ 400, 600, 800 ] },
	{ family: 'Source Serif 4', category: 'serif', weights: [ 400, 600, 700 ] },
];

const loaded = new Set< string >();

export async function loadGoogleFont( family: string ): Promise< void > {
	if ( loaded.has( family ) ) {
		// Warm canvas font cache even if link is already there.
		await primeCanvasFont( family );
		return;
	}

	// Same-origin inlining via <style> with data-URL @font-face rules. The
	// live preview's canvas-based text fitting reads metrics off the inlined
	// face, and the inline path is also what some Chromium foreignObject
	// rasterization contexts need (see services/inlineGoogleFont.ts). If
	// inlining fails, fall back to a plain <link> so the live UI still shows
	// the right family.
	try {
		const { inlineGoogleFont } = await import( './inlineGoogleFont' );
		await inlineGoogleFont( family );
	} catch ( err ) {
		console.warn( `[loadGoogleFont] inline failed for ${ family }, falling back to <link>`, err );
		const meta = GOOGLE_FONTS.find( ( f ) => f.family === family );
		const weights = ( meta?.weights ?? [ 400, 700 ] ).join( ';' );
		const url = `https://fonts.googleapis.com/css2?family=${ encodeURIComponent( family ).replace(
			/%20/g,
			'+'
		) }:wght@${ weights }&display=swap`;
		const existing = document.querySelector< HTMLLinkElement >( `link[data-gfont="${ family }"]` );
		if ( ! existing ) {
			const link = document.createElement( 'link' );
			link.rel = 'stylesheet';
			link.href = url;
			link.dataset.gfont = family;
			document.head.appendChild( link );
			await new Promise< void >( ( resolve ) => {
				link.onload = () => resolve();
				link.onerror = () => resolve();
				setTimeout( resolve, 4000 );
			} );
		}
	}

	await primeCanvasFont( family );
	loaded.add( family );
}

async function primeCanvasFont( family: string ) {
	// Canvas only uses a font once document.fonts.load() has resolved for each
	// weight/size pair we'll draw with.
	try {
		await Promise.all( [
			document.fonts.load( `400 24px "${ family }"` ),
			document.fonts.load( `500 24px "${ family }"` ),
			document.fonts.load( `600 24px "${ family }"` ),
			document.fonts.load( `700 24px "${ family }"` ),
			document.fonts.load( `400 60px "${ family }"` ),
			// The stat-hero fitter measures at the headline weight (600) via
			// canvas measureText; without priming that weight the canvas falls
			// back to a generic face and the measured width is wrong.
			document.fonts.load( `600 84px "${ family }"` ),
			document.fonts.load( `700 84px "${ family }"` ),
			document.fonts.load( `400 108px "${ family }"` ),
			document.fonts.load( `700 120px "${ family }"` ),
		] );
	} catch {
		/* non-fatal */
	}
}
