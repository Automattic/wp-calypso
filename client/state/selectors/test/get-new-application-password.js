/**
 * Internal dependencies
 */
import getNewApplicationPassword from 'calypso/state/selectors/get-new-application-password';

describe( 'getNewApplicationPassword()', () => {
	test( 'should return the new application password if it exists', () => {
		const newPassword = 'abcd 1234 efgh 5678';
		const state = {
			applicationPasswords: {
				newPassword,
			},
		};
		const result = getNewApplicationPassword( state );
		expect( result ).toBe( newPassword );
	} );

	test( 'should return null with an empty state', () => {
		const result = getNewApplicationPassword( undefined );
		expect( result ).toBeNull();
	} );
} );
