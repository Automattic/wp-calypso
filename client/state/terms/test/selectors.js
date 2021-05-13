/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	countFoundTermsForQuery,
	getTerm,
	getTerms,
	getTermsForQuery,
	getTermsForQueryIgnoringPage,
	getTermsLastPageForQuery,
	isRequestingTermsForQuery,
	isRequestingTermsForQueryIgnoringPage,
} from '../selectors';
import TermQueryManager from 'calypso/lib/query-manager/term';

describe( 'selectors', () => {
	beforeEach( () => {
		getTermsForQuery.memoizedSelector.cache.clear();
		getTermsForQueryIgnoringPage.memoizedSelector.cache.clear();
	} );

	describe( 'isRequestingTermsForQuery()', () => {
		test( 'should return false if no request exists', () => {
			const requesting = isRequestingTermsForQuery(
				{
					terms: {
						queryRequests: {},
					},
				},
				2916284,
				'category',
				{}
			);

			expect( requesting ).to.be.false;
		} );

		test( 'should return false if query is not requesting', () => {
			const requesting = isRequestingTermsForQuery(
				{
					terms: {
						queryRequests: {
							2916284: {
								category: {
									'{"search":"ribs"}': false,
								},
							},
						},
					},
				},
				2916284,
				'category',
				{ search: 'ribs' }
			);

			expect( requesting ).to.be.false;
		} );

		test( 'should return true if query is in progress', () => {
			const requesting = isRequestingTermsForQuery(
				{
					terms: {
						queryRequests: {
							2916284: {
								category: {
									'{"search":"ribs"}': true,
								},
							},
						},
					},
				},
				2916284,
				'category',
				{ search: 'ribs' }
			);

			expect( requesting ).to.be.true;
		} );
	} );

	describe( 'isRequestingTermsForQueryIgnoringPage()', () => {
		test( 'should return false if no request exists', () => {
			const requesting = isRequestingTermsForQueryIgnoringPage(
				{
					terms: {
						queryRequests: {},
					},
				},
				2916284,
				'categories',
				{}
			);

			expect( requesting ).to.be.false;
		} );

		test( 'should return false if query is not requesting', () => {
			const requesting = isRequestingTermsForQueryIgnoringPage(
				{
					terms: {
						queries: {
							2916284: {
								categories: new TermQueryManager( {
									queries: {
										'[["search","ribs"]]': {
											itemKeys: [ 123, 124 ],
											found: 2,
										},
									},
								} ),
							},
						},
						queryRequests: {
							2916284: {
								categories: {
									'{"search":"ribs","page":1,"number":1}': false,
									'{"search":"ribs","page":2,"number":1}': false,
								},
							},
						},
					},
				},
				2916284,
				'categories',
				{ search: 'ribs', page: 1, number: 1 }
			);

			expect( requesting ).to.be.false;
		} );

		test( 'should return true if any query is in progress', () => {
			const requesting = isRequestingTermsForQueryIgnoringPage(
				{
					terms: {
						queries: {
							2916284: {
								categories: new TermQueryManager( {
									queries: {
										'[["search","ribs"]]': {
											itemKeys: [ 123, 124 ],
											found: 2,
										},
									},
								} ),
							},
						},
						queryRequests: {
							2916284: {
								categories: {
									'{"search":"ribs","page":1,"number":1}': false,
									'{"search":"ribs","page":2,"number":1}': true,
								},
							},
						},
					},
				},
				2916284,
				'categories',
				{ search: 'ribs', page: 1, number: 1 }
			);

			expect( requesting ).to.be.true;
		} );
	} );

	describe( 'getTermsForQuery()', () => {
		test( 'should return null if no matching query results exist', () => {
			const terms = getTermsForQuery(
				{
					terms: {
						queries: {},
					},
				},
				2916284,
				'category',
				{}
			);

			expect( terms ).to.be.null;
		} );

		test( 'should return an empty array if no matches exist', () => {
			const terms = getTermsForQuery(
				{
					terms: {
						queries: {
							2916284: {
								category: new TermQueryManager( {
									items: {},
									queries: {
										'[["search","ribs"]]': {
											itemKeys: [],
										},
									},
								} ),
							},
						},
					},
				},
				2916284,
				'category',
				{ search: 'ribs' }
			);

			expect( terms ).to.eql( [] );
		} );

		test( 'should return matching terms', () => {
			const terms = getTermsForQuery(
				{
					terms: {
						queries: {
							2916284: {
								category: new TermQueryManager( {
									items: {
										111: {
											ID: 111,
											name: 'Chicken and a biscuit',
										},
										112: {
											ID: 112,
											name: 'Ribs',
										},
									},
									queries: {
										'[["search","ribs"]]': {
											itemKeys: [ 111 ],
										},
									},
								} ),
							},
						},
					},
				},
				2916284,
				'category',
				{ search: 'ribs' }
			);

			expect( terms ).to.eql( [
				{
					ID: 111,
					name: 'Chicken and a biscuit',
				},
			] );
		} );
	} );

	describe( 'getTermsForQueryIgnoringPage', () => {
		test( 'should return null if site has not received terms', () => {
			const terms = getTermsForQueryIgnoringPage(
				{
					terms: {
						queries: {
							2916284: {},
						},
					},
				},
				2916284,
				'category',
				{ search: 'i', page: 2, number: 1 }
			);

			expect( terms ).to.be.null;
		} );

		test( 'should return null if site is not tracking query for taxonomy', () => {
			const terms = getTermsForQueryIgnoringPage(
				{
					terms: {
						queries: {
							2916284: {
								category: new TermQueryManager( {
									items: {
										123: {
											ID: 123,
											name: 'Chicken',
											slug: 'chicken',
										},
										124: {
											ID: 124,
											name: 'Ribs',
											slug: 'ribs',
										},
									},
									queries: {
										'[["search","i"]]': {
											itemKeys: [ 123, 124 ],
											found: 2,
										},
									},
								} ),
							},
						},
					},
				},
				2916284,
				'category',
				{ search: 'icken', page: 2, number: 1 }
			);

			expect( terms ).to.be.null;
		} );

		test( 'should return terms ignoring page param', () => {
			const terms = getTermsForQueryIgnoringPage(
				{
					terms: {
						queries: {
							2916284: {
								category: new TermQueryManager( {
									items: {
										123: {
											ID: 123,
											name: 'Chicken',
											slug: 'chicken',
										},
										124: {
											ID: 124,
											name: 'Ribs',
											slug: 'ribs',
										},
									},
									queries: {
										'[["search","i"]]': {
											itemKeys: [ 123, 124 ],
											found: 2,
										},
									},
								} ),
							},
						},
					},
				},
				2916284,
				'category',
				{ search: 'i', page: 2, number: 1 }
			);

			expect( terms ).to.eql( [
				{
					ID: 123,
					name: 'Chicken',
					slug: 'chicken',
				},
				{
					ID: 124,
					name: 'Ribs',
					slug: 'ribs',
				},
			] );
		} );
	} );

	describe( 'getTermsLastPageForQuery()', () => {
		test( 'should return null if the taxonomy is not tracked', () => {
			const lastPage = getTermsLastPageForQuery(
				{
					terms: {
						queries: {},
					},
				},
				2916284,
				'category',
				{ search: 'Hello' }
			);

			expect( lastPage ).to.be.null;
		} );

		test( 'should return null if the terms query is not tracked', () => {
			const lastPage = getTermsLastPageForQuery(
				{
					terms: {
						queries: {
							category: new TermQueryManager(),
						},
					},
				},
				2916284,
				'category',
				{ search: 'Hello' }
			);

			expect( lastPage ).to.be.null;
		} );

		test( 'should return the last page value for a query', () => {
			const lastPage = getTermsLastPageForQuery(
				{
					terms: {
						queries: {
							2916284: {
								category: new TermQueryManager( {
									items: {
										123: {
											ID: 123,
											name: 'Chicken',
											slug: 'chicken',
										},
										124: {
											ID: 124,
											name: 'Ribs',
											slug: 'ribs',
										},
									},
									queries: {
										'[["search","i"]]': {
											itemKeys: [ 123, 124 ],
											found: 2,
										},
									},
								} ),
							},
						},
					},
				},
				2916284,
				'category',
				{ search: 'i', number: 1 }
			);

			expect( lastPage ).to.equal( 2 );
		} );

		test( 'should return the last page value for a terms query, even if including page param', () => {
			const lastPage = getTermsLastPageForQuery(
				{
					terms: {
						queries: {
							2916284: {
								category: new TermQueryManager( {
									items: {
										123: {
											ID: 123,
											name: 'Chicken',
											slug: 'chicken',
										},
										124: {
											ID: 124,
											name: 'Ribs',
											slug: 'ribs',
										},
									},
									queries: {
										'[["search","i"]]': {
											itemKeys: [ 123, 124 ],
											found: 2,
										},
									},
								} ),
							},
						},
					},
				},
				2916284,
				'category',
				{ search: 'i', page: 2, number: 1 }
			);

			expect( lastPage ).to.equal( 2 );
		} );

		test( 'should return 1 if there are no results for a query', () => {
			const lastPage = getTermsLastPageForQuery(
				{
					terms: {
						queries: {
							2916284: {
								category: new TermQueryManager( {
									items: {},
									queries: {
										'[["search","unappetizing"]]': {
											itemKeys: [],
											found: 0,
										},
									},
								} ),
							},
						},
					},
				},
				2916284,
				'category',
				{ search: 'unappetizing' }
			);

			expect( lastPage ).to.equal( 1 );
		} );
	} );

	describe( 'getTerms()', () => {
		test( 'should return null if no site exists', () => {
			const terms = getTerms(
				{
					terms: {
						queries: {},
					},
				},
				2916284,
				'jetpack-portfolio'
			);

			expect( terms ).to.be.null;
		} );

		test( 'should return null if no terms exist for site taxonomy', () => {
			const terms = getTerms(
				{
					terms: {
						queries: {
							2916284: {
								'jetpack-portfolio': new TermQueryManager( {
									items: {
										111: {
											ID: 111,
											name: 'Chicken and a biscuit',
										},
									},
									queries: {},
								} ),
							},
						},
					},
				},
				2916284,
				'jetpack-testimonials'
			);

			expect( terms ).to.be.null;
		} );

		test( 'should return array of matching terms for site taxonomy combo', () => {
			const terms = getTerms(
				{
					terms: {
						queries: {
							2916284: {
								'jetpack-portfolio': new TermQueryManager( {
									items: {
										111: {
											ID: 111,
											name: 'Chicken and a biscuit',
										},
										112: {
											ID: 112,
											name: 'Ribs',
										},
									},
									queries: {},
								} ),
							},
						},
					},
				},
				2916284,
				'jetpack-portfolio'
			);

			expect( terms ).to.eql( [
				{
					ID: 111,
					name: 'Chicken and a biscuit',
				},
				{
					ID: 112,
					name: 'Ribs',
				},
			] );
		} );
	} );

	describe( 'getTerm()', () => {
		test( 'should return null if no site exists', () => {
			const term = getTerm(
				{
					terms: {
						queries: {},
					},
				},
				2916284,
				'jetpack-portfolio',
				111
			);

			expect( term ).to.be.null;
		} );

		test( 'should return term', () => {
			const term = getTerm(
				{
					terms: {
						queries: {
							2916284: {
								'jetpack-portfolio': new TermQueryManager( {
									items: {
										111: {
											ID: 111,
											name: 'Chicken and a biscuit',
										},
										112: {
											ID: 112,
											name: 'Ribs',
										},
									},
									queries: {},
								} ),
							},
						},
					},
				},
				2916284,
				'jetpack-portfolio',
				111
			);

			expect( term ).to.eql( {
				ID: 111,
				name: 'Chicken and a biscuit',
			} );
		} );

		test( 'should return null if term does not exist', () => {
			const term = getTerm(
				{
					terms: {
						queries: {
							2916284: {
								'jetpack-portfolio': new TermQueryManager( {
									items: {
										111: {
											ID: 111,
											name: 'Chicken and a biscuit',
										},
										112: {
											ID: 112,
											name: 'Ribs',
										},
									},
									queries: {},
								} ),
							},
						},
					},
				},
				2916284,
				'jetpack-portfolio',
				100
			);

			expect( term ).to.be.null;
		} );
	} );

	describe( 'countFoundTermsForQuery()', () => {
		test( 'should return null if no matching query results exist', () => {
			const count = countFoundTermsForQuery(
				{
					terms: {
						queries: {},
					},
				},
				2916284,
				'category',
				{}
			);

			expect( count ).to.be.null;
		} );

		test( 'should return the found value of the query', () => {
			const count = countFoundTermsForQuery(
				{
					terms: {
						queries: {
							2916284: {
								category: new TermQueryManager( {
									items: {
										111: {
											ID: 111,
											name: 'Chicken and a biscuit',
										},
										112: {
											ID: 112,
											name: 'Ribs',
										},
									},
									queries: {
										'[["search","ribs"]]': {
											itemKeys: [ 111 ],
											found: 4,
										},
									},
								} ),
							},
						},
					},
				},
				2916284,
				'category',
				{ search: 'ribs' }
			);

			expect( count ).to.eql( 4 );
		} );
	} );
} );
