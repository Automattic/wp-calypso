jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

import { isEnabled } from '@automattic/calypso-config';
import { isLeadMatchingSectionEnabled } from '../lead-matching-visibility';

const mockedIsEnabled = isEnabled as jest.MockedFunction< typeof isEnabled >;

describe( 'lead matching visibility', () => {
	beforeEach( () => {
		mockedIsEnabled.mockReset();
	} );

	it( 'returns true when the global feature flag is enabled', () => {
		mockedIsEnabled.mockReturnValue( true );

		expect( isLeadMatchingSectionEnabled() ).toBe( true );
	} );

	it( 'returns false when the global feature flag is disabled', () => {
		mockedIsEnabled.mockReturnValue( false );

		expect( isLeadMatchingSectionEnabled() ).toBe( false );
	} );
} );
