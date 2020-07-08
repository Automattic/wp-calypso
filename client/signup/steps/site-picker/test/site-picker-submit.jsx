jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'lib/analytics/tracks', () => ( {} ) );
jest.mock( 'lib/analytics/page-view', () => ( {} ) );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import { noop } from 'lodash';

jest.mock( 'i18n-calypso', () => ( {
	translate: ( str ) => str,
} ) );

/**
 * Internal dependencies
 */
import { siteHasPaidPlan, SitePickerSubmit } from '../site-picker-submit';
import {
	PLAN_FREE,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

const props = {
	goToStep: jest.fn(),
	submitSignupStep: noop,
	selectedSite: {
		ID: 1,
	},
};

describe( 'siteHasPaidPlan', () => {
	[
		PLAN_BLOGGER,
		PLAN_BLOGGER_2_YEARS,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( ( product_slug ) => {
		test( `Should return true for plan ${ product_slug }`, () => {
			expect( siteHasPaidPlan( { plan: { product_slug } } ) ).toBe( true );
		} );
	} );

	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( ( product_slug ) => {
		test( `Should return false for plan ${ product_slug }`, () => {
			expect( siteHasPaidPlan( { plan: { product_slug } } ) ).toBe( false );
		} );
	} );
} );

describe( 'SitePickerSubmit', () => {
	beforeEach( () => {
		props.goToStep.mockReset();
	} );

	test( 'Does not blow up', () => {
		expect( props.goToStep ).toHaveBeenCalledTimes( 0 );
		const comp = shallow( <SitePickerSubmit { ...props } /> );
		expect( comp.find( '*' ).length ).toBe( 0 );
		expect( props.goToStep ).toHaveBeenCalledTimes( 1 );
	} );

	[
		PLAN_BLOGGER,
		PLAN_BLOGGER_2_YEARS,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( ( plan ) => {
		test( `Goes to step "user" when paid plan is passed (${ plan })`, () => {
			expect( props.goToStep ).toHaveBeenCalledTimes( 0 );
			shallow(
				<SitePickerSubmit { ...props } selectedSite={ { plan: { product_slug: plan } } } />
			);
			expect( props.goToStep ).toHaveBeenCalledWith( 'user' );
		} );
	} );

	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( ( plan ) => {
		test( `Goes to step "plans-site-selected" when a free plan is passed (${ plan })`, () => {
			expect( props.goToStep ).toHaveBeenCalledTimes( 0 );
			shallow(
				<SitePickerSubmit { ...props } selectedSite={ { plan: { product_slug: plan } } } />
			);
			expect( props.goToStep ).toHaveBeenCalledWith( 'plans-site-selected' );
		} );
	} );
} );
