/**
 * Internal Dependencies
 **/
var CategoryStore = require( './category-store' );

/**
 * Module variables
 **/
var _categoryStores = {};

function categoryStoreFactory( storeId ) {
	var categoryStore = _categoryStores[ storeId ];

	if ( categoryStore ) {
		return categoryStore;
	}

	categoryStore = new CategoryStore( storeId );

	_categoryStores[ storeId ] = categoryStore;

	return categoryStore;
}

module.exports = categoryStoreFactory;
