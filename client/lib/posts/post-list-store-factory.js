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
	let postListStore = _postListStores[ postStoreId ];

	if ( postListStore ) {
		return postListStore;
	}

	postListStore = new PostListStore( postStoreId );

	_postListStores[ postStoreId ] = postListStore;

	return postListStore;
}
