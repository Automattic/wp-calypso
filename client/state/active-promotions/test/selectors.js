jest.mock( 'calypso/lib/plans/constants', () => ( {
	GROUP_WPCOM: 'GROUP_WPCOM',
	GROUP_JETPACK: 'GROUP_JETPACK',

	TERM_MONTHLY: 'TERM_MONTHLY',
	TERM_ANNUALLY: 'TERM_ANNUALLY',
	TERM_BIENNIALLY: 'TERM_BIENNIALLY',

	TYPE_FREE: 'TYPE_FREE',
	TYPE_PERSONAL: 'TYPE_PERSONAL',
	TYPE_PREMIUM: 'TYPE_PREMIUM',
	TYPE_BUSINESS: 'TYPE_BUSINESS',

	ACTIVE_PROMOTIONS_LIST: {
		jetpack_premium_monthly: {
			term: 'TERM_MONTHLY',
		},
		value_bundle: {
			term: 'TERM_ANNUALLY',
		},
		'personal-bundle-2y': {
			term: 'TERM_BIENNIALLY',
		},
	},
} ) );

/**
 * Internal dependencies
 */
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
