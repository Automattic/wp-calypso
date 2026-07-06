/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { resolveSelect } from '@wordpress/data';
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import onboarding from '../onboarding';

const queryParams: Record< string, string > = {};

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {} ),
	useSelect: () => ( {} ),
	resolveSelect: jest.fn(),
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
	useDispatch: () => jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
	SITE_STORE: 'SITE_STORE',
} ) );

jest.mock( '@automattic/data-stores', () => ( {} ) );

jest.mock( '@automattic/onboarding', () => ( {
	ONBOARDING_FLOW: 'onboarding',
	SITE_SETUP_FLOW: 'site-setup',
	clearStepPersistedState: jest.fn(),
} ) );

jest.mock( 'calypso/signup/storageUtils', () => ( {
	persistSignupDestination: jest.fn(),
	setSignupCompleteFlowName: jest.fn(),
	setSignupCompleteSlug: jest.fn(),
	clearSignupCompleteSlug: jest.fn(),
	clearSignupCompleteFlowName: jest.fn(),
	clearSignupDestinationCookie: jest.fn(),
	clearSignupCompleteSiteID: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/survicate', () => ( { addSurvicate: jest.fn() } ) );
jest.mock( 'calypso/lib/analytics/signup', () => ( { SIGNUP_DOMAIN_ORIGIN: {} } ) );
jest.mock( 'calypso/lib/explat', () => ( { loadExperimentAssignment: jest.fn() } ) );

jest.mock(
	'calypso/landing/stepper/declarative-flow/internals/hooks/use-purchase-plan-notification',
	() => ( { usePurchasePlanNotification: () => ( { setShouldShowNotification: jest.fn() } ) } )
);

jest.mock( 'calypso/landing/stepper/hooks/use-flow-locale', () => ( {
	useFlowLocale: () => 'en',
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => ( { get: ( key: string ) => queryParams[ key ] ?? null } ),
} ) );

describe( 'onboarding flow: setup-your-site-ai manual setup destination', () => {
	const navigate = jest.fn();
	const assign = jest.fn();

	const getSubmit = () => {
		let result: ReturnType< typeof onboarding.useStepNavigation >;
		renderHook( () => {
			// `useStepNavigation` reads `this.name`, so it must be invoked bound to the flow.
			result = onboarding.useStepNavigation.call(
				onboarding,
				'setup-your-site-ai' as Parameters< typeof onboarding.useStepNavigation >[ 0 ],
				navigate
			);
		} );
		return result!.submit;
	};

	const submitBlankSite = ( submit: ReturnType< typeof getSubmit > ) =>
		submit( {
			slug: 'setup-your-site-ai',
			providedDependencies: {
				setupChoice: 'blank-site',
				siteSlug: 'example.wordpress.com',
			},
		} as Parameters< typeof submit >[ 0 ] );

	beforeEach( () => {
		jest.clearAllMocks();
		for ( const key of Object.keys( queryParams ) ) {
			delete queryParams[ key ];
		}
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { assign },
		} );
	} );

	it( 'sends the manual-setup (blank-site) choice to My Home', async () => {
		await submitBlankSite( getSubmit() );

		expect( assign ).toHaveBeenCalledWith( '/home/example.wordpress.com' );
	} );

	it( 'keeps the Woo hosting manual-setup choice on wp-admin (wc-admin)', async () => {
		queryParams.ref = WOO_HOSTING_SOLUTIONS_REF;
		( resolveSelect as jest.Mock ).mockReturnValue( {
			getSite: async () => ( {
				options: { admin_url: 'https://example.wordpress.com/wp-admin/' },
			} ),
		} );

		await submitBlankSite( getSubmit() );

		expect( assign ).toHaveBeenCalledWith(
			'https://example.wordpress.com/wp-admin/admin.php?page=wc-admin'
		);
	} );
} );
