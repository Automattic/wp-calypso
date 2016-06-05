/**
 * Internal Dependencies
 **/
var CategoryStore = require( './category-store' );

function categoryStoreFactory( storeId ) {
	var categoryStore = categoryStoreFactory._categoryStores[ storeId ];

	if ( categoryStore ) {
		return categoryStore;
	}

	categoryStore = new CategoryStore( storeId );

	categoryStoreFactory._categoryStores[ storeId ] = categoryStore;

	return categoryStore;
}

categoryStoreFactory._categoryStores = {};

module.exports = categoryStoreFactory;
