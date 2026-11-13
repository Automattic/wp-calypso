/**
 * @jest-environment jsdom
 */
import { dispatch, select } from '@wordpress/data';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ONBOARD_STORE } from '../../../../stores';
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import { runFlowNavigation } from '../../../test/helpers';
import { STUDENT_PLAN_SLUG } from '../../education/education';
import studentFlow from '../student';
import type { StepperStep } from '../../../internals/types';
import type { OnboardActions } from '@automattic/data-stores';

const runNavigation = ( options: Parameters< typeof runFlowNavigation >[ 1 ] ) =>
	runFlowNavigation( studentFlow, options, 'forward' );

describe( 'Student Flow', () => {
	const originalLocation = window.location;

	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: {
				...originalLocation,
				assign: jest.fn(),
				replace: jest.fn(),
				href: 'https://wordpress.com/setup/student',
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
		( dispatch( ONBOARD_STORE ) as OnboardActions ).resetOnboardStore();
	} );

	it( 'starts with the eligibility step and requires login on every step', () => {
		const steps = studentFlow.initialize();

		expect( steps.map( ( step ) => step.slug ) ).toEqual( [
			STEPS.STUDENT_PLAN_ELIGIBILITY.slug,
			STEPS.DOMAIN_SEARCH.slug,
			STEPS.USE_MY_DOMAIN.slug,
			STEPS.SITE_CREATION_STEP.slug,
			STEPS.PROCESSING.slug,
			STEPS.ERROR.slug,
		] );
		expect( steps.every( ( step: StepperStep ) => step.requiresLoggedInUser ) ).toBe( true );
	} );

	it( 'continues from an eligible account to domains with the Student plan in the cart', () => {
		const destination = runNavigation( {
			from: STEPS.STUDENT_PLAN_ELIGIBILITY,
			dependencies: { eligible: true },
		} );

		expect( destination ).toMatchDestination( {
			step: STEPS.DOMAIN_SEARCH,
			query: null,
		} );
		expect( select( ONBOARD_STORE ).getPlanCartItem() ).toEqual( {
			product_slug: STUDENT_PLAN_SLUG,
		} );
	} );

	/**
	 * Going back from the domain step must not land on the eligibility step, which would
	 * send an eligible account forward again.
	 */
	it( 'replaces the eligibility step in the history when it continues', () => {
		const navigate = jest.fn();
		const Navigation = () => {
			const { submit } = studentFlow.useStepNavigation(
				STEPS.STUDENT_PLAN_ELIGIBILITY.slug,
				navigate
			);
			submit?.( {
				slug: STEPS.STUDENT_PLAN_ELIGIBILITY.slug,
				providedDependencies: { eligible: true },
			} );
			return null;
		};

		renderWithProvider(
			<MemoryRouter>
				<Navigation />
			</MemoryRouter>
		);

		expect( navigate ).toHaveBeenCalledWith( STEPS.DOMAIN_SEARCH.slug, undefined, true );
	} );

	it( 'does not advance past the eligibility step without an eligible account', () => {
		expect( () =>
			runNavigation( {
				from: STEPS.STUDENT_PLAN_ELIGIBILITY,
				dependencies: {},
			} )
		).toThrow( 'Student plan eligibility must be confirmed before continuing' );
		expect( select( ONBOARD_STORE ).getPlanCartItem() ).toBeFalsy();
	} );

	/**
	 * The later steps come from the education flow; the checkout links must still name this flow.
	 */
	it( 'sends a created site to checkout with links back to the student flow', () => {
		runNavigation( {
			from: STEPS.PROCESSING,
			dependencies: {
				processingResult: ProcessingResult.SUCCESS,
				siteId: 123,
				siteSlug: 'student-example.wordpress.com',
				goToCheckout: true,
			},
		} );

		const checkoutUrl = new URL(
			( window.location.replace as jest.Mock ).mock.calls[ 0 ][ 0 ],
			'https://wordpress.com'
		);

		expect( checkoutUrl.pathname ).toBe( '/checkout/student-example.wordpress.com' );
		expect( checkoutUrl.searchParams.get( 'redirect_to' ) ).toBe(
			'/home/student-example.wordpress.com?ref=student'
		);
		expect( new URL( checkoutUrl.searchParams.get( 'checkoutBackUrl' ) ?? '' ).pathname ).toBe(
			'/setup/student/domains'
		);
	} );

	describe( 'deep-link guard', () => {
		const renderSideEffect = ( currentStepSlug: string ) => {
			const navigate = jest.fn();
			const SideEffect = () => {
				studentFlow.useSideEffect?.(
					currentStepSlug as Parameters< NonNullable< typeof studentFlow.useSideEffect > >[ 0 ],
					navigate
				);
				return null;
			};

			renderWithProvider( <SideEffect /> );
			return navigate;
		};

		it.each( [
			[ 'domains', STEPS.DOMAIN_SEARCH.slug ],
			[ 'error', STEPS.ERROR.slug ],
		] )(
			'sends a deep link to the %s step without the Student plan back to eligibility',
			( _name, slug ) => {
				expect( renderSideEffect( slug ) ).toHaveBeenCalledWith(
					STEPS.STUDENT_PLAN_ELIGIBILITY.slug
				);
			}
		);

		it( 'stays on a later step once the Student plan is in the cart', () => {
			( dispatch( ONBOARD_STORE ) as OnboardActions ).setPlanCartItem( {
				product_slug: STUDENT_PLAN_SLUG,
			} );

			expect( renderSideEffect( STEPS.DOMAIN_SEARCH.slug ) ).not.toHaveBeenCalled();
		} );

		it( 'does not redirect on the eligibility step itself', () => {
			expect( renderSideEffect( STEPS.STUDENT_PLAN_ELIGIBILITY.slug ) ).not.toHaveBeenCalled();
		} );
	} );

	/**
	 * A localized root such as `/setup/student/es` arrives with the locale as the step slug.
	 */
	it.each( [
		[ 'the flow root', '' ],
		[ 'a localized flow root', 'es' ],
	] )( 'starts with a clean slate at %s', ( _name, currentStepSlug ) => {
		( dispatch( ONBOARD_STORE ) as OnboardActions ).setPlanCartItem( {
			product_slug: STUDENT_PLAN_SLUG,
		} );
		const SideEffect = () => {
			studentFlow.useSideEffect?.(
				currentStepSlug as Parameters< NonNullable< typeof studentFlow.useSideEffect > >[ 0 ],
				jest.fn()
			);
			return null;
		};

		renderWithProvider( <SideEffect /> );

		expect( select( ONBOARD_STORE ).getPlanCartItem() ).toBeFalsy();
	} );
} );
