/** @format */

jest.mock( 'lib/analytics', () => ( {
	tracks: {
		recordEvent: jest.fn(),
	},
} ) );

jest.mock( 'lib/signup/actions', () => ( {
	submitSignupStep: jest.fn(),
	saveSignupStep: jest.fn(),
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
	translate: x => x,
} ) );

import analytics from 'lib/analytics';
import SignupActions from 'lib/signup/actions';

const translate = x => x;

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { PlansStep, isDotBlogDomainRegistration } from '../index';
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
	translate,
	siteGoals: '',
	stepName: 'Step name',
	stepSectionName: 'Step section name',
	signupDependencies: {
		domainItem: null,
	},
	goToNextStep: function() {},
};

describe( 'Plans basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <PlansStep { ...props } /> );
		expect( comp.find( '.plans-step' ).length ).toBe( 1 );
	} );
} );

describe( 'Plans.onSelectPlan', () => {
	const tplProps = {
		...props,
		signupDependencies: {
			...props.signupDependencies,
		},
		flowName: 'ecommerce',
		designType: 'store',
	};

	test( 'Should call goToNextStep', () => {
		const myProps = {
			...tplProps,
			goToNextStep: jest.fn(),
		};
		const comp = new PlansStep( myProps );
		comp.onSelectPlan( { product_slug: PLAN_FREE } );
		expect( myProps.goToNextStep ).toBeCalled();
	} );

	test( 'Should call submitSignupStep with step details', () => {
		SignupActions.submitSignupStep.mockReset();

		const comp = new PlansStep( tplProps );
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

		const comp = new PlansStep( myProps );
		const cartItem = { product_slug: PLAN_FREE };
		comp.onSelectPlan( cartItem );
		expect( SignupActions.submitSignupStep ).toBeCalled();

		const calls = SignupActions.submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ].test ).toEqual( 23 );
	} );

	test( 'Should call submitSignupStep with correct providedDependencies', () => {
		SignupActions.submitSignupStep.mockReset();

		const comp = new PlansStep( tplProps );
		const cartItem = { product_slug: PLAN_FREE };
		comp.onSelectPlan( cartItem );
		expect( SignupActions.submitSignupStep ).toBeCalled();

		const calls = SignupActions.submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 2 ].cartItem ).toBe( cartItem );
		expect( args[ 2 ].privacyItem ).toEqual( null );
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

		const comp = new PlansStep( myProps );
		const cartItem = { product_slug: PLAN_FREE };
		comp.onSelectPlan( cartItem );

		expect( SignupActions.submitSignupStep ).toBeCalled();

		const calls = SignupActions.submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ].privacyItem ).toEqual( 43 );
		expect( args[ 2 ].privacyItem ).toEqual( 43 );
	} );

	test( 'Should call recordEvent when cartItem is specified', () => {
		analytics.tracks.recordEvent.mockReset();

		const comp = new PlansStep( tplProps );
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

	[
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_2_YEARS,
	].forEach( plan => {
		test( `Should add is_store_signup to cartItem.extra when processing wp.com business and eCommerce plans (${ plan })`, () => {
			const myProps = {
				...tplProps,
				goToNextStep: jest.fn(),
			};
			const cartItem = { product_slug: plan };
			const comp = new PlansStep( myProps );
			comp.onSelectPlan( cartItem );
			expect( myProps.goToNextStep ).toBeCalled();
			expect( cartItem.extra ).toEqual( {
				is_store_signup: true,
			} );
		} );
	} );

	[
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_2_YEARS,
	].forEach( plan => {
		test( `Should not add is_store_signup to cartItem.extra when flowName is different than 'ecommerce' (${ plan })`, () => {
			const myProps = {
				...tplProps,
				flowName: 'signup',
				goToNextStep: jest.fn(),
			};
			const cartItem = { product_slug: plan };
			const comp = new PlansStep( myProps );
			comp.onSelectPlan( cartItem );
			expect( myProps.goToNextStep ).toBeCalled();
			expect( cartItem.extra ).toEqual( undefined );
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
		const comp = new PlansStep( myProps );
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
	].forEach( plan => {
		test( `Should not add is_store_signup to cartItem.extra when processing non-wp.com non-business plan (${ plan })`, () => {
			const cartItem = { product_slug: plan };
			const comp = new PlansStep( tplProps );
			comp.onSelectPlan( cartItem );
			expect( cartItem.extra ).toEqual( undefined );
		} );
	} );
} );

describe( 'Plans.getCustomerType', () => {
	describe( 'Should return "business" if at least one site goal seem related to business', () => {
		const goals = [ 'sell', 'share', 'educate,sell', 'promote,educate' ];
		goals.forEach( goal =>
			test( `Should return "business" for site goals ${ goal }`, () => {
				const comp = new PlansStep( { ...props, siteGoals: 'sell' } );
				expect( comp.getCustomerType() ).toEqual( 'business' );
			} )
		);
	} );
	describe( 'Should return "business" if none of site goal sseem related to business', () => {
		const goals = [ 'educate', 'share', 'showcase', 'share,showcase,educate' ];
		goals.forEach( goal =>
			test( `Should return "business" for site goals ${ goal }`, () => {
				const comp = new PlansStep( { ...props, siteGoals: 'sell' } );
				expect( comp.getCustomerType() ).toEqual( 'business' );
			} )
		);
	} );
	test( 'Should return site type property is siteType is provided', () => {
		const comp = new PlansStep( { ...props, siteGoals: 'share', siteType: 'online-store' } );
		expect( comp.getCustomerType() ).toEqual( 'business' );
	} );
	test( "Should return customerType prop when it's provided", () => {
		const comp = new PlansStep( { ...props, siteGoals: 'sell', customerType: 'personal' } );
		expect( comp.getCustomerType() ).toEqual( 'personal' );
	} );
} );

describe( 'isDotBlogDomainRegistration()', () => {
	test( 'should return true for dot blog domain registrations', () => {
		expect(
			isDotBlogDomainRegistration( {
				meta: 'domain.blog',
				is_domain_registration: true,
			} )
		).toBe( true );
	} );

	test( 'should return false for dot blog domain mapping', () => {
		expect(
			isDotBlogDomainRegistration( {
				meta: 'domain.blog',
				is_domain_registration: false,
				is_domain_mapping: true,
			} )
		).toBe( false );
	} );

	test( 'should return false for dot com domain registrations', () => {
		expect(
			isDotBlogDomainRegistration( {
				meta: 'domain.com',
				is_domain_registration: true,
			} )
		).toBe( false );
	} );
} );
