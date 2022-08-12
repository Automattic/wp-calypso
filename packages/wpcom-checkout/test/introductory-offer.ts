import { ResponseCartProduct } from '@automattic/shopping-cart';
import { getItemIntroductoryOfferDisplay } from '../src';

const emptyIntroductoryOffer = { introductory_offer_terms: {} } as ResponseCartProduct;

const disabledIntroductoryOffer = {
	introductory_offer_terms: {
		enabled: false,
		interval_count: 3,
		interval_unit: 'month',
		reason: '',
		should_prorate_when_offer_ends: true,
		transition_after_renewal_count: 0,
	},
} as ResponseCartProduct;

const disabledIntroductoryOfferForAReason = {
	introductory_offer_terms: {
		enabled: false,
		interval_count: 3,
		interval_unit: 'month',
		reason: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		should_prorate_when_offer_ends: true,
		transition_after_renewal_count: 0,
	},
} as ResponseCartProduct;

const enabledIntroductoryOffer = {
	introductory_offer_terms: {
		enabled: true,
		interval_count: 3,
		interval_unit: 'month',
		should_prorate_when_offer_ends: true,
		transition_after_renewal_count: 0,
	},
} as ResponseCartProduct;

describe( 'Introductory Offer Utils', () => {
	test( 'should return null when introductory offer is empty', () => {
		expect( getItemIntroductoryOfferDisplay( emptyIntroductoryOffer ) ).toBeNull();
	} );

	test( 'should return null when introductory offer is disabled', () => {
		expect( getItemIntroductoryOfferDisplay( disabledIntroductoryOffer ) ).toBeNull();
	} );

	test( 'should return an object when introductory offer is disabled and reason is given', () => {
		expect( getItemIntroductoryOfferDisplay( disabledIntroductoryOfferForAReason ) ).toEqual(
			expect.objectContaining( {
				enabled: false,
				text: expect.any( String ),
			} )
		);
	} );

	test( 'should return an object when introductory offer is enabled', () => {
		expect( getItemIntroductoryOfferDisplay( enabledIntroductoryOffer ) ).toEqual(
			expect.objectContaining( {
				enabled: true,
				text: expect.any( String ),
			} )
		);
	} );
} );
