/**
 * @jest-environment jsdom
 */
/* eslint-disable no-restricted-imports */
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { render } from '../../../test-utils';
import { OmnibarLaunchButton } from '../omnibar-launch-button';

// ---------- Module mocks ----------

// Capture the props passed to the shared view so each test can inspect and
// invoke the callbacks directly.
let viewProps: Record< string, unknown > = {};
jest.mock( 'calypso/layout/masterbar/masterbar-launch-button', () => ( {
	__esModule: true,
	MasterbarLaunchButtonView: ( props: Record< string, unknown > ) => {
		viewProps = props;
		return <div data-testid="view" />;
	},
} ) );

// Mock the api-queries factories so we can recognize which query is which by
// its queryKey, but otherwise leave them as simple config objects.
jest.mock( '@automattic/api-queries', () => ( {
	siteByIdQuery: jest.fn( ( siteId: number ) => ( {
		queryKey: [ 'site', siteId ],
		queryFn: jest.fn(),
	} ) ),
	siteDomainsQuery: jest.fn( ( siteId: number ) => ( {
		queryKey: [ 'site-domains', siteId ],
		queryFn: jest.fn(),
	} ) ),
	siteLaunchMutation: jest.fn( ( siteId: number ) => ( {
		mutationFn: jest.fn(),
		mutationKey: [ 'site-launch', siteId ],
	} ) ),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	updateLaunchpadSettings: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// Selectively mock tanstack hooks but preserve the rest of the module so the
// dashboard test-utils still gets a real QueryClientProvider.
const mockMutate = jest.fn();
const mockInvalidateQueries = jest.fn();
let replaceStateSpy: jest.SpyInstance;
jest.mock( '@tanstack/react-query', () => {
	const actual = jest.requireActual( '@tanstack/react-query' );
	return {
		...actual,
		useQuery: jest.fn(),
		useMutation: jest.fn(),
		useQueryClient: jest.fn(),
	};
} );

// ---------- Fixtures ----------

const SITE_ID = 1234;

type PartialSite = {
	ID: number;
	slug: string;
	is_wpcom_atomic?: boolean;
	launch_status?: string;
	plan?: { product_slug?: string; is_free?: boolean };
	options?: { site_creation_flow?: string };
};

type PartialDomain = { domain: string };

const defaultSite: PartialSite = {
	ID: SITE_ID,
	slug: 'example.wordpress.com',
	is_wpcom_atomic: false,
	launch_status: 'unlaunched',
	plan: { product_slug: 'free_plan', is_free: true },
	options: { site_creation_flow: 'onboarding' },
};

const oneDomain: PartialDomain[] = [ { domain: 'example.wordpress.com' } ];

function setupQueries( {
	site = defaultSite,
	domains = oneDomain,
}: { site?: PartialSite | undefined; domains?: PartialDomain[] } = {} ) {
	( useQuery as jest.Mock ).mockImplementation( ( config: { queryKey: unknown[] } ) => {
		if ( config.queryKey[ 0 ] === 'site' ) {
			return { data: site };
		}
		if ( config.queryKey[ 0 ] === 'site-domains' ) {
			return { data: domains };
		}
		return { data: undefined };
	} );
}

beforeEach( () => {
	jest.clearAllMocks();
	viewProps = {};

	( useMutation as jest.Mock ).mockReturnValue( {
		mutate: mockMutate,
		isPending: false,
	} );
	( useQueryClient as jest.Mock ).mockReturnValue( {
		invalidateQueries: mockInvalidateQueries,
	} );

	setupQueries();

	// Stub window.location so direct assignments to href don't trigger jsdom
	// navigation errors. Tests read back from this mock to observe redirects.
	Object.defineProperty( window, 'location', {
		configurable: true,
		writable: true,
		value: {
			href: 'http://localhost/current-path',
			pathname: '/current-path',
			assign: jest.fn(),
		},
	} );

	// Spy on history.replaceState without actually mutating jsdom's URL (which
	// would throw under same-origin checks in our stubbed location).
	replaceStateSpy = jest
		.spyOn( window.history, 'replaceState' )
		.mockImplementation( () => undefined );
} );

afterEach( () => {
	replaceStateSpy.mockRestore();
} );

// ---------- Tests ----------

describe( 'OmnibarLaunchButton', () => {
	describe( 'view props wiring', () => {
		it( 'passes siteSlug, isWpcomAtomic and trackingSource="dashboard" to the view', () => {
			setupQueries( {
				site: { ...defaultSite, slug: 'my-site.com', is_wpcom_atomic: true },
			} );
			render( <OmnibarLaunchButton siteId={ SITE_ID } /> );

			expect( viewProps.siteId ).toBe( SITE_ID );
			expect( viewProps.siteSlug ).toBe( 'my-site.com' );
			expect( viewProps.isWpcomAtomic ).toBe( true );
			expect( viewProps.trackingSource ).toBe( 'dashboard' );
		} );

		it( 'uses the standalone recordTracksEvent for the recordTracks callback', () => {
			render( <OmnibarLaunchButton siteId={ SITE_ID } /> );
			( viewProps.recordTracks as ( n: string, p: Record< string, unknown > ) => void )(
				'calypso_masterbar_launch_site',
				{ source: 'dashboard' }
			);
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_masterbar_launch_site', {
				source: 'dashboard',
			} );
		} );
	} );

	describe( 'onDefaultLaunch branching (parity with classic thunk)', () => {
		it( 'no-ops if the site is already launched', () => {
			setupQueries( { site: { ...defaultSite, launch_status: 'launched' } } );
			render( <OmnibarLaunchButton siteId={ SITE_ID } /> );

			( viewProps.onDefaultLaunch as () => void )();

			expect( mockMutate ).not.toHaveBeenCalled();
			expect( window.location.href ).toBe( 'http://localhost/current-path' );
		} );

		it( 'calls siteLaunchMutation directly when the site is paid with multiple domains', () => {
			setupQueries( {
				site: {
					...defaultSite,
					plan: { product_slug: 'business-bundle', is_free: false },
				},
				domains: [ { domain: 'example.wordpress.com' }, { domain: 'example.com' } ],
			} );
			render( <OmnibarLaunchButton siteId={ SITE_ID } /> );

			( viewProps.onDefaultLaunch as () => void )();

			expect( mockMutate ).toHaveBeenCalledTimes( 1 );
			expect( window.location.href ).toBe( 'http://localhost/current-path' );
		} );

		it( 'calls siteLaunchMutation directly when the site is on the hosting trial', () => {
			setupQueries( {
				site: {
					...defaultSite,
					plan: { product_slug: 'wp_bundle_hosting_trial_monthly', is_free: false },
				},
			} );
			render( <OmnibarLaunchButton siteId={ SITE_ID } /> );

			( viewProps.onDefaultLaunch as () => void )();

			expect( mockMutate ).toHaveBeenCalledTimes( 1 );
			expect( window.location.href ).toBe( 'http://localhost/current-path' );
		} );

		it( 'redirects to /setup/ai-site-builder/domains for a Big Sky trial', () => {
			setupQueries( {
				site: {
					...defaultSite,
					plan: { product_slug: 'free_plan', is_free: true },
					options: { site_creation_flow: 'ai-site-builder' },
				},
			} );
			render( <OmnibarLaunchButton siteId={ SITE_ID } /> );

			( viewProps.onDefaultLaunch as () => void )();

			expect( window.location.href ).toContain( '/setup/ai-site-builder/domains' );
			expect( window.location.href ).toContain( `siteId=${ SITE_ID }` );
			expect( window.location.href ).toContain( 'redirect=site-launch' );
			expect( mockMutate ).not.toHaveBeenCalled();
		} );

		it( 'does not treat a paid AI-site-builder site as a Big Sky trial (falls through to default)', () => {
			setupQueries( {
				site: {
					...defaultSite,
					plan: { product_slug: 'business-bundle', is_free: false },
					options: { site_creation_flow: 'ai-site-builder' },
				},
			} );
			render( <OmnibarLaunchButton siteId={ SITE_ID } /> );

			( viewProps.onDefaultLaunch as () => void )();

			// Paid + single domain → falls through to the default redirect.
			expect( window.location.href ).toContain( '/start/launch-site' );
			expect( window.location.href ).not.toContain( '/setup/ai-site-builder/domains' );
		} );

		it( 'redirects to /start/launch-site by default', () => {
			render( <OmnibarLaunchButton siteId={ SITE_ID } /> );

			( viewProps.onDefaultLaunch as () => void )();

			expect( window.location.href ).toContain( '/start/launch-site' );
			expect( window.location.href ).toContain( 'siteSlug=example.wordpress.com' );
			expect( mockMutate ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'onSiteLaunched', () => {
		it( 'invalidates the site query and adds ?celebrateLaunch=true', () => {
			render( <OmnibarLaunchButton siteId={ SITE_ID } /> );

			( viewProps.onSiteLaunched as ( isAtomic: boolean ) => void )( false );

			expect( mockInvalidateQueries ).toHaveBeenCalledWith( {
				queryKey: [ 'site', SITE_ID ],
			} );
			expect( replaceStateSpy ).toHaveBeenCalledWith(
				{},
				'',
				expect.stringContaining( 'celebrateLaunch=true' )
			);
			expect( updateLaunchpadSettings ).not.toHaveBeenCalled();
		} );

		it( 'also updates launchpad settings for atomic sites', () => {
			render( <OmnibarLaunchButton siteId={ SITE_ID } /> );

			( viewProps.onSiteLaunched as ( isAtomic: boolean ) => void )( true );

			expect( updateLaunchpadSettings ).toHaveBeenCalledWith( SITE_ID, {
				checklist_statuses: { site_launched: true },
			} );
			expect( mockInvalidateQueries ).toHaveBeenCalled();
		} );
	} );
} );
