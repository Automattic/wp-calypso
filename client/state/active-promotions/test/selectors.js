import { getActivePromotions, isRequestingActivePromotions } from '../selectors';
import { ACTIVE_PROMOTIONS, getStateInstance } from './fixture';

describe( 'selectors', () => {
	describe( '#getActivePromotions()', () => {
		test( 'should return WordPress ActivePromotions array', () => {
			const state = getStateInstance();
			const activePromotions = getActivePromotions( state );
			expect( activePromotions ).toEqual( ACTIVE_PROMOTIONS );
		} );
	} );

	describe( '#isRequestingActivePromotions()', () => {
		test( 'should return requesting state of ActivePromotions', () => {
			const state = getStateInstance();
			const isRequesting = isRequestingActivePromotions( state );
			expect( isRequesting ).toEqual( false );
		} );
	} );
} );
