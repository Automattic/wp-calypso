/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'lib/upgrades/actions', () => ( {
	addItem: () => ( {} ),
} ) );
jest.mock( 'lib/analytics/ad-tracking', () => ( {} ) );
jest.mock( 'lib/analytics/index', () => ( {} ) );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'lib/user', () => ( {} ) );
jest.mock( 'components/main', () => 'MainComponent' );
jest.mock( 'components/popover', () => 'Popover' );
jest.mock( '../cart-ad', () => 'CartAd' );
jest.mock( 'page', () => () => () => {} );
jest.mock( 'lib/cart-values', () => ( {
	cartItems: {
		premiumPlan: jest.fn(),
		getDomainRegistrations: jest.fn( () => [ {} ] ),
	},
} ) );

jest.mock( 'i18n-calypso', () => ( {
	localize: Comp => props => (
		<Comp
			{ ...props }
			translate={ function( x ) {
				return x;
			} }
		/>
	),
	numberFormat: x => x,
} ) );

import { cartItems } from 'lib/cart-values';
const { premiumPlan } = cartItems;

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import {
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { CartPlanAd } from '../cart-plan-ad';

const e = {
	preventDefault: () => {},
};
const props = {
	selectedSite: {
		slug: 'hii',
	},
	cart: {},
};

describe( 'CartPlanAd basic tests', () => {
	test( 'should not blow up', () => {
		const comp = shallow( <CartPlanAd { ...props } /> );
		expect( comp.find( 'CartAd' ).length ).toBe( 0 );
	} );
} );

describe( 'CartPlanAd.addToCartAndRedirect()', () => {
	[
		PLAN_FREE,
		PLAN_JETPACK_FREE,
		PLAN_PERSONAL,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_BUSINESS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( plan => {
		test( `Should add 1-year premium plan for plan ${ plan }`, () => {
			premiumPlan.mockReset();
			const ad = new CartPlanAd( { ...props, currentPlanSlug: plan } );
			expect( premiumPlan ).toHaveBeenCalledTimes( 0 );
			ad.addToCartAndRedirect( e );
			expect( premiumPlan ).toHaveBeenCalledTimes( 1 );
			expect( premiumPlan ).toHaveBeenCalledWith( PLAN_PREMIUM, { isFreeTrial: false } );
		} );
	} );

	[ PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS, PLAN_BUSINESS_2_YEARS ].forEach( plan => {
		test( `Should add 2-years premium plan for plan ${ plan }`, () => {
			premiumPlan.mockReset();
			const ad = new CartPlanAd( { ...props, currentPlanSlug: plan } );
			expect( premiumPlan ).toHaveBeenCalledTimes( 0 );
			ad.addToCartAndRedirect( e );
			expect( premiumPlan ).toHaveBeenCalledTimes( 1 );
			expect( premiumPlan ).toHaveBeenCalledWith( PLAN_PREMIUM_2_YEARS, { isFreeTrial: false } );
		} );
	} );
} );
