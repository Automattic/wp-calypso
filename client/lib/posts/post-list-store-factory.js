import { has } from 'lodash';

/**
 * Internal Dependencies
 **/
import PostListStore from './post-list-store';

/**
 * Module variables
 **/
let _postListStores = {};

function getStore( storeId ) {
	const postStoreId = storeId || 'default';

	if ( ! has( _postListStores, postStoreId ) ) {
		_postListStores[ postStoreId ] = new PostListStore( postStoreId );
	}

	return _postListStores[ postStoreId ];
}

getStore._reset = function() {
	_postListStores = {};
};

module.exports = getStore;
