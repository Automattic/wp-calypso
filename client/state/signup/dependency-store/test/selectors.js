import { getSignupDependencyStore } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty object as a default state', () => {
		expect( getSignupDependencyStore( { signup: undefined }, {} ) ).toEqual( {} );
	} );

	test( 'should return signupDependencyStore instance from the state', () => {
		expect(
			getSignupDependencyStore(
				{
					signup: {
						dependencyStore: { test: 123 },
					},
				},
				{}
			)
		).toEqual( { test: 123 } );
	} );
} );
