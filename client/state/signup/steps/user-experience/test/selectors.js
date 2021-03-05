/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getUserExperience } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty string as a default state', () => {
		expect( getUserExperience( { signup: undefined } ) ).to.be.eql( '' );
	} );

	test( 'should return user experience level from the state', () => {
		expect(
			getUserExperience( {
				signup: {
					steps: {
						userExperience: 5,
					},
				},
			} )
		).to.be.eql( 5 );
	} );
} );
