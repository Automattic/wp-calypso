/**
 * External dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	assign = require( 'lodash/object/assign' );

/**
 * Internal dependencies
 */
var data = require( './data' ),
	ActionTypes = require( '../constants' ).action;

/**
 * Module variables
 */
var TEST_SITE_ID = 777,
	TEST_CATEGORY_STORE_ID = 'default',
	TEST_CATEGORY_ID = 1,
	TEMPORARY_ID = 'temporary-0',
	TEST_QUERY = {
		search: 'unicorns'
	},
	TEST_ADD_TERM = {
		name: 'random',
		ID: TEMPORARY_ID
	},
	TEST_ADDED_TERM = {
		name: 'wookies',
		ID: 1337
	},
	TEST_NUM_CATEGORIES = data.treeList.length - 1;

module.exports = {
	TEST_SITE_ID: TEST_SITE_ID,
	TEST_CATEGORY_STORE_ID: TEST_CATEGORY_STORE_ID,
	TEST_CATEGORY_ID: TEST_CATEGORY_ID,
	TEMPORARY_ID: TEMPORARY_ID,
	TEST_QUERY: TEST_QUERY,
	TEST_ADD_TERM: TEST_ADD_TERM,
	TEST_ADDED_TERM: TEST_ADDED_TERM,
	TEST_NUM_CATEGORIES: TEST_NUM_CATEGORIES,

	dispatchReceiveCategoryTerms: function() {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_TERMS',
			id: TEST_CATEGORY_STORE_ID,
			siteId: TEST_SITE_ID,
			data: {
				termType: 'categories',
				terms: data.treeList,
				found: data.treeList.length
			},
			error: null
		} );
	},

	dispatchAddTerm: function( categoryStoreId = TEST_CATEGORY_STORE_ID ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_ADD_TERM',
			id: categoryStoreId,
			siteId: TEST_SITE_ID,
			data: {
				termType: 'categories',
				terms: [ TEST_ADDED_TERM ]
			},
			error: null
		} );
	},

	dispatchReceiveTagTerms: function() {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_TERMS',
			id: TEST_CATEGORY_STORE_ID,
			siteId: TEST_SITE_ID,
			data: {
				termType: 'tags',
				terms: data.tagList,
				found: data.tagList.length
			},
			error: null
		} );
	},

	dispatchPaginatedReceiveTerms: function( categoryStoreId ) {
		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_TERMS,
			id: categoryStoreId || TEST_CATEGORY_STORE_ID,
			siteId: TEST_SITE_ID,
			data: {
				termType: 'categories',
				terms: data.treeList,
				found: data.treeList.length + 100
			},
			error: null
		} );
	},

	dispatchReceiveAddTempTerm: function() {
		Dispatcher.handleViewAction( {
			type: ActionTypes.CREATE_TERM,
			id: TEST_CATEGORY_STORE_ID,
			siteId: TEST_SITE_ID,
			data: {
				termType: 'categories',
				terms: [ TEST_ADD_TERM ]
			},
			error: null
		} );
	},

	dispatchSetQuery: function( query, categoryStoreId ) {
		Dispatcher.handleViewAction( {
			type: ActionTypes.SET_CATEGORY_QUERY,
			id: categoryStoreId || TEST_CATEGORY_STORE_ID,
			siteId: TEST_SITE_ID,
			query: assign( {}, TEST_QUERY, query )
		} );
	}
};
