/**
 * External dependencies
 */
import { omit, mergeWith, includes, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { unwrap, insertAfter, remove } from '@wordpress/dom';

/**
 * Browser dependencies
 */
const { ELEMENT_NODE, TEXT_NODE } = window.Node;

const phrasingContentSchema = {
	strong: {},
	em: {},
	del: {},
	ins: {},
	a: { attributes: [ 'href' ] },
	code: {},
	abbr: { attributes: [ 'title' ] },
	sub: {},
	sup: {},
	br: {},
	'#text': {},
};

// Recursion is needed.
// Possible: strong > em > strong.
// Impossible: strong > strong.
[ 'strong', 'em', 'del', 'ins', 'a', 'code', 'abbr', 'sub', 'sup' ].forEach( ( tag ) => {
	phrasingContentSchema[ tag ].children = omit( phrasingContentSchema, tag );
} );

/**
 * Get schema of possible paths for phrasing content.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Phrasing_content
 *
 * @return {Object} Schema.
 */
export function getPhrasingContentSchema() {
	return phrasingContentSchema;
}

/**
 * Find out whether or not the given node is phrasing content.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Phrasing_content
 *
 * @param {Element} node The node to test.
 *
 * @return {boolean} True if phrasing content, false if not.
 */
export function isPhrasingContent( node ) {
	const tag = node.nodeName.toLowerCase();
	return getPhrasingContentSchema().hasOwnProperty( tag ) || tag === 'span';
}

/**
 * Given raw transforms from blocks, merges all schemas into one.
 *
 * @param {Array} transforms Block transforms, of the `raw` type.
 *
 * @return {Object} A complete block content schema.
 */
export function getBlockContentSchema( transforms ) {
	const schemas = transforms.map( ( { schema } ) => schema );

	return mergeWith( {}, ...schemas, ( objValue, srcValue, key ) => {
		if ( key === 'children' ) {
			if ( objValue === '*' || srcValue === '*' ) {
				return '*';
			}

			return { ...objValue, ...srcValue };
		} else if ( key === 'attributes' || key === 'require' ) {
			return [ ...( objValue || [] ), ...( srcValue || [] ) ];
		}
	} );
}

/**
 * Recursively checks if an element is empty. An element is not empty if it
 * contains text or contains elements with attributes such as images.
 *
 * @param {Element} element The element to check.
 *
 * @return {boolean} Wether or not the element is empty.
 */
export function isEmpty( element ) {
	if ( ! element.hasChildNodes() ) {
		return true;
	}

	return Array.from( element.childNodes ).every( ( node ) => {
		if ( node.nodeType === TEXT_NODE ) {
			return ! node.nodeValue.trim();
		}

		if ( node.nodeType === ELEMENT_NODE ) {
			if ( node.nodeName === 'BR' ) {
				return true;
			} else if ( node.hasAttributes() ) {
				return false;
			}

			return isEmpty( node );
		}

		return true;
	} );
}

/**
 * Checks wether HTML can be considered plain text. That is, it does not contain
 * any elements that are not line breaks.
 *
 * @param {string} HTML The HTML to check.
 *
 * @return {boolean} Wether the HTML can be considered plain text.
 */
export function isPlain( HTML ) {
	return ! /<(?!br[ />])/i.test( HTML );
}

/**
 * Given node filters, deeply filters and mutates a NodeList.
 *
 * @param {NodeList} nodeList The nodeList to filter.
 * @param {Array}    filters  An array of functions that can mutate with the provided node.
 * @param {Document} doc      The document of the nodeList.
 * @param {Object}   schema   The schema to use.
 */
export function deepFilterNodeList( nodeList, filters, doc, schema ) {
	Array.from( nodeList ).forEach( ( node ) => {
		deepFilterNodeList( node.childNodes, filters, doc, schema );

		filters.forEach( ( item ) => {
			// Make sure the node is still attached to the document.
			if ( ! doc.contains( node ) ) {
				return;
			}

			item( node, doc, schema );
		} );
	} );
}

/**
 * Given node filters, deeply filters HTML tags.
 * Filters from the deepest nodes to the top.
 *
 * @param {string} HTML    The HTML to filter.
 * @param {Array}  filters An array of functions that can mutate with the provided node.
 * @param {Object} schema  The schema to use.
 *
 * @return {string} The filtered HTML.
 */
export function deepFilterHTML( HTML, filters = [], schema ) {
	const doc = document.implementation.createHTMLDocument( '' );

	doc.body.innerHTML = HTML;

	deepFilterNodeList( doc.body.childNodes, filters, doc, schema );

	return doc.body.innerHTML;
}

/**
 * Given a schema, unwraps or removes nodes, attributes and classes on a node
 * list.
 *
 * @param {NodeList} nodeList The nodeList to filter.
 * @param {Document} doc      The document of the nodeList.
 * @param {Object}   schema   An array of functions that can mutate with the provided node.
 * @param {Object}   inline   Whether to clean for inline mode.
 */
function cleanNodeList( nodeList, doc, schema, inline ) {
	Array.from( nodeList ).forEach( ( node ) => {
		const tag = node.nodeName.toLowerCase();

		// It's a valid child.
		if ( schema.hasOwnProperty( tag ) ) {
			if ( node.nodeType === ELEMENT_NODE ) {
				const { attributes = [], classes = [], children, require = [] } = schema[ tag ];

				// If the node is empty and it's supposed to have children,
				// remove the node.
				if ( isEmpty( node ) && children ) {
					remove( node );
					return;
				}

				if ( node.hasAttributes() ) {
					// Strip invalid attributes.
					Array.from( node.attributes ).forEach( ( { name } ) => {
						if ( name !== 'class' && ! includes( attributes, name ) ) {
							node.removeAttribute( name );
						}
					} );

					// Strip invalid classes.
					if ( node.classList.length ) {
						const mattchers = classes.map( ( item ) => {
							if ( typeof item === 'string' ) {
								return ( className ) => className === item;
							} else if ( item instanceof RegExp ) {
								return ( className ) => item.test( className );
							}

							return noop;
						} );

						Array.from( node.classList ).forEach( ( name ) => {
							if ( ! mattchers.some( ( isMatch ) => isMatch( name ) ) ) {
								node.classList.remove( name );
							}
						} );

						if ( ! node.classList.length ) {
							node.removeAttribute( 'class' );
						}
					}
				}

				if ( node.hasChildNodes() ) {
					// Do not filter any content.
					if ( children === '*' ) {
						return;
					}

					// Continue if the node is supposed to have children.
					if ( children ) {
						// If a parent requires certain children, but it does
						// not have them, drop the parent and continue.
						if ( require.length && ! node.querySelector( require.join( ',' ) ) ) {
							cleanNodeList( node.childNodes, doc, schema, inline );
							unwrap( node );
						}

						cleanNodeList( node.childNodes, doc, children, inline );
					// Remove children if the node is not supposed to have any.
					} else {
						while ( node.firstChild ) {
							remove( node.firstChild );
						}
					}
				}
			}
		// Invalid child. Continue with schema at the same place and unwrap.
		} else {
			cleanNodeList( node.childNodes, doc, schema, inline );

			// For inline mode, insert a line break when unwrapping nodes that
			// are not phrasing content.
			if ( inline && ! isPhrasingContent( node ) && node.nextElementSibling ) {
				insertAfter( doc.createElement( 'br' ), node );
			}

			unwrap( node );
		}
	} );
}

/**
 * Given a schema, unwraps or removes nodes, attributes and classes on HTML.
 *
 * @param {string} HTML   The HTML to clean up.
 * @param {Object} schema Schema for the HTML.
 * @param {Object} inline Whether to clean for inline mode.
 *
 * @return {string} The cleaned up HTML.
 */
export function removeInvalidHTML( HTML, schema, inline ) {
	const doc = document.implementation.createHTMLDocument( '' );

	doc.body.innerHTML = HTML;

	cleanNodeList( doc.body.childNodes, doc, schema, inline );

	return doc.body.innerHTML;
}
