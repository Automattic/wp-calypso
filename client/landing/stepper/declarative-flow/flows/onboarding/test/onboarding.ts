/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { clearSessionStorageQuery } from 'calypso/components/domains/wpcom-domain-search/use-query-handler';
import onboarding from '../onboarding';

jest.mock( 'calypso/components/domains/wpcom-domain-search/use-query-handler', () => ( {
	clearSessionStorageQuery: jest.fn(),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { resetOnboardStore: jest.fn() } ),
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

jest.mock( 'calypso/lib/analytics/survicate', () => ( {
	addSurvicate: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/signup', () => ( {
	SIGNUP_DOMAIN_ORIGIN: {},
} ) );

jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn(),
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
} ) );

describe( 'onboarding flow side effects', () => {
	const navigate = jest.fn();
	const renderSideEffect = ( currentStepSlug: string | null ) =>
		renderHook(
			() =>
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
} );

describe( 'onboarding flow use-my-domain navigation', () => {
	const submitUseMyDomain = ( providedDependencies: Record< string, unknown > ) => {
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
} );
