import DOMPurify from 'dompurify';

export const MAX_PREVIEW_HTML_BYTES = 262144;

export type PreviewAsset = { id: string; mime_type: string; url: string };
export type PreviewAssets = Record< string, PreviewAsset >;
const IMAGE_MIMES = [ 'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif' ];
const FONT_MIMES = [ 'font/woff2', 'font/woff' ];

export function parsePreviewAssets( value: unknown, blogId: number ): PreviewAssets {
	const assets: PreviewAssets = {};
	if ( ! value || typeof value !== 'object' || Array.isArray( value ) ) {
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
				parsed.origin !== 'https://public-api.wordpress.com' ||
				parsed.username ||
				parsed.password ||
				parsed.hash ||
				parsed.pathname !==
					`/wpcom/v2/sites/${ blogId }/big-sky/build-wow/preview-assets/${ id }/content` ||
				! /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(
					parsed.searchParams.get( 'token' ) ?? ''
				) ||
				Array.from( parsed.searchParams.keys() ).some( ( key ) => key !== 'token' )
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
		FORBID_ATTR: [ 'href', 'srcset', 'action', 'formaction', 'ping', 'background', 'poster' ],
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
