/**
 * External dependencies
 */
import { assign, kebabCase } from 'lodash';
import { createElement, render } from '@wordpress/element';

export class FrontendManagement {
	blockIterator( rootNode, blocks ) {
		blocks.forEach( block => {
			this.initializeFrontendReactBlocks( block.component, block.options, rootNode );
		} );
	}
	initializeFrontendReactBlocks( component, options = {}, rootNode ) {
		const { attributes, name, prefix } = options.settings;
		const { selector } = options;
		const fullName = prefix && prefix.length ? `${ prefix }/${ name }` : name;
		const blockClass = `.wp-block-${ fullName.replace( '/', '-' ) }`;

		const blockNodeList = rootNode.querySelectorAll( blockClass );
		for ( const node of blockNodeList ) {
			const data = this.extractAttributesFromContainer( node, attributes );
			assign( data, options.props );
			const children = this.extractChildrenFromContainer( node );
			const el = createElement( component, data, children );
			render( el, selector ? node.querySelector( selector ) : node );
		}
	}
	extractAttributesFromContainer( node, attributes ) {
		const data = {};
		for ( const name in attributes ) {
			const attribute = attributes[ name ];
			const dataAttributeName = 'data-' + kebabCase( name );
			data[ name ] = node.getAttribute( dataAttributeName );
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
		const children = [ ...node.childNodes ];
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
