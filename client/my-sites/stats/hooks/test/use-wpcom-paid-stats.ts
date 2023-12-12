import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import { checkPaidStatsFeature } from '../use-wpcom-paid-stats';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = jest.fn();
	return config;
} );

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

describe( 'checkPaidStatsFeature for a wpcom site', () => {
	beforeAll( () => {
		( isEnabled as jest.Mock ).mockImplementation( ( property: string ) => {
			switch ( property ) {
				case 'stats/paid-wpcom-v2':
					return true;
				case 'is_running_in_jetpack_site':
					return false;
			}
		} );
	} );

	afterAll( () => {
		jest.clearAllMocks();
	} );

	it( 'should be true when feature type exists', () => {
		const featureType = 'statsSearchTerms';
		const result = checkPaidStatsFeature( mockState, siteId, featureType );
		expect( result ).toBe( true );
	} );

	it( 'should be false when feature type does not exist', () => {
		const featureType = 'nonExistentFeature';
		const result = checkPaidStatsFeature( mockState, siteId, featureType );
		expect( result ).toBe( false );
	} );
} );

describe( 'checkPaidStatsFeature for a non wpcom site', () => {
	beforeAll( () => {
		( isEnabled as jest.Mock ).mockImplementation( ( property: string ) => {
			switch ( property ) {
				case 'stats/paid-wpcom-v2':
					return true;
				case 'is_running_in_jetpack_site':
					return true;
			}
		} );
	} );

	afterAll( () => {
		jest.clearAllMocks();
	} );

	it( 'should be false when feature type exists', () => {
		const featureType = 'statsSearchTerms';
		const result = checkPaidStatsFeature( mockState, siteId, featureType );
		expect( result ).toBe( false );
	} );

	it( 'should be false when feature type does not exist', () => {
		const featureType = 'nonExistentFeature';
		const result = checkPaidStatsFeature( mockState, siteId, featureType );
		expect( result ).toBe( false );
	} );
} );
