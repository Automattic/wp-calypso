/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import {
	POST_EDIT,
	SITE_SETTINGS_UPDATE,
	TERM_REMOVE,
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_SUCCESS,
	TERMS_REQUEST_FAILURE
} from 'state/action-types';
import {
	addTerm,
	receiveTerm,
	receiveTerms,
	removeTerm,
	requestSiteTerms,
	updateTerm,
	deleteTerm
} from '../actions';
import PostQueryManager from 'lib/query-manager/post';
import TermQueryManager from 'lib/query-manager/term';

/**
 * Module Variables
 */
const testTerms = [
	{ ID: 777, name: 'Chicken', slug: 'chicken', description: 'His Majesty Colonel Sanders', post_count: 1, number: 0 },
	{ ID: 778, name: 'Ribs', slug: 'ribs', description: 'i want my baby back * 3 ribs', post_count: 100, number: 0 },
];
const siteId = 2916284;
const taxonomyName = 'jetpack-testimonials';
const categoryTaxonomyName = 'category';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( 'addTerm()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/${ taxonomyName }/terms/new` )
				.reply( 200, {
					ID: 123,
					name: 'ribs',
					description: ''
				} )
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/chicken-and-ribs/terms/new` )
				.reply( 400, {
					message: 'The taxonomy does not exist',
					error: 'invalid_taxonomy'
				} );
		} );

		it( 'should dispatch a TERMS_RECEIVE', () => {
			addTerm( siteId, taxonomyName, { name: 'ribs' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: [
					sinon.match( {
						ID: sinon.match( /^temporary/ ),
						name: 'ribs'
					} )
				],
				query: undefined,
				found: undefined
			} );
		} );

		it( 'should dispatch a TERMS_RECEIVE event on success', () => {
			return addTerm( siteId, taxonomyName, { name: 'ribs' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERMS_RECEIVE,
					siteId: siteId,
					taxonomy: taxonomyName,
					terms: [ {
						ID: 123,
						name: 'ribs',
						description: ''
					} ],
					query: undefined,
					found: undefined
				} );
			} );
		} );

		it( 'should dispatch a TERM_REMOVE event on success', () => {
			return addTerm( siteId, taxonomyName, { name: 'ribs' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERM_REMOVE,
					siteId: siteId,
					taxonomy: taxonomyName,
					termId: sinon.match( /^temporary/ )
				} );
			} );
		} );

		it( 'should dispatch a TERM_REMOVE event on failure', () => {
			return addTerm( siteId, 'chicken-and-ribs', { name: 'new term' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERM_REMOVE,
					siteId: siteId,
					taxonomy: 'chicken-and-ribs',
					termId: sinon.match( /^temporary/ )
				} );
			} );
		} );
	} );

	describe( 'receiveTerm()', () => {
		it( 'should return an action object', () => {
			const action = receiveTerm( siteId, taxonomyName, testTerms[ 0 ] );

			expect( action ).to.eql( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: [ testTerms[ 0 ] ],
				query: undefined,
				found: undefined
			} );
		} );
	} );

	describe( '#receiveTerms()', () => {
		it( 'should return an action object', () => {
			const action = receiveTerms( siteId, taxonomyName, testTerms, {}, 2 );

			expect( action ).to.eql( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: testTerms,
				query: {},
				found: 2
			} );
		} );

		it( 'should return an action object with query if passed', () => {
			const action = receiveTerms( siteId, taxonomyName, testTerms, { search: 'foo' }, 2 );

			expect( action ).to.eql( {
				type: TERMS_RECEIVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				terms: testTerms,
				query: { search: 'foo' },
				found: 2
			} );
		} );
	} );

	describe( 'removeTerm()', () => {
		it( 'should return an action object', () => {
			const action = removeTerm( siteId, taxonomyName, 777 );

			expect( action ).to.eql( {
				type: TERM_REMOVE,
				siteId: siteId,
				taxonomy: taxonomyName,
				termId: 777
			} );
		} );
	} );

	describe( '#requestSiteTerms()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.1/sites/${ siteId }/taxonomies/${ taxonomyName }/terms` )
				.reply( 200, {
					found: 2,
					terms: testTerms
				} )
				.get( '/rest/v1.1/sites/12345/taxonomies/chicken-and-ribs/terms' )
				.reply( 400, {
					message: 'The taxonomy does not exist',
					error: 'invalid_taxonomy'
				} );
		} );

		it( 'should dispatch a TERMS_REQUEST', () => {
			requestSiteTerms( siteId, taxonomyName )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: TERMS_REQUEST,
				siteId: siteId,
				taxonomy: taxonomyName,
				query: {}
			} );
		} );

		it( 'should dispatch a TERMS_RECEIVE event on success', () => {
			return requestSiteTerms( siteId, taxonomyName )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERMS_RECEIVE,
					siteId: siteId,
					taxonomy: taxonomyName,
					terms: testTerms,
					query: {},
					found: 2
				} );
			} );
		} );

		it( 'should dispatch TERMS_REQUEST_SUCCESS action when request succeeds', () => {
			return requestSiteTerms( siteId, taxonomyName )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERMS_REQUEST_SUCCESS,
					siteId: siteId,
					taxonomy: taxonomyName,
					query: {}
				} );
			} );
		} );

		it( 'should dispatch TERMS_REQUEST_FAILURE action when request fails', () => {
			return requestSiteTerms( 12345, 'chicken-and-ribs' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERMS_REQUEST_FAILURE,
					siteId: 12345,
					taxonomy: 'chicken-and-ribs',
					query: {},
					error: sinon.match( { error: 'invalid_taxonomy' } )
				} );
			} );
		} );
	} );

	describe( 'updateTerm()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/${ taxonomyName }/terms/slug:rib` )
				.reply( 200, {
					ID: 123,
					name: 'ribs',
					description: ''
				} )
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/${ categoryTaxonomyName }/terms/slug:rib` )
				.reply( 200, {
					ID: 123,
					name: 'ribs',
					description: ''
				} )
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/${ taxonomyName }/terms/slug:toto` )
				.reply( 400, {
					message: 'The taxonomy does not exist',
					error: 'invalid_taxonomy'
				} );
		} );

		it( 'should dispatch a TERMS_RECEIVE, TERM_REMOVE POST_EDIT and SITE_SETTINGS_UPDATE on Success', () => {
			const postObjects = {
				[ siteId ]: {
					'0fcb4eb16f493c19b627438fdc18d57c': {
						ID: 120,
						site_ID: siteId,
						global_ID: 'f0cb4eb16f493c19b627438fdc18d57c',
						title: 'Steak &amp; Eggs',
						terms: {
							[ categoryTaxonomyName ]: [
								{ ID: 10, name: 'old category name', slug: 'old' }
							]
						}
					}
				}
			};
			const state = {
				posts: {
					queries: {
						[ siteId ]: new PostQueryManager( {
							items: postObjects[ siteId ]
						} )
					},
				},
				siteSettings: {
					items: {
						[ siteId ]: {
							default_category: 10
						}
					}
				},
				terms: {
					queries: {
						[ siteId ]: {
							[ categoryTaxonomyName ]: new TermQueryManager( {
								items: {
									11: { ID: 11, name: 'chicken', slug: 'chicken', parent: 10 }
								},
								queries: {}
							} )
						}
					}
				}
			};
			const getState = () => state;

			return updateTerm( siteId, categoryTaxonomyName, 10, 'rib', { name: 'ribs' } )( spy, getState ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERM_REMOVE,
					siteId: siteId,
					taxonomy: categoryTaxonomyName,
					termId: 10
				} );
				expect( spy ).to.have.been.calledWith( {
					type: TERMS_RECEIVE,
					siteId: siteId,
					taxonomy: categoryTaxonomyName,
					terms: [
						{ ID: 11, name: 'chicken', slug: 'chicken', parent: 123 },
						{ ID: 123, name: 'ribs', description: '' }
					],
					query: undefined,
					found: undefined
				} );
				expect( spy ).to.have.been.calledWith( {
					type: POST_EDIT,
					siteId: siteId,
					postId: 120,
					post: {
						terms: {
							[ categoryTaxonomyName ]: [ { ID: 123, name: 'ribs', description: '' } ]
						}
					}
				} );
				expect( spy ).to.have.been.calledWith( {
					type: SITE_SETTINGS_UPDATE,
					siteId: siteId,
					settings: {
						default_category: 123
					}
				} );
			} );
		} );

		it( 'should not dispatch SITE_SETTINGS_UPDATE on Success if the taxonomy is not equal to "category"', () => {
			const state = {
				posts: { queries: {} },
				siteSettings: {
					items: {
						[ siteId ]: {
							default_category: 10
						}
					}
				},
				terms: {
					queries: {
						[ siteId ]: {
							[ taxonomyName ]: new TermQueryManager( {
								items: {
									11: { ID: 11, name: 'chicken', slug: 'chicken', parent: 10 }
								},
								queries: {}
							} )
						}
					}
				}
			};
			const getState = () => state;

			return updateTerm( siteId, taxonomyName, 10, 'rib', { name: 'ribs' } )( spy, getState ).then( () => {
				expect( spy ).to.not.have.been.calledWith( {
					type: SITE_SETTINGS_UPDATE,
					siteId: siteId,
					settings: {
						default_category: 123
					}
				} );
			} );
		} );
	} );

	describe( 'deleteTerm()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/${ taxonomyName }/terms/slug:ribs/delete` )
				.reply( 200, { status: 'ok' } )
				.post( `/rest/v1.1/sites/${ siteId }/taxonomies/${ categoryTaxonomyName }/terms/slug:ribs/delete` )
				.reply( 200, { status: 'ok' } );
		} );

		it( 'should dispatch a TERMS_RECEIVE, TERM_REMOVE and POST_EDIT on Success', () => {
			const postObjects = {
				[ siteId ]: {
					'0fcb4eb16f493c19b627438fdc18d57c': {
						ID: 120,
						site_ID: siteId,
						global_ID: 'f0cb4eb16f493c19b627438fdc18d57c',
						title: 'Steak &amp; Eggs',
						terms: {
							[ taxonomyName ]: [
								{ ID: 10, name: 'ribs', slug: 'ribs' }
							]
						}
					}
				}
			};
			const state = {
				posts: {
					queries: {
						[ siteId ]: new PostQueryManager( {
							items: postObjects[ siteId ]
						} )
					},
				},
				terms: {
					queries: {
						[ siteId ]: {
							[ taxonomyName ]: new TermQueryManager( {
								items: {
									5: { ID: 5, name: 'chicken', slug: 'chicken', parent: 0 },
									10: { ID: 10, name: 'ribs', slug: 'ribs', parent: 5 },
									15: { ID: 15, name: 'chicken ribs', slug: 'chicken-ribs', parent: 10 }
								},
								queries: {}
							} )
						}
					}
				}
			};
			const getState = () => state;

			return deleteTerm( siteId, taxonomyName, 10, 'ribs' )( spy, getState ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERMS_RECEIVE,
					siteId: siteId,
					taxonomy: taxonomyName,
					terms: [ { ID: 15, name: 'chicken ribs', slug: 'chicken-ribs', parent: 5 } ],
					query: undefined,
					found: undefined
				} );
				expect( spy ).to.have.been.calledWith( {
					type: POST_EDIT,
					siteId: siteId,
					postId: 120,
					post: {
						terms: {
							[ taxonomyName ]: []
						}
					}
				} );
				expect( spy ).to.have.been.calledWith( {
					type: TERM_REMOVE,
					siteId: siteId,
					taxonomy: taxonomyName,
					termId: 10
				} );
				expect( spy ).to.not.have.been.calledWith( {
					type: TERMS_RECEIVE,
					siteId: siteId,
					taxonomy: taxonomyName,
					terms: []
				} );
			} );
		} );

		it( 'should dispatch a TERMS_RECEIVE for default category on Success', () => {
			const state = {
				posts: {
					queries: {
						[ siteId ]: new PostQueryManager( {
							items: {}
						} )
					},
				},
				siteSettings: {
					items: {
						[ siteId ]: { default_category: 5 }
					}
				},
				terms: {
					queries: {
						[ siteId ]: {
							[ categoryTaxonomyName ]: new TermQueryManager( {
								items: {
									5: { ID: 5, name: 'chicken', slug: 'chicken', parent: 0, post_count: 10 },
									10: { ID: 10, name: 'ribs', slug: 'ribs', parent: 5, post_count: 2 }
								},
								queries: {}
							} )
						}
					}
				}
			};
			const getState = () => state;

			return deleteTerm( siteId, categoryTaxonomyName, 10, 'ribs' )( spy, getState ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TERMS_RECEIVE,
					siteId: siteId,
					taxonomy: categoryTaxonomyName,
					terms: [ { ID: 5, name: 'chicken', slug: 'chicken', parent: 0, post_count: 12 } ],
					query: undefined,
					found: undefined
				} );
				expect( spy ).to.have.been.calledWith( {
					type: TERM_REMOVE,
					siteId: siteId,
					taxonomy: categoryTaxonomyName,
					termId: 10
				} );
			} );
		} );

		it( 'should not dispatch a TERMS_RECEIVE for default category when prior category had no post_count', () => {
			const state = {
				posts: {
					queries: {
						[ siteId ]: new PostQueryManager( {
							items: {}
						} )
					},
				},
				siteSettings: {
					items: {
						[ siteId ]: { default_category: 5 }
					}
				},
				terms: {
					queries: {
						[ siteId ]: {
							[ categoryTaxonomyName ]: new TermQueryManager( {
								items: {
									5: { ID: 5, name: 'chicken', slug: 'chicken', parent: 0, post_count: 10 },
									10: { ID: 10, name: 'ribs', slug: 'ribs', parent: 5 }
								},
								queries: {}
							} )
						}
					}
				}
			};
			const getState = () => state;

			return deleteTerm( siteId, categoryTaxonomyName, 10, 'ribs' )( spy, getState ).then( () => {
				expect( spy ).to.not.have.been.calledWith( {
					type: TERMS_RECEIVE,
					siteId: siteId,
					taxonomy: categoryTaxonomyName,
					terms: [ { ID: 5, name: 'chicken', slug: 'chicken', parent: 0, post_count: 10 } ],
					query: undefined,
					found: undefined
				} );
				expect( spy ).to.have.been.calledWith( {
					type: TERM_REMOVE,
					siteId: siteId,
					taxonomy: categoryTaxonomyName,
					termId: 10
				} );
			} );
		} );

		it( 'should not dispatch any action on Failure', () => {
			return updateTerm( siteId, taxonomyName, 10, 'toto', { name: 'ribs' } )( spy ).catch( () => {
				expect( spy ).not.to.have.been.called;
			} );
		} );
	} );
} );
