Terms
=====

Terms provides flux stores to house Category and Tag ( _soon_ ) data returned from the WordPress.com API.

# Stores

The following flux stores can be utlized by listening to `change` events to update your components.

## TermStore

The term store in `store.js` acts as a central data store for all Category and Tag data.

## CategoryStore

The CategoryStore supports paginating of Category data housed within the TermStore, and supports the following methods:

```js
var CategoryStore = require( 'lib/terms/category-store' ),
	allCategories = CategoryStore.all( siteId ),
	singleCategory = CategoryStore.get( siteId, categoryId ),
	
	// Total number of categories found
	foundCategories = CategoryStore.found( siteId );
```

To execute data requests against the store, use the actions:

```js
var TermActions = require( 'lib/terms/actions' );

// set query options
TermActions.setCategoryQuery( siteId, { search: 'amaze' } );
TermActions.fetchNextCategoryPage( siteId );

// add new category
TermActions.addCategory( siteId, 'My Awesome Category' );

// add new category with parent ID of 1001
TermActions.addCategory( siteId, 'A Child of 1001', 1001 );
```