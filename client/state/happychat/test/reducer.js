/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { lastActivityTimestamp, lostFocusAt, message, geoLocation } from '../reducer';
import { HAPPYCHAT_RECEIVE_EVENT, HAPPYCHAT_BLUR, HAPPYCHAT_FOCUS, HAPPYCHAT_SEND_MESSAGE, HAPPYCHAT_SET_MESSAGE, SERIALIZE, DESERIALIZE, HAPPYCHAT_SET_GEO_LOCATION } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

describe( 'reducers', () => {
	describe( '#lastActivityTimestamp', () => {
		useSandbox( sandbox => {
			sandbox.stub( Date, 'now' ).returns( NOW );
		} );

		it( 'defaults to null', () => {
			const result = lastActivityTimestamp( undefined, {} );
			expect( result ).to.be.null;
		} );

		it( 'should update on certain activity-specific actions', () => {
			let result;

			result = lastActivityTimestamp( null, { type: HAPPYCHAT_RECEIVE_EVENT } );
			expect( result ).to.equal( NOW );

			result = lastActivityTimestamp( null, { type: HAPPYCHAT_SEND_MESSAGE } );
			expect( result ).to.equal( NOW );
		} );
	} );

	describe( '#lostFocusAt', () => {
		useSandbox( sandbox => {
			sandbox.stub( Date, 'now' ).returns( NOW );
		} );

		it( 'defaults to null', () => {
			expect( lostFocusAt( undefined, {} ) ).to.be.null;
		} );

		it( 'SERIALIZEs to Date.now() if state is null', () => {
			expect( lostFocusAt( null, { type: SERIALIZE } ) ).to.eql( NOW );
		} );

		it( 'returns Date.now() on HAPPYCHAT_BLUR actions', () => {
			expect( lostFocusAt( null, { type: HAPPYCHAT_BLUR } ) ).to.eql( NOW );
		} );

		it( 'returns null on HAPPYCHAT_FOCUS actions', () => {
			expect( lostFocusAt( 12345, { type: HAPPYCHAT_FOCUS } ) ).to.be.null;
		} );
	} );

	describe( '#message()', () => {
		it( 'defaults to an empty string', () => {
			const result = message( undefined, {} );
			expect( result ).to.eql( '' );
		} );
		it( 'saves messages passed from HAPPYCHAT_SET_MESSAGE', () => {
			const action = { type: HAPPYCHAT_SET_MESSAGE, message: 'abcd' };
			const result = message( 'abc', action );
			expect( result ).to.eql( 'abcd' );
		} );
		it( 'resets to empty string on HAPPYCHAT_SEND_MESSAGE', () => {
			const action = { type: HAPPYCHAT_SEND_MESSAGE, message: 'abcd' };
			const result = message( 'abcd', action );
			expect( result ).to.eql( '' );
		} );
	} );

	describe( '#geoLocation()', () => {
		it( 'should default to null', () => {
			const state = geoLocation( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set the current user geolocation', () => {
			const state = geoLocation( null, {
				type: HAPPYCHAT_SET_GEO_LOCATION,
				geoLocation: { city: 'Timisoara' }
			} );

			expect( state ).to.eql( { city: 'Timisoara' } );
		} );

		it( 'returns valid geolocation', () => {
			const state = geoLocation( { city: 'Timisoara' }, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( { city: 'Timisoara' } );
		} );
	} );
} );
