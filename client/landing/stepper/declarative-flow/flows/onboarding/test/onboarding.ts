/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { clearSessionStorageQuery } from 'calypso/components/domains/wpcom-domain-search/use-query-handler';
import onboarding, { getPlaygroundPostCheckoutDestination } from '../onboarding';

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

describe( 'getPlaygroundPostCheckoutDestination', () => {
	it( 'initiates the Atomic transfer before continuing to the Playground importer', () => {
		const destination = getPlaygroundPostCheckoutDestination( {
			locale: 'it',
			siteId: 256300535,
			siteSlug: 'example.wordpress.com',
			playgroundId: 'playground-id',
		} );
		const transferUrl = new URL( destination, 'https://wordpress.com' );

		expect( transferUrl.pathname ).toBe( '/setup/transferring-hosted-site' );
		expect( transferUrl.searchParams.get( 'siteId' ) ).toBe( '256300535' );
		expect( transferUrl.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
		expect( transferUrl.searchParams.get( 'initiate_transfer_context' ) ).toBe( 'onboarding' );

		const importerUrl = new URL(
			transferUrl.searchParams.get( 'redirect_to' ) as string,
			'https://wordpress.com'
		);
		expect( importerUrl.pathname ).toBe( '/setup/site-setup/importerPlayground/it' );
		expect( importerUrl.searchParams.get( 'siteId' ) ).toBe( '256300535' );
		expect( importerUrl.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
		expect( importerUrl.searchParams.get( 'playground' ) ).toBe( 'playground-id' );
	} );
} );

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
