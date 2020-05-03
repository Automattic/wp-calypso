jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'react-redux', () => ( {
	connect: () => ( component ) => component,
} ) );
jest.mock( 'lib/analytics/tracks', () => ( {} ) );
jest.mock( 'lib/analytics/page-view', () => ( {} ) );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'config', () => {
	const fn = () => {
		return [];
	};
	fn.isEnabled = jest.fn( () => true );
	return fn;
} );
jest.mock( 'components/happychat/connection-connected', () => 'HappychatConnection' );
jest.mock( 'components/data/query-plans', () => 'QueryPlans' );
jest.mock( 'components/data/query-site-plans', () => 'QuerySitePlans' );
jest.mock( 'components/data/cart', () => 'CartData' );
jest.mock( 'blocks/payment-methods', () => 'PaymentMethods' );
jest.mock( 'my-sites/plan-features', () => 'PlanFeatures' );
jest.mock( 'my-sites/plans-features-main/wpcom-faq', () => 'WpcomFAQ' );
jest.mock( 'my-sites/plans-features-main/jetpack-faq', () => 'JetpackFAQ' );

jest.mock( 'i18n-calypso', () => ( {
	localize: ( Component ) => ( props ) => <Component { ...props } translate={ ( x ) => x } />,
	numberFormat: ( x ) => x,
	translate: ( x ) => x,
} ) );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { PlansFeaturesMain } from '../index';
import {
	GROUP_WPCOM,
	PLAN_FREE,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
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
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_FREE,
	TERM_ANNUALLY,
	TYPE_PREMIUM,
} from 'lib/plans/constants';

const props = {
	selectedPlan: PLAN_FREE,
	translate: ( x ) => x,
};

describe( 'PlansFeaturesMain.renderFreePlanBanner()', () => {
	test( 'Should return null when called with hideFreePlan props', () => {
		const instance = new PlansFeaturesMain( {
			...props,
			hideFreePlan: true,
		} );
		const freePlanBanner = instance.renderFreePlanBanner();
		expect( freePlanBanner ).toBeNull();
	} );
} );

describe( 'PlansFeaturesMain.getPlansForPlanFeatures()', () => {
	test( 'Should render <PlanFeatures /> with plans matching given planTypes when called with planTypes props', () => {
		const instance = new PlansFeaturesMain( {
			...props,
			planTypes: [ TYPE_BUSINESS, TYPE_ECOMMERCE ],
		} );
		const plans = instance.getPlansForPlanFeatures();
		expect( plans ).toEqual( [ PLAN_BUSINESS, PLAN_ECOMMERCE ] );
	} );
	test( 'Should render <PlanFeatures /> removing the free plan when hideFreePlan prop is present, regardless of its position', () => {
		const instance = new PlansFeaturesMain( {
			...props,
			planTypes: [ TYPE_BUSINESS, TYPE_FREE, TYPE_ECOMMERCE ],
			hideFreePlan: true,
		} );
		const plans = instance.getPlansForPlanFeatures();
		expect( plans ).toEqual( [ PLAN_BUSINESS, PLAN_ECOMMERCE ] );
	} );
	test( 'Should render <PlanFeatures /> with Jetpack monthly plans when called with jetpack props', () => {
		const instance = new PlansFeaturesMain( {
			...props,
			displayJetpackPlans: true,
			intervalType: 'monthly',
		} );
		const plans = instance.getPlansForPlanFeatures();
		expect( plans ).toEqual( [
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		] );
	} );

	test( 'Should render <PlanFeatures /> with Jetpack monthly plans without free one when requested', () => {
		const instance = new PlansFeaturesMain( {
			...props,
			displayJetpackPlans: true,
			intervalType: 'monthly',
			hideFreePlan: true,
		} );
		const plans = instance.getPlansForPlanFeatures();
		expect( plans ).toEqual( [
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		] );
	} );
	test( 'Should render <PlanFeatures /> with Jetpack monthly data-e2e-plans when requested', () => {
		const instance = new PlansFeaturesMain( { ...props, displayJetpackPlans: true } );
		const comp = shallow( instance.getPlanFeatures() );
		expect( comp.find( '[data-e2e-plans="jetpack"]' ).length ).toBe( 1 );
	} );

	test( 'Should render <PlanFeatures /> with Jetpack plans when called with jetpack props', () => {
		const instance = new PlansFeaturesMain( { ...props, displayJetpackPlans: true } );
		const plans = instance.getPlansForPlanFeatures();
		expect( plans ).toEqual( [
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_BUSINESS,
		] );
	} );

	test( 'Should render <PlanFeatures /> with Jetpack plans without free one when requested', () => {
		const instance = new PlansFeaturesMain( {
			...props,
			displayJetpackPlans: true,
			hideFreePlan: true,
		} );
		const plans = instance.getPlansForPlanFeatures();
		expect( plans ).toEqual( [
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_BUSINESS,
		] );
	} );

	test( 'Should render <PlanFeatures /> with Jetpack data-e2e-plans when requested', () => {
		const instance = new PlansFeaturesMain( { ...props, displayJetpackPlans: true } );
		const comp = shallow( instance.getPlanFeatures() );
		expect( comp.find( '[data-e2e-plans="jetpack"]' ).length ).toBe( 1 );
	} );

	test( 'Should render <PlanFeatures /> with WP.com plans when requested', () => {
		const instance = new PlansFeaturesMain( { ...props } );
		const plans = instance.getPlansForPlanFeatures();
		expect( plans ).toEqual( [
			PLAN_FREE,
			PLAN_PERSONAL,
			PLAN_PREMIUM,
			PLAN_BUSINESS,
			PLAN_ECOMMERCE,
		] );
	} );

	test( 'Should render <PlanFeatures /> with WP.com data-e2e-plans when requested', () => {
		const instance = new PlansFeaturesMain( { ...props } );
		const comp = shallow( instance.getPlanFeatures() );
		expect( comp.find( '[data-e2e-plans="wpcom"]' ).length ).toBe( 1 );
	} );

	test( 'Should render <PlanFeatures /> with WP.com plans without free one when requested', () => {
		const instance = new PlansFeaturesMain( { ...props, hideFreePlan: true } );
		const plans = instance.getPlansForPlanFeatures();
		expect( plans ).toEqual( [ PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE ] );
	} );

	test( 'Should render <PlanFeatures /> with monthly WP.com plans when requested', () => {
		const instance = new PlansFeaturesMain( {
			...props,
			intervalType: 'monthly',
			hideFreePlan: true,
		} );
		const plans = instance.getPlansForPlanFeatures();
		expect( plans ).toEqual( [
			PLAN_PERSONAL,
			PLAN_PREMIUM,
			PLAN_BUSINESS_MONTHLY,
			PLAN_ECOMMERCE,
		] );
	} );

	test( 'Should render <PlanFeatures /> with WP.com 2-year plans when requested ( by plan )', () => {
		const instance = new PlansFeaturesMain( { ...props, selectedPlan: PLAN_PERSONAL_2_YEARS } );
		const plans = instance.getPlansForPlanFeatures();
		expect( plans ).toEqual( [
			PLAN_FREE,
			PLAN_PERSONAL_2_YEARS,
			PLAN_PREMIUM_2_YEARS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_ECOMMERCE_2_YEARS,
		] );
	} );

	test( 'Should render <PlanFeatures /> with WP.com 2-year plans when requested ( by interval )', () => {
		const instance = new PlansFeaturesMain( { ...props, intervalType: '2yearly' } );
		const plans = instance.getPlansForPlanFeatures();
		expect( plans ).toEqual( [
			PLAN_FREE,
			PLAN_PERSONAL_2_YEARS,
			PLAN_PREMIUM_2_YEARS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_ECOMMERCE_2_YEARS,
		] );
	} );
} );

describe( 'PlansFeaturesMain.getPlansForPlanFeatures() with tabs', () => {
	const myProps = {
		selectedPlan: PLAN_FREE,
		translate: ( x ) => x,
		hideFreePlan: true,
		withWPPlanTabs: true,
	};

	beforeEach( () => {
		global.document = { location: { search: '' } };
	} );

	test( 'Should render <PlanFeatures /> with tab picker when requested', () => {
		const instance = new PlansFeaturesMain( { ...myProps } );
		const comp = shallow( instance.render() );
		expect( comp.find( 'SegmentedControl' ).length ).toBe( 1 );
	} );

	test( "Should select personal tab when it's requested", () => {
		const instance = new PlansFeaturesMain( { ...myProps, customerType: 'personal' } );
		const comp = shallow( instance.render() );
		expect( comp.find( 'SegmentedControl' ).length ).toBe( 1 );
		expect( comp.find( 'SegmentedControlItem[path="?customerType=personal"]' ).length ).toBe( 1 );
		expect(
			comp.find( 'SegmentedControlItem[path="?customerType=personal"]' ).props().selected
		).toBe( true );
		expect( comp.find( 'SegmentedControlItem[path="?customerType=business"]' ).length ).toBe( 1 );
		expect(
			comp.find( 'SegmentedControlItem[path="?customerType=business"]' ).props().selected
		).toBe( false );
	} );

	test( 'Should display proper plans in personal tab', () => {
		const instance = new PlansFeaturesMain( { ...myProps, customerType: 'personal' } );
		const comp = shallow( instance.render() );
		expect( comp.find( 'PlanFeatures' ).props().visiblePlans ).toEqual( [
			PLAN_PERSONAL,
			PLAN_PREMIUM,
		] );
	} );

	test( 'Should display proper plans in personal tab (2y)', () => {
		const instance = new PlansFeaturesMain( {
			...myProps,
			intervalType: '2yearly',
			customerType: 'personal',
		} );
		const comp = shallow( instance.render() );
		expect( comp.find( 'PlanFeatures' ).props().visiblePlans ).toEqual( [
			PLAN_PERSONAL_2_YEARS,
			PLAN_PREMIUM_2_YEARS,
		] );
	} );

	test( "Should select business tab when it's requested", () => {
		const instance = new PlansFeaturesMain( { ...myProps, customerType: 'business' } );
		const comp = shallow( instance.render() );
		expect( comp.find( 'SegmentedControl' ).length ).toBe( 1 );
		expect( comp.find( 'SegmentedControlItem[path="?customerType=business"]' ).length ).toBe( 1 );
		expect(
			comp.find( 'SegmentedControlItem[path="?customerType=business"]' ).props().selected
		).toBe( true );
		expect( comp.find( 'SegmentedControlItem[path="?customerType=personal"]' ).length ).toBe( 1 );
		expect(
			comp.find( 'SegmentedControlItem[path="?customerType=personal"]' ).props().selected
		).toBe( false );
	} );

	test( 'Should add existing query arguments to personal and business tab links', () => {
		global.document = { location: { search: '?fake=item' } };
		const instance = new PlansFeaturesMain( { ...myProps, customerType: 'business' } );
		const comp = shallow( instance.render() );
		expect( comp.find( 'SegmentedControl' ).length ).toBe( 1 );
		expect(
			comp.find( 'SegmentedControlItem[path="?fake=item&customerType=personal"]' ).length
		).toBe( 1 );
		expect(
			comp.find( 'SegmentedControlItem[path="?fake=item&customerType=business"]' ).length
		).toBe( 1 );
	} );

	test( 'Highlights TYPE_PREMIUM as popular plan for personal customer type', () => {
		const instance = new PlansFeaturesMain( {
			customerType: 'personal',
		} );
		const comp = shallow( instance.render() );
		expect( comp.find( 'PlanFeatures' ).props().popularPlanSpec ).toEqual( {
			type: TYPE_PREMIUM,
			group: GROUP_WPCOM,
		} );
	} );

	test( 'Highlights TYPE_BUSINESS as popular plan for business customer type', () => {
		const instance = new PlansFeaturesMain( {
			customerType: 'business',
		} );
		const comp = shallow( instance.render() );
		expect( comp.find( 'PlanFeatures' ).props().popularPlanSpec ).toEqual( {
			type: TYPE_BUSINESS,
			group: GROUP_WPCOM,
		} );
	} );

	test( 'Highlights TYPE_BUSINESS as popular plan for empty customer type', () => {
		const instance = new PlansFeaturesMain( {} );
		const comp = shallow( instance.render() );
		expect( comp.find( 'PlanFeatures' ).props().popularPlanSpec ).toEqual( {
			type: TYPE_BUSINESS,
			group: GROUP_WPCOM,
		} );
	} );
} );

describe( 'PlansFeaturesMain.getPlansFromProps', () => {
	const group = GROUP_WPCOM;
	const term = TERM_ANNUALLY;

	test( 'Should return an empty array if planTypes are not specified', () => {
		const instance = new PlansFeaturesMain( { ...props } );
		const plans = instance.getPlansFromProps( group, term );
		expect( plans ).toEqual( [] );
	} );

	test( 'Should filter out invalid plan types and print a warning in the console', () => {
		global.console.warn = jest.fn();
		const NOT_A_PLAN = 'not-a-plan';
		const instance = new PlansFeaturesMain( {
			...props,
			planTypes: [ NOT_A_PLAN, TYPE_BUSINESS, TYPE_ECOMMERCE ],
		} );
		const plans = instance.getPlansFromProps( group, term );

		expect( plans ).toEqual( [ PLAN_BUSINESS, PLAN_ECOMMERCE ] );
		expect( global.console.warn ).toHaveBeenCalledWith(
			`Invalid plan type, \`${ NOT_A_PLAN }\`, provided to \`PlansFeaturesMain\` component. See plans constants for valid plan types.`
		);
	} );
} );
