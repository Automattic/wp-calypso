/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { CONNECTION_LOST, CONNECTION_RESTORED } from 'calypso/state/action-types';

describe( 'state/application reducer', () => {
	describe( '#connectionState()', () => {
		test( 'should default to CHECKING as initial state', () => {
			expect( reducer( undefined, { type: 'INIT' } ) ).toEqual( { connectionState: 'CHECKING' } );
		} );

		test( 'should be ONLINE when action CONNECTION_RESTORED dispatched', () => {
			expect( reducer( undefined, { type: CONNECTION_RESTORED } ) ).toEqual( {
				connectionState: 'ONLINE',
			} );
		} );

		test( 'should be OFFLINE when action CONNECTION_LOST dispatched', () => {
			expect( reducer( undefined, { type: CONNECTION_LOST } ) ).toEqual( {
				connectionState: 'OFFLINE',
			} );
		} );
	} );
} );
