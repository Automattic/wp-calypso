/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:terms:actions' ),
	assign = require( 'lodash/object/assign' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	CategoryStoreFactory = require( './category-store-factory' ),
	TagStore = require( './tag-store' ),
	wpcom = require( 'lib/wp' ),
	ActionTypes = require( './constants' ).action;

var TermActions = {},
	temporaryIdCount = 0;

function getTemporaryId() {
	var temporaryId = [ 'temporary', temporaryIdCount ].join( '-' );
	temporaryIdCount++;
	return temporaryId;
}

TermActions.addCategory = function( siteId, name, parent, postId ) {
	var temporaryCategory,
		temporaryId,
		args;
	if ( ! siteId || ! name ) {
		return;
	}

	temporaryId = getTemporaryId();

	temporaryCategory = {
		ID: temporaryId,
		name: name,
		parent: parent,
		postId: postId
	};

	Dispatcher.handleViewAction( {
		type: ActionTypes.CREATE_TERM,
		siteId: siteId,
		data: {
			termType: 'categories',
			terms: [ temporaryCategory ]
		}
	} );

	args = {
		name: name,
		parent: parent
	};

	wpcom.site( siteId ).category().add( args, function( error, data ) {
		data.temporaryId = temporaryId;
		data.postId = postId;

		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_ADD_TERM,
			siteId: siteId,
			data: {
				termType: 'categories',
				terms: [ data ]
			},
			error: error
		} );
	} );
};

TermActions.setSelectedCategories = function( siteId, categoryIds ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.SET_CATEGORY_SELECTED_ITEMS,
		siteId: siteId,
		data: categoryIds,
		error: null
	} );
};

TermActions.setCategoryQuery = function( siteId, query, categoryStoreId = 'default' ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.SET_CATEGORY_QUERY,
		id: categoryStoreId,
		siteId: siteId,
		query: query
	} );
};

TermActions.fetchNextCategoryPage = function( siteId, categoryStoreId = 'default' ) {
	var categoryStore, query;

	categoryStore = CategoryStoreFactory( categoryStoreId );

	query = assign( {}, categoryStore.getQueryParams( siteId ) );

	if ( categoryStore.isFetchingPage( siteId ) ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.FETCH_CATEGORIES,
		id: categoryStoreId,
		siteId: siteId,
		query: query
	} );

	debug( 'fetching categories for site: ' + siteId, query );
	wpcom.site( siteId ).categoriesList( query, function( error, data ) {
		var categories, found;

		categories = data ? data.categories : [];
		found = data ? data.found : null;

		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_TERMS,
			id: categoryStoreId,
			siteId: siteId,
			data: {
				termType: 'categories',
				terms: categories,
				found: found
			},
			error: error
		} );
	} );
};

TermActions.fetchNextTagPage = function( siteId ) {
	var query = assign( {}, TagStore.getQueryParams( siteId ) );

	if ( TagStore.isFetchingPage( siteId ) ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.FETCH_TAGS,
		siteId: siteId,
		query: query
	} );

	debug( 'fetching tags for site: ' + siteId, query );
	wpcom.site( siteId ).tagsList( query, function( error, data ) {
		var tags, found;

		tags = data ? data.tags : [];
		found = data ? data.found : null;

		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_TERMS,
			siteId: siteId,
			data: {
				termType: 'tags',
				terms: tags,
				found: found
			},
			error: error
		} );
	} );
};

module.exports = TermActions;
