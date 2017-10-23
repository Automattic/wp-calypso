/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSettings, isFetchingSettings } from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isFetchingSettings()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: undefined,
					},
				},
			};
			const isFetching = isFetchingSettings( state, primarySiteId );

			expect( isFetching ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							fetching: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isFetching = isFetchingSettings( state, secondarySiteId );

			expect( isFetching ).to.be.false;
		} );

		test( 'should return false if the settings are not being fetched', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							fetching: {
								[ primarySiteId ]: false,
							},
						},
					},
				},
			};
			const isFetching = isFetchingSettings( state, primarySiteId );

			expect( isFetching ).to.be.false;
		} );

		test( 'should return true if the settings are being fetched', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							fetching: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isFetching = isFetchingSettings( state, primarySiteId );

			expect( isFetching ).to.be.true;
		} );
	} );

	describe( 'getSettings()', () => {
		const primarySettings = { job_manager_hide_expired: true };

		test( 'should return an empty object if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: undefined,
					},
				},
			};
			const settings = getSettings( state, primarySiteId );

			expect( settings ).to.deep.equal( {} );
		} );

		test( 'should return an empty object if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							items: {
								[ primarySiteId ]: primarySettings,
							},
						},
					},
				},
			};
			const settings = getSettings( state, secondarySiteId );

			expect( settings ).to.deep.equal( {} );
		} );

		test( 'should return the settings for a siteId', () => {
			const state = {
				extensions: {
					wpJobManager: {
						settings: {
							items: {
								[ primarySiteId ]: primarySettings,
							},
						},
					},
				},
			};
			const settings = getSettings( state, primarySiteId );

			expect( settings ).to.deep.equal( primarySettings );
		} );
	} );
} );
