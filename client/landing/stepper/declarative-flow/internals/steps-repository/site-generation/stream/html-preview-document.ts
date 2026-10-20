import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

export const MAX_PREVIEW_HTML_BYTES = 262144;

export type PreviewAsset = { id: string; mime_type: string; url: string };
export type PreviewAssets = Record< string, PreviewAsset >;
export const IMAGE_MIMES = [ 'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif' ];
export const FONT_MIMES = [ 'font/woff2', 'font/woff' ];

/**
 * Keeps the assets a preview document may load. They must be served by the same
 * feed as the document: the snapshot URL names the host and the site path, and
 * the asset endpoint is its sibling. That URL was already vetted when the feed
 * was accepted (https, or loopback http on the page's own host), so this adds no
 * new origin to trust. For WordPress.com it is the one host and path used before.
 */
export function parsePreviewAssets( value: unknown, snapshotUrl: string ): PreviewAssets {
	const assets: PreviewAssets = {};
	if ( ! value || typeof value !== 'object' || Array.isArray( value ) ) {
		return assets;
	}
	let feed: URL;
	try {
		feed = new URL( snapshotUrl );
	} catch {
		return assets;
	}
	if ( ! /\/snapshot$/.test( feed.pathname ) ) {
		return assets;
	}
	for ( const [ source, asset ] of Object.entries( value ).slice( 0, 96 ) ) {
		if ( ! asset || typeof asset !== 'object' ) {
			continue;
		}
		const { id, mime_type: mime, url } = asset;
		if (
			typeof id !== 'string' ||
			! /^[a-f0-9]{64}$/.test( id ) ||
			typeof mime !== 'string' ||
			! [ ...IMAGE_MIMES, ...FONT_MIMES ].includes( mime ) ||
			typeof url !== 'string' ||
			url.length > 8192 ||
			! /^\/wp-content\/themes\/[^/]+\/assets\//.test( source )
		) {
			continue;
		}
		try {
			const parsed = new URL( url );
			if (
				parsed.origin !== feed.origin ||
				parsed.username ||
				parsed.password ||
				parsed.hash ||
				parsed.pathname !==
					feed.pathname.replace( /\/snapshot$/, `/preview-assets/${ id }/content` ) ||
				! /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(
					parsed.searchParams.get( 'token' ) ?? ''
				) ||
				Array.from( parsed.searchParams ).length !== 1
			) {
				continue;
			}
			assets[ source ] = { id, mime_type: mime, url: parsed.href };
		} catch {
			// Malformed references are omitted; HTML remains available.
		}
	}
	return assets;
}

function assetSources( assets: PreviewAssets, mimes: string[] ): string {
	const sources = Object.values( assets )
		.filter( ( asset ) => mimes.includes( asset.mime_type ) )
		.map( ( asset ) => {
			const url = new URL( asset.url );
			return url.origin + url.pathname;
		} );
	return Array.from( new Set( sources ) ).join( ' ' ) || "'none'";
}

function rewriteCssAssets(
	css: string,
	assets: PreviewAssets,
	preserveImageSlots = false
): string {
	// The engine emits ordinary url(...) references. CSP also blocks unrecognized URL syntax.
	return css.replace(
		/url\(\s*(?:"([^"\n]*)"|'([^'\n]*)'|([^\s)'";]+))\s*\)/gi,
		( _match, doubleQuoted, singleQuoted, unquoted ) => {
			const source = doubleQuoted ?? singleQuoted ?? unquoted;
			const asset = assets[ source ];
			if ( asset ) {
				return `url("${ asset.url }")`;
			}
			return preserveImageSlots && source && ! /\.(?:woff2?|ttf|otf|eot)(?:[?#]|$)/i.test( source )
				? 'url("preview-pending:image")'
				: 'url("")';
		}
	);
}

// Generated markup is untrusted. The boundary is the frame: its sandbox and CSP
// allow no script, network or popups, and the inert body stops clicks and keys
// from navigating it. DOMPurify is a second layer that keeps forms, buttons,
// links and inline SVG as authored; the drops below remove what would change
// how the page renders or fight the asset rewriting.
const SANITIZER_CONFIG: Config = {
	WHOLE_DOCUMENT: true,
	USE_PROFILES: { html: true, svg: true, svgFilters: true },
	// DOMPurify disallows <use> by default; same-document references are put back
	// below, and any other reference is removed.
	ADD_TAGS: [ 'style', 'use' ],
	FORBID_TAGS: [ 'base', 'meta', 'link', 'script', 'iframe', 'object', 'embed', 'source', 'audio' ],
	FORBID_ATTR: [
		'srcset',
		'action',
		'formaction',
		'ping',
		'background',
		'poster',
		'nonce',
		'is',
		'autofocus',
	],
};
const DROPPED_ELEMENTS = 'script, meta, base, link, noscript, template, iframe, object, embed';
const DROPPED_ATTRIBUTES = [ 'nonce', 'srcset', 'sizes' ];
// SVG elements that fetch what their href names. Only a fragment of the same
// document may stay; DOMPurify lets other https references through.
const SVG_REFERENCE_ELEMENTS = [ 'image', 'use', 'feimage' ];
const SVG_REFERENCE_ATTRIBUTES = [ 'href', 'xlink:href' ];
const MAX_DROP_PASSES = 4;

function parseWithoutDropped( html: string ): Document {
	const root = new DOMParser().parseFromString(
		DOMPurify.sanitize( html, SANITIZER_CONFIG ),
		'text/html'
	);
	root.querySelectorAll( DROPPED_ELEMENTS ).forEach( ( node ) => node.remove() );
	for ( const element of root.querySelectorAll( '*' ) ) {
		DROPPED_ATTRIBUTES.forEach( ( name ) => element.removeAttribute( name ) );
		if ( element.tagName !== 'IMG' ) {
			element.removeAttribute( 'src' );
		}
		if ( SVG_REFERENCE_ELEMENTS.includes( element.localName.toLowerCase() ) ) {
			for ( const name of SVG_REFERENCE_ATTRIBUTES ) {
				if ( ! element.getAttribute( name )?.trim().startsWith( '#' ) ) {
					element.removeAttribute( name );
				}
			}
		}
	}
	return root;
}

/**
 * Markup that changes meaning when re-parsed can bring dropped elements back
 * once the frame parses the output, so drop until the result re-parses to the
 * same tree. Markup that never settles renders as an empty page.
 */
function settledWithoutDropped( html: string ): Document {
	let markup = html;
	for ( let pass = 0; pass < MAX_DROP_PASSES; pass++ ) {
		const root = parseWithoutDropped( markup );
		const output = root.documentElement.outerHTML;
		if (
			new DOMParser().parseFromString( output, 'text/html' ).documentElement.outerHTML === output
		) {
			return root;
		}
		markup = output;
	}
	return new DOMParser().parseFromString( '', 'text/html' );
}

/** Keep generated markup isolated; only registered preview assets may load. */
export function htmlPreviewDocument(
	html: string,
	assets: PreviewAssets = {},
	preserveImageSlots = false
): string {
	const root = settledWithoutDropped( html );
	for ( const image of root.querySelectorAll( 'img' ) ) {
		const asset = assets[ image.getAttribute( 'src' ) ?? '' ];
		if ( ! asset || ! IMAGE_MIMES.includes( asset.mime_type ) ) {
			if ( preserveImageSlots ) {
				image.removeAttribute( 'src' );
			} else {
				image.remove();
			}
			continue;
		}
		image.setAttribute( 'crossorigin', 'anonymous' );
		image.setAttribute( 'referrerpolicy', 'no-referrer' );
		image.setAttribute( 'src', asset.url );
	}
	for ( const style of root.querySelectorAll( 'style' ) ) {
		style.textContent = rewriteCssAssets( style.textContent ?? '', assets, preserveImageSlots );
	}
	for ( const element of root.querySelectorAll( '[style]' ) ) {
		element.setAttribute(
			'style',
			rewriteCssAssets( element.getAttribute( 'style' ) ?? '', assets, preserveImageSlots )
		);
	}
	const policy = root.createElement( 'meta' );
	policy.httpEquiv = 'Content-Security-Policy';
	policy.content = `default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src ${ assetSources( assets, IMAGE_MIMES ) }; font-src ${ assetSources( assets, FONT_MIMES ) }; form-action 'none'; base-uri 'none';`;
	const referrer = root.createElement( 'meta' );
	referrer.name = 'referrer';
	referrer.content = 'no-referrer';
	root.head.prepend( policy, referrer );
	// Page CSS can turn pointer events back on, so links stay live unless inert.
	root.body.setAttribute( 'inert', '' );
	return '<!doctype html>' + root.documentElement.outerHTML;
}

export const MAX_PREVIEW_DOCUMENT_BYTES = 1048576;

export type PreparedPreviewDocument = { html: string; meaningful: boolean };

/** The runtime receives asset identities, never signed URLs or authentication. */
export function preparePreviewDocument(
	html: string,
	assets: PreviewAssets = {}
): PreparedPreviewDocument | null {
	if ( ! html.trim() || new Blob( [ html ] ).size > MAX_PREVIEW_HTML_BYTES ) {
		return null;
	}
	const sanitized = htmlPreviewDocument( html, assets, true );
	const root = new DOMParser().parseFromString( sanitized, 'text/html' );
	for ( const element of root.querySelectorAll( '*' ) ) {
		for ( const attribute of Array.from( element.attributes ) ) {
			if ( attribute.name.startsWith( 'data-preview-' ) || attribute.name === 'nonce' ) {
				element.removeAttribute( attribute.name );
			}
		}
	}
	root.querySelectorAll( 'meta' ).forEach( ( node ) => node.remove() );
	const byUrl = new Map( Object.values( assets ).map( ( asset ) => [ asset.url, asset ] ) );
	const rewrite = ( value: string ) =>
		value.replace( /url\(\s*"([^"\n]*)"\s*\)/gi, ( _match, url: string ) => {
			if ( url === 'preview-pending:image' ) {
				return 'url("preview-pending:image")';
			}
			const asset = byUrl.get( url );
			return asset ? `url("preview-asset:${ asset.id }")` : 'url("")';
		} );
	for ( const image of root.querySelectorAll( 'img' ) ) {
		const asset = byUrl.get( image.getAttribute( 'src' ) ?? '' );
		image.removeAttribute( 'src' );
		if ( asset ) {
			image.setAttribute( 'data-preview-image', asset.id );
		} else {
			image.setAttribute( 'data-preview-pending', '' );
		}
	}
	root.querySelectorAll( 'style' ).forEach( ( style ) => {
		style.textContent = rewrite( style.textContent ?? '' );
	} );
	root.querySelectorAll( '[style]' ).forEach( ( element ) => {
		element.setAttribute( 'style', rewrite( element.getAttribute( 'style' ) ?? '' ) );
	} );
	const content = root.body.cloneNode( true ) as HTMLElement;
	content.querySelectorAll( 'header, nav, footer, style' ).forEach( ( node ) => node.remove() );
	const meaningful =
		!! content.querySelector( 'h1, h2' ) &&
		( content.textContent?.trim().length ?? 0 ) >= 30 &&
		!! content.querySelector( 'p, img[data-preview-image], section' );
	const output = root.documentElement.outerHTML;
	return new Blob( [ output ] ).size <= MAX_PREVIEW_DOCUMENT_BYTES
		? { html: output, meaningful }
		: null;
}
