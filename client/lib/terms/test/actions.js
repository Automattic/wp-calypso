/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';
import mockery from 'mockery';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import data from './data';
import TermsConstants from '../constants';

const ActionTypes = TermsConstants.action,
	TEST_SITE_ID = 777,
	TEST_CATEGORY_STORE_ID = 'default',
	TEST_CATEGORY_ID = 999,
	TAGS_DEFAULT_PER_PAGE = TermsConstants.MAX_TAGS,
	CATEGORIES_DEFAULT_PER_PAGE = 300,
	TEST_CATEGORY_NAME = 'OMGKITIES',
	CATEGORY_API_RESPONSE = {
		categories: data.treeList,
		found: 7
	},
	ADD_CATEGORY_API_RESPONSE = {
		ID: TEST_CATEGORY_ID,
		name: TEST_CATEGORY_NAME
	},
	TEST_QUERY = {
		search: 'unicorns'
	},
	TAG_API_RESPONSE = {
		tags: data.tagList,
		found: 2
	};

describe( 'actions', function() {
	let TermActions, Dispatcher, sandbox, getCategories, getTags, addCategory;

	useMockery();

	before( function() {
		mockery.registerMock( 'lib/wp', {
			site: function() {
				return {
					categoriesList: getCategories,
					tagsList: getTags,
					category: function() {
						return {
							add: addCategory
						};
					}
				};
			}
		} );
		TermActions = require( '../actions' );
		// have to require dispatcher after turning on mockery because we get a different instance after mockery cleans out the cache.
		// yay singletons that are not single
		Dispatcher = require( 'dispatcher' );
	} );

	beforeEach( function() {
		sandbox = sinon.sandbox.create();

		getCategories = sandbox.stub().callsArgWithAsync( 1, null, CATEGORY_API_RESPONSE );
		getTags = sandbox.stub().callsArgWithAsync( 1, null, TAG_API_RESPONSE );
		addCategory = sandbox.stub().callsArgWithAsync( 1, null, ADD_CATEGORY_API_RESPONSE );
		sandbox.stub( Dispatcher, 'handleServerAction' );
		sandbox.stub( Dispatcher, 'handleViewAction' );
	} );

	afterEach( function() {
		sandbox.restore();
	} );

	describe( '#addCategory', function() {
		it( 'should call handleViewAction with proper data', function() {
			TermActions.addCategory( TEST_SITE_ID, TEST_CATEGORY_NAME );
			assert.calledWith( Dispatcher.handleViewAction, {
				type: ActionTypes.CREATE_TERM,
				siteId: TEST_SITE_ID,
				data: {
					termType: 'categories',
					terms: [ {
						ID: sinon.match( /^temporary-/ ),
						name: TEST_CATEGORY_NAME,
						parent: undefined,
						postId: undefined
					} ]
				}
			} );
		} );

		it( 'should allow a parent to be passed in', function( done ) {
			TermActions.addCategory( TEST_SITE_ID, TEST_CATEGORY_NAME, TEST_CATEGORY_ID );
			assert.calledWith( Dispatcher.handleViewAction, {
				type: ActionTypes.CREATE_TERM,
				siteId: TEST_SITE_ID,
				data: {
					termType: 'categories',
					terms: [ {
						ID: sinon.match( /^temporary-/ ),
						name: TEST_CATEGORY_NAME,
						parent: TEST_CATEGORY_ID,
						postId: undefined
					} ]
				}
			} );

			process.nextTick( function() {
				assert.calledWith( Dispatcher.handleServerAction, {
					type: ActionTypes.RECEIVE_ADD_TERM,
					data: {
						termType: 'categories',
						terms: [ ADD_CATEGORY_API_RESPONSE ]
					},
					error: null,
					siteId: TEST_SITE_ID
				} );
				done();
			} );
		} );
	} );

	describe( '#setCategoryQuery', function() {
		it( 'should call handleViewAction', function() {
			TermActions.setCategoryQuery( TEST_SITE_ID, TEST_QUERY );
			assert.calledWith( Dispatcher.handleViewAction, {
				type: ActionTypes.SET_CATEGORY_QUERY,
				id: TEST_CATEGORY_STORE_ID,
				siteId: TEST_SITE_ID,
				query: TEST_QUERY
			} );
		} );
	} );

	describe( '#fetchNextCategoryPage', function() {
		it( 'should make a get via wpcom and dispatch an event', function( done ) {
			TermActions.fetchNextCategoryPage( TEST_SITE_ID );
			assert.calledWith( getCategories, { number: CATEGORIES_DEFAULT_PER_PAGE, page: 1 } );
			process.nextTick( function() {
				assert.calledWith( Dispatcher.handleServerAction, {
					type: ActionTypes.RECEIVE_TERMS,
					id: TEST_CATEGORY_STORE_ID,
					data: { termType: 'categories', terms: CATEGORY_API_RESPONSE.categories, found: CATEGORY_API_RESPONSE.found },
					error: null,
					siteId: TEST_SITE_ID
				} );
				done();
			} );
		} );
	} );

	describe( '#setSelectedCategories', function() {
		it( 'should call handleViewAction', function() {
			TermActions.setSelectedCategories( TEST_SITE_ID, [] );
			assert.calledWith( Dispatcher.handleViewAction, {
				type: ActionTypes.SET_CATEGORY_SELECTED_ITEMS,
				siteId: TEST_SITE_ID,
				data: [],
				error: null
			} );
		} );
	} );

	describe( '#fetchNextTagPage', function() {
		it( 'should make a get via wpcom and dispatch an event', function( done ) {
			TermActions.fetchNextTagPage( TEST_SITE_ID );
			assert.calledWith( getTags, { number: TAGS_DEFAULT_PER_PAGE, order_by: 'count', order: 'DESC', page: 1 } );
			process.nextTick( function() {
				assert.calledWith( Dispatcher.handleServerAction, {
					type: ActionTypes.RECEIVE_TERMS,
					data: { termType: 'tags', terms: TAG_API_RESPONSE.tags, found: TAG_API_RESPONSE.found },
					error: null,
					siteId: TEST_SITE_ID
				} );
				done();
			} );
		} );
	} );
} );
