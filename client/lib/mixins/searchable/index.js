/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory('calypso:searchable');

/**
 * Add search capability to collection
 * @param {type} prototype The prototype of the Collection you are extending
 * @param {array} searchNodes Parameter to specify which nodes of each collection item to search
 */
function Searchable( prototype, searchNodes ) {

	debug( 'Adding searchable mixin to:', prototype );

	/**
	 * Walks through the item's data according to the `searchNodes` parameter
	 * passed in as `node`. This function initially takes the `searchNodes` parameter,
	 * but then uses recursion to walk through each node. If any match is found,
	 * we stop searching and immediately return true. Otherwise we return false.
	 *
	 * @param {array|string|object} node The current node config we are searching
	 * @param {object} object The item (or node) whose data we are searching
	 * @param {string} keyword	The string we are searching for
	 * @return {boolean} True for a match, false for no match
	 */
	var findMatches = function( node, object, keyword ) {

		var i, key;

		if ( Array.isArray( node ) ) {
			// array -- walk through each item
			for ( i = 0; i < node.length; i++ ) {
				if ( findMatches( node[ i ], object, keyword ) ) {
					return true;
				}
			}

		} else if ( 'string' === typeof node ) {
			// string -- return true|false on search term
			return ( -1 !== object[ node ].toLowerCase().indexOf( keyword ) );

		} else {
			// object -- walk the deeper node
			for ( key in node ) {
				if ( ! node.hasOwnProperty( key ) ) {
					continue;
				}
				if ( findMatches( node[ key ], object[ key ], keyword ) ) {
					return true;
				}
			}
		}
		return false;
	};

	/**
	 * Public method added to a collection to return a filtered set of matching items
	 * 
	 * @param {string} keyword The string we are searching for on the collection
	 * @return {array} The filtered set of items in the collection that match the search term
	 */
	prototype.search = function( keyword ) {

		debug( 'Searching for "' + keyword + '" in ', prototype );

		var allItems = this.get(),
			filteredItems = [];

		filteredItems = allItems.filter( function( item ) {
			return findMatches( searchNodes, item, keyword.toLowerCase() );
		} );

		return filteredItems;

	};

}

/**
 * Expose `Searchable`
 */
module.exports = Searchable;
