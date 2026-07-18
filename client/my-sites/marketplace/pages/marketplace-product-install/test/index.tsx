/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import MarketplaceProductInstall from '../index';

const PLUGIN_SLUG = 'give';
const SITE_ID = 1;
const ADMIN_URL = 'https://example.wordpress.com/wp-admin/';
const ACTIVE_LIST_URL = `${ ADMIN_URL }plugins.php?activate=true&plugin_status=active`;

// The state the mocked selectors/queries below see. A test moves the flow along by changing this
// and re-rendering; beforeEach restores the defaults.
const DEFAULT_SITE = {
	// What the /plugins/{slug}/active endpoint reports: null (not fetched), 'processing', 'inactive',
	// or 'complete'.
	pluginActive: null as null | 'processing' | 'inactive' | 'complete',
	// A terminal (non-503) read error from that endpoint.
	pluginActiveError: null as { status: number } | null,
	// Whether the manage-plugins capability has propagated.
	canManage: true,
	// Whether the site is Atomic (the endpoint only applies to Atomic sites).
	siteIsAtomic: true,
	// A self-hosted Jetpack site, which the endpoint does not cover.
	isJetpack: false,
	// The plugin the plugin-list selector reports, for the flows the endpoint can't reach.
	installedPlugin: null as { slug: string; id: string; active?: boolean } | null,
	// The checkout purchase-flow handoff: which product it installed, and its status.
	purchaseProduct: 'give' as string | null,
	purchaseStatus: 'PENDING',
	// The install status the plugin-list selector reports (e.g. a terminal local install failure).
	installStatus: null as { status: string; action: string; error?: unknown } | null,
	// A monotonically increasing poll counter; each increment simulates a completed endpoint poll.
	pollTick: 0,
};
const mockSite = { ...DEFAULT_SITE };

const mockDispatch = jest.fn();

// react-query keeps a stable data reference across unchanged polls (structural sharing). Mimic that
// so activation retries are driven by dataUpdatedAt (pollTick), not by every re-render.
let mockActiveData: unknown;
let mockActiveKey: string | undefined;

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );

jest.mock( 'calypso/state/plugins/installed/actions', () => ( {
	installPlugin: jest.fn( () => ( { type: 'INSTALL_PLUGIN' } ) ),
	activatePlugin: jest.fn( () => ( { type: 'ACTIVATE_PLUGIN' } ) ),
} ) );
jest.mock( 'calypso/state/themes/actions', () => ( {
	initiateThemeTransfer: jest.fn( () => ( { type: 'INITIATE_TRANSFER' } ) ),
	installAndActivateTheme: jest.fn( () => ( { type: 'INSTALL_THEME' } ) ),
	requestActiveTheme: jest.fn( () => ( { type: 'REQUEST_ACTIVE_THEME' } ) ),
} ) );
jest.mock( 'calypso/state/atomic/transfers/actions', () => ( {
	initiateAtomicTransfer: jest.fn( () => ( { type: 'INITIATE_ATOMIC_TRANSFER' } ) ),
} ) );
jest.mock( 'calypso/state/plugins/wporg/actions', () => ( {
	fetchPluginData: jest.fn( () => ( { type: 'FETCH_PLUGIN_DATA' } ) ),
} ) );

jest.mock( 'calypso/state/plugins/wporg/selectors', () => ( {
	getPlugin: () => ( { slug: 'give', wporg: true } ),
	isFetched: () => true,
} ) );
jest.mock( 'calypso/state/plugins/installed/selectors-ts', () => ( {
	getPluginOnSite: () => mockSite.installedPlugin,
	getStatusForPlugin: () => mockSite.installStatus,
} ) );
jest.mock( 'calypso/state/automated-transfer/selectors', () => ( {
	getAutomatedTransferStatus: () => 'complete',
} ) );
jest.mock( 'calypso/state/marketplace/purchase-flow/selectors', () => ( {
	getPurchaseFlowState: () => ( {
		pluginInstallationStatus: mockSite.purchaseStatus,
		productSlugInstalled: mockSite.purchaseProduct,
		primaryDomain: 'example.wordpress.com',
	} ),
} ) );
jest.mock( 'calypso/state/products-list/selectors', () => ( {
	getProductsList: () => ( {} ),
	isMarketplaceProduct: () => false,
} ) );
jest.mock( 'calypso/state/themes/selectors', () => ( {
	getTheme: () => null,
	isThemeActive: () => false,
} ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	isJetpackSite: () => mockSite.isJetpack,
	getSiteAdminUrl: () => null,
} ) );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( 'calypso/state/selectors/site-has-feature', () => ( {
	__esModule: true,
	default: ( _state: unknown, _siteId: number, feature: string ) =>
		feature === 'manage-plugins' ? mockSite.canManage : true,
} ) );
jest.mock( 'calypso/state/selectors/get-current-query-arguments', () => ( {
	getCurrentQueryArguments: () => ( {} ),
} ) );
jest.mock( 'calypso/state/selectors/get-plugin-upload-error', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( 'calypso/state/selectors/get-plugin-upload-progress', () => ( {
	__esModule: true,
	default: () => 0,
} ) );
jest.mock( 'calypso/state/selectors/get-uploaded-plugin-id', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( 'calypso/state/selectors/is-plugin-upload-complete', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: () => ( { ID: 1, slug: 'example.wordpress.com' } ),
	getSelectedSiteId: () => 1,
	getSelectedSiteSlug: () => 'example.wordpress.com',
} ) );

// Two useQuery callers: the fresh site (siteByIdQuery) and the plugin-active endpoint.
jest.mock( '@tanstack/react-query', () => ( {
	useQuery: ( options: { queryKey?: unknown[]; enabled?: boolean } ) => {
		if ( ( options?.queryKey ?? [] ).includes( 'plugin-active' ) ) {
			// A disabled query has no data, like react-query.
			if ( options?.enabled === false ) {
				return { data: undefined, error: null, dataUpdatedAt: 0 };
			}
			const key = String( mockSite.pluginActive );
			if ( key !== mockActiveKey ) {
				mockActiveKey = key;
				mockActiveData = mockSite.pluginActive
					? { status: mockSite.pluginActive, plugin: { slug: 'give', id: 'give/give' } }
					: undefined;
			}
			return {
				data: mockActiveData,
				error: mockSite.pluginActiveError,
				dataUpdatedAt: mockSite.pollTick,
			};
		}
		return {
			data: {
				ID: 1,
				is_wpcom_atomic: mockSite.siteIsAtomic,
				options: { admin_url: 'https://example.wordpress.com/wp-admin/' },
			},
		};
	},
} ) );
jest.mock( 'calypso/dashboard/utils/site-atomic-transfers', () => ( {
	isAtomicTransferredSite: ( site: { is_wpcom_atomic?: boolean } ) => !! site?.is_wpcom_atomic,
} ) );
jest.mock( '@automattic/api-queries', () => ( {
	siteByIdQuery: () => ( { queryKey: [ 'site' ] } ),
	sitePluginActiveQuery: ( _siteId: number, slug: string ) => ( {
		queryKey: [ 'plugin-active', slug ],
	} ),
} ) );
jest.mock( 'calypso/data/marketplace/use-wpcom-plugins-query', () => ( {
	useWPCOMPlugin: () => ( { data: null } ),
} ) );
jest.mock( 'calypso/components/data/query-theme', () => ( { useQueryTheme: () => null } ) );
jest.mock( 'calypso/components/data/query-active-theme', () => () => null );
jest.mock( 'calypso/components/data/query-jetpack-plugins', () => () => null );
jest.mock( 'calypso/components/data/query-products-list', () => () => null );
jest.mock( 'calypso/layout/masterbar/masterbar', () => () => null );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => null );
jest.mock( 'calypso/my-sites/marketplace/util', () => ( { waitFor: () => Promise.resolve() } ) );
jest.mock( 'calypso/my-sites/marketplace/components/progressbar', () => ( {
	__esModule: true,
	default: () => <div>Installing plugin</div>,
} ) );

const { activatePlugin } = jest.requireMock( 'calypso/state/plugins/installed/actions' );

const install = () => render( <MarketplaceProductInstall pluginSlug={ PLUGIN_SLUG } /> );

const settle = async ( rendered: ReturnType< typeof install > ) => {
	rendered.rerender( <MarketplaceProductInstall pluginSlug={ PLUGIN_SLUG } /> );
	await act( async () => {} );
};

// The install kicks off, then hands over to the endpoint poll. That takes a render and a resolved
// promise, so let both settle.
const start = async ( rendered: ReturnType< typeof install > ) => {
	await act( async () => {} );
	await settle( rendered );
};

describe( 'MarketplaceProductInstall', () => {
	let originalLocation: Location;

	beforeEach( () => {
		jest.clearAllMocks();
		Object.assign( mockSite, DEFAULT_SITE );
		mockActiveKey = undefined;
		mockActiveData = undefined;
		originalLocation = window.location;
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
	} );

	it( 'redirects once the active-status endpoint reports the plugin complete', async () => {
		mockSite.pluginActive = 'processing';
		const rendered = install();
		await start( rendered );

		// Still installing: no redirect yet.
		expect( window.location.href ).toBe( '' );

		mockSite.pluginActive = 'complete';
		await settle( rendered );
		expect( window.location.href ).toBe( ACTIVE_LIST_URL );
	} );

	it( 'activates the plugin when the endpoint reports it installed but inactive', async () => {
		const rendered = install();
		await start( rendered );

		// `inactive` means installed-but-not-active: dispatch the targeted activation, using the id the
		// endpoint returns.
		activatePlugin.mockClear();
		mockSite.pluginActive = 'inactive';
		await settle( rendered );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE_ID, {
			id: 'give/give',
			slug: PLUGIN_SLUG,
		} );

		// A re-render without a new poll does not re-dispatch.
		await settle( rendered );
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
		expect( window.location.href ).toBe( '' );
	} );

	it( 'retries activation a bounded number of times, then shows an error', async () => {
		mockSite.pluginActive = 'inactive';
		const rendered = install();
		await start( rendered ); // attempt 1

		// Each subsequent poll that still reports inactive retries, up to the cap of 3.
		mockSite.pollTick = 1;
		await settle( rendered ); // attempt 2
		mockSite.pollTick = 2;
		await settle( rendered ); // attempt 3
		expect( activatePlugin ).toHaveBeenCalledTimes( 3 );
		expect( screen.queryByText( /could not activate it/ ) ).toBeNull();

		// The next inactive poll exhausts the retries and surfaces the failure.
		mockSite.pollTick = 3;
		await settle( rendered );
		expect( activatePlugin ).toHaveBeenCalledTimes( 3 );
		expect( screen.getByText( /could not activate it/ ) ).toBeVisible();
		expect( window.location.href ).toBe( '' );
	} );

	it( 'redirects when a retried activation eventually succeeds', async () => {
		mockSite.pluginActive = 'inactive';
		const rendered = install();
		await start( rendered ); // attempt 1

		mockSite.pollTick = 1;
		await settle( rendered ); // attempt 2, still inactive
		expect( activatePlugin ).toHaveBeenCalledTimes( 2 );

		// A later poll reports it active.
		mockSite.pluginActive = 'complete';
		await settle( rendered );
		expect( window.location.href ).toBe( ACTIVE_LIST_URL );
	} );

	it( 'activates and redirects on a non-Atomic site through the plugin list', async () => {
		// The endpoint is Atomic-only, so a self-hosted Jetpack site keeps the plugin-list path.
		mockSite.siteIsAtomic = false;
		mockSite.isJetpack = true;
		const rendered = install();
		await start( rendered );

		// The plugin turns up installed-but-inactive and is activated here.
		activatePlugin.mockClear();
		mockSite.installedPlugin = { slug: 'give', id: 'give/give' };
		await settle( rendered );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE_ID, { id: 'give/give', slug: 'give' } );
		expect( window.location.href ).toBe( '' );

		// Once the plugin list reports it active, redirect.
		mockSite.installedPlugin = { slug: 'give', id: 'give/give', active: true };
		await settle( rendered );
		expect( window.location.href ).toBe( ACTIVE_LIST_URL );
	} );

	it( 'does not activate a plugin when no install was requested', async () => {
		// A completed purchase with no handoff for this plugin: opening the URL must not activate it,
		// even though the endpoint would report it inactive.
		mockSite.purchaseProduct = null;
		mockSite.purchaseStatus = 'COMPLETED';
		mockSite.pluginActive = 'inactive';
		const rendered = install();
		await start( rendered );

		expect( activatePlugin ).not.toHaveBeenCalled();
		expect( window.location.href ).toBe( '' );
	} );

	it( 'stops polling and shows an error when a local install fails with no plugin', async () => {
		mockSite.installStatus = {
			status: 'error',
			action: 'INSTALL_PLUGIN',
			error: { error: 'no_package' },
		};
		mockSite.pluginActive = 'processing';
		const rendered = install();
		await start( rendered );

		// The endpoint is disabled (nothing to reconcile), so it neither activates nor polls; the
		// install error is shown.
		expect( activatePlugin ).not.toHaveBeenCalled();
		expect( screen.getByText( /An error occurred while installing the plugin/ ) ).toBeVisible();
	} );

	it( 'shows an error on a terminal read failure and does not redirect', async () => {
		mockSite.pluginActiveError = { status: 502 };
		const rendered = install();
		await start( rendered );

		expect( screen.getByText( /could not verify the plugin/ ) ).toBeVisible();
		expect( window.location.href ).toBe( '' );
	} );
} );
