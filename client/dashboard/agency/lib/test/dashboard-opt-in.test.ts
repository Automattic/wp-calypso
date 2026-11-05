import config, { isEnabled } from '@automattic/calypso-config';
import { needsPreviousAgencyDashboard } from '../dashboard-opt-in';

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: jest.fn(),
	isEnabled: jest.fn(),
} ) );

const mockedConfig = jest.mocked( config );
const mockedIsEnabled = jest.mocked( isEnabled );

describe( 'needsPreviousAgencyDashboard', () => {
	beforeEach( () => {
		mockedConfig.mockReturnValue( 'dashboard-production' );
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

	it.each( [ 'dashboard-development', 'dashboard-horizon' ] )(
		'keeps agencies that are not on Billing Dragon here on %s',
		( envId ) => {
			mockedConfig.mockReturnValue( envId );

			expect( needsPreviousAgencyDashboard( { billing_system: 'legacy' } ) ).toBe( false );
		}
	);
} );
