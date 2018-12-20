/** @format */

/**
 * Internal dependencies
 */
import { getcurrentFlowName } from '../selectors';

describe( 'getcurrentFlowName()', () => {
	test( 'should return the current flow', () => {
		const currentFlowName = 'sultana_wetsuit';
		expect(
			getcurrentFlowName( {
				signup: {
					flow: {
						currentFlowName,
					},
				},
			} )
		).toEqual( currentFlowName );
	} );

	test( 'should default to be an empty string', () => {
		expect( getcurrentFlowName( {} ) ).toEqual( '' );
	} );
} );
