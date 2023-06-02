import { canCurrentUser } from 'calypso/state/selectors/can-current-user';

describe( 'canCurrentUser()', () => {
	test( 'should return null if the site is not known', () => {
		const isCapable = canCurrentUser(
			{
				currentUser: {
					capabilities: {},
				},
			},
			2916284,
			'manage_options'
		);

		expect( isCapable ).toBeNull();
	} );

	test( 'should return the value for the specified capability', () => {
		const isCapable = canCurrentUser(
			{
				currentUser: {
					capabilities: {
						2916284: {
							manage_options: false,
						},
					},
				},
			},
			2916284,
			'manage_options'
		);

		expect( isCapable ).toBe( false );
	} );

	test( 'should return false if the capability is invalid', () => {
		const isCapable = canCurrentUser(
			{
				currentUser: {
					capabilities: {
						2916284: {
							manage_options: false,
						},
					},
				},
			},
			2916284,
			'manage_foo'
		);

		expect( isCapable ).toBe( false );
	} );
} );
