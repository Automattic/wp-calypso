/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { resolveSelect, useSelect } from '@wordpress/data';
import { clearSessionStorageQuery } from 'calypso/components/domains/wpcom-domain-search/use-query-handler';
import { STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT } from 'calypso/landing/stepper/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { setSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import { useStepNavigationWithTracking } from '../../../internals/hooks/use-step-navigation-with-tracking';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import onboarding from '../onboarding';

jest.mock( 'calypso/components/domains/wpcom-domain-search/use-query-handler', () => ( {
	clearSessionStorageQuery: jest.fn(),
} ) );

const mockResetOnboardStore = jest.fn();
const mockSetPlanCartItem = jest.fn();
const mockSetProductCartItems = jest.fn();

// The product catalog's feature list pulls @wordpress/components in through this, and that
// chain needs a real @wordpress/data, which this file mocks. Only JSX uses these.
jest.mock( '@automattic/components', () => ( {
	MaterialIcon: () => null,
	ExternalLink: () => null,
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		resetOnboardStore: mockResetOnboardStore,
		setDomain: jest.fn(),
		setDomainCartItem: jest.fn(),
		setDomainCartItems: jest.fn(),
		setHideFreePlan: jest.fn(),
		setPlanCartItem: mockSetPlanCartItem,
		setProductCartItems: mockSetProductCartItems,
		setSignupDomainOrigin: jest.fn(),
		setSiteUrl: jest.fn(),
	} ),
	useSelect: jest.fn( () => ( {} ) ),
	resolveSelect: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: jest.fn( () => new URLSearchParams( '' ) ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-flow-locale', () => ( {
	useFlowLocale: jest.fn( () => 'en' ),
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
	useDispatch: () => jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/survicate', () => ( {
	addSurvicate: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/signup', () => ( {
	SIGNUP_DOMAIN_ORIGIN: {},
} ) );

jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn(),
	useExperiment: jest.fn( () => [ false, null ] ),
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
	SITE_STORE: 'SITE_STORE',
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	// Real add-on constants: the barrel is too heavy for this environment, this file is not.
	AddOns: jest.requireActual( '@automattic/data-stores/src/add-ons/constants' ),
} ) );

jest.mock(
	'calypso/landing/stepper/declarative-flow/internals/hooks/use-purchase-plan-notification',
	() => ( {
		usePurchasePlanNotification: jest.fn( () => ( { setShouldShowNotification: jest.fn() } ) ),
	} )
);

jest.mock( 'calypso/signup/storageUtils', () => ( {
	persistSignupDestination: jest.fn(),
	setSignupCompleteFlowName: jest.fn(),
	setSignupCompleteSlug: jest.fn(),
	clearSignupCompleteSlug: jest.fn(),
	clearSignupCompleteFlowName: jest.fn(),
	clearSignupDestinationCookie: jest.fn(),
	clearSignupCompleteSiteID: jest.fn(),
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	ONBOARDING_FLOW: 'onboarding',
	SITE_SETUP_FLOW: 'site-setup',
	clearStepPersistedState: jest.fn(),
	isOnboardingFlow: ( flow: string ) => flow === 'onboarding',
} ) );

describe( 'onboarding flow side effects', () => {
	const navigate = jest.fn();
	const renderSideEffect = ( currentStepSlug: string | null ) =>
		renderHook( () =>
			// `useSideEffect` reads `this.name`, so it must be invoked bound to the flow.
			onboarding.useSideEffect?.call(
				onboarding,
				currentStepSlug as Parameters< NonNullable< typeof onboarding.useSideEffect > >[ 0 ],
				navigate
			)
		);

	beforeEach( () => {
		jest.clearAllMocks();
		sessionStorage.clear();
	} );

	it( 'clears the stored domain-search query when the flow is freshly entered', () => {
		renderSideEffect( null );

		expect( clearSessionStorageQuery ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'preserves the stored domain-search query when navigating back within the flow', () => {
		renderSideEffect( 'domains' );

		expect( clearSessionStorageQuery ).not.toHaveBeenCalled();
	} );

	describe( 'post-checkout hand-off from the site-selected signup flow', () => {
		afterEach( () => {
			window.history.replaceState( null, '', '/' );
		} );

		it( 'drops store state left behind by an earlier onboarding run', () => {
			window.history.replaceState(
				null,
				'',
				'/setup/onboarding/post-checkout-onboarding?siteSlug=example.com&ref=site-selected'
			);

			renderSideEffect( 'post-checkout-onboarding' );

			expect( mockResetOnboardStore ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'keeps the store for an onboarding run returning from its own checkout', () => {
			window.history.replaceState(
				null,
				'',
				'/setup/onboarding/post-checkout-onboarding?siteSlug=example.com'
			);

			renderSideEffect( 'post-checkout-onboarding' );

			expect( mockResetOnboardStore ).not.toHaveBeenCalled();
		} );

		// The ref stays in the URL past post-checkout-onboarding, and a reset there would also
		// clear the pending action that step just set for processing to run.
		it.each( [ 'processing', 'setup-your-site-ai' ] )(
			'keeps the store on %s after the hand-off',
			( step ) => {
				window.history.replaceState(
					null,
					'',
					`/setup/onboarding/${ step }?siteSlug=example.com&ref=site-selected`
				);

				renderSideEffect( step );

				expect( mockResetOnboardStore ).not.toHaveBeenCalled();
			}
		);
	} );
} );

describe( 'onboarding flow step props', () => {
	const renderStepsProps = ( search: string ) => {
		( useQuery as jest.Mock ).mockReturnValue( new URLSearchParams( search ) );
		return renderHook( () => onboarding.useStepsProps?.call( onboarding ) ).result.current;
	};

	it( 'skips the processing completion of a site-selected hand-off, which signup already recorded', () => {
		expect( renderStepsProps( '?siteSlug=example.com&ref=site-selected' ) ).toEqual( {
			processing: { skipSignupComplete: true },
		} );
	} );

	it( 'records the processing completion of an onboarding run', () => {
		expect( renderStepsProps( '?siteSlug=example.com' ) ).toEqual( {
			processing: { skipSignupComplete: false },
		} );
	} );
} );

describe( 'onboarding flow post-checkout processing', () => {
	const originalLocation = window.location;
	const navigate = jest.fn();

	const submitProcessing = async (
		search: string,
		providedDependencies: Record< string, unknown > = {}
	) => {
		( useQuery as jest.Mock ).mockReturnValue( new URLSearchParams( search ) );

		const { result } = renderHook( () =>
			onboarding.useStepNavigation.call(
				onboarding,
				'processing' as Parameters< typeof onboarding.useStepNavigation >[ 0 ],
				navigate
			)
		);

		await result.current.submit?.( {
			slug: 'processing',
			providedDependencies: {
				processingResult: ProcessingResult.SUCCESS,
				siteSlug: 'example.com',
				...providedDependencies,
			},
		} as Parameters< NonNullable< typeof result.current.submit > >[ 0 ] );
	};

	beforeEach( () => {
		jest.clearAllMocks();
		// A site without the Launchpad options lands on My Home.
		( resolveSelect as jest.Mock ).mockReturnValue( { getSite: async () => ( { options: {} } ) } );
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, replace: jest.fn() },
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

	it( 'sends a site-selected purchase with Big Sky to the setup-your-site-ai chooser', async () => {
		await submitProcessing( '?siteSlug=example.com&ref=site-selected', {
			postCheckoutBigSky: true,
		} );

		expect( navigate ).toHaveBeenCalledWith( 'setup-your-site-ai' );
		expect( window.location.replace ).not.toHaveBeenCalled();
	} );

	it( 'keeps a site-selected purchase attributed to that flow', async () => {
		await submitProcessing( '?siteSlug=example.com&ref=site-selected' );

		expect( window.location.replace ).toHaveBeenCalledWith( '/home/example.com?ref=site-selected' );
		expect( setSignupCompleteFlowName ).toHaveBeenCalledWith( 'site-selected' );
	} );

	it( 'attributes an onboarding purchase to onboarding', async () => {
		await submitProcessing( '?siteSlug=example.com' );

		expect( window.location.replace ).toHaveBeenCalledWith( '/home/example.com?ref=onboarding' );
		expect( setSignupCompleteFlowName ).toHaveBeenCalledWith( 'onboarding' );
	} );
} );

describe( 'onboarding flow use-my-domain navigation', () => {
	const submitUseMyDomain = ( providedDependencies: Record< string, unknown >, search = '' ) => {
		const query = new URLSearchParams( search );
		( useQuery as jest.Mock ).mockReturnValue( query );
		( useSelect as jest.Mock ).mockReturnValue(
			query.get( 'blueprint' ) ? { blueprint: query.get( 'blueprint' ) } : {}
		);

		const navigate = jest.fn();
		const { result } = renderHook( () =>
			// `useStepNavigation` reads `this.name`, so it must be invoked bound to the flow.
			onboarding.useStepNavigation.call(
				onboarding,
				'use-my-domain' as Parameters< typeof onboarding.useStepNavigation >[ 0 ],
				navigate
			)
		);

		result.current.submit?.( {
			slug: 'use-my-domain',
			providedDependencies,
		} as Parameters< NonNullable< typeof result.current.submit > >[ 0 ] );

		return { navigate };
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	// Regression: the destination must be the bare `use-my-domain` slug. A leading
	// slash makes navigate() pass `/use-my-domain` as the router step param, which
	// doesn't match a step and drops the user back on the domains step.
	it( 'navigates to the use-my-domain step (no leading slash) when a mode and domain are submitted', () => {
		const { navigate } = submitUseMyDomain( {
			mode: 'transfer-or-connect',
			domain: 'example.com',
		} );

		expect( navigate ).toHaveBeenCalledTimes( 1 );

		const destination = navigate.mock.calls[ 0 ][ 0 ] as string;
		expect( destination.startsWith( '/' ) ).toBe( false );

		const [ pathname, queryString ] = destination.split( '?' );
		expect( pathname ).toBe( 'use-my-domain' );

		const query = new URLSearchParams( queryString );
		expect( query.get( 'step' ) ).toBe( 'transfer-or-connect' );
		expect( query.get( 'initialQuery' ) ).toBe( 'example.com' );
	} );

	// A connected or transferred domain needs a paid plan. The free-plan shortcut a Simple
	// blueprint build takes after the domain step would send this order to checkout with a
	// domain and no plan, so it still goes through the plans grid.
	it( 'goes to the plans step for a connected domain even on a Simple blueprint build', () => {
		const { navigate } = submitUseMyDomain(
			{ domainCartItem: { product_slug: 'domain_map', meta: 'example.com' } },
			'blueprint=zoom&build_dest=simple'
		);

		expect( navigate ).toHaveBeenCalledWith( 'plans' );
		expect( mockSetPlanCartItem ).not.toHaveBeenCalled();
	} );
} );

describe( 'onboarding flow domains navigation', () => {
	const submitDomains = ( search: string, cartPlan?: string ) => {
		const query = new URLSearchParams( search );
		( useQuery as jest.Mock ).mockReturnValue( query );
		( useSelect as jest.Mock ).mockReturnValue( {
			...( cartPlan ? { planCartItem: { product_slug: cartPlan } } : {} ),
			// The blueprint step stores the slug it verified; the flow reads it from the store.
			...( query.get( 'blueprint' ) ? { blueprint: query.get( 'blueprint' ) } : {} ),
		} );

		const navigate = jest.fn();
		const { result } = renderHook( () =>
			// `useStepNavigation` reads `this.name`, so it must be invoked bound to the flow.
			onboarding.useStepNavigation.call(
				onboarding,
				'domains' as Parameters< typeof onboarding.useStepNavigation >[ 0 ],
				navigate
			)
		);

		result.current.submit?.( {
			slug: 'domains',
			providedDependencies: { siteUrl: 'example.wordpress.com' },
		} as Parameters< NonNullable< typeof result.current.submit > >[ 0 ] );

		return navigate;
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	// Without this, redirected traffic is asked to pick a plan it already chose.
	it( 'skips the plans step when the URL names a plan already in the cart', () => {
		const navigate = submitDomains( 'plan=personal-bundle', 'personal-bundle' );

		expect( navigate ).toHaveBeenCalledWith( 'create-site', undefined, false );
	} );

	// A cold step URL never ran the seeding; skipping would hand over a free site.
	it( 'goes to the plans step when the cart does not hold the named plan', () => {
		const navigate = submitDomains( 'plan=personal-bundle' );

		expect( navigate ).toHaveBeenCalledWith( 'plans' );
	} );

	it( 'goes to the plans step when the URL names no plan', () => {
		const navigate = submitDomains( '' );

		expect( navigate ).toHaveBeenCalledWith( 'plans' );
	} );

	// A Simple blueprint build is a free-plan run: the grid has nothing to ask.
	it( 'skips the plans step with an empty cart on a Simple blueprint build', () => {
		const navigate = submitDomains( 'blueprint=zoom&build_dest=simple' );

		expect( navigate ).toHaveBeenCalledWith( 'create-site', undefined, false );
		expect( mockSetPlanCartItem ).toHaveBeenCalledWith( null );
		expect( mockSetProductCartItems ).toHaveBeenCalledWith( [] );
	} );
} );

describe( 'onboarding flow plan preselection', () => {
	const enterFlowAt = ( search: string, currentStepSlug: string | null ) => {
		window.history.replaceState( {}, '', `/setup/onboarding${ search }` );

		renderHook( () =>
			// `useSideEffect` reads `this.name`, so it must be invoked bound to the flow.
			onboarding.useSideEffect?.call(
				onboarding,
				currentStepSlug as Parameters< NonNullable< typeof onboarding.useSideEffect > >[ 0 ],
				jest.fn()
			)
		);
	};

	beforeEach( () => {
		jest.clearAllMocks();
		sessionStorage.clear();
	} );

	// Entry resets the store. Seed any earlier and the customer arrives at checkout with no
	// plan, because navigation still skips the grid.
	it( 'seeds the cart after the entry reset, not before it', () => {
		enterFlowAt( '?plan=personal-bundle', null );

		expect( mockResetOnboardStore ).toHaveBeenCalled();
		expect( mockSetPlanCartItem ).toHaveBeenCalledWith( { product_slug: 'personal-bundle' } );
		expect( mockResetOnboardStore.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			mockSetPlanCartItem.mock.invocationCallOrder[ 0 ]
		);
	} );

	it( 'carries a storage add-on into the cart alongside the plan', () => {
		enterFlowAt( '?plan=business-bundle&storage=50gb-storage-add-on', null );

		expect( mockSetProductCartItems ).toHaveBeenCalledWith( [
			expect.objectContaining( { product_slug: 'wordpress_com_1gb_space_addon_yearly' } ),
		] );
	} );

	// `/setup/onboarding` is public and the query rides through the redirect untouched, so
	// this is the only thing stopping a combination that was never purchasable.
	it( 'refuses a storage add-on on a plan that cannot buy one', () => {
		enterFlowAt( '?plan=personal-bundle&storage=50gb-storage-add-on', null );

		expect( mockSetPlanCartItem ).toHaveBeenCalledWith( { product_slug: 'personal-bundle' } );
		expect( mockSetProductCartItems ).not.toHaveBeenCalled();
	} );

	it( 'leaves the cart alone when no plan is named', () => {
		enterFlowAt( '', null );

		expect( mockSetPlanCartItem ).not.toHaveBeenCalled();
	} );

	// The route match is unconstrained, so a localized entry hands over the locale where a
	// step slug would be. Read as a step, it leaves the cart unseeded.
	it( 'seeds the cart on a localized entry, where the locale arrives as the step slug', () => {
		enterFlowAt( '/es?plan=personal-bundle', 'es' );

		expect( mockSetPlanCartItem ).toHaveBeenCalledWith( { product_slug: 'personal-bundle' } );
	} );

	it( 'leaves the cart alone on a real step, which is not flow entry', () => {
		enterFlowAt( '/domains?plan=personal-bundle', 'domains' );

		expect( mockSetPlanCartItem ).not.toHaveBeenCalled();
	} );
} );

describe( 'onboarding flow tracks event props', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	// The consumer keys its effect on object identity, so a new object each render records
	// another signup start.
	it( 'returns a stable object across renders', () => {
		( useQuery as jest.Mock ).mockReturnValue(
			new URLSearchParams( 'plan=personal-bundle&coupon=WC_ABC' )
		);

		const { result, rerender } = renderHook( () =>
			onboarding.useTracksEventProps?.call( onboarding )
		);
		const first = result.current;
		rerender();

		expect( result.current ).toBe( first );
		expect( first?.eventsProperties.calypso_signup_start ).toEqual( {
			preselected_plan: 'personal-bundle',
			coupon: 'WC_ABC',
		} );

		// WordCamp coupon links name no plan.
		( useQuery as jest.Mock ).mockReturnValue( new URLSearchParams( 'coupon=WC_ABC' ) );
		rerender();

		expect( result.current?.eventsProperties.calypso_signup_start ).toEqual( {
			coupon: 'WC_ABC',
		} );
	} );
} );

describe( 'onboarding flow plans-page experiment enrolment', () => {
	const enterFlowAt = ( search: string ) => {
		window.history.replaceState( {}, '', `/setup/onboarding${ search }` );

		renderHook( () =>
			// `useSideEffect` reads `this.name`, so it must be invoked bound to the flow.
			onboarding.useSideEffect?.call(
				onboarding,
				'' as Parameters< NonNullable< typeof onboarding.useSideEffect > >[ 0 ],
				jest.fn()
			)
		);
	};

	beforeEach( () => {
		jest.clearAllMocks();
		sessionStorage.clear();
	} );

	// A preselected plan skips the grid, so enrolling puts someone in a plans-page test they
	// never see and dilutes it for everyone who does.
	it( 'does not enrol a visit that skips the plans step', () => {
		enterFlowAt( '?plan=personal-bundle' );

		expect( loadExperimentAssignment ).not.toHaveBeenCalled();
	} );

	it( 'enrols an ordinary visit', () => {
		enterFlowAt( '' );

		expect( loadExperimentAssignment ).toHaveBeenCalledWith(
			'calypso_plans_page_visual_separation_2025_09_v2'
		);
	} );
} );

describe( 'onboarding flow playground navigation', () => {
	const locationDescriptor = Object.getOwnPropertyDescriptor( window, 'location' );
	const assign = jest.fn();

	const mockLocation = ( search: string ) => {
		window.history.replaceState( null, '', `/setup/onboarding/playground${ search }` );
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { ...window.location, assign },
		} );
	};

	const submitPlayground = ( search: string ) => {
		mockLocation( search );

		const navigate = jest.fn();
		const { result } = renderHook( () =>
			// `useStepNavigation` reads `this.name`, so it must be invoked bound to the flow.
			onboarding.useStepNavigation.call(
				onboarding,
				'playground' as Parameters< typeof onboarding.useStepNavigation >[ 0 ],
				navigate
			)
		);

		result.current.submit?.( {
			slug: 'playground',
			providedDependencies: {},
		} as Parameters< NonNullable< typeof result.current.submit > >[ 0 ] );

		return { navigate };
	};

	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
		Object.defineProperty( window, 'location', locationDescriptor as PropertyDescriptor );
		window.history.replaceState( null, '', '/' );
	} );

	it( 'leaves for the entrepreneur flow only once Tracks has had time to send the submit events', () => {
		const { navigate } = submitPlayground( '?intent=woocommerce&playground=abc' );

		expect( assign ).not.toHaveBeenCalled();
		jest.advanceTimersByTime( 249 );
		expect( assign ).not.toHaveBeenCalled();

		jest.advanceTimersByTime( 1 );
		expect( assign ).toHaveBeenCalledTimes( 1 );
		expect( assign ).toHaveBeenCalledWith(
			'/setup/entrepreneur?from=playground-publish&playground=abc'
		);
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'records the Stepper submit event before leaving for the entrepreneur flow', () => {
		mockLocation( '?intent=woocommerce&playground=abc' );

		const { result } = renderHook( () =>
			useStepNavigationWithTracking( {
				flow: onboarding,
				currentStepRoute: 'playground',
				navigate: jest.fn(),
			} )
		);
		result.current.submit?.();

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
			expect.objectContaining( { flow: 'onboarding', step: 'playground' } )
		);
		expect( assign ).not.toHaveBeenCalled();

		jest.advanceTimersByTime( 250 );
		expect( assign ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'stays in Stepper and goes to the domains step straight away without the WooCommerce intent', () => {
		const { navigate } = submitPlayground( '?playground=abc' );

		expect( navigate ).toHaveBeenCalledWith(
			'domains?back_to=%2Fsetup%2Fonboarding%2Fplayground%3Fplayground%3Dabc'
		);
		jest.runAllTimers();
		expect( assign ).not.toHaveBeenCalled();
	} );
} );
