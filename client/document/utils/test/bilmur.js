import config from '@automattic/calypso-config';
import { isBilmurSpaEnabled } from '../bilmur';

jest.mock( '@automattic/calypso-config', () => {
	const mock = jest.fn();
	mock.isEnabled = jest.fn();
	return mock;
} );

describe( 'isBilmurSpaEnabled', () => {
	it( 'is enabled for the main entry point alone', () => {
		config.isEnabled.mockImplementation( ( feature ) => feature === 'bilmur-spa' );

		expect( isBilmurSpaEnabled( 'entry-main' ) ).toBe( true );
		expect( isBilmurSpaEnabled( 'entry-stepper' ) ).toBe( false );
	} );

	it( 'is disabled without the feature', () => {
		config.isEnabled.mockReturnValue( false );

		expect( isBilmurSpaEnabled( 'entry-main' ) ).toBe( false );
	} );
} );
