import { getCanvasIframeElements } from './canvas-iframe-elements';

/**
 * Generates CSS for a `@font-face` rule.
 */
function generateFontFaceCSS( fontFace: Record< string, unknown > ): string {
	const properties = Object.entries( fontFace )
		.map( ( [ key, value ] ) => {
			const kebabKey = key.replace( /[A-Z]/g, ( m ) => `-${ m.toLowerCase() }` );

			if ( kebabKey === 'src' ) {
				if ( Array.isArray( value ) ) {
					const urls = value.map( ( url ) => `url("${ url }")` ).join( ', ' );
					return `  src: ${ urls };`;
				}
				return `  src: url("${ value }");`;
			}

			if ( kebabKey === 'font-family' ) {
				return `  ${ kebabKey }: "${ value }";`;
			}

			return `  ${ kebabKey }: ${ value };`;
		} )
		.join( '\n' );

	return `@font-face {\n${ properties }\n}`;
}

function normalizeThemeUri( value: unknown ): string {
	if ( ! value ) {
		return '';
	}
	if ( typeof value === 'string' ) {
		return value;
	}
	if ( typeof value === 'object' ) {
		const obj = value as Record< string, unknown >;
		const candidate = obj.raw || obj.rendered || obj.href || obj.url || obj.link || '';
		return typeof candidate === 'string' ? candidate : '';
	}
	return '';
}

function normalizeThemeBaseFromUri( uri: string ): string {
	try {
		const url = new URL( uri, window.location.href );
		url.pathname = ( url.pathname || '' ).replace( /\/style(\.min)?\.css(\?.*)?$/i, '' );
		url.search = '';
		url.hash = '';
		return url.toString().replace( /\/+$/, '' );
	} catch {
		return String( uri ).replace( /\/+$/, '' );
	}
}

function getActiveThemeBaseUrl(): string {
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accessing global `wp.data` at runtime
		const wpData = ( window as any )?.wp?.data;
		const theme = wpData?.select?.( 'core' )?.getCurrentTheme?.() as
			| Record< string, unknown >
			| undefined;

		if ( ! theme ) {
			return '';
		}

		const stylesheetRaw = theme?.stylesheet;
		const stylesheetSlug = typeof stylesheetRaw === 'string' ? stylesheetRaw : '';
		const localBaseUrl =
			stylesheetSlug && window?.location?.origin
				? `${ window.location.origin }/wp-content/themes/${ stylesheetSlug }`
				: '';

		// Try multiple theme URI fields — WP REST responses vary by version.
		const rawUri =
			theme?.theme_uri ||
			theme?.themeUri ||
			theme?.stylesheet_uri ||
			theme?.stylesheetUri ||
			theme?.template_uri ||
			theme?.templateUri;

		const uri = normalizeThemeUri( rawUri );
		if ( uri ) {
			const baseFromUri = normalizeThemeBaseFromUri( uri );
			// Prefer same-origin to avoid CORS failures when loading font files.
			try {
				const baseOrigin = new URL( baseFromUri, window.location.href ).origin;
				if ( baseOrigin === window.location.origin ) {
					return baseFromUri;
				}
			} catch {
				// Fall through to local base.
			}
			if ( localBaseUrl ) {
				return localBaseUrl;
			}
			return baseFromUri;
		}

		if ( localBaseUrl ) {
			return localBaseUrl;
		}
	} catch {
		// Ignore.
	}

	return '';
}

function resolveFontFaceSrc( src: unknown, themeBaseUrl: string ): string | string[] | null {
	if ( typeof src === 'string' ) {
		const resolved = resolveFileSrcToThemeUrl( src, themeBaseUrl );
		return resolved.startsWith( 'file:' ) ? null : resolved;
	}
	if ( Array.isArray( src ) ) {
		const resolved = ( src as string[] )
			.map( ( url ) => resolveFileSrcToThemeUrl( url, themeBaseUrl ) )
			.filter( ( url ) => url && ! url.startsWith( 'file:' ) );
		return resolved.length ? resolved : null;
	}
	return null;
}

function resolveFileSrcToThemeUrl( url: string, themeBaseUrl: string ): string {
	if ( typeof url !== 'string' ) {
		return '';
	}
	if ( ! url.startsWith( 'file:' ) ) {
		return url;
	}
	if ( ! themeBaseUrl ) {
		return url;
	}
	let rel = url.replace( /^file:/, '' );
	rel = rel.replace( /^\.\//, '' );
	rel = rel.replace( /^\/+/, '' );

	const normalizedBase = themeBaseUrl.replace( /\/+$/, '' );
	return `${ normalizedBase }/${ rel }`;
}

interface FontFace {
	src?: string | string[];
	fontDisplay?: string;
	[ key: string ]: unknown;
}

interface FontFamily {
	name: string;
	fontFamily: string;
	fontFace?: FontFace[];
	[ key: string ]: unknown;
}

/**
 * Converts font family objects to CSS `@font-face` rules.
 * Resolves `file:./assets/...` src values to loadable URLs.
 */
export function fontFamiliesToCSS( fontFamilies: FontFamily[] ): string {
	let css = '';
	if ( ! Array.isArray( fontFamilies ) || ! fontFamilies.length ) {
		return css;
	}
	const themeBaseUrl = getActiveThemeBaseUrl();
	fontFamilies.forEach( ( fontFamily ) => {
		if ( fontFamily.fontFace ) {
			fontFamily.fontFace.forEach( ( fontFace ) => {
				if ( fontFace.src ) {
					const src = resolveFontFaceSrc( fontFace.src, themeBaseUrl );
					if ( ! src ) {
						return;
					}
					css += generateFontFaceCSS( {
						...fontFace,
						fontDisplay: fontFace.fontDisplay || 'block',
						src,
					} );
				}
			} );
		}
	} );
	return css;
}

/**
 * Injects `@font-face` CSS for font families into the editor canvas iframe.
 */
export function injectFontFamiliesIntoEditorIframe( fontFamilies: FontFamily[] ): void {
	const css = fontFamiliesToCSS( fontFamilies );
	if ( ! css ) {
		return;
	}
	const { canvasIframeDocument } = getCanvasIframeElements();
	if ( canvasIframeDocument ) {
		const style = document.createElement( 'style' );
		style.textContent = css;
		canvasIframeDocument.head.appendChild( style );
	}
}
