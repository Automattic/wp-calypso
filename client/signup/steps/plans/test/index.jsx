/** @jest-environment jsdom */
jest.mock( 'calypso/signup/step-wrapper', () => () => <div data-testid="step-wrapper" /> );
jest.mock( 'calypso/components/marketing-message', () => 'marketing-message' );
jest.mock( 'calypso/lib/wp', () => ( { req: { post: () => {} } } ) );

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
} from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import { PlansStep, isDotBlogDomainRegistration } from '../index';

const noop = () => {};
const props = {
	stepName: 'Step name',
	stepSectionName: 'Step section name',
	signupDependencies: { domainItem: null },
	saveSignupStep: noop,
	submitSignupStep: noop,
	goToNextStep: noop,
	recordTracksEvent: noop,
	translate: ( string ) => string,
};

function getCartItems( overrides ) {
	return [
		{
			product_slug: PLAN_FREE,
			...overrides,
		},
	];
}

describe( 'Plans basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		render( <PlansStep { ...props } /> );
		const stepWrapper = screen.getByTestId( 'step-wrapper' );
		expect( stepWrapper ).toBeVisible();
		expect( stepWrapper.parentNode ).toHaveClass( 'plans-step' );
	} );
} );

describe( 'Plans.onSelectPlan', () => {
	const tplProps = {
		...props,
		flowName: 'ecommerce',
		designType: 'store',
	};

	test( 'Should call goToNextStep', () => {
		const myProps = {
			...tplProps,
			goToNextStep: jest.fn(),
		};
		const comp = new PlansStep( myProps );
		comp.onSelectPlan( getCartItems() );
		expect( myProps.goToNextStep ).toHaveBeenCalled();
	} );

	test( 'Should call submitSignupStep with step details', () => {
		const submitSignupStep = jest.fn();
		const cartItems = getCartItems();
		const comp = new PlansStep( { ...tplProps, submitSignupStep } );
		comp.onSelectPlan( cartItems );
		expect( submitSignupStep ).toHaveBeenCalled();

		const calls = submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ].stepName ).toEqual( 'Step name' );
		expect( args[ 0 ].stepSectionName ).toEqual( 'Step section name' );
		expect( args[ 0 ].cartItems ).toBe( cartItems );
		expect( 'test' in args[ 0 ] ).toEqual( false );
	} );

	test( 'Should call submitSignupStep with additionalStepData if specified', () => {
		const submitSignupStep = jest.fn();
		const myProps = {
			...tplProps,
			additionalStepData: { test: 23 },
			submitSignupStep,
		};
		const comp = new PlansStep( myProps );
		comp.onSelectPlan( getCartItems() );
		expect( submitSignupStep ).toHaveBeenCalled();

		const calls = submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ].test ).toEqual( 23 );
	} );

	test( 'Should call submitSignupStep with correct providedDependencies', () => {
		const submitSignupStep = jest.fn();
		const comp = new PlansStep( { ...tplProps, submitSignupStep } );
		const cartItems = getCartItems();
		comp.onSelectPlan( cartItems );
		expect( submitSignupStep ).toHaveBeenCalled();

		const calls = submitSignupStep.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 1 ].cartItems ).toBe( cartItems );
	} );

	test( 'Should call recordEvent when cartItem is specified', () => {
		const recordTracksEvent = jest.fn();
		const comp = new PlansStep( { ...tplProps, recordTracksEvent } );
		comp.onSelectPlan( getCartItems( {} ) );

		expect( recordTracksEvent ).toHaveBeenCalled();

		const calls = recordTracksEvent.mock.calls;
		const args = calls[ calls.length - 1 ];
		expect( args[ 0 ] ).toEqual( 'calypso_signup_plan_select' );
		expect( args[ 1 ] ).toEqual( {
			product_slug: PLAN_FREE,
			from_section: 'Step section name',
		} );
	} );

	test.each( [
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_2_YEARS,
	] )(
		`Should add is_store_signup to cartItem.extra when processing wp.com business and eCommerce plans (%s)`,
		( plan ) => {
			const myProps = {
				...tplProps,
				goToNextStep: jest.fn(),
			};
			const cartItems = getCartItems( { product_slug: plan } );
			const [ planCartItem ] = cartItems;
			const comp = new PlansStep( myProps );
			comp.onSelectPlan( cartItems );
			expect( myProps.goToNextStep ).toHaveBeenCalled();
			expect( planCartItem.extra ).toEqual( {
				is_store_signup: true,
			} );
		}
	);

	test.each( [
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_2_YEARS,
	] )(
		`Should not add is_store_signup to cartItem.extra when flowName is different than 'ecommerce' (%s)`,
		( plan ) => {
			const myProps = {
				...tplProps,
				flowName: 'signup',
				goToNextStep: jest.fn(),
			};
			const cartItems = getCartItems( { product_slug: plan } );
			const [ planCartItem ] = cartItems;
			const comp = new PlansStep( myProps );
			comp.onSelectPlan( cartItems );
			expect( myProps.goToNextStep ).toHaveBeenCalled();
			expect( planCartItem.extra ).toEqual( undefined );
		}
	);

	test( 'Should not add is_store_signup to cartItem.extra when processing wp.com business plans and designType is not "store"', () => {
		const myProps = {
			...tplProps,
			signupDependencies: {
				...tplProps.signupDependencies,
				designType: 'other',
			},
		};
		const cartItems = getCartItems();
		const [ planCartItem ] = cartItems;
		const comp = new PlansStep( myProps );
		comp.onSelectPlan( cartItems );
		expect( planCartItem.extra ).toEqual( undefined );
	} );

	test.each( [
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
	] )(
		`Should not add is_store_signup to cartItem.extra when processing non-wp.com non-business plan (%s)`,
		( plan ) => {
			const cartItems = getCartItems( { product_slug: plan } );
			const [ planCartItem ] = cartItems;
			const comp = new PlansStep( tplProps );
			comp.onSelectPlan( cartItems );
			expect( planCartItem.extra ).toEqual( undefined );
		}
	);
} );

describe( 'Plans.getCustomerType', () => {
	test( "Should return customerType prop when it's provided", () => {
		const comp = new PlansStep( { ...props, customerType: 'customerType' } );
		expect( comp.getCustomerType() ).toEqual( 'customerType' );
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
