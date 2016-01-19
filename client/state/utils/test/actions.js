/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';
/**
 * Internal dependencies
 */
import { UTILS_UNIQUEID_INCREMENT } from 'state/action-types';
import { uniqueId, uniqueIdIncrement } from '../actions';

describe( 'actions', () => {
	describe( 'uniqueIdIncrement()', () => {
		it( 'should return an action object with type UTILS_UNIQUEID_INCREMENT', () => {
			const action = uniqueIdIncrement();
			expect( action ).to.eql( {
				type: UTILS_UNIQUEID_INCREMENT
			} );
		} );
	} );

	describe( 'uniqueId()', () => {
		const getState = () => {
			return {
				utils: {
					uniqueId: 3
				}
			}
		};

		it( 'should call dispatch to increment the counter', () => {
			const dispatchSpy = spy(),
				getStateSpy = spy( getState );

			uniqueId()( dispatchSpy, getStateSpy );
			expect( dispatchSpy.calledWithMatch( { type: UTILS_UNIQUEID_INCREMENT } ) ).to.be.ok;
		} );

		it( 'should return new counter value', () => {
			const dispatchSpy = spy(),
				getStateSpy = spy( getState ),
				newValue = uniqueId()( dispatchSpy, getStateSpy );

			expect( newValue ).to.eql( '3' );
		} );

		it( 'should return store value only after incrementing it', () => {
			const dispatchSpy = spy(),
				getStateSpy = spy( getState );

			uniqueId()( dispatchSpy, getStateSpy )

			expect( getStateSpy.calledAfter( dispatchSpy ) ).to.be.ok;
		} );
	} );
} );
