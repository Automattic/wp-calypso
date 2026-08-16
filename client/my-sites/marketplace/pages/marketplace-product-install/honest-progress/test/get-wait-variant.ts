import { isEnabled } from '@automattic/calypso-config';
import { getWaitVariant } from '../get-wait-variant';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

const mockFlags = ( flags: Record< string, boolean > ) => {
	( isEnabled as jest.Mock ).mockImplementation( ( flag: string ) => !! flags[ flag ] );
};

describe( 'getWaitVariant', () => {
	it( 'is the control when the base flag is off', () => {
		mockFlags( {} );
		expect( getWaitVariant() ).toBe( 'control' );
	} );

	it( 'is the narrated list with only the base flag on', () => {
		mockFlags( { 'marketplace-honest-install-progress': true } );
		expect( getWaitVariant() ).toBe( 'honest_progress' );
	} );

	it( 'is the scene when both flags are on', () => {
		mockFlags( {
			'marketplace-honest-install-progress': true,
			'marketplace-honest-install-progress-scene': true,
		} );
		expect( getWaitVariant() ).toBe( 'honest_scene' );
	} );

	it( 'never shows the scene without the base flag', () => {
		mockFlags( { 'marketplace-honest-install-progress-scene': true } );
		expect( getWaitVariant() ).toBe( 'control' );
	} );
} );
