/** @format */

jest.mock( 'lib/analytics', () => ( {
	tracks: {
		recordEvent: jest.fn(),
	},
} ) );

jest.mock( 'lib/signup/actions', () => ( {
	submitSignupStep: jest.fn(),
} ) );

jest.mock( 'lib/cart-values', () => ( {
	cartItems: {
		domainPrivacyProtection: jest.fn( () => {
			return 43;
		} ),
	},
} ) );

jest.mock( 'signup/step-wrapper', () => 'step-wrapper' );
jest.mock( 'my-sites/plan-features', () => 'plan-features' );

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

import analytics from 'lib/analytics';
import SignupActions from 'lib/signup/actions';

const translate = x => x;

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
import { PlansAtomicStoreStep } from '../index';

const props = {
	translate,
	stepName: 'Step name',
	stepSectionName: 'Step section name',
	signupDependencies: {
		domainItem: null,
	},
	goToNextStep: function() {},
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
		signupDependencies: {
			...props.signupDependencies,
		},
		designType: 'store',
	};

	test( 'Should call goToNextStep', () => {
		const myProps = {
			...tplProps,
			goToNextStep: jest.fn(),
		};
		const comp = new PlansAtomicStoreStep( myProps );
		comp.onSelectPlan( { product_slug: PLAN_FREE } );
		expect( myProps.goToNextStep ).toBeCalled();
	} );

	test( 'Should call submitSignupStep with step details', () => {
		SignupActions.submitSignupStep.mockReset();

		const comp = new PlansAtomicStoreStep( tplProps );
		const cartItem = { product_slug: PLAN_FREE };
		comp.onSelectPlan( cartItem );
		expect( SignupActions.submitSignupStep ).toBeCalled();

		const calls = SignupActions.submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( typeof args[ 0 ].processingMessage ).toEqual( 'string' );
		expect( args[ 0 ].stepName ).toEqual( 'Step name' );
		expect( args[ 0 ].stepSectionName ).toEqual( 'Step section name' );
		expect( args[ 0 ].cartItem ).toBe( cartItem );
		expect( args[ 0 ].privacyItem ).toEqual( null );
		expect( 'test' in args[ 0 ] ).toEqual( false );
	} );

	test( 'Should call submitSignupStep with additionalStepData if specified', () => {
		const myProps = {
			...tplProps,
			additionalStepData: {
				test: 23,
			},
		};
		SignupActions.submitSignupStep.mockReset();

		const comp = new PlansAtomicStoreStep( myProps );
		const cartItem = { product_slug: PLAN_FREE };
		comp.onSelectPlan( cartItem );
		expect( SignupActions.submitSignupStep ).toBeCalled();

		const calls = SignupActions.submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ].test ).toEqual( 23 );
	} );

	test( 'Should call submitSignupStep with correct providedDependencies', () => {
		SignupActions.submitSignupStep.mockReset();

		const comp = new PlansAtomicStoreStep( tplProps );
		const cartItem = { product_slug: PLAN_FREE };
		comp.onSelectPlan( cartItem );
		expect( SignupActions.submitSignupStep ).toBeCalled();

		const calls = SignupActions.submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 1 ].cartItem ).toBe( cartItem );
		expect( args[ 1 ].privacyItem ).toEqual( null );
		expect( args[ 0 ].privacyItem ).toEqual( null );
	} );

	test( 'Should call submitSignupStep with correct privacyItem', () => {
		const myProps = {
			...tplProps,
			signupDependencies: {
				domainItem: {
					meta: {},
				},
			},
		};

		SignupActions.submitSignupStep.mockReset();

		const comp = new PlansAtomicStoreStep( myProps );
		const cartItem = { product_slug: PLAN_FREE };
		comp.onSelectPlan( cartItem );

		expect( SignupActions.submitSignupStep ).toBeCalled();

		const calls = SignupActions.submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ].privacyItem ).toEqual( 43 );
		expect( args[ 1 ].privacyItem ).toEqual( 43 );
	} );

	test( 'Should call recordEvent when cartItem is specified', () => {
		analytics.tracks.recordEvent.mockReset();

		const comp = new PlansAtomicStoreStep( tplProps );
		const cartItem = { product_slug: PLAN_FREE, free_trial: false };
		comp.onSelectPlan( cartItem );

		expect( analytics.tracks.recordEvent ).toBeCalled();

		const calls = analytics.tracks.recordEvent.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ] ).toEqual( 'calypso_signup_plan_select' );
		expect( args[ 1 ] ).toEqual( {
			product_slug: PLAN_FREE,
			free_trial: false,
			from_section: 'Step section name',
		} );
	} );

	[ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ].forEach( plan => {
		test( `Should add is_store_signup to cartItem.extra when processing wp.com business plans (${ plan })`, () => {
			const myProps = {
				...tplProps,
				goToNextStep: jest.fn(),
			};
			const cartItem = { product_slug: plan };
			const comp = new PlansAtomicStoreStep( myProps );
			comp.onSelectPlan( cartItem );
			expect( myProps.goToNextStep ).toBeCalled();
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
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( plan => {
		test( `Should not add is_store_signup to cartItem.extra when processing non-wp.com non-business plan (${ plan })`, () => {
			const cartItem = { product_slug: plan };
			const comp = new PlansAtomicStoreStep( tplProps );
			comp.onSelectPlan( cartItem );
			expect( cartItem.extra ).toEqual( undefined );
		} );
	} );
} );
