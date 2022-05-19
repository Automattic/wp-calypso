import { getSuggestedUsername } from '../selectors';

describe( 'selectors', () => {
	test( 'should return string if no username suggestions', () => {
		expect( getSuggestedUsername( { signup: undefined } ) ).toEqual( '' );
	} );

	test( 'should return suggestedUsername', () => {
		expect(
			getSuggestedUsername( {
				signup: {
					optionalDependencies: { suggestedUsername: 'testUsernameSuggestion' },
				},
			} )
		).toEqual( 'testUsernameSuggestion' );
	} );
} );
