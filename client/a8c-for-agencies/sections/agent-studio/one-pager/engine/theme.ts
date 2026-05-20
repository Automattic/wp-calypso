// Per-page theme picker + color resolver. Themes mix white / ink / brand /
// accent across the document so the deliverable reads like a designed
// magazine spread, not a stack of identical pages. Ported from prototype.

import type { BrandTokens, ElaPageTheme } from './types';

interface ThemeColors {
	bg: string;
	fg: string;
	accent: string;
}

function luminance( hex: string ): number {
	const c = hex.replace( '#', '' );
	if ( c.length !== 6 ) {
		return 0.5;
	}
	const r = parseInt( c.slice( 0, 2 ), 16 ) / 255;
	const g = parseInt( c.slice( 2, 4 ), 16 ) / 255;
	const b = parseInt( c.slice( 4, 6 ), 16 ) / 255;
	const lin = ( v: number ): number =>
		v <= 0.03928 ? v / 12.92 : Math.pow( ( v + 0.055 ) / 1.055, 2.4 );
	return 0.2126 * lin( r ) + 0.7152 * lin( g ) + 0.0722 * lin( b );
}

function contrastRatio( a: string, b: string ): number {
	const la = luminance( a );
	const lb = luminance( b );
	return ( Math.max( la, lb ) + 0.05 ) / ( Math.min( la, lb ) + 0.05 );
}

function ensureContrastFg( bg: string, candidate: string ): string {
	if ( contrastRatio( bg, candidate ) >= 4 ) {
		return candidate;
	}
	return luminance( bg ) < 0.5 ? '#FFFFFF' : '#101517';
}

export function pageThemeColors(
	theme: ElaPageTheme,
	tokens: BrandTokens | undefined
): ThemeColors | null {
	if ( theme === 'light' ) {
		return null;
	}
	if ( theme === 'ink' ) {
		const bg = tokens?.textPrimary ?? '#1A1A1A';
		const fg = ensureContrastFg( bg, tokens?.surfacePrimary ?? '#FFFFFF' );
		return { bg, fg, accent: tokens?.brandPrimary ?? '#3858E9' };
	}
	if ( theme === 'accent' ) {
		const bg = tokens?.brandPrimary ?? tokens?.surfaceBrand ?? '#3858E9';
		const fg = ensureContrastFg( bg, tokens?.textOnBrand ?? '#FFFFFF' );
		return { bg, fg, accent: fg };
	}
	const bg = tokens?.surfaceBrand ?? tokens?.brandPrimary ?? '#3858E9';
	const fg = ensureContrastFg( bg, tokens?.textOnBrand ?? '#FFFFFF' );
	return { bg, fg, accent: fg };
}

export function pickThemeSequence( numPages: number ): ElaPageTheme[] {
	if ( numPages <= 0 ) {
		return [];
	}
	const accent: ElaPageTheme = Math.random() < 0.5 ? 'ink' : 'brand';
	const evenAccent = ( i: number ): ElaPageTheme => ( i % 2 === 0 ? accent : 'light' );
	const oddAccent = ( i: number ): ElaPageTheme => {
		if ( i === 0 ) {
			return 'light';
		}
		return i % 2 === 1 ? accent : 'light';
	};
	const bookend = ( i: number ): ElaPageTheme =>
		i === 0 || i === numPages - 1 ? accent : 'light';
	const rhythms: Array< ( i: number ) => ElaPageTheme > = [ evenAccent, oddAccent, bookend ];
	const pick = rhythms[ Math.floor( Math.random() * rhythms.length ) ];
	return Array.from( { length: numPages }, ( _, i ) => pick( i ) );
}

export function applyPageTheme(
	html: string,
	theme: ElaPageTheme,
	colors: ThemeColors | null
): string {
	if ( theme === 'light' || ! colors ) {
		return html;
	}
	const styleDecl = `--page-bg:${ colors.bg };--page-fg:${ colors.fg };--page-accent:${ colors.accent };`;
	return html.replace(
		/<div\b([^>]*)\bclass\s*=\s*("|')([^"']*\bela-page\b[^"']*)\2([^>]*)>/gi,
		( _full, pre: string, q: string, classes: string, post: string ) => {
			const before = pre + post;
			let attrs = before.replace( /\s*data-theme\s*=\s*("[^"]*"|'[^']*')/gi, '' );
			const styleRe = /\bstyle\s*=\s*("|')([^"']*)\1/i;
			if ( styleRe.test( attrs ) ) {
				attrs = attrs.replace( styleRe, ( _m: string, sq: string, val: string ): string => {
					const trimmed = val.trim();
					const sep = trimmed.length === 0 || trimmed.endsWith( ';' ) ? '' : ';';
					return `style=${ sq }${ trimmed }${ sep }${ styleDecl }${ sq }`;
				} );
			} else {
				attrs = `${ attrs } style="${ styleDecl }"`;
			}
			return `<div${ attrs } class=${ q }${ classes }${ q } data-theme="${ theme }">`;
		}
	);
}

export { luminance };
