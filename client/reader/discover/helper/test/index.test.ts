import { isEnabled } from '@automattic/calypso-config';
import { when } from 'jest-when';
import { getDefaultTab } from '../';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn().mockReturnValue( false ),
} ) );

describe( 'getDefaultSelectedTab', () => {
	it( 'returns the recommended tab when the feature flag is disabled', () => {
		when( isEnabled ).calledWith( 'reader/discover/freshly-pressed' ).mockReturnValue( false );

		expect( getDefaultTab() ).toBe( 'recommended' );
	} );

	it( 'returns the freshly pressed tab when the feature flag is enabled', () => {
		when( isEnabled ).calledWith( 'reader/discover/freshly-pressed' ).mockReturnValue( true );

		expect( getDefaultTab() ).toBe( 'freshly-pressed' );
	} );
} );
