/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getFeed } from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 1234;
	const secondarySiteId = 4321;

	const primaryZoneId = 5678;
	const secondaryZoneId = 8765;

	describe( 'getFeed()', () => {
		const primaryFeed = [ 1, 2, 3, 4, 5 ];

		it( 'should return an empty array if no state exists', () => {
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

		it( 'should return an empty array if no feed is attached for the given site ID', () => {
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

		it( 'should return an empty array if no feed is attached for the given zone ID', () => {
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

		it( 'should return a feed for the given site and zone ID', () => {
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
