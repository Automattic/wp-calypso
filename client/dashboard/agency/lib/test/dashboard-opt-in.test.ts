import { isEnabled } from '@automattic/calypso-config';
import { needsPreviousAgencyDashboard } from '../dashboard-opt-in';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

const mockedIsEnabled = jest.mocked( isEnabled );

describe( 'needsPreviousAgencyDashboard', () => {
	beforeEach( () => {
		mockedIsEnabled.mockReturnValue( true );
	} );

	it( 'sends agencies that are not on Billing Dragon to the previous dashboard', () => {
		expect( needsPreviousAgencyDashboard( { billing_system: 'legacy' } ) ).toBe( true );
	} );

	it( 'keeps agencies on Billing Dragon here', () => {
		expect( needsPreviousAgencyDashboard( { billing_system: 'billingdragon' } ) ).toBe( false );
	} );

	it( 'keeps everyone here while the opt-in is turned off', () => {
		mockedIsEnabled.mockReturnValue( false );

		expect( needsPreviousAgencyDashboard( { billing_system: 'legacy' } ) ).toBe( false );
	} );

	it( 'keeps people without an agency here', () => {
		expect( needsPreviousAgencyDashboard( null ) ).toBe( false );
	} );
} );
