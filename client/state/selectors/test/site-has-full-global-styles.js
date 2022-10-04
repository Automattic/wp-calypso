import { WPCOM_FEATURES_GLOBAL_STYLES } from '@automattic/calypso-products';
import siteHasFullGlobalStyles from 'calypso/state/selectors/site-has-full-global-styles';

describe( 'selectors', () => {
	describe( '#siteHasFullGlobalStyles()', () => {
		test( 'should return true for legacy sites', () => {
			const state = {
				sites: {
					features: {
						210494206: {
							data: {
								active: [],
							},
						},
					},
				},
			};
			expect( siteHasFullGlobalStyles( state, 210494206 ) ).toEqual( true );
		} );

		test( 'should return true for sites with eligible purchases', () => {
			const state = {
				sites: {
					features: {
						210494207: {
							data: {
								active: [ WPCOM_FEATURES_GLOBAL_STYLES ],
							},
						},
					},
				},
			};
			expect( siteHasFullGlobalStyles( state, 210494207 ) ).toEqual( true );
		} );

		test( 'should return false for non-legacy sites without eligible purchases', () => {
			const state = {
				sites: {
					features: {
						210494207: {
							data: {
								active: [],
							},
						},
					},
				},
			};
			expect( siteHasFullGlobalStyles( state, 210494207 ) ).toEqual( false );
		} );
	} );
} );
