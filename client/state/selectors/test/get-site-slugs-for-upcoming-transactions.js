/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getSiteSlugsForUpcomingTransactions from 'state/selectors/get-site-slugs-for-upcoming-transactions';

describe( 'getSiteSlugsForUpcomingTransactions()', () => {
	beforeEach( () => {
		getSiteSlugsForUpcomingTransactions.memoizedSelector.cache.clear();
	} );

	test( 'should return slugs for sites with transactions only', () => {
		const state = {
			sites: {
				items: {
					2916284: {
						URL: 'https://example.wordpress.com',
					},
				},
			},
			billingTransactions: {
				items: {
					upcoming: [
						{ id: 123456, blog_id: '2916284' },
						{ id: 888888, blog_id: '1234567' },
					],
				},
			},
		};
		const output = getSiteSlugsForUpcomingTransactions( state );
		expect( output ).to.eql( {
			2916284: 'example.wordpress.com',
		} );
	} );

	test( 'should not return duplicate slugs when multiple transactions are for the same site', () => {
		const state = {
			sites: {
				items: {
					2916284: {
						URL: 'https://example.wordpress.com',
					},
				},
			},
			billingTransactions: {
				items: {
					upcoming: [
						{ id: 123456, blog_id: '2916284' },
						{ id: 234567, blog_id: '2916284' },
					],
				},
			},
		};
		const output = getSiteSlugsForUpcomingTransactions( state );
		expect( output ).to.eql( {
			2916284: 'example.wordpress.com',
		} );
	} );

	test( 'should skip transactions with empty blog_id', () => {
		const state = {
			sites: {
				items: {},
			},
			billingTransactions: {
				items: {
					upcoming: [ { id: 234567, blog_id: null } ],
				},
			},
		};
		const output = getSiteSlugsForUpcomingTransactions( state );
		expect( output ).to.eql( {} );
	} );

	test( 'should skip sites that are not loaded yet', () => {
		const state = {
			sites: {
				items: {
					2916284: null,
				},
			},
			billingTransactions: {
				items: {
					upcoming: [ { id: 123456, blog_id: '2916284' } ],
				},
			},
		};
		const output = getSiteSlugsForUpcomingTransactions( state );
		expect( output ).to.eql( {} );
	} );
} );
