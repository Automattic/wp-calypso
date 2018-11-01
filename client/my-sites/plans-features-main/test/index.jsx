/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'lib/analytics/index', () => ( {} ) );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'config', () => {
	const fn = () => {};
	fn.isEnabled = jest.fn( () => true );
	return fn;
} );
jest.mock( 'components/main', () => 'MainComponent' );
jest.mock( 'components/popover', () => 'Popover' );
jest.mock( 'my-sites/plan-features', () => 'PlanFeatures' );

jest.mock( 'i18n-calypso', () => ( {
	localize: Component => props => <Component { ...props } translate={ x => x } />,
	numberFormat: x => x,
	translate: x => x,
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
import { PlansFeaturesMain } from '../index';

const props = {
	selectedPlan: PLAN_FREE,
};

describe( 'PlansFeaturesMain.getPlansForPlanFeatures()', () => {
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
		expect( plans ).toEqual( [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS ] );
	} );

	test( 'Should render <PlanFeatures /> with WP.com data-e2e-plans when requested', () => {
		const instance = new PlansFeaturesMain( { ...props } );
		const comp = shallow( instance.getPlanFeatures() );
		expect( comp.find( '[data-e2e-plans="wpcom"]' ).length ).toBe( 1 );
	} );

	test( 'Should render <PlanFeatures /> with WP.com plans without free one when requested', () => {
		const instance = new PlansFeaturesMain( { ...props, hideFreePlan: true } );
		const plans = instance.getPlansForPlanFeatures();
		expect( plans ).toEqual( [ PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS ] );
	} );

	test( 'Should render <PlanFeatures /> with WP.com 2-year plans when requested ( by plan )', () => {
		const instance = new PlansFeaturesMain( { ...props, selectedPlan: PLAN_PERSONAL_2_YEARS } );
		const plans = instance.getPlansForPlanFeatures();
		expect( plans ).toEqual( [
			PLAN_FREE,
			PLAN_PERSONAL_2_YEARS,
			PLAN_PREMIUM_2_YEARS,
			PLAN_BUSINESS_2_YEARS,
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
		] );
	} );
} );
