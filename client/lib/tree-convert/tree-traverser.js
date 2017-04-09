/**
 * External dependencies
 */

var findIndex = require( 'lodash/findIndex' ),
	some = require( 'lodash/some' );

/**
 * Given a node within a tree, return the node's parent or the tree
 * itself if the node is not found within the tree.
 */
function parent( node, tree ) {
	return find( tree, function( it ) {
		return some( it.items, { id: node.id } );
	} ) || tree;
}

function traverse( node, filters, root ) {
	filters.forEach( function( filter ) {
		node = filter( node, root );
	}, this );

	if ( node.items ) {
		node.items = node.items.map( function( item ) {
			return traverse( item, filters, root );
		} );
	}

	return node;
}

/**
 * Depth-first search
 */
function find( node, predicate ) {
	if ( predicate( node ) ) {
		return node;
	}

	if ( node.items ) {
		return mapFindAny( node.items, function( node ) {
			return find( node, predicate );
		} );
	}
}

/**
 * Depth-first search based replacement
 */
function replaceItem( node, newNode, predicate ) {
	var i;

	if ( ! node.items ) {
		return;
	}

	for ( i = 0; i < node.items.length; i++ ) {
		if ( predicate( node.items[ i ] ) ) {
			node.items[ i ] = newNode;
			return;
		}
		replaceItem( node.items[ i ], newNode, predicate);
	}
}

/**
 * Returns the first non-null element resulting from the mapping of a function
 * over an array.
 */
function mapFindAny( array, fn ) {
	var i, result, length = array.length;
	for ( i = 0; i < length; i++ ) {
		if ( result = fn( array[ i ] ) ) { // eslint-disable-line no-cond-assign
			return result;
		}
	}
}

function childInserter( srcNode, dstId ) {
	return function( node ) {
		if ( node.id === dstId ) {
			node.items = node.items || [];
			node.items.push( srcNode );
		}
		return node;
	};
}

function siblingInserter( srcNode, dstId, position ) {
	return function( node ) {
		var index,
			offset = position === 'before' ? 0 : 1;

		if ( ~ ( index = findIndex( node.items, { id: dstId } ) ) ) {
			node.items.splice( index + offset, 0, srcNode );
		}
		return node;
	};
}

module.exports = {

	/**
	 * Traverses a tree of menu items and calls a set of filters on each item
	 * node it enters. Warning: no data is ever cloned internally.
	 *
	 * @param {object} root of a tree of menu items
	 * @param {array} filters
	 * @return {object} the original tree, which might have mutated
	 */
	traverse: function( root, filters ) {
		return traverse( root, filters, root );
	},

	/**
	 * Given a node within a tree, return the node's parent or the tree
	 * itself if the node is not found within the tree.
	 *
	 * @param {object} tree node
	 * @param {object} root of a tree
	 * @return {object} node
	 */
	parent: parent,

	/**
	 * Returns the first item that satisfies a given predicate.
	 *
	 * @param {object} root of a tree of menu items
	 * @param {function} predicate
	 * @return {object} node
	 */
	find: find,

	/**
	 * Find the first item that satisfies a given predicate, and
	 * replace it with a new item.
	 *
	 * @param {object} root of a tree of menu items
	 * @param {object} the new item
	 * @param {function} predicate
	 * @return {object} node
	 */
	replaceItem: replaceItem,

	/**
	 * Returns a filter function that aims to remove from the tree any item whose
	 * 'id' property has the value 'id'.
	 *
	 * @param {int} id
	 * @return {function} a filter to be fed to 'traverse'
	 */
	remover: function( id ) {
		return function( node ) {
			var index;
			if ( ~ ( index = findIndex( node.items, { id: id } ) ) ) {
				node.items.splice( index, 1 );
			}
			return node;
		};
	},

	/**
	 * Returns a filter function that aims to insert item 'srcItem' next to any
	 * item whose 'id' property has the value 'dstId', according to 'position'.
	 *
	 * @param {object} srcItem
	 * @param {int} dstId
	 * @param {string} position ('before', 'after', or 'child')
	 * @return {function} a filter to be fed to 'traverse'
	 */
	inserter: function( srcItem, dstId, position ) {
		var func = 'child' === position ? childInserter : siblingInserter;
		return func( srcItem, dstId, position );
	}

};
