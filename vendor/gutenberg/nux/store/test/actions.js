/**
 * Internal dependencies
 */
import { triggerGuide, dismissTip, disableTips, enableTips } from '../actions';

describe( 'actions', () => {
	describe( 'triggerGuide', () => {
		it( 'should return a TRIGGER_GUIDE action', () => {
			expect( triggerGuide( [ 'test/tip-1', 'test/tip-2' ] ) ).toEqual( {
				type: 'TRIGGER_GUIDE',
				tipIds: [ 'test/tip-1', 'test/tip-2' ],
			} );
		} );
	} );

	describe( 'dismissTip', () => {
		it( 'should return an DISMISS_TIP action', () => {
			expect( dismissTip( 'test/tip' ) ).toEqual( {
				type: 'DISMISS_TIP',
				id: 'test/tip',
			} );
		} );
	} );

	describe( 'disableTips', () => {
		it( 'should return an DISABLE_TIPS action', () => {
			expect( disableTips() ).toEqual( {
				type: 'DISABLE_TIPS',
			} );
		} );
	} );

	describe( 'enableTips', () => {
		it( 'should return an ENABLE_TIPS action', () => {
			expect( enableTips() ).toEqual( {
				type: 'ENABLE_TIPS',
			} );
		} );
	} );
} );
