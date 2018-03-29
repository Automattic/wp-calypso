/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'blocks/dismissible-card', () => {} );
jest.mock( 'components/search', () => 'Search' );
jest.mock( 'components/popover', () => 'Popover' );
jest.mock( 'my-sites/checkout/cart/cart-item', () => 'CartItem' );
jest.mock( 'my-sites/checkout/cart/cart-coupon', () => 'CartCoupon' );
jest.mock( 'my-sites/checkout/cart/cart-plan-ad', () => 'CartPlanAd' );
jest.mock( 'my-sites/checkout/checkout-thank-you/google-voucher', () => 'GoogleVoucher' );
jest.mock( 'components/happiness-support', () => 'HappinessSupport' );
jest.mock( 'lib/user', () => ( {} ) );
jest.mock( 'lib/cart/store/cart-analytics', () => ( {} ) );
jest.mock( 'lib/mixins/analytics', () => () => {} );

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
import { CurrentPlanHeader } from '../header';

const props = {
	selectedSite: {
		jetpack: false,
	},
	translate: () => {},
};

describe( 'CurrentPlanHeader basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <CurrentPlanHeader { ...props } /> );
		expect( comp.find( '.current-plan__header' ).length ).toBe( 1 );
	} );
} );

describe( 'isEligibleForLiveChat', () => {
	[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY ].forEach( currentPlanSlug => {
		test( 'Should return true if Jetpack business plan', () => {
			const comp = new CurrentPlanHeader( { ...props, currentPlanSlug } );
			expect( comp.isEligibleForLiveChat() ).toBe( true );
		} );
	} );

	[
		PLAN_FREE,
		PLAN_JETPACK_FREE,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
	].forEach( currentPlanSlug => {
		test( 'Should return false if not Jetpack business plan', () => {
			const comp = new CurrentPlanHeader( { ...props, currentPlanSlug } );
			expect( comp.isEligibleForLiveChat() ).toBe( false );
		} );
	} );
} );

describe( '<HappinessSupport isJetpackFreePlan', () => {
	[ PLAN_JETPACK_FREE ].forEach( currentPlanSlug => {
		test( 'Should be true if Jetpack free plan', () => {
			const comp = shallow(
				<CurrentPlanHeader { ...props } currentPlanSlug={ currentPlanSlug } />
			);
			expect( comp.find( 'HappinessSupport' ).props().isJetpackFreePlan ).toBe( true );
		} );
	} );

	[
		PLAN_FREE,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( currentPlanSlug => {
		test( 'Should be false otherwise', () => {
			const comp = shallow(
				<CurrentPlanHeader { ...props } currentPlanSlug={ currentPlanSlug } />
			);
			expect( comp.find( 'HappinessSupport' ).props().isJetpackFreePlan ).toBe( false );
		} );
	} );
} );

describe( '<HappinessSupport renderPurchaseInfo', () => {
	test( 'Should not be displayed for Jetpack free plan', () => {
		const comp = shallow(
			<CurrentPlanHeader { ...props } currentPlan={ {} } currentPlanSlug={ PLAN_JETPACK_FREE } />
		);
		expect( comp.find( '.current-plan__header-purchase-info-wrapper' ).length ).toBe( 0 );
	} );

	test( 'Should not be displayed for empty plan', () => {
		const comp = shallow(
			<CurrentPlanHeader
				{ ...props }
				currentPlan={ null }
				currentPlanSlug={ PLAN_JETPACK_BUSINESS }
			/>
		);
		expect( comp.find( '.current-plan__header-purchase-info-wrapper' ).length ).toBe( 0 );
	} );

	[
		PLAN_FREE,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( currentPlanSlug => {
		test( `Should be displayed for plan ${ currentPlanSlug }`, () => {
			const comp = shallow(
				<CurrentPlanHeader { ...props } currentPlan={ {} } currentPlanSlug={ currentPlanSlug } />
			);
			expect( comp.find( '.current-plan__header-purchase-info-wrapper' ).length ).toBe( 1 );
		} );
	} );
} );
