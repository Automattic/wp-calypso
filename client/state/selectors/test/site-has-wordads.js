import siteHasWordAds from 'calypso/state/selectors/site-has-wordads';

const siteId = '123001';

describe( 'selectors', () => {
	describe( '#siteHasWordAds()', () => {
		test( "should return TRUE when site's active features include wordads", () => {
			const activeFeatures = [ 'feature_active_01', 'wordads', 'feature_active_03' ];
			const state = {
				sites: {
					features: {
						123001: {
							data: {
								active: activeFeatures,
							},
						},
					},
				},
			};

			const hasWordAdsFeature = siteHasWordAds( state, siteId );
			expect( hasWordAdsFeature ).toEqual( true );
		} );

		test( "should return False when site's features does not include wordads", () => {
			const activeFeatures = [ 'feature_active_01', 'feature_active_02' ];
			const state = {
				sites: {
					features: {
						123001: {
							data: {
								active: activeFeatures,
							},
						},
					},
				},
			};

			const hasWordAdsFeature = siteHasWordAds( state, siteId );
			expect( hasWordAdsFeature ).toEqual( false );
		} );
	} );
} );
