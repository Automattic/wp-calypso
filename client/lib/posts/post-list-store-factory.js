/**
 * Internal dependencies
 */
import PostListStore from './post-list-store';

/**
 * Module variables
 **/
let _postListStores = {};

export default function getStore( storeId ) {
	const postStoreId = storeId || 'default';

	if ( ! _postListStores[ postStoreId ] ) {
		_postListStores[ postStoreId ] = new PostListStore( postStoreId );
	}

	return _postListStores[ postStoreId ];
}

getStore._reset = function() {
	_postListStores = {};
};
