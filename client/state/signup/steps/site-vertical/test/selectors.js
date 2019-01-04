/** @format */

/**
 * Internal dependencies
 */
import { getSiteVerticalName, getSiteVerticalSlug } from '../selectors';

describe( 'selectors', () => {
	const state = {
		signup: {
			steps: {
				siteVertical: {
					name: 'felice',
					slug: 'happy',
				},
			},
		},
	};
	describe( 'getSiteVerticalName', () => {
		test( 'should return empty string as a default state', () => {
			expect( getSiteVerticalName( {} ) ).toEqual( '' );
		} );

		test( 'should return site vertical from the state', () => {
			expect( getSiteVerticalName( state ) ).toEqual( state.signup.steps.siteVertical.name );
		} );
	} );
	describe( 'getSiteVerticalSlug', () => {
		test( 'should return empty string as a default state', () => {
			expect( getSiteVerticalSlug( {} ) ).toEqual( '' );
		} );

		test( 'should return site vertical from the state', () => {
			expect( getSiteVerticalSlug( state ) ).toEqual( state.signup.steps.siteVertical.slug );
		} );
	} );
} );
