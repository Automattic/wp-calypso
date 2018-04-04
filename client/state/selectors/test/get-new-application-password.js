/** @format */

/**
 * Internal dependencies
 */
import { getNewApplicationPassword } from 'state/selectors';

describe( 'getNewApplicationPassword()', () => {
	test( 'should return the new application password if it exists', () => {
		const newPassword = 'abcd 1234 efgh 5678';
		const state = {
			applicationPasswords: {
				newPassword,
			},
		};
		const result = getNewApplicationPassword( state );
		expect( result ).toEqual( newPassword );
	} );

	test( 'should return null if there is currently no new application password', () => {
		const state = {
			applicationPasswords: {
				newPassword: null,
			},
		};
		const result = getNewApplicationPassword( state );
		expect( result ).toBeNull();
	} );

	test( 'should return null with an empty state', () => {
		const result = getNewApplicationPassword( undefined );
		expect( result ).toBeNull();
	} );
} );
