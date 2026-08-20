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

	it( 'is the honest progress card when the base flag is on', () => {
		mockFlags( { 'marketplace-honest-install-progress': true } );
		expect( getWaitVariant() ).toBe( 'honest_progress' );
	} );
} );
