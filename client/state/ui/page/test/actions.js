/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SET_PAGE_STATE, RESET_PAGE_STATE } from 'state/action-types';
import { setPageState, resetPageState } from '../actions';

describe( 'actions', () => {
	describe( '#setPageState()', () => {
		it( 'should return an action object', () => {
			expect( setPageState( 'foo', 'bar' ) ).to.eql( {
				type: SET_PAGE_STATE,
				key: 'foo',
				value: 'bar'
			} );
		} );
	} );

	describe( '#resetPageState()', () => {
		it( 'should return an action object', () => {
			expect( resetPageState() ).to.eql( {
				type: RESET_PAGE_STATE
			} );
		} );
	} );
} );
