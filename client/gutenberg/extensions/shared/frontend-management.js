/**
 * External dependencies
 *
 * @format
 */

import { createElement, render } from '@wordpress/element';

/**
 * Internal dependencies
 */

import assign from 'lodash/assign';

export class FrontendManagement {
	blockIterator( rootNode, blocks ) {
		blocks.forEach( block => {
			this.initializeFrontendReactBlocks( block.component, block.options, rootNode );
		} );
	}
	initializeFrontendReactBlocks( component, options = {}, rootNode ) {
		const { name, attributes } = options.settings;
		const { selector } = options;
		const blockClass = [ '.wp-block', name.replace( '/', '-' ) ].join( '-' );
		rootNode.querySelectorAll( blockClass ).forEach( node => {
			const data = this.extractAttributesFromContainer( node.dataset, attributes );
			assign( data, options.props );
			const children = this.extractChildrenFromContainer( node );
			const targetNode = selector ? node.querySelector( selector ) : node;
			if ( options.beforeRender ) {
				options.beforeRender( data ).then( processedData => {
					this.createAndRenderElement( component, processedData, children, targetNode );
				} );
			} else {
				this.createAndRenderElement( component, data, children, targetNode );
			}
		} );
	}
	createAndRenderElement = ( component, data, children, node ) => {
		const el = createElement( component, data, children );
		return render( el, node );
	};
	extractAttributesFromContainer( dataset, attributes ) {
		const data = {};
		for ( const name in attributes ) {
			const attribute = attributes[ name ];
			data[ name ] = dataset[ name ];
			if ( attribute.type === 'boolean' ) {
				data[ name ] = data[ name ] === 'false' ? false : !! data[ name ];
			}
			if ( attribute.type === 'array' || attribute.type === 'object' ) {
				try {
					data[ name ] = JSON.parse( data[ name ] );
				} catch ( e ) {
					// console.log( 'Error decoding JSON data for field ' + name, e);
					data[ name ] = null;
				}
			}
		}
		return data;
	}
	extractChildrenFromContainer( node ) {
		const children = [];
		node.childNodes.forEach( childNode => children.push( childNode ) );
		return children.map( child => {
			const attr = {};
			for ( let i = 0; i < child.attributes.length; i++ ) {
				const attribute = child.attributes[ i ];
				attr[ attribute.nodeName ] = attribute.nodeValue;
			}
			attr.dangerouslySetInnerHTML = {
				__html: child.innerHTML,
			};
			return createElement( child.tagName.toLowerCase(), attr );
		} );
	}
}

export default FrontendManagement;
