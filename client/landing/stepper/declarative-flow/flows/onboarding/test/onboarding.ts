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
	useSelect: jest.fn(),
	resolveSelect: jest.fn(),
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
		usePurchasePlanNotification: jest.fn(),
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
