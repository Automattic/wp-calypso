jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

import { isEnabled } from '@automattic/calypso-config';
import {
	A4A_PARTNER_DIRECTORY_LEAD_MATCHING_PILOT_AGENCY_IDS,
	isLeadMatchingPilotAgency,
	isLeadMatchingSectionEnabled,
} from '../lead-matching-visibility';

const mockedIsEnabled = isEnabled as jest.MockedFunction< typeof isEnabled >;

describe( 'lead matching visibility', () => {
	beforeEach( () => {
		mockedIsEnabled.mockReset();
	} );

	it( 'returns true when the global feature flag is enabled', () => {
		mockedIsEnabled.mockReturnValue( true );

		expect( isLeadMatchingSectionEnabled() ).toBe( true );
	} );

	it( 'returns true for pilot agencies', () => {
		for ( const agencyId of A4A_PARTNER_DIRECTORY_LEAD_MATCHING_PILOT_AGENCY_IDS ) {
			expect( isLeadMatchingPilotAgency( agencyId ) ).toBe( true );
		}
	} );

	it( 'returns false for non-pilot agencies', () => {
		mockedIsEnabled.mockReturnValue( false );

		expect( isLeadMatchingPilotAgency( 123 ) ).toBe( false );
		expect( isLeadMatchingPilotAgency() ).toBe( false );
		expect( isLeadMatchingSectionEnabled() ).toBe( false );
	} );
} );
