/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { lostFocusAt, geoLocation } from '../reducer';
import {
	HAPPYCHAT_BLUR,
	HAPPYCHAT_FOCUS,
	SERIALIZE,
	DESERIALIZE,
	HAPPYCHAT_CONNECTED,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

describe( 'reducers', () => {
	describe( '#lostFocusAt', () => {
		useSandbox( sandbox => {
			sandbox.stub( Date, 'now' ).returns( NOW );
		} );

		test( 'defaults to null', () => {
			expect( lostFocusAt( undefined, {} ) ).to.be.null;
		} );

		test( 'SERIALIZEs to Date.now() if state is null', () => {
			expect( lostFocusAt( null, { type: SERIALIZE } ) ).to.eql( NOW );
		} );

		test( 'returns Date.now() on HAPPYCHAT_BLUR actions', () => {
			expect( lostFocusAt( null, { type: HAPPYCHAT_BLUR } ) ).to.eql( NOW );
		} );

		test( 'returns null on HAPPYCHAT_FOCUS actions', () => {
			expect( lostFocusAt( 12345, { type: HAPPYCHAT_FOCUS } ) ).to.be.null;
		} );
	} );

	describe( '#geoLocation()', () => {
		test( 'should default to null', () => {
			const state = geoLocation( undefined, {} );

			expect( state ).to.be.null;
		} );

		test( 'should set the current user geolocation', () => {
			const state = geoLocation( null, {
				type: HAPPYCHAT_CONNECTED,
				user: {
					geo_location: {
						country_long: 'Romania',
						city: 'Timisoara',
					},
				},
			} );

			expect( state ).to.eql( { country_long: 'Romania', city: 'Timisoara' } );
		} );

		test( 'returns valid geolocation', () => {
			const state = geoLocation(
				{ country_long: 'Romania', city: 'Timisoara' },
				{
					type: DESERIALIZE,
				}
			);

			expect( state ).to.eql( { country_long: 'Romania', city: 'Timisoara' } );
		} );
	} );
} );
