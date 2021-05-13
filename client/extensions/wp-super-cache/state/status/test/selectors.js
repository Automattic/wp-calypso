/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingStatus, getStatus } from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isRequestingStatus()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				},
			};
			const isRequesting = isRequestingStatus( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						status: {
							requesting: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isRequesting = isRequestingStatus( state, secondarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return false if the status are not being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						status: {
							requesting: {
								[ primarySiteId ]: false,
							},
						},
					},
				},
			};
			const isRequesting = isRequestingStatus( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return true if the status are being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						status: {
							requesting: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isRequesting = isRequestingStatus( state, primarySiteId );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'getStatus()', () => {
		const primaryNotices = {
			cache_writable: {
				message: '/home/public_html/ is writable.',
				type: 'warning',
			},
		};

		test( 'should return empty object if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				},
			};
			const status = getStatus( state, primarySiteId );

			expect( status ).to.be.empty;
		} );

		test( 'should return empty object if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						status: {
							items: {
								[ primarySiteId ]: primaryNotices,
							},
						},
					},
				},
			};
			const status = getStatus( state, secondarySiteId );

			expect( status ).to.be.empty;
		} );

		test( 'should return the status for a siteId', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						status: {
							items: {
								[ primarySiteId ]: primaryNotices,
							},
						},
					},
				},
			};
			const status = getStatus( state, primarySiteId );

			expect( status ).to.eql( primaryNotices );
		} );
	} );
} );
