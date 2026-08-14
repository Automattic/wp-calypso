/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import onboarding from '../onboarding';

// Variant B (post-plan-selection gate) vs. control, driven by the experiment assignment.
let mockVariant = 'treatment_post_plan_selection';
let mockQueryParams = new URLSearchParams( '' );

jest.mock( 'calypso/components/domains/wpcom-domain-search/use-query-handler', () => ( {
	clearSessionStorageQuery: jest.fn(),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		resetOnboardStore: jest.fn(),
		setDomain: jest.fn(),
		setDomainCartItem: jest.fn(),
		setDomainCartItems: jest.fn(),
		setPlanCartItem: jest.fn(),
		setProductCartItems: jest.fn(),
		setSiteUrl: jest.fn(),
		setSignupDomainOrigin: jest.fn(),
		setHideFreePlan: jest.fn(),
	} ),
	useSelect: jest.fn( () => ( {} ) ),
	resolveSelect: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: jest.fn( () => mockQueryParams ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-flow-locale', () => ( {
	useFlowLocale: jest.fn( () => 'en' ),
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
	useDispatch: () => jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/survicate', () => ( { addSurvicate: jest.fn() } ) );
jest.mock( 'calypso/lib/analytics/signup', () => ( { SIGNUP_DOMAIN_ORIGIN: {} } ) );
jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn(),
	useExperiment: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
	SITE_STORE: 'SITE_STORE',
} ) );

jest.mock( '@automattic/data-stores', () => ( {} ) );

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

jest.mock( 'calypso/lib/ai-launchpad', () => ( {
	resolveLaunchpadPersonalizationVariation: jest.fn( async () => 'control' ),
	getLaunchpadPersonalizationDestination: jest.fn(),
} ) );

jest.mock( 'calypso/lib/url', () => ( { pathToUrl: ( path: string ) => path } ) );

jest.mock( '../../../helpers/get-onboarding-post-checkout-destination', () => ( {
	getOnboardingPostCheckoutDestination: jest.fn( () => [
		'/home/example.wordpress.com',
		null,
		null,
	] ),
} ) );

jest.mock( '../step-counter-config', () => ( {
	getOnboardingStepperPosition: () => ( { current: 3, total: 3 } ),
} ) );

// Runs the `processing` case for a successful, paid order (goToCheckout) with a mocked
// `window.location`, and returns the URL passed to `window.location.replace`.
const submitPaidProcessing = async () => {
	const replace = jest.fn();
	const originalLocation = Object.getOwnPropertyDescriptor( window, 'location' );
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: { href: 'http://localhost/', search: '', replace },
	} );

	try {
		const navigate = jest.fn();
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
				goToCheckout: true,
				siteSlug: 'example.wordpress.com',
				siteId: 123,
			},
		} as Parameters< NonNullable< typeof result.current.submit > >[ 0 ] );

		return replace.mock.calls[ 0 ]?.[ 0 ] ? decodeURIComponent( replace.mock.calls[ 0 ][ 0 ] ) : '';
	} finally {
		if ( originalLocation ) {
			Object.defineProperty( window, 'location', originalLocation );
		}
	}
};

const submitPlans = async ( providedDependencies: Record< string, unknown > ) => {
	const navigate = jest.fn();
	const { result } = renderHook( () =>
		onboarding.useStepNavigation.call(
			onboarding,
			'plans' as Parameters< typeof onboarding.useStepNavigation >[ 0 ],
			navigate
		)
	);

	await result.current.submit?.( {
		slug: 'plans',
		providedDependencies,
	} as Parameters< NonNullable< typeof result.current.submit > >[ 0 ] );

	return { navigate };
};

describe( 'onboarding deferred email verification (Variant B)', () => {
	beforeEach( () => {
		mockVariant = 'treatment_post_plan_selection';
		mockQueryParams = new URLSearchParams( '' );
		jest.clearAllMocks();
		( useExperiment as jest.Mock ).mockImplementation(
			( _name: string, opts?: { isEligible?: boolean } ) =>
				opts?.isEligible ? [ false, { variationName: mockVariant } ] : [ false, null ]
		);
	} );

	it( 'sends a fully free order to the verification step before the site is created', async () => {
		const { navigate } = await submitPlans( { cartItems: [] } );

		expect( navigate ).toHaveBeenCalledWith(
			'email-verification?next=create-site',
			undefined,
			false
		);
	} );

	it( 'sends a paid order straight to site creation', async () => {
		const { navigate } = await submitPlans( { cartItems: [ { product_id: 1 } ] } );

		expect( navigate ).toHaveBeenCalledWith( 'create-site', undefined, false );
	} );

	it( 'keeps the free order on site creation under the control arm', async () => {
		mockVariant = 'control';

		const { navigate } = await submitPlans( { cartItems: [] } );

		expect( navigate ).toHaveBeenCalledWith( 'create-site', undefined, false );
	} );

	it( 'advances the verification step to the target named in the next query param', async () => {
		mockQueryParams = new URLSearchParams( 'next=post-checkout-onboarding' );
		const navigate = jest.fn();
		const { result } = renderHook( () =>
			onboarding.useStepNavigation.call(
				onboarding,
				'email-verification' as Parameters< typeof onboarding.useStepNavigation >[ 0 ],
				navigate
			)
		);

		await result.current.submit?.( {
			slug: 'email-verification',
			providedDependencies: {},
		} as Parameters< NonNullable< typeof result.current.submit > >[ 0 ] );

		expect( navigate ).toHaveBeenCalledWith( 'post-checkout-onboarding' );
	} );

	it( 'points a paid order back at the verification step on return from checkout', async () => {
		const checkoutUrl = await submitPaidProcessing();

		expect( checkoutUrl ).toContain( '/checkout/' );
		// The checkout return (redirect_to) lands on the deferred gate, which then advances to
		// post-checkout-onboarding once verified.
		expect( checkoutUrl ).toContain( '/setup/onboarding/email-verification' );
		expect( checkoutUrl ).toContain( 'next=post-checkout-onboarding' );
	} );

	it( 'sends a paid order straight to post-checkout-onboarding under the control arm', async () => {
		mockVariant = 'control';

		const checkoutUrl = await submitPaidProcessing();

		expect( checkoutUrl ).toContain( '/setup/onboarding/post-checkout-onboarding' );
		expect( checkoutUrl ).not.toContain( 'email-verification' );
	} );
} );
