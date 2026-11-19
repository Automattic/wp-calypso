// The site's look, applied to this page without an iframe: MCP hosts' CSP blocks the
// blob: iframe the block editor's canvas uses, so the post renders in this document.

const SCOPE = ':where(.editor-styles-wrapper)';

export type SiteStyle = { css: string; isGlobalStyles?: boolean };

// Splits a selector list on its top-level commas, leaving `:is(a, b)` whole.
function splitSelectors( selectorText: string ) {
	const selectors = [];
	let depth = 0;
	let start = 0;
	for ( let i = 0; i < selectorText.length; i++ ) {
		const char = selectorText[ i ];
		if ( char === '(' || char === '[' ) {
			depth++;
		} else if ( char === ')' || char === ']' ) {
			depth--;
		} else if ( char === ',' && depth === 0 ) {
			selectors.push( selectorText.slice( start, i ) );
			start = i + 1;
		}
	}
	selectors.push( selectorText.slice( start ) );
	return selectors.map( ( selector ) => selector.trim() );
}

// As the block editor's transformStyles does: `html`, `body` and `:root` become the
// wrapper, and every other selector is nested in it.
function scopeSelector( selector: string ) {
	if ( selector.includes( '.editor-styles-wrapper' ) ) {
		return selector;
	}
	if ( /^(html|body|:root)(?![\w-])/.test( selector ) ) {
		return selector.replace( /^(html|body|:root)/, SCOPE );
	}
	return `${ SCOPE } ${ selector }`;
}

function scopeRules( rules: CSSRuleList ) {
	for ( const rule of Array.from( rules ) ) {
		if ( rule instanceof CSSStyleRule ) {
			rule.selectorText = splitSelectors( rule.selectorText ).map( scopeSelector ).join( ', ' );
		} else if ( rule instanceof CSSGroupingRule ) {
			// @media, @supports, @layer and @container.
			scopeRules( rule.cssRules );
		}
	}
}

export function scopeStyles( css: string ) {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync( css );
	scopeRules( sheet.cssRules );
	return Array.from( sheet.cssRules, ( rule ) => rule.cssText ).join( '\n' );
}

// Rebuilds each server `<link>` and `<style>` with only the attributes it needs.
function appendHtml( html: string, selector: string ) {
	const template = document.createElement( 'template' );
	template.innerHTML = html;
	for ( const node of template.content.querySelectorAll( selector ) ) {
		if ( node instanceof HTMLStyleElement ) {
			const style = document.createElement( 'style' );
			style.textContent = node.textContent;
			document.head.append( style );
			continue;
		}
		const rawHref = node.getAttribute( 'href' ) ?? '';
		let href: URL;
		try {
			href = new URL( rawHref.startsWith( '//' ) ? `https:${ rawHref }` : rawHref );
		} catch {
			continue;
		}
		if ( href.protocol !== 'http:' && href.protocol !== 'https:' ) {
			continue;
		}
		const link = document.createElement( 'link' );
		link.rel = 'stylesheet';
		link.href = href.href;
		const media = node.getAttribute( 'media' );
		if ( media ) {
			link.media = media;
		}
		document.head.append( link );
	}
}

export function applySiteStyles( config: {
	styles?: SiteStyle[];
	assets_styles?: string;
	font_faces_html?: string;
} ) {
	// Block and theme CSS, written for the canvas document, which this page stands in for.
	appendHtml( config.assets_styles ?? '', 'link[rel="stylesheet"], style' );
	appendHtml( config.font_faces_html ?? '', 'style' );
	for ( const { css } of config.styles ?? [] ) {
		if ( ! css ) {
			continue;
		}
		const style = document.createElement( 'style' );
		style.textContent = scopeStyles( css );
		document.head.append( style );
	}
}
