import { getActiveDowngradeVariant } from '../active-downgrade-variant';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

const mockIsEnabled = jest.requireMock( '@automattic/calypso-config' ).isEnabled as jest.Mock;

function enableFlags( ...flags: string[] ) {
	mockIsEnabled.mockImplementation( ( flag: string ) => flags.includes( flag ) );
}

describe( 'getActiveDowngradeVariant', () => {
	beforeEach( () => {
		mockIsEnabled.mockReset();
	} );

	test( 'returns "on_renewal" when scheduled-plan-downgrade is enabled (takes precedence)', () => {
		enableFlags( 'plans/scheduled-plan-downgrade', 'plans/active-plan-downgrade-instant' );
		expect( getActiveDowngradeVariant() ).toBe( 'on_renewal' );
	} );

	test( 'returns "instant" when only active-plan-downgrade-instant is enabled', () => {
		enableFlags( 'plans/active-plan-downgrade-instant' );
		expect( getActiveDowngradeVariant() ).toBe( 'instant' );
	} );

	test( 'returns "control" when neither flag is enabled', () => {
		enableFlags();
		expect( getActiveDowngradeVariant() ).toBe( 'control' );
	} );
} );
