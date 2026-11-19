// The site's look, applied to this page without an iframe: MCP hosts' CSP blocks the
// blob: iframe the block editor's canvas uses, so the post renders in this document.
// The editor scopes the site's editor `styles` to its canvas; this adds the rest.

// Rebuilds each server `<link>` and `<style>` with only the attributes it needs. Settles when
// each stylesheet has loaded or failed.
function appendHtml( html: string, selector: string ) {
	const loads: Promise< unknown >[] = [];
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
		loads.push(
			new Promise( ( resolve ) => {
				link.onload = link.onerror = resolve;
			} )
		);
		document.head.append( link );
	}
	return Promise.all( loads );
}

// Settles once the stylesheets have loaded or failed, and then the fonts the page uses by the next
// frame have loaded.
export async function applySiteStyles( config: {
	assets_styles?: string;
	font_faces_html?: string;
} ) {
	// Block and theme CSS, written for the canvas document, which this page stands in for.
	const loaded = appendHtml( config.assets_styles ?? '', 'link[rel="stylesheet"], style' );
	appendHtml( config.font_faces_html ?? '', 'style' );
	await loaded;
	await new Promise( ( resolve ) => requestAnimationFrame( resolve ) );
	await document.fonts?.ready;
}
