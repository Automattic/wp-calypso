import { safeLinkRe } from './utils';

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

// SVG 1.1 anchors carry their URL in the xlink namespace, SVG 2 ones in a plain `href`.
const SVG_HREF_ATTRIBUTES = [
	[ null, 'href' ],
	[ XLINK_NS, 'href' ],
];

function resolve( href ) {
	try {
		return new URL( href, document.baseURI ).href;
	} catch {
		return null;
	}
}

export default function makeContentLinksSafe( post, dom ) {
	const links = Array.from( dom.querySelectorAll( 'a' ) );
	links.forEach( ( link ) => {
		// An SVG anchor's `href` IDL property is an `SVGAnimatedString`, not a resolved URL, so it
		// never matches and every link -- safe ones included -- would be stripped. Resolve the
		// attributes by hand instead, so relative URLs are treated as they are on an HTML anchor.
		if ( link.namespaceURI === SVG_NS ) {
			SVG_HREF_ATTRIBUTES.forEach( ( [ namespace, name ] ) => {
				const href = link.getAttributeNS( namespace, name );

				if ( href !== null && ! safeLinkRe.test( resolve( href ) ?? '' ) ) {
					link.removeAttributeNS( namespace, name );
				}
			} );
			return;
		}

		// only accept links that are to http or https sites
		if ( link.hasAttribute( 'href' ) && ! safeLinkRe.test( link.href ) ) {
			link.removeAttribute( 'href' );
		}
	} );

	return post;
}
