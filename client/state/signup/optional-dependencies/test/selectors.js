import { expect } from 'chai';
import { getSuggestedUsername } from '../selectors';

describe( 'selectors', () => {
	test( 'should return string if no username suggestions', () => {
		expect( getSuggestedUsername( { signup: undefined } ) ).to.be.eql( '' );
	} );

	test( 'should return suggestedUsername', () => {
		expect(
			getSuggestedUsername( {
				signup: {
					optionalDependencies: { suggestedUsername: 'testUsernameSuggestion' },
				},
			} )
		).to.be.eql( 'testUsernameSuggestion' );
	} );
} );
