/**
 * Internal dependencies
 */
import getApplicationPasswords from 'calypso/state/selectors/get-application-passwords';

describe( 'getApplicationPasswords()', () => {
	test( 'should return application passwords of the current user', () => {
		const appPasswords = [
			{
				ID: 12345,
				name: 'Example',
				value: '2018-01-01T00:00:00+00:00',
			},
			{
				ID: 23456,
				name: 'Test',
				value: '2018-02-01T08:10:00+00:00',
			},
		];
		const state = {
			applicationPasswords: {
				items: appPasswords,
			},
		};
		const result = getApplicationPasswords( state );
		expect( result ).toBe( appPasswords );
	} );

	test( 'should return an empty array with an empty state', () => {
		const result = getApplicationPasswords( undefined );
		expect( result ).toEqual( [] );
	} );
} );
