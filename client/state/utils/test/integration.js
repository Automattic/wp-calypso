import { expect } from 'chai';
import { spy } from 'sinon';
/**
 * Internal dependencies
 */
import { uniqueId as uniqueId } from '../actions';
import { uniqueId as uniqueIdReducer } from '../reducer';

describe( 'integrationTest', () => {
	describe( 'uniqueId', () => {
		let state = 0;
		const getState = () => {
			return {
				utils: {
					uniqueId: state
				}
			};
		};
		const dispatchSpy = spy( action => {
			state = uniqueIdReducer( state, action );
		} );
		const getStateSpy = spy( getState );

		it( 'should return incremented number', () => {
			const initState = 1;
			state = initState;

			const returnValue = uniqueId()( dispatchSpy, getStateSpy );

			expect( state ).to.eql( initState + 1 );
			expect( returnValue ).to.eql( state.toString() );
		} );
	} );
} );
