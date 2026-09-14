/* eslint-disable no-console */
import { loadGoogleFont } from '../services/googleFonts';
import type { BrandPack, BrandPackFont } from './types';

// Cache of pack-font URL → in-flight (or settled) registration. Keyed by the
// original asset URL so previewing the same pack twice doesn't re-register.
// The Promise is stored synchronously before any await, so concurrent callers
// for the same file (a pack that lists one font file under several roles)
// share one registration instead of each fetching the binary and appending a
// duplicate data-URL @font-face to <head>.
const localRegistered = new Map< string, Promise< string > >();

async function urlToDataUrl( url: string ): Promise< string > {
	const res = await fetch( url );
	if ( ! res.ok ) {
		throw new Error( `font fetch failed: ${ res.status }` );
	}
	const blob = await res.blob();
	return new Promise< string >( ( resolve, reject ) => {
		const reader = new FileReader();
		reader.onload = () => resolve( reader.result as string );
		reader.onerror = reject;
		reader.readAsDataURL( blob );
	} );
}

function registerLocalPackFont( font: BrandPackFont ): Promise< string > {
	const url = font.fileUrl as string;
	const cached = localRegistered.get( url );
	if ( cached ) {
		return cached;
	}
	// Store the Promise before awaiting anything so concurrent callers for the
	// same file dedupe onto it.
	const pending = registerLocalPackFontUncached( font, url );
	localRegistered.set( url, pending );
	// A failed registration shouldn't poison the cache for later retries.
	pending.catch( () => localRegistered.delete( url ) );
	return pending;
}

async function registerLocalPackFontUncached(
	font: BrandPackFont,
	url: string
): Promise< string > {
	const family = `pack-${ font.family.toLowerCase().replace( /\W+/g, '-' ) }-${ font.role }`;
	let src = url;
	try {
		src = await urlToDataUrl( url );
	} catch ( err ) {
		console.warn( `[loadFonts] inline failed for ${ url }; using direct URL`, err );
	}

	const style = document.createElement( 'style' );
	style.dataset.packFont = family;
	// Treat shipped single-face pack fonts as role fonts, not one exact CSS
	// weight. Ela's type ramp asks for 500/600/700 depending on block level;
	// registering a static face at only 800 made Knockout miss when CSS asked
	// for 700, falling through to the generic stack.
	style.textContent = `@font-face { font-family: "${ family }"; src: url("${ src }"); font-display: block; font-weight: 100 900; }`;
	document.head.appendChild( style );

	const face = new FontFace( family, `url(${ src })` );
	await face.load();
	document.fonts.add( face );
	await Promise.all( [
		document.fonts.load( `400 24px "${ family }"` ),
		document.fonts.load( `500 48px "${ family }"` ),
		document.fonts.load( `600 48px "${ family }"` ),
		document.fonts.load( `700 84px "${ family }"` ),
		document.fonts.load( `800 108px "${ family }"` ),
	] );
	return family;
}

// Resolve a CSS font-family value for a pack font, registering the local
// face if needed. Idempotent and cached.
async function resolvePackFont( font: BrandPackFont ): Promise< string > {
	if ( font.systemFamily ) {
		return font.systemFamily;
	}
	if ( font.googleFamily ) {
		await loadGoogleFont( font.googleFamily );
		return `"${ font.googleFamily }", system-ui, sans-serif`;
	}
	if ( font.fileUrl ) {
		const family = await registerLocalPackFont( font );
		return `"${ family }", system-ui, sans-serif`;
	}
	return 'system-ui, sans-serif';
}

// Resolve all of a pack's fonts and return a role → CSS font-family map.
export async function resolvePackFonts( pack: BrandPack ): Promise< Record< string, string > > {
	const entries = await Promise.all(
		pack.fonts.map( async ( f ) => [ f.role, await resolvePackFont( f ) ] as const )
	);
	return Object.fromEntries( entries );
}
