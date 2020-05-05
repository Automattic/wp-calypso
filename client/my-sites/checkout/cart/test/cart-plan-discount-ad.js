/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

jest.mock( 'page' );
jest.mock( 'state/sites/plans/actions' );
jest.mock( 'state/analytics/actions' );

import { CartPlanDiscountAd } from '../cart-plan-discount-ad';
import CartAd from '../cart-ad';

describe( 'cart-plan-discount-ad', () => {
	const BLOGGER_PLAN = {
		expired: false,
		is_free: false,
		product_id: 1010,
		product_name_short: 'Blogger',
		product_slug: 'blogger-bundle',
		user_is_owner: true,
	};

	const CART = {
		hasLoadedFromServer: true,
		hasPendingServerUpdates: false,
		products: [ BLOGGER_PLAN ],
	};

	const props = {
		cart: CART,
		translate: ( str ) => str,
		sitePlans: {
			hasLoadedFromServer: true,
			data: [
				{
					rawDiscount: 10,
					isDomainUpgrade: true,
					formattedDiscount: '$10',
					formattedOriginalPrice: '$20',
					productSlug: BLOGGER_PLAN.product_slug,
				},
			],
		},
		fetchSitePlans: () => {},
		trackPlanDiscountAd: () => {},
	};

	test( 'Should call trackPlanDiscountAd() when the nudge appears', () => {
		const trackPlanDiscountAd = jest.fn();
		const wrapper = shallow(
			<CartPlanDiscountAd { ...props } trackPlanDiscountAd={ trackPlanDiscountAd } />
		);

		expect( wrapper.type() ).toBe( CartAd );
		expect( trackPlanDiscountAd ).toHaveBeenCalled();
	} );

	test( 'Should not call trackPlanDiscountAd() when the nudge is not rendered', () => {
		const trackPlanDiscountAd = jest.fn();
		const wrapper = shallow(
			<CartPlanDiscountAd
				{ ...props }
				cart={ { hasLoadedFromServer: false } }
				trackPlanDiscountAd={ trackPlanDiscountAd }
			/>
		);

		expect( wrapper.type() ).toBe( null );
		expect( trackPlanDiscountAd ).not.toHaveBeenCalled();
	} );
} );
