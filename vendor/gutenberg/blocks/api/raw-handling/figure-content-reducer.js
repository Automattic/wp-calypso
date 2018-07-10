/**
 * External dependencies
 */
import { has } from 'lodash';

/**
 * Internal dependencies
 */
import { isPhrasingContent } from './utils';

/**
 * Whether or not the given node is figure content.
 *
 * @param {Node}   node   The node to check.
 * @param {Object} schema The schema to use.
 *
 * @return {boolean} True if figure content, false if not.
 */
function isFigureContent( node, schema ) {
	const tag = node.nodeName.toLowerCase();

	// We are looking for tags that can be a child of the figure tag, excluding
	// `figcaption` and any phrasing content.
	if ( tag === 'figcaption' || isPhrasingContent( node ) ) {
		return false;
	}

	return has( schema, [ 'figure', 'children', tag ] );
}

/**
 * Whether or not the given node can have an anchor.
 *
 * @param {Node}   node   The node to check.
 * @param {Object} schema The schema to use.
 *
 * @return {boolean} True if it can, false if not.
 */
function canHaveAnchor( node, schema ) {
	const tag = node.nodeName.toLowerCase();

	return has( schema, [ 'figure', 'children', 'a', 'children', tag ] );
}

/**
 * This filter takes figure content out of paragraphs, wraps it in a figure
 * element, and moves any anchors with it if needed.
 *
 * @param {Node}     node   The node to filter.
 * @param {Document} doc    The document of the node.
 * @param {Object}   schema The schema to use.
 *
 * @return {void}
 */
export default function( node, doc, schema ) {
	if ( ! isFigureContent( node, schema ) ) {
		return;
	}

	let nodeToInsert = node;
	const parentNode = node.parentNode;

	// If the figure content can have an anchor and its parent is an anchor with
	// only the figure content, take the anchor out instead of just the content.
	if (
		canHaveAnchor( node, schema ) &&
		parentNode.nodeName === 'A' &&
		parentNode.childNodes.length === 1
	) {
		nodeToInsert = node.parentNode;
	}

	let wrapper = nodeToInsert;

	while ( wrapper && wrapper.nodeName !== 'P' ) {
		wrapper = wrapper.parentElement;
	}

	const figure = doc.createElement( 'figure' );

	if ( wrapper ) {
		wrapper.parentNode.insertBefore( figure, wrapper );
	} else {
		nodeToInsert.parentNode.insertBefore( figure, nodeToInsert );
	}

	figure.appendChild( nodeToInsert );
}
