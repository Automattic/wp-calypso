/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';

describe( 'selectors', () => {
	describe( '#isRequestingSiteFeatures()', () => {
		test( 'should return True if we are fetching features', () => {
			const state = {
				sites: {
					features: {
						123001: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: true,
						},

						123002: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: false,
						},
					},
				},
			};

			expect( isRequestingSiteFeatures( state, 123001 ) ).to.equal( true );
		} );

		test( 'should return False if we are not fetching features', () => {
			const state = {
				sites: {
					features: {
						123001: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: true,
						},

						123002: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: false,
						},
					},
				},
			};

			expect( isRequestingSiteFeatures( state, 123002 ) ).to.equal( false );
		} );

		test( 'should return False when site has not been synced', () => {
			const state = {
				sites: {
					features: {
						123001: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: true,
						},

						123002: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: false,
						},
					},
				},
			};

			expect( isRequestingSiteFeatures( state, 'unknown' ) ).to.equal( false );
		} );

		test( 'should return False when no site id', () => {
			const state = {
				sites: {
					features: {
						123001: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: true,
						},

						123002: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: false,
						},
					},
				},
			};

			expect( isRequestingSiteFeatures( state ) ).to.equal( false );
		} );
	} );
} );
