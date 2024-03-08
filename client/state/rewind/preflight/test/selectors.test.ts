import { isEnabled } from '@automattic/calypso-config';
import { getPreflightStatus } from '../selectors';
import { PreflightTestStatus } from '../types';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = jest.fn();
	return config;
} );

const mockPreflightFeatureFlag = ( isEnabledValue: boolean ) => {
	( isEnabled as jest.Mock ).mockImplementation( ( property: string ) => {
		if ( property === 'jetpack/backup-restore-preflight-checks' ) {
			return isEnabledValue;
		}

		return false;
	} );
};

const mockState = {
	rewind: {
		123: {
			preflight: {
				overallStatus: PreflightTestStatus.IN_PROGRESS,
				tests: [
					{ test: 'test1', status: PreflightTestStatus.SUCCESS },
					{ test: 'test2', status: PreflightTestStatus.IN_PROGRESS },
				],
			},
		},
	},
};

describe( 'getPreflightStatus', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return the correct overall preflight status from the state when feature flag is enabled', () => {
		mockPreflightFeatureFlag( true );
		const selectedStatus = getPreflightStatus( mockState, 123 );
		expect( selectedStatus ).toEqual( PreflightTestStatus.IN_PROGRESS );
	} );

	it( 'should return overall preflight status as failed when the feature flag is not enabled', () => {
		mockPreflightFeatureFlag( false );
		const selectedStatus = getPreflightStatus( mockState, 123 );
		expect( selectedStatus ).toEqual( PreflightTestStatus.FAILED );
	} );
} );
