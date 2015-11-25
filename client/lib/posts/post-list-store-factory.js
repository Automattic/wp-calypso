/**
 * Internal Dependencies
 **/
import PostListStore from './post-list-store';

/**
 * Module variables
 **/
const _postListStores = {};

export default function( storeId ) {
	const postStoreId = storeId || 'default';

	if ( ! _postListStores[ postStoreId ] ) {
		_postListStores[ postStoreId ] = new PostListStore( postStoreId );
	}

	return _postListStores[ postStoreId ];
}
