/**
 * @jest-environment jsdom
 */
import { PLAN_STUDENT } from '@automattic/calypso-products';
import { select } from '@wordpress/data';
import { ONBOARD_STORE } from '../../../../stores';
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import { runFlowNavigation } from '../../../test/helpers';
import educationFlow from '../education';
import type { StepperStep } from '../../../internals/types';

const runNavigation = ( options: Parameters< typeof runFlowNavigation >[ 1 ] ) =>
	runFlowNavigation( educationFlow, options, 'forward' );

describe( 'Education Flow', () => {
	const originalLocation = window.location;

	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: {
				...originalLocation,
				assign: jest.fn(),
				replace: jest.fn(),
				href: 'https://wordpress.com/setup/education',
			},
			writable: true,
			configurable: true,
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
			configurable: true,
		} );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'initializes the education steps with required login and no plan in the cart yet', () => {
		const steps = educationFlow.initialize();
		const slugs = steps.map( ( step ) => step.slug );

		expect( slugs ).toEqual( [
			STEPS.EDUCATION_STUDENT_VALIDATION.slug,
			STEPS.DOMAIN_SEARCH.slug,
			STEPS.USE_MY_DOMAIN.slug,
			STEPS.SITE_CREATION_STEP.slug,
			STEPS.PROCESSING.slug,
			STEPS.ERROR.slug,
		] );
		expect( steps.every( ( step: StepperStep ) => step.requiresLoggedInUser ) ).toBe( true );
		expect( select( ONBOARD_STORE ).getPlanCartItem() ).not.toEqual( {
			product_slug: PLAN_STUDENT,
		} );
	} );

	it( 'continues from education validation to domains and adds the Student plan', () => {
		const destination = runNavigation( {
			from: STEPS.EDUCATION_STUDENT_VALIDATION,
			dependencies: { inviteCodeValidated: true },
		} );

		expect( destination ).toMatchDestination( {
			step: STEPS.DOMAIN_SEARCH,
			query: null,
		} );
		expect( select( ONBOARD_STORE ).getPlanCartItem() ).toEqual( {
			product_slug: PLAN_STUDENT,
		} );
	} );

	it( 'does not advance past validation without the validated marker', () => {
		expect( () =>
			runNavigation( {
				from: STEPS.EDUCATION_STUDENT_VALIDATION,
				dependencies: {},
			} )
		).toThrow( 'Education invite code must be validated before continuing' );
	} );

	it( 'continues from domain search to site creation', () => {
		const destination = runNavigation( {
			from: STEPS.DOMAIN_SEARCH,
			dependencies: {
				siteUrl: 'school-example',
				suggestion: {
					domain_name: 'school-example.wordpress.com',
					is_free: true,
				},
				domainItem: undefined,
				domainCart: [],
				signupDomainOrigin: 'free',
			},
		} );

		expect( destination ).toMatchDestination( {
			step: STEPS.SITE_CREATION_STEP,
			query: null,
		} );
	} );

	it( 'continues from use-my-domain to site creation with the preselected plan', () => {
		const destination = runNavigation( {
			from: STEPS.USE_MY_DOMAIN,
			dependencies: {
				domainCartItem: {
					product_slug: 'domain_map',
					meta: 'school.edu',
				},
			},
		} );

		expect( destination ).toMatchDestination( {
			step: STEPS.SITE_CREATION_STEP,
			query: null,
		} );
	} );

	it( 'continues from create site to processing', () => {
		const destination = runNavigation( {
			from: STEPS.SITE_CREATION_STEP,
		} );

		expect( destination ).toMatchDestination( {
			step: STEPS.PROCESSING,
			query: null,
		} );
	} );

	it( 'redirects processing success to checkout', () => {
		runNavigation( {
			from: STEPS.PROCESSING,
			dependencies: {
				processingResult: ProcessingResult.SUCCESS,
				siteId: 123,
				siteSlug: 'school-example.wordpress.com',
				goToCheckout: true,
			},
		} );

		const checkoutUrl = new URL(
			( window.location.replace as jest.Mock ).mock.calls[ 0 ][ 0 ],
			'https://wordpress.com'
		);

		expect( checkoutUrl.pathname ).toBe( '/checkout/school-example.wordpress.com' );
		expect( checkoutUrl.searchParams.get( 'signup' ) ).toBe( '1' );
		expect( checkoutUrl.searchParams.get( 'redirect_to' ) ).toBe(
			'/home/school-example.wordpress.com?ref=education'
		);
	} );

	it( 'forwards the coupon query param to checkout', () => {
		runNavigation( {
			from: STEPS.PROCESSING,
			dependencies: {
				processingResult: ProcessingResult.SUCCESS,
				siteId: 123,
				siteSlug: 'school-example.wordpress.com',
				goToCheckout: true,
			},
			query: { coupon: 'EDU50' },
		} );

		const checkoutUrl = new URL(
			( window.location.replace as jest.Mock ).mock.calls[ 0 ][ 0 ],
			'https://wordpress.com'
		);

		expect( checkoutUrl.searchParams.get( 'coupon' ) ).toBe( 'EDU50' );
	} );

	it( 'navigates processing failure to the error step', () => {
		const destination = runNavigation( {
			from: STEPS.PROCESSING,
			dependencies: {
				processingResult: ProcessingResult.FAILURE,
			},
		} );

		expect( destination ).toMatchDestination( {
			step: STEPS.ERROR,
			query: null,
		} );
	} );
} );
