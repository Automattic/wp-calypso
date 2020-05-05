jest.mock( 'signup/step-wrapper', () => 'step-wrapper' );
jest.mock( 'my-sites/plan-features', () => 'plan-features' );

jest.mock( 'i18n-calypso', () => ( {
	localize: ( c ) => c,
	translate: ( s ) => s,
} ) );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import { identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { PlansAtomicStoreStep } from '../index';
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
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

const props = {
	translate: identity,
	stepName: 'Step name',
	stepSectionName: 'Step section name',
	signupDependencies: { domainItem: null },
	submitSignupStep: noop,
	goToNextStep: noop,
	recordTracksEvent: noop,
};

describe( 'PlansAtomicStoreStep basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <PlansAtomicStoreStep { ...props } /> );
		expect( comp.find( '.plans-step' ).length ).toBe( 1 );
	} );
} );

describe( 'PlansAtomicStoreStep.onSelectPlan', () => {
	const tplProps = {
		...props,
		designType: 'store',
	};

	test( 'Should call goToNextStep', () => {
		const goToNextStep = jest.fn();
		const myProps = { ...tplProps, goToNextStep };
		const comp = new PlansAtomicStoreStep( myProps );
		comp.onSelectPlan( { product_slug: PLAN_FREE } );
		expect( goToNextStep ).toHaveBeenCalled();
	} );

	test( 'Should call submitSignupStep with step details', () => {
		const submitSignupStep = jest.fn();
		const comp = new PlansAtomicStoreStep( { ...tplProps, submitSignupStep } );
		const cartItem = { product_slug: PLAN_FREE };
		comp.onSelectPlan( cartItem );
		expect( submitSignupStep ).toHaveBeenCalled();

		const calls = submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ].stepName ).toEqual( 'Step name' );
		expect( args[ 0 ].stepSectionName ).toEqual( 'Step section name' );
		expect( args[ 0 ].cartItem ).toBe( cartItem );
		expect( 'test' in args[ 0 ] ).toEqual( false );
	} );

	test( 'Should call submitSignupStep with additionalStepData if specified', () => {
		const submitSignupStep = jest.fn();
		const myProps = {
			...tplProps,
			additionalStepData: { test: 23 },
			submitSignupStep,
		};

		const comp = new PlansAtomicStoreStep( myProps );
		const cartItem = { product_slug: PLAN_FREE };
		comp.onSelectPlan( cartItem );
		expect( submitSignupStep ).toHaveBeenCalled();

		const calls = submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ].test ).toEqual( 23 );
	} );

	test( 'Should call submitSignupStep with correct providedDependencies', () => {
		const submitSignupStep = jest.fn();

		const comp = new PlansAtomicStoreStep( { ...tplProps, submitSignupStep } );
		const cartItem = { product_slug: PLAN_FREE };
		comp.onSelectPlan( cartItem );
		expect( submitSignupStep ).toHaveBeenCalled();

		const calls = submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 1 ].cartItem ).toBe( cartItem );
	} );

	test( 'Should call recordEvent when cartItem is specified', () => {
		const recordTracksEvent = jest.fn();

		const comp = new PlansAtomicStoreStep( { ...tplProps, recordTracksEvent } );
		const cartItem = { product_slug: PLAN_FREE, free_trial: false };
		comp.onSelectPlan( cartItem );

		expect( recordTracksEvent ).toHaveBeenCalled();

		const calls = recordTracksEvent.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ] ).toEqual( 'calypso_signup_plan_select' );
		expect( args[ 1 ] ).toEqual( {
			product_slug: PLAN_FREE,
			free_trial: false,
			from_section: 'Step section name',
		} );
	} );

	[
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_2_YEARS,
	].forEach( ( plan ) => {
		test( `Should add is_store_signup to cartItem.extra when processing wp.com business and eCommerce plans (${ plan })`, () => {
			const myProps = {
				...tplProps,
				goToNextStep: jest.fn(),
			};
			const cartItem = { product_slug: plan };
			const comp = new PlansAtomicStoreStep( myProps );
			comp.onSelectPlan( cartItem );
			expect( myProps.goToNextStep ).toHaveBeenCalled();
			expect( cartItem.extra ).toEqual( {
				is_store_signup: true,
			} );
		} );
	} );

	test( 'Should not add is_store_signup to cartItem.extra when processing wp.com business plans and designType is not "store"', () => {
		const myProps = {
			...tplProps,
			signupDependencies: {
				...tplProps.signupDependencies,
				designType: 'other',
			},
		};
		const cartItem = { product_slug: PLAN_FREE };
		const comp = new PlansAtomicStoreStep( myProps );
		comp.onSelectPlan( cartItem );
		expect( cartItem.extra ).toEqual( undefined );
	} );

	[
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_BLOGGER,
		PLAN_BLOGGER_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( ( plan ) => {
		test( `Should not add is_store_signup to cartItem.extra when processing non-wp.com non-business plan (${ plan })`, () => {
			const cartItem = { product_slug: plan };
			const comp = new PlansAtomicStoreStep( tplProps );
			comp.onSelectPlan( cartItem );
			expect( cartItem.extra ).toBeUndefined();
		} );
	} );
} );
