import config from '@automattic/calypso-config';
import { vi } from 'vitest';
import { isBilmurSpaEnabled } from '../bilmur';

vi.mock( '@automattic/calypso-config', () => {
	const mock = vi.fn();
	mock.isEnabled = vi.fn();
	return { ...mock, default: mock };
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
