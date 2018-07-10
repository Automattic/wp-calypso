/**
 * WordPress dependencies
 */
import { createElement } from '@wordpress/element';

/**
 * External dependencies
 */
import { nodeListToReact, nodeToReact } from 'dom-react';
export { attr, prop, html, text, query } from 'hpq';

export const children = ( selector ) => {
	return ( domNode ) => {
		let match = domNode;

		if ( selector ) {
			match = domNode.querySelector( selector );
		}

		if ( match ) {
			return nodeListToReact( match.childNodes || [], createElement );
		}

		return [];
	};
};

export const node = ( selector ) => {
	return ( domNode ) => {
		let match = domNode;

		if ( selector ) {
			match = domNode.querySelector( selector );
		}

		return nodeToReact( match, createElement );
	};
};
