import DOMPurify from 'dompurify';

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

function rewriteCssAssets( css: string, assets: PreviewAssets ): string {
	// The engine emits ordinary url(...) references. CSP also blocks unrecognized URL syntax.
	return css.replace(
		/url\(\s*(?:"([^"\n]*)"|'([^'\n]*)'|([^\s)'";]+))\s*\)/gi,
		( _match, doubleQuoted, singleQuoted, unquoted ) => {
			const asset = assets[ doubleQuoted ?? singleQuoted ?? unquoted ];
			return asset ? `url("${ asset.url }")` : 'url("")';
		}
	);
}

/** Keep generated markup isolated; only registered preview assets may load. */
export function htmlPreviewDocument( html: string, assets: PreviewAssets = {} ): string {
	const root = DOMPurify.sanitize( html, {
		WHOLE_DOCUMENT: true,
		RETURN_DOM: true,
		USE_PROFILES: { html: true },
		ADD_TAGS: [ 'style' ],
		FORBID_TAGS: [
			'base',
			'meta',
			'link',
			'script',
			'iframe',
			'object',
			'embed',
			'form',
			'input',
			'button',
			'select',
			'textarea',
			'picture',
			'source',
			'video',
			'audio',
		],
		FORBID_ATTR: [
			'href',
			'srcset',
			'action',
			'formaction',
			'ping',
			'background',
			'poster',
			'nonce',
			'is',
			'autofocus',
			'tabindex',
			'contenteditable',
			'slot',
			'part',
			'exportparts',
		],
	} );
	if ( ! ( root instanceof Element ) ) {
		return '';
	}
	const head = root.querySelector( 'head' );
	if ( ! head ) {
		return '';
	}
	for ( const image of root.querySelectorAll( 'img' ) ) {
		const asset = assets[ image.getAttribute( 'src' ) ?? '' ];
		if ( ! asset || ! IMAGE_MIMES.includes( asset.mime_type ) ) {
			image.remove();
			continue;
		}
		image.setAttribute( 'crossorigin', 'anonymous' );
		image.setAttribute( 'referrerpolicy', 'no-referrer' );
		image.setAttribute( 'src', asset.url );
	}
	for ( const element of root.querySelectorAll( '[src]' ) ) {
		if ( element.tagName !== 'IMG' ) {
			element.removeAttribute( 'src' );
		}
	}
	for ( const style of root.querySelectorAll( 'style' ) ) {
		style.textContent = rewriteCssAssets( style.textContent ?? '', assets );
	}
	for ( const element of root.querySelectorAll( '[style]' ) ) {
		element.setAttribute(
			'style',
			rewriteCssAssets( element.getAttribute( 'style' ) ?? '', assets )
		);
	}
	const policy = document.createElement( 'meta' );
	policy.httpEquiv = 'Content-Security-Policy';
	policy.content = `default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src ${ assetSources( assets, IMAGE_MIMES ) }; font-src ${ assetSources( assets, FONT_MIMES ) }; form-action 'none'; base-uri 'none';`;
	const referrer = document.createElement( 'meta' );
	referrer.name = 'referrer';
	referrer.content = 'no-referrer';
	head.prepend( policy, referrer );
	return '<!doctype html>' + root.outerHTML;
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
	const sanitized = htmlPreviewDocument( html, assets );
	const root = new DOMParser().parseFromString( sanitized, 'text/html' );
	for ( const element of root.querySelectorAll( '*' ) ) {
		for ( const attribute of Array.from( element.attributes ) ) {
			if ( attribute.name.startsWith( 'data-preview-' ) || attribute.name === 'nonce' ) {
				element.removeAttribute( attribute.name );
			}
		}
	}
	root.querySelectorAll( 'meta, script, template, noscript' ).forEach( ( node ) => node.remove() );
	const byUrl = new Map( Object.values( assets ).map( ( asset ) => [ asset.url, asset ] ) );
	const rewrite = ( value: string ) =>
		value.replace( /url\(\s*"([^"\n]*)"\s*\)/gi, ( _match, url: string ) => {
			const asset = byUrl.get( url );
			return asset ? `url("preview-asset:${ asset.id }")` : 'url("")';
		} );
	for ( const image of root.querySelectorAll( 'img' ) ) {
		const asset = byUrl.get( image.getAttribute( 'src' ) ?? '' );
		image.removeAttribute( 'src' );
		if ( asset ) {
			image.setAttribute( 'data-preview-image', asset.id );
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
