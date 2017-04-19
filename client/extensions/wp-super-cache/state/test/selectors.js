/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingSettings,
	getSettings,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isRequestingSettings()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				}
			};
			const isRequesting = isRequestingSettings( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						requesting: {
							[ primarySiteId ]: true,
						}
					}
				}
			};
			const isRequesting = isRequestingSettings( state, secondarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the settings are not being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						requesting: {
							[ primarySiteId ]: false,
						}
					}
				}
			};
			const isRequesting = isRequestingSettings( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the settings are being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						requesting: {
							[ primarySiteId ]: true,
						}
					}
				}
			};
			const isRequesting = isRequestingSettings( state, primarySiteId );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'getSettings()', () => {
		const primarySettings = { is_cache_enabled: true };

		it( 'should return null if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				}
			};
			const settings = getSettings( state, primarySiteId );

			expect( settings ).to.be.null;
		} );

		it( 'should return null if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						items: {
							[ primarySiteId ]: primarySettings,
						}
					}
				}
			};
			const settings = getSettings( state, secondarySiteId );

			expect( settings ).to.be.null;
		} );

		it( 'should return the settings for a siteId', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						items: {
							[ primarySiteId ]: primarySettings,
						}
					}
				}
			};
			const settings = getSettings( state, primarySiteId );

			expect( settings ).to.eql( primarySettings );
		} );
	} );
} );
