import { safeLinkRe } from './utils';

const XLINK_NS = 'http://www.w3.org/1999/xlink';

export default function makeContentLinksSafe( post, dom ) {
	const links = Array.from( dom.querySelectorAll( 'a[href]' ) );
	links.forEach( ( link ) => {
		// only accept links that are to http or https sites
		if ( ! safeLinkRe.test( link.href ) ) {
			link.removeAttribute( 'href' );
		}
	} );

	// SVG anchors keep their URL in `xlink:href`, which `a[href]` does not match, and their `href`
	// IDL property is an `SVGAnimatedString` rather than a resolved URL. Resolve the attribute by
	// hand so relative URLs are treated the same way as they are on an HTML anchor.
	const svgLinks = Array.from( dom.querySelectorAll( 'a[*|href]' ) );
	svgLinks.forEach( ( link ) => {
		const href = link.getAttributeNS( XLINK_NS, 'href' );
		if ( href === null ) {
			return;
		}

		let resolved;
		try {
			resolved = new URL( href, document.baseURI ).href;
		} catch ( e ) {
			resolved = href;
		}

		if ( ! safeLinkRe.test( resolved ) ) {
			link.removeAttributeNS( XLINK_NS, 'href' );
		}
	} );

	return post;
}
