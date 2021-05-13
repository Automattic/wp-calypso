/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteGoals } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty string as a default state', () => {
		expect( getSiteGoals( { signup: undefined } ) ).to.be.eql( '' );
	} );

	test( 'should return site goals from the state', () => {
		expect(
			getSiteGoals( {
				signup: {
					steps: {
						siteGoals: 'Showcase creative work',
					},
				},
			} )
		).to.be.eql( 'Showcase creative work' );
	} );
} );
