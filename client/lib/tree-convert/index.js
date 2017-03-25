
/**
 * Internal dependencies
 */
var Traverser = require( './tree-traverser' );

/**
 * TreeConvert provides methods to convert a linearly structured set of "items"
 * into a tree-based one that reflects the parent-child relationship of said
 * items, and vice-versa.
 *
 * Currently, this relationship is stated in the `parent` property of items,
 * which indicates a parent key.
 *
 * @param {string} [optional] key - the item property to be used as its
 *     identifying key
 */
function TreeConvert( key ) {
	if ( ! ( this instanceof TreeConvert ) ) {
		return new TreeConvert( key );
	}

	this.key = key || 'id';
}

TreeConvert.prototype.treeify = function( items ) {
	var tree = [],
		indexedNodes = {};

	items.forEach( function( item, i ) {
		indexedNodes[ items[ i ][ this.key ] ] = item;
	}, this );

	items.forEach( function( item ) {
		var parentNode;

		if ( item.parent > 0 && indexedNodes[ item.parent ] ) {
			parentNode = indexedNodes[ item.parent ];
			parentNode.items = parentNode.items || [];
			parentNode.items.push( item );
		} else {
			// reset parent in case it was not zero
			item.parent = 0;
			tree.push( item );
		}
	} );

	this.sortItems( tree );
	this.removeOrderProperty( tree );

	return tree;
};

TreeConvert.prototype.untreeify = function( tree, list ) {
	list = list || [];
	tree.forEach( function( item, index ) {
		if ( item.items ) {
			TreeConvert.prototype.untreeify( item.items, list );
		}
		item.order = index + 1;
		list.push(item);
	});
	return list;
};


TreeConvert.prototype.sortItems = function( itemTrees ) {
	var root = {};

	root.items = itemTrees;

	Traverser.traverse( root, [ function( node ) {
		node.items && node.items.sort( function( a, b ) {
			return a.order - b.order;
		} );
		return node;
	} ] );
};

TreeConvert.prototype.removeOrderProperty = function( itemTrees ) {
	var root = {};

	root.items = itemTrees;

	Traverser.traverse( root, [ function( node ) {
		node.items && node.items.forEach( function( item ) {
			delete item.order;
		} );
		return node;
	} ] );
};

module.exports = TreeConvert;
