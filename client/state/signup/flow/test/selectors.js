/** @format */

/**
 * Internal dependencies
 */
import { getCurrentFlowName, getCurrentStepName } from '../selectors';
describe( 'selectors', () => {
	describe( 'getCurrentFlowName()', () => {
		test( 'should return the current flow', () => {
			const name = 'sultana_wetsuit';
			expect(
				getCurrentFlowName( {
					signup: {
						flow: {
							name,
						},
					},
				} )
			).toEqual( name );
		} );

		test( 'should default to be an empty string', () => {
			expect( getCurrentFlowName( {} ) ).toEqual( '' );
		} );
	} );

	describe( 'getCurrentStepName()', () => {
		test( 'should return the current flow', () => {
			const step = 'the_hairy_noodle';
			expect(
				getCurrentStepName( {
					signup: {
						flow: {
							step,
						},
					},
				} )
			).toEqual( step );
		} );

		test( 'should default to be an empty string', () => {
			expect( getCurrentStepName( {} ) ).toEqual( '' );
		} );
	} );
} );
