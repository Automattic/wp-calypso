/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import onboarding from '../onboarding';

let mockDeferredFlagOn = true;
let mockQueryParams = new URLSearchParams( '' );

jest.mock( '@automattic/calypso-config', () => {
	const actual = jest.requireActual( '@automattic/calypso-config' );
	const configFn = ( key: string ) => actual( key );
	Object.assign( configFn, actual, {
		isEnabled: ( flag: string ) =>
			flag === 'onboarding/email-verification-deferred'
				? mockDeferredFlagOn
				: actual.isEnabled( flag ),
	} );
	return configFn;
} );

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
jest.mock( 'calypso/lib/explat', () => ( { loadExperimentAssignment: jest.fn() } ) );

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
		mockDeferredFlagOn = true;
		mockQueryParams = new URLSearchParams( '' );
		jest.clearAllMocks();
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

	it( 'keeps the free order on site creation when the deferred flag is off', async () => {
		mockDeferredFlagOn = false;

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
} );
