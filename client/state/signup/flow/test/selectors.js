/**
 * Internal dependencies
 */
import { getCurrentFlowName } from '../selectors';

describe( 'getCurrentFlowName()', () => {
	test( 'should return the current flow', () => {
		const currentFlowName = 'sultana_wetsuit';
		expect(
			getCurrentFlowName( {
				signup: {
					flow: {
						currentFlowName,
					},
				},
			} )
		).toEqual( currentFlowName );
	} );

	test( 'should default to be an empty string', () => {
		expect( getCurrentFlowName( {} ) ).toEqual( '' );
	} );
} );
