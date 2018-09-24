/**
 * Wordpress dependencies
 */

import { createElement, render } from '@wordpress/element';

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

export class FrontendManagement {
	blockIterator( rootNode, blocks ) {
		blocks.forEach( block => {
			this.initializeFrontendReactBlocks(
				block.component,
				block.options,
				rootNode
			)
		} )
	}
	initializeFrontendReactBlocks( component, options = {}, rootNode ) {
		const { name, attributes } = component.config;
		const { selector } = options;
		const blockClass = [ '.wp-block', name.replace('/', '-') ].join( '-' )
		rootNode
			.querySelectorAll( blockClass )
			.forEach( node => {
				const data = this.extractAttributesFromContainer( node.dataset, attributes )
				let children;
				if ( node.childNodes.length > 0 ) {
					const innerBlocksContainerAttributes = {
						dangerouslySetInnerHTML: { __html: node.innerHTML },
						className: 'inner-blocks-container'
					}
					children = createElement( 'div', innerBlocksContainerAttributes );
				}
				const el = createElement( component, data, children );
			  	render( el, selector ? node.querySelector( selector ) : node );
			} )
	}

	extractAttributesFromContainer( dataset, attributes ) {
		const data = {};
		for ( const name in attributes) {
			const attribute = attributes[ name ];
			data[ name ] = dataset[ name ];
			if ( attribute.type === 'array' || attribute.type === 'object' ) {

				try {
					data[ name ] = JSON.parse( data[ name ] );
				} catch(e) {
					// console.log( 'Error decoding JSON data for field ' + name, e);
					data[ name ] = null;
				}

			}
		}
		return data;
	}
}

export default FrontendManagement;
