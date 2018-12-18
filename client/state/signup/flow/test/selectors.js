/** @format */

/**
 * Internal dependencies
 */
import { getCurrentFlow } from '../selectors';

describe( 'getCurrentFlow()', () => {
	test( 'should return the current flow', () => {
		const currentFlow = 'sultana_wetsuit';
		expect(
			getCurrentFlow( {
				signup: {
					flow: {
						currentFlow,
					},
				},
			} )
		).toEqual( currentFlow );
	} );

	test( 'should default to be an empty string', () => {
		expect( getCurrentFlow( {} ) ).toEqual( '' );
	} );
} );
