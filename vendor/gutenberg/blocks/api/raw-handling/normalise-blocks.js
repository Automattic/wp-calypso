/**
 * Internal dependencies
 */
import { isPhrasingContent, isEmpty } from './utils';

/**
 * Browser dependencies
 */
const { ELEMENT_NODE, TEXT_NODE } = window.Node;

export default function( HTML ) {
	const decuDoc = document.implementation.createHTMLDocument( '' );
	const accuDoc = document.implementation.createHTMLDocument( '' );

	const decu = decuDoc.body;
	const accu = accuDoc.body;

	decu.innerHTML = HTML;

	while ( decu.firstChild ) {
		const node = decu.firstChild;

		// Text nodes: wrap in a paragraph, or append to previous.
		if ( node.nodeType === TEXT_NODE ) {
			if ( ! node.nodeValue.trim() ) {
				decu.removeChild( node );
			} else {
				if ( ! accu.lastChild || accu.lastChild.nodeName !== 'P' ) {
					accu.appendChild( accuDoc.createElement( 'P' ) );
				}

				accu.lastChild.appendChild( node );
			}
		// Element nodes.
		} else if ( node.nodeType === ELEMENT_NODE ) {
			// BR nodes: create a new paragraph on double, or append to previous.
			if ( node.nodeName === 'BR' ) {
				if ( node.nextSibling && node.nextSibling.nodeName === 'BR' ) {
					accu.appendChild( accuDoc.createElement( 'P' ) );
					decu.removeChild( node.nextSibling );
				}

				// Don't append to an empty paragraph.
				if (
					accu.lastChild &&
					accu.lastChild.nodeName === 'P' &&
					accu.lastChild.hasChildNodes()
				) {
					accu.lastChild.appendChild( node );
				} else {
					decu.removeChild( node );
				}
			} else if ( node.nodeName === 'P' ) {
				// Only append non-empty paragraph nodes.
				if ( isEmpty( node ) ) {
					decu.removeChild( node );
				} else {
					accu.appendChild( node );
				}
			} else if ( isPhrasingContent( node ) ) {
				if ( ! accu.lastChild || accu.lastChild.nodeName !== 'P' ) {
					accu.appendChild( accuDoc.createElement( 'P' ) );
				}
				accu.lastChild.appendChild( node );
			} else {
				accu.appendChild( node );
			}
		} else {
			decu.removeChild( node );
		}
	}

	return accu.innerHTML;
}
