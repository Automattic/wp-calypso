/**
 * Internal dependencies
 */
import { guides, areTipsEnabled, dismissedTips } from '../reducer';

describe( 'reducer', () => {
	describe( 'guides', () => {
		it( 'should start out empty', () => {
			expect( guides( undefined, {} ) ).toEqual( [] );
		} );

		it( 'should add a guide when it is triggered', () => {
			const state = guides( [], {
				type: 'TRIGGER_GUIDE',
				tipIds: [ 'test/tip-1', 'test/tip-2' ],
			} );
			expect( state ).toEqual( [
				[ 'test/tip-1', 'test/tip-2' ],
			] );
		} );
	} );

	describe( 'areTipsEnabled', () => {
		it( 'should default to true', () => {
			expect( areTipsEnabled( undefined, {} ) ).toBe( true );
		} );

		it( 'should flip when tips are disabled', () => {
			const state = areTipsEnabled( true, {
				type: 'DISABLE_TIPS',
			} );
			expect( state ).toBe( false );
		} );

		it( 'should flip when tips are enabled', () => {
			const state = areTipsEnabled( false, {
				type: 'ENABLE_TIPS',
			} );
			expect( state ).toBe( true );
		} );
	} );

	describe( 'dismissedTips', () => {
		it( 'should start out empty', () => {
			expect( dismissedTips( undefined, {} ) ).toEqual( {} );
		} );

		it( 'should mark tips as dismissed', () => {
			const state = dismissedTips( {}, {
				type: 'DISMISS_TIP',
				id: 'test/tip',
			} );
			expect( state ).toEqual( {
				'test/tip': true,
			} );
		} );

		it( 'should reset if tips are enabled', () => {
			const initialState = {
				'test/tip': true,
			};
			const state = dismissedTips( initialState, {
				type: 'ENABLE_TIPS',
			} );
			expect( state ).toEqual( {} );
		} );
	} );
} );
