/**
 * @jest-environment node
 */
import { generatePassword } from '../';

describe( 'generatePassword in Node', () => {
	test( 'does not require a browser window global', () => {
		expect( typeof window ).toBe( 'undefined' );
		expect( generatePassword() ).toHaveLength( 24 );
	} );
} );
