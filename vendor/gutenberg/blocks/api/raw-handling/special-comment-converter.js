/**
 * WordPress dependencies
 */
import { remove, replace } from '@wordpress/dom';

/**
 * Browser dependencies
 */
const { COMMENT_NODE } = window.Node;

/**
 * Looks for `<!--nextpage-->` and `<!--more-->` comments, as well as the
 * `<!--more Some text-->` variant and its `<!--noteaser-->` companion,
 * and replaces them with a custom element representing a future block.
 *
 * The custom element is a way to bypass the rest of the `raw-handling`
 * transforms, which would eliminate other kinds of node with which to carry
 * `<!--more-->`'s data: nodes with `data` attributes, empty paragraphs, etc.
 *
 * The custom element is then expected to be recognized by any registered
 * block's `raw` transform.
 *
 * @param {Node}     node The node to be processed.
 * @param {Document} doc  The document of the node.
 * @return {void}
 */
export default function( node, doc ) {
	if ( node.nodeType !== COMMENT_NODE ) {
		return;
	}

	if ( node.nodeValue === 'nextpage' ) {
		replace( node, createNextpage( doc ) );
		return;
	}

	if ( node.nodeValue.indexOf( 'more' ) === 0 ) {
		// Grab any custom text in the comment.
		const customText = node.nodeValue.slice( 4 ).trim();

		/*
		 * When a `<!--more-->` comment is found, we need to look for any
		 * `<!--noteaser-->` sibling, but it may not be a direct sibling
		 * (whitespace typically lies in between)
		 */
		let sibling = node;
		let noTeaser = false;
		while ( ( sibling = sibling.nextSibling ) ) {
			if (
				sibling.nodeType === COMMENT_NODE &&
				sibling.nodeValue === 'noteaser'
			) {
				noTeaser = true;
				remove( sibling );
				break;
			}
		}

		replace( node, createMore( customText, noTeaser, doc ) );
	}
}

function createMore( customText, noTeaser, doc ) {
	const node = doc.createElement( 'wp-block' );
	node.dataset.block = 'core/more';
	if ( customText ) {
		node.dataset.customText = customText;
	}
	if ( noTeaser ) {
		// "Boolean" data attribute
		node.dataset.noTeaser = '';
	}
	return node;
}

function createNextpage( doc ) {
	const node = doc.createElement( 'wp-block' );
	node.dataset.block = 'core/nextpage';

	return node;
}
