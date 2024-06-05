import nock from 'nock';
import PostQueryManager from 'calypso/lib/query-manager/post';
import TermQueryManager from 'calypso/lib/query-manager/term';
import {
	POST_EDIT,
	SITE_SETTINGS_UPDATE,
	TERM_REMOVE,
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_SUCCESS,
	TERMS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import {
	addTerm,
	receiveTerm,
	receiveTerms,
	removeTerm,
	requestSiteTerms,
	updateTerm,
	deleteTerm,
} from '../actions';

/**
 * Module Variables
 */
const testTerms = [
	{
		ID: 777,
		name: 'Chicken',
		slug: 'chicken',
		description: 'His Majesty Colonel Sanders',
		post_count: 1,
		number: 0,
	},
	{
		ID: 778,
		name: 'Ribs',
		slug: 'ribs',
		description: 'i want my baby back * 3 ribs',
		post_count: 100,
		number: 0,
	},
];
const siteId = 2916284;
const taxonomyName = 'jetpack-portfolio-tag';
const categoryTaxonomyName = 'category';

describe( 'actions', () => {
	describe( 'addTerm()', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/${ taxonomyName }/terms/new` )
				.reply( 200, {
					ID: 123,
					name: 'ribs',
					description: '',
				} )
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/chicken-and-ribs/terms/new` )
				.reply( 400, {
					message: 'The taxonomy does not exist',
					error: 'invalid_taxonomy',
				} );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should dispatch a TERMS_RECEIVE event on success', async () => {
			const spy = jest.fn();
			await addTerm( siteId, taxonomyName, { name: 'ribs' } )( spy );
			expect( spy ).toHaveBeenCalledWith( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: [
					{
						ID: 123,
						name: 'ribs',
						description: '',
					},
				],
				query: undefined,
				found: undefined,
			} );
		} );

		test( 'should not dispatch a TERMS_RECEIVE event on failure', () => {
			const spy = jest.fn();
			addTerm( siteId, taxonomyName, { name: 'ribs' } )( spy );

			expect( spy ).not.toHaveBeenCalledWith( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: 'chicken-and-ribs',
				terms: expect.any( Array ),
			} );
		} );
	} );

	describe( 'receiveTerm()', () => {
		test( 'should return an action object', () => {
			const action = receiveTerm( siteId, taxonomyName, testTerms[ 0 ] );

			expect( action ).toEqual( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: [ testTerms[ 0 ] ],
				query: undefined,
				found: undefined,
			} );
		} );
	} );

	describe( '#receiveTerms()', () => {
		test( 'should return an action object', () => {
			const action = receiveTerms( siteId, taxonomyName, testTerms, {}, 2 );

			expect( action ).toEqual( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: testTerms,
				query: {},
				found: 2,
			} );
		} );

		test( 'should return an action object with query if passed', () => {
			const action = receiveTerms( siteId, taxonomyName, testTerms, { search: 'foo' }, 2 );

			expect( action ).toEqual( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: testTerms,
				query: { search: 'foo' },
				found: 2,
			} );
		} );
	} );

	describe( 'removeTerm()', () => {
		test( 'should return an action object', () => {
			const action = removeTerm( siteId, taxonomyName, 777 );

			expect( action ).toEqual( {
				type: TERM_REMOVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				termId: 777,
			} );
		} );
	} );

	describe( '#requestSiteTerms()', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.1/sites/${ siteId }/taxonomies/${ taxonomyName }/terms` )
				.reply( 200, {
					found: 2,
					terms: testTerms,
				} )
				.get( '/rest/v1.1/sites/12345/taxonomies/chicken-and-ribs/terms' )
				.reply( 400, {
					message: 'The taxonomy does not exist',
					error: 'invalid_taxonomy',
				} );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should dispatch a TERMS_REQUEST', () => {
			const spy = jest.fn();
			requestSiteTerms( siteId, taxonomyName )( spy );

			expect( spy ).toHaveBeenCalledWith( {
				type: TERMS_REQUEST,
				siteId: siteId,
				taxonomy: taxonomyName,
				query: {},
			} );
		} );

		test( 'should dispatch a TERMS_RECEIVE event on success', async () => {
			const spy = jest.fn();
			await requestSiteTerms( siteId, taxonomyName )( spy );
			expect( spy ).toHaveBeenCalledWith( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: testTerms,
				query: {},
				found: 2,
			} );
		} );

		test( 'should dispatch TERMS_REQUEST_SUCCESS action when request succeeds', async () => {
			const spy = jest.fn();
			await requestSiteTerms( siteId, taxonomyName )( spy );
			expect( spy ).toHaveBeenCalledWith( {
				type: TERMS_REQUEST_SUCCESS,
				siteId: siteId,
				taxonomy: taxonomyName,
				query: {},
			} );
		} );

		test( 'should dispatch TERMS_REQUEST_FAILURE action when request fails', async () => {
			const spy = jest.fn();
			await requestSiteTerms( 12345, 'chicken-and-ribs' )( spy );
			expect( spy ).toHaveBeenCalledWith( {
				type: TERMS_REQUEST_FAILURE,
				siteId: 12345,
				taxonomy: 'chicken-and-ribs',
				query: {},
				error: expect.objectContaining( { error: 'invalid_taxonomy' } ),
			} );
		} );
	} );

	describe( 'updateTerm()', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/${ taxonomyName }/terms/slug:rib` )
				.reply( 200, {
					ID: 123,
					name: 'ribs',
					description: '',
				} )
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/${ categoryTaxonomyName }/terms/slug:rib` )
				.reply( 200, {
					ID: 123,
					name: 'ribs',
					description: '',
				} )
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/${ taxonomyName }/terms/slug:toto` )
				.reply( 400, {
					message: 'The taxonomy does not exist',
					error: 'invalid_taxonomy',
				} );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should dispatch a TERMS_RECEIVE, TERM_REMOVE POST_EDIT and SITE_SETTINGS_UPDATE on Success', async () => {
			const postObjects = {
				[ siteId ]: {
					'0fcb4eb16f493c19b627438fdc18d57c': {
						ID: 120,
						site_ID: siteId,
						global_ID: 'f0cb4eb16f493c19b627438fdc18d57c',
						title: 'Steak &amp; Eggs',
						terms: {
							[ categoryTaxonomyName ]: [ { ID: 10, name: 'old category name', slug: 'old' } ],
						},
					},
				},
			};
			const state = {
				posts: {
					queries: {
						[ siteId ]: new PostQueryManager( {
							items: postObjects[ siteId ],
						} ),
					},
				},
				siteSettings: {
					items: {
						[ siteId ]: {
							default_category: 10,
						},
					},
				},
				terms: {
					queries: {
						[ siteId ]: {
							[ categoryTaxonomyName ]: new TermQueryManager( {
								items: {
									11: { ID: 11, name: 'chicken', slug: 'chicken', parent: 10 },
								},
								queries: {},
							} ),
						},
					},
				},
			};
			const getState = () => state;

			const spy = jest.fn();
			await updateTerm( siteId, categoryTaxonomyName, 10, 'rib', { name: 'ribs' } )(
				spy,
				getState
			);

			expect( spy ).toHaveBeenCalledWith( {
				type: TERM_REMOVE,
				siteId: siteId,
				taxonomy: categoryTaxonomyName,
				termId: 10,
			} );
			expect( spy ).toHaveBeenCalledWith( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: categoryTaxonomyName,
				terms: [
					{ ID: 11, name: 'chicken', slug: 'chicken', parent: 123 },
					{ ID: 123, name: 'ribs', description: '' },
				],
				query: undefined,
				found: undefined,
			} );
			expect( spy ).toHaveBeenCalledWith( {
				type: POST_EDIT,
				siteId: siteId,
				postId: 120,
				post: {
					terms: {
						[ categoryTaxonomyName ]: [ { ID: 123, name: 'ribs', description: '' } ],
					},
				},
			} );
			expect( spy ).toHaveBeenCalledWith( {
				type: SITE_SETTINGS_UPDATE,
				siteId: siteId,
				settings: {
					default_category: 123,
				},
			} );
		} );

		test( 'should not dispatch SITE_SETTINGS_UPDATE on Success if the taxonomy is not equal to "category"', async () => {
			const state = {
				posts: { queries: {} },
				siteSettings: {
					items: {
						[ siteId ]: {
							default_category: 10,
						},
					},
				},
				terms: {
					queries: {
						[ siteId ]: {
							[ taxonomyName ]: new TermQueryManager( {
								items: {
									11: { ID: 11, name: 'chicken', slug: 'chicken', parent: 10 },
								},
								queries: {},
							} ),
						},
					},
				},
			};
			const getState = () => state;

			const spy = jest.fn();
			await updateTerm( siteId, taxonomyName, 10, 'rib', { name: 'ribs' } )( spy, getState );
			expect( spy ).not.toHaveBeenCalledWith( {
				type: SITE_SETTINGS_UPDATE,
				siteId: siteId,
				settings: {
					default_category: 123,
				},
			} );
		} );
	} );

	describe( 'deleteTerm()', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/wp/v2/sites/${ siteId }/taxonomies/${ taxonomyName }/` )
				.reply( 200, { rest_base: taxonomyName } )
				.delete( `/wp/v2/sites/${ siteId }/${ taxonomyName }/10?force=true` )
				.reply( 200, { status: 'ok' } )
				.delete( `/wp/v2/sites/${ siteId }/categories/10?force=true` )
				.reply( 200, { status: 'ok' } );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should dispatch a TERMS_RECEIVE, TERM_REMOVE and POST_EDIT on Success', async () => {
			const postObjects = {
				[ siteId ]: {
					'0fcb4eb16f493c19b627438fdc18d57c': {
						ID: 120,
						site_ID: siteId,
						global_ID: 'f0cb4eb16f493c19b627438fdc18d57c',
						title: 'Steak &amp; Eggs',
						terms: {
							[ taxonomyName ]: [ { ID: 10, name: 'ribs', slug: 'ribs' } ],
						},
					},
				},
			};
			const state = {
				posts: {
					queries: {
						[ siteId ]: new PostQueryManager( {
							items: postObjects[ siteId ],
						} ),
					},
				},
				terms: {
					queries: {
						[ siteId ]: {
							[ taxonomyName ]: new TermQueryManager( {
								items: {
									5: { ID: 5, name: 'chicken', slug: 'chicken', parent: 0 },
									10: { ID: 10, name: 'ribs', slug: 'ribs', parent: 5 },
									15: { ID: 15, name: 'chicken ribs', slug: 'chicken-ribs', parent: 10 },
								},
								queries: {},
							} ),
						},
					},
				},
			};
			const getState = () => state;

			const spy = jest.fn();
			await deleteTerm( siteId, taxonomyName, 10, 'ribs' )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: [ { ID: 15, name: 'chicken ribs', slug: 'chicken-ribs', parent: 5 } ],
				query: undefined,
				found: undefined,
			} );
			expect( spy ).toHaveBeenCalledWith( {
				type: POST_EDIT,
				siteId: siteId,
				postId: 120,
				post: {
					terms: {
						[ taxonomyName ]: [],
					},
				},
			} );
			expect( spy ).toHaveBeenCalledWith( {
				type: TERM_REMOVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				termId: 10,
			} );
			expect( spy ).not.toHaveBeenCalledWith( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: [],
			} );
		} );

		test( 'should dispatch a TERMS_RECEIVE for default category on Success', async () => {
			const state = {
				posts: {
					queries: {
						[ siteId ]: new PostQueryManager( {
							items: {},
						} ),
					},
				},
				siteSettings: {
					items: {
						[ siteId ]: { default_category: 5 },
					},
				},
				terms: {
					queries: {
						[ siteId ]: {
							[ categoryTaxonomyName ]: new TermQueryManager( {
								items: {
									5: { ID: 5, name: 'chicken', slug: 'chicken', parent: 0, post_count: 10 },
									10: { ID: 10, name: 'ribs', slug: 'ribs', parent: 5, post_count: 2 },
								},
								queries: {},
							} ),
						},
					},
				},
			};
			const getState = () => state;

			const spy = jest.fn();
			await deleteTerm( siteId, categoryTaxonomyName, 10, 'ribs' )( spy, getState );

			expect( spy ).toHaveBeenCalledWith( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: categoryTaxonomyName,
				terms: [ { ID: 5, name: 'chicken', slug: 'chicken', parent: 0, post_count: 12 } ],
				query: undefined,
				found: undefined,
			} );
			expect( spy ).toHaveBeenCalledWith( {
				type: TERM_REMOVE,
				siteId: siteId,
				taxonomy: categoryTaxonomyName,
				termId: 10,
			} );
		} );

		test( 'should not dispatch a TERMS_RECEIVE for default category when prior category had no post_count', async () => {
			const state = {
				posts: {
					queries: {
						[ siteId ]: new PostQueryManager( {
							items: {},
						} ),
					},
				},
				siteSettings: {
					items: {
						[ siteId ]: { default_category: 5 },
					},
				},
				terms: {
					queries: {
						[ siteId ]: {
							[ categoryTaxonomyName ]: new TermQueryManager( {
								items: {
									5: { ID: 5, name: 'chicken', slug: 'chicken', parent: 0, post_count: 10 },
									10: { ID: 10, name: 'ribs', slug: 'ribs', parent: 5 },
								},
								queries: {},
							} ),
						},
					},
				},
			};
			const getState = () => state;

			const spy = jest.fn();
			await deleteTerm( siteId, categoryTaxonomyName, 10, 'ribs' )( spy, getState );

			expect( spy ).not.toHaveBeenCalledWith( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: categoryTaxonomyName,
				terms: [ { ID: 5, name: 'chicken', slug: 'chicken', parent: 0, post_count: 10 } ],
				query: undefined,
				found: undefined,
			} );
			expect( spy ).toHaveBeenCalledWith( {
				type: TERM_REMOVE,
				siteId: siteId,
				taxonomy: categoryTaxonomyName,
				termId: 10,
			} );
		} );

		test( 'should not dispatch any action on Failure', async () => {
			const spy = jest.fn();

			await expect(
				updateTerm( siteId, taxonomyName, 10, 'toto', { name: 'ribs' } )( spy )
			).rejects.toThrow();

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );
} );
