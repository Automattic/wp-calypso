import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import { checkFeatureGating } from '../use-feature-gating';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = ( property: string ) => property === 'stats/paid-wpcom-v2';
	return config;
} );

describe( 'checkFeatureGating', () => {
	const siteId = 123;
	const mockState = {
		sites: {
			features: {
				[ siteId ]: {
					data: {
						active: [ FEATURE_STATS_PAID ],
					},
				},
			},
		},
	};

	it( 'should allow access when paid stats are enabled and the feature type is included', () => {
		const featureType = 'statsSearchTerms';
		// Mock siteHasFeature and isEnabled functions as necessary
		const result = checkFeatureGating( mockState, siteId, featureType );
		expect( result ).toBe( true );
	} );

	it( 'should not allow access when paid stats are enabled and the feature type is not included', () => {
		const featureType = 'nonExistentFeature';
		// Mock siteHasFeature and isEnabled functions as necessary
		const result = checkFeatureGating( mockState, siteId, featureType );
		expect( result ).toBe( false );
	} );
} );
