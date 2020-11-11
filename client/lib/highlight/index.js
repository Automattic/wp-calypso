/**
 * External dependencies
 */

import { compact, toArray } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:highlight' );

/**
 * @private
 */
function wrap( innerHtml, wrapperNode ) {
	const node = wrapperNode.cloneNode();
	node.innerHTML = innerHtml;
	return node;
}

function replaceChildNodesWithGroup( node, newChildren, oldChild ) {
	let child = newChildren.pop();
	let last;
	if ( child ) {
		node.replaceChild( child, oldChild );
		last = child;
		while ( ( child = newChildren.pop() ) ) {
			node.insertBefore( child, last );
			last = child;
		}
	}
}

/**
 * @private
 */
function highlightNode( node, term, wrapperNode ) {
	let nodes = [];
	let found = false;
	let pos;
	let leftText;
	let midText;
	let remainingText;
	if ( node.nodeName === '#text' ) {
		remainingText = node.nodeValue;
	}

	while ( true ) {
		pos = remainingText.toLowerCase().indexOf( term.toLowerCase() );
		if ( ! remainingText || pos === -1 ) {
			break;
		}
		found = true;

		leftText = remainingText.slice( 0, pos );
		nodes.push( document.createTextNode( leftText ) );

		midText = remainingText.slice( pos, pos + term.length );
		nodes.push( wrap( midText, wrapperNode ) );

		remainingText = remainingText.slice( pos + term.length );
	}
	nodes.push( document.createTextNode( remainingText ) );

	nodes = compact( nodes );
	if ( nodes.length && found ) {
		replaceChildNodesWithGroup( node.parentElement, nodes, node );
	}
}

/**
 * @private
 */
function walk( node, term, wrapperNode ) {
	let children;
	debug( 'Node type', node.nodeName );
	if ( node.childNodes.length ) {
		children = toArray( node.childNodes );

		for ( let i = 0; i < children.length; i++ ) {
			walk( children[ i ], term, wrapperNode );
		}
	} else if ( node.nodeName === '#text' ) {
		debug( 'Parsing node with value:', node.nodeValue );
		highlightNode( node, term, wrapperNode );
	}
}

/**
 * Wraps strings in a html to highlight
 *
 * @param {string} term Term to search for
 * @param {string} html HTML string to search and wrap
 * @param {HTMLElement} [wrapperNode] Custom node to wrap the elements with, defaults to <mark>
 * @returns {string} Wrapped HTML
 */
function highlight( term, html, wrapperNode ) {
	debug( 'Starting highlight' );
	if ( ! wrapperNode ) {
		wrapperNode = document.createElement( 'mark' );
	}
	if ( ! term || ! html ) {
		return html;
	}
	const root = document.createElement( 'div' );
	root.innerHTML = html;
	walk( root, term, wrapperNode );
	return root.innerHTML;
}

export default highlight;
