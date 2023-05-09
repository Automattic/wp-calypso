import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import { getItemIntroductoryOfferDisplay } from '../src';

const emptyIntroductoryOffer = getEmptyResponseCartProduct();

const disabledIntroductoryOffer = {
	...getEmptyResponseCartProduct(),
	introductory_offer_terms: {
		enabled: false,
		interval_count: 3,
		interval_unit: 'month',
		reason: '',
		should_prorate_when_offer_ends: true,
		transition_after_renewal_count: 0,
	},
};

const disabledIntroductoryOfferForAReason = {
	...getEmptyResponseCartProduct(),
	introductory_offer_terms: {
		enabled: false,
		interval_count: 3,
		interval_unit: 'month',
		reason: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		should_prorate_when_offer_ends: true,
		transition_after_renewal_count: 0,
	},
};

const enabledIntroductoryOffer = {
	...getEmptyResponseCartProduct(),
	introductory_offer_terms: {
		enabled: true,
		interval_count: 3,
		interval_unit: 'month',
		should_prorate_when_offer_ends: true,
		transition_after_renewal_count: 0,
	},
};

describe( 'getItemIntroductoryOfferDisplay', () => {
	test( 'should return null when introductory offer is empty', () => {
		expect( getItemIntroductoryOfferDisplay( translate, emptyIntroductoryOffer ) ).toBeNull();
	} );

	test( 'should return null when introductory offer is disabled', () => {
		expect( getItemIntroductoryOfferDisplay( translate, disabledIntroductoryOffer ) ).toBeNull();
	} );

	test( 'should return an object when introductory offer is disabled and reason is given', () => {
		expect(
			getItemIntroductoryOfferDisplay( translate, disabledIntroductoryOfferForAReason )
		).toEqual(
			expect.objectContaining( {
				enabled: false,
				text: expect.any( String ),
			} )
		);
	} );

	test( 'should return an object when introductory offer is enabled', () => {
		expect( getItemIntroductoryOfferDisplay( translate, enabledIntroductoryOffer ) ).toEqual(
			expect.objectContaining( {
				enabled: true,
				text: expect.any( String ),
			} )
		);
	} );
} );
