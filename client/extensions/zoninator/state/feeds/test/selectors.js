/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getFeed, isRequestingFeed } from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 1234;
	const secondarySiteId = 4321;

	const primaryZoneId = 5678;
	const secondaryZoneId = 8765;

	describe( 'isRequestingFeed()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					zoninator: {
						feeds: undefined,
					},
				},
			};

			const isRequesting = isRequestingFeed( state, 123, 456 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if no site is attached', () => {
			const state = {
				extensions: {
					zoninator: {
						feeds: {
							requesting: {
								[ 123 ]: { 456: true },
							},
						},
					},
				},
			};

			const isRequesting = isRequestingFeed( state, 111, 456 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if a feed is being fetched', () => {
			const state = {
				extensions: {
					zoninator: {
						feeds: {
							requesting: {
								[ 123 ]: { 456: true },
							},
						},
					},
				},
			};

			const isRequesting = isRequestingFeed( state, 123, 456 );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'getFeed()', () => {
		const primaryFeed = [ 1, 2, 3, 4, 5 ];

		test( 'should return an empty array if no state exists', () => {
			const state = {
				extensions: {
					zoninator: {
						feeds: undefined,
					},
				},
			};

			const feed = getFeed( state, primarySiteId, primaryZoneId );

			expect( feed ).to.deep.equal( [] );
		} );

		test( 'should return an empty array if no feed is attached for the given site ID', () => {
			const state = {
				extensions: {
					zoninator: {
						feeds: {
							items: {
								[ primarySiteId ]: {
									[ primaryZoneId ]: primaryFeed,
								},
							},
						},
					},
				},
			};

			const feed = getFeed( state, secondarySiteId, primaryZoneId );

			expect( feed ).to.deep.equal( [] );
		} );

		test( 'should return an empty array if no feed is attached for the given zone ID', () => {
			const state = {
				extensions: {
					zoninator: {
						feeds: {
							items: {
								[ primarySiteId ]: {
									[ primaryZoneId ]: primaryFeed,
								},
							},
						},
					},
				},
			};

			const feed = getFeed( state, primarySiteId, secondaryZoneId );

			expect( feed ).to.deep.equal( [] );
		} );

		test( 'should return a feed for the given site and zone ID', () => {
			const state = {
				extensions: {
					zoninator: {
						feeds: {
							items: {
								[ primarySiteId ]: {
									[ primaryZoneId ]: primaryFeed,
								},
							},
						},
					},
				},
			};

			const feed = getFeed( state, primarySiteId, primaryZoneId );

			expect( feed ).to.deep.equal( primaryFeed );
		} );
	} );
} );
