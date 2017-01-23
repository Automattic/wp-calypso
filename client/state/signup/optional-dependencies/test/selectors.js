/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSuggestedUsername } from '../selectors';

describe( 'selectors', () => {
	it( 'should return string if no username suggestions', () => {
		expect( getSuggestedUsername( { signup: undefined } ) ).to.be.eql( '' );
	} );

	it( 'should return suggestedUsername', () => {
		expect( getSuggestedUsername( {
			signup: {
				optionalDependencies: { suggestedUsername: 'testUsernameSuggestion' }
			}
		} ) ).to.be.eql( 'testUsernameSuggestion' );
	} );
} );
