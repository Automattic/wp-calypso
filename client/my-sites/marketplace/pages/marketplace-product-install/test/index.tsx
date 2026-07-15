/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import MarketplaceProductInstall from '../index';

const PLUGIN_SLUG = 'give';
const PLUGIN = { slug: PLUGIN_SLUG, id: 'give/give' };
const ACTIVE_PLUGIN = { ...PLUGIN, active: true };
const SITE_ID = 1;
const ADMIN_URL = 'https://example.wordpress.com/wp-admin/';
const ACTIVE_LIST_URL = `${ ADMIN_URL }plugins.php?activate=true&plugin_status=active`;

// The state the component reads, as the mocked selectors below see it. A test moves the flow along
// by changing this and re-rendering; beforeEach restores these defaults.
const DEFAULT_SITE = {
	installedPlugin: null as ( typeof PLUGIN & { active?: boolean } ) | null,
	// A paid marketplace plugin is not a wp.org one, and its site is already atomic: checkout
	// transferred it and started the install.
	isAtomic: false,
	isWporgPlugin: true,
	// Whether a site-plugins request is in flight, so a test can hold off the next poll.
	isFetching: false,
	// Whether the transferred atomic site is ready for its WP Admin URL.
	isReady: true,
	// Whether the site's manage-plugins capability has propagated.
	canManage: true,
	// The checkout install status. COMPLETED means checkout finished the install, so this page does
	// not start one and stays at step 0 — the marketplace poll path.
	purchaseStatus: 'PENDING',
	// The status the store reports for the installed plugin's id, e.g. a failed activation.
	activationStatus: null as { status: string; action: string; error?: unknown } | null,
};
const mockSite = { ...DEFAULT_SITE };

const mockDispatch = jest.fn();

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );

jest.mock( 'calypso/state/plugins/installed/actions', () => ( {
	installPlugin: jest.fn( () => ( { type: 'INSTALL_PLUGIN' } ) ),
	activatePlugin: jest.fn( () => ( { type: 'ACTIVATE_PLUGIN' } ) ),
	fetchSitePlugins: jest.fn( () => ( { type: 'FETCH_SITE_PLUGINS' } ) ),
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
	getPlugin: () => ( { slug: 'give', wporg: mockSite.isWporgPlugin } ),
	isFetched: () => true,
} ) );
jest.mock( 'calypso/state/plugins/installed/selectors-ts', () => ( {
	getPluginOnSite: () => mockSite.installedPlugin,
	// Install status is keyed by slug; activation status by the installed plugin's id (PLUGIN.id).
	getStatusForPlugin: ( _state: unknown, _siteId: number, pluginId: string ) =>
		pluginId === 'give/give' ? mockSite.activationStatus : null,
	isRequesting: () => mockSite.isFetching,
} ) );
jest.mock( 'calypso/state/automated-transfer/selectors', () => ( {
	getAutomatedTransferStatus: () => 'complete',
} ) );
jest.mock( 'calypso/state/marketplace/purchase-flow/selectors', () => ( {
	getPurchaseFlowState: () => ( {
		pluginInstallationStatus: mockSite.purchaseStatus,
		productSlugInstalled: 'give',
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
	isJetpackSite: () => false,
	getSiteAdminUrl: () => null,
} ) );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => ( {
	__esModule: true,
	default: () => mockSite.isAtomic,
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

// The site the transfer hands back: atomic, with an admin URL to redirect to.
jest.mock( '@tanstack/react-query', () => ( {
	useQuery: () => ( {
		data: {
			ID: 1,
			is_wpcom_atomic: true,
			options: { admin_url: 'https://example.wordpress.com/wp-admin/' },
		},
	} ),
} ) );
jest.mock( 'calypso/dashboard/utils/site-atomic-transfers', () => ( {
	isAtomicTransferredSite: () => mockSite.isReady,
} ) );
jest.mock( '@automattic/api-queries', () => ( {
	siteByIdQuery: () => ( { queryKey: [ 'site' ] } ),
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

const { installPlugin, activatePlugin, fetchSitePlugins } = jest.requireMock(
	'calypso/state/plugins/installed/actions'
);

const install = () => render( <MarketplaceProductInstall pluginSlug={ PLUGIN_SLUG } /> );

// The store the component reads is mocked, so a change to it reaches the page on the next render.
const settle = async ( rendered: ReturnType< typeof install > ) => {
	rendered.rerender( <MarketplaceProductInstall pluginSlug={ PLUGIN_SLUG } /> );
	await act( async () => {} );
};

// Getting the install under way takes a render and a resolved promise, so let both settle.
const start = async ( rendered: ReturnType< typeof install > ) => {
	await act( async () => {} );
	await settle( rendered );
};

const advance = async ( rendered: ReturnType< typeof install >, ms: number ) => {
	await act( async () => {
		jest.advanceTimersByTime( ms );
	} );
	await settle( rendered );
};

// The plugin going active is what ends every flow: the store reports it, and the page redirects.
const expectRedirectsOnceActive = async ( rendered: ReturnType< typeof install > ) => {
	mockSite.installedPlugin = ACTIVE_PLUGIN;
	await settle( rendered );
	expect( window.location.href ).toBe( ACTIVE_LIST_URL );
};

describe( 'MarketplaceProductInstall', () => {
	let originalLocation: Location;

	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		Object.assign( mockSite, DEFAULT_SITE );
		originalLocation = window.location;
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );
	} );

	afterEach( () => {
		jest.useRealTimers();
		Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
	} );

	it( 'activates a transferred plugin that appears after a minute, and redirects once active', async () => {
		const rendered = install();
		await start( rendered );

		// The transfer is done but the plugin has not been fetched yet, which is the bug this guards
		// against: the page must not call that an install and leave for a list the plugin is missing
		// from. It keeps polling however long the install takes, with no cutoff.
		await advance( rendered, 90 * 1000 );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( SITE_ID );
		expect( activatePlugin ).not.toHaveBeenCalled();
		expect( window.location.href ).toBe( '' );

		// A later poll finds it, so it is activated.
		mockSite.installedPlugin = PLUGIN;
		await settle( rendered );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE_ID, PLUGIN );
		expect( window.location.href ).toBe( '' );

		// Only the refreshed active state, not the activation call, ends the wait.
		await expectRedirectsOnceActive( rendered );
	} );

	it( 'polls a paid plugin that checkout installed, without starting its own install', async () => {
		mockSite.isAtomic = true;
		mockSite.isWporgPlugin = false;
		// Checkout finished the install, so this page starts none and stays at step 0. Polling then
		// happens only through the marketplace path, which is what this exercises.
		mockSite.purchaseStatus = 'COMPLETED';
		const rendered = install();
		await start( rendered );

		expect( installPlugin ).not.toHaveBeenCalled();

		// The plugin is present but inactive. Checkout activates it out of band, so the page must keep
		// polling rather than leaving as soon as it appears.
		mockSite.installedPlugin = PLUGIN;
		fetchSitePlugins.mockClear();
		await advance( rendered, 3000 );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( SITE_ID );
		expect( installPlugin ).not.toHaveBeenCalled();
		expect( window.location.href ).toBe( '' );

		await expectRedirectsOnceActive( rendered );
	} );

	it( 'reconciles an install on an existing-plan site, redirecting once active', async () => {
		mockSite.isAtomic = true; // the site already has a plan
		mockSite.isWporgPlugin = true; // a free wp.org plugin, not a marketplace product
		const rendered = install();
		await start( rendered );

		// The flow is under way, so it polls for the active state like the theme flow does, even though
		// this is neither a transfer nor a paid marketplace install.
		await advance( rendered, 3000 );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( SITE_ID );

		mockSite.installedPlugin = PLUGIN;
		await settle( rendered );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE_ID, PLUGIN );

		await expectRedirectsOnceActive( rendered );
	} );

	it( 'does not activate or redirect before the transferred atomic site is ready', async () => {
		mockSite.isReady = false;
		const rendered = install();
		await start( rendered );

		// The plugin has turned up, but the site is not ready, so it must not activate it, poll, or
		// send the user to a WP Admin URL that is not there yet.
		mockSite.installedPlugin = PLUGIN;
		fetchSitePlugins.mockClear();
		await advance( rendered, 6000 );
		expect( activatePlugin ).not.toHaveBeenCalled();
		expect( fetchSitePlugins ).not.toHaveBeenCalled();
		expect( window.location.href ).toBe( '' );

		// Once the site is ready, it activates the plugin and, once active, redirects.
		mockSite.isReady = true;
		await advance( rendered, 3000 );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE_ID, PLUGIN );

		await expectRedirectsOnceActive( rendered );
	} );

	it( 'waits for the manage-plugins capability before activating or redirecting', async () => {
		mockSite.canManage = false; // still propagating after the transfer
		const rendered = install();
		await start( rendered );

		// Transfer complete and the site atomic-ready, but the capability has not propagated: the
		// one-shot activation must not fire yet, and nothing should redirect.
		mockSite.installedPlugin = PLUGIN;
		fetchSitePlugins.mockClear();
		await advance( rendered, 6000 );
		expect( activatePlugin ).not.toHaveBeenCalled();
		expect( fetchSitePlugins ).not.toHaveBeenCalled();
		expect( window.location.href ).toBe( '' );

		// Once it propagates, it activates and, once active, redirects.
		mockSite.canManage = true;
		await advance( rendered, 3000 );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE_ID, PLUGIN );

		await expectRedirectsOnceActive( rendered );
	} );

	it( 'shows an error on a genuine activation failure, but keeps reconciling', async () => {
		const rendered = install();
		await start( rendered );

		mockSite.installedPlugin = PLUGIN;
		await settle( rendered );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE_ID, PLUGIN );

		// Activation reports a real failure, so the page surfaces the error.
		mockSite.activationStatus = {
			status: 'error',
			action: 'ACTIVATE_PLUGIN',
			error: { error: 'some_failure' },
		};
		await settle( rendered );
		expect( screen.getByText( /could not activate it/ ) ).toBeVisible();

		// A lost response can follow a server-side success, so polling continues and a later active
		// refresh still redirects.
		fetchSitePlugins.mockClear();
		await advance( rendered, 3000 );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( SITE_ID );
		await expectRedirectsOnceActive( rendered );
	} );

	it( 'ignores a stale activation error when checkout drives the install', async () => {
		mockSite.isAtomic = true;
		mockSite.isWporgPlugin = false;
		mockSite.purchaseStatus = 'COMPLETED';
		// A failure left over from an earlier attempt on the same plugin id, in the same session.
		mockSite.activationStatus = {
			status: 'error',
			action: 'ACTIVATE_PLUGIN',
			error: { error: 'some_failure' },
		};
		const rendered = install();
		await start( rendered );

		// This flow never dispatches its own activation, so the stale error is not ours: no error
		// screen, and polling continues until the plugin is active.
		mockSite.installedPlugin = PLUGIN;
		fetchSitePlugins.mockClear();
		await advance( rendered, 3000 );
		expect( screen.queryByText( /could not activate it/ ) ).toBeNull();
		expect( fetchSitePlugins ).toHaveBeenCalledWith( SITE_ID );
		await expectRedirectsOnceActive( rendered );
	} );

	it( 'keeps polling on an activation_error, which just means already active', async () => {
		const rendered = install();
		await start( rendered );

		mockSite.installedPlugin = PLUGIN;
		mockSite.activationStatus = {
			status: 'error',
			action: 'ACTIVATE_PLUGIN',
			error: { error: 'activation_error' },
		};
		await settle( rendered );

		// activation_error is not a failure: keep waiting for the refreshed active state.
		fetchSitePlugins.mockClear();
		await advance( rendered, 3000 );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( SITE_ID );
		await expectRedirectsOnceActive( rendered );
	} );

	it( 'does not start a new plugin fetch while one is already in flight', async () => {
		const rendered = install();
		await start( rendered );

		// A slow request is still running, so a tick must not pile a second one on top of it.
		mockSite.isFetching = true;
		await settle( rendered );
		fetchSitePlugins.mockClear();
		await advance( rendered, 6000 );
		expect( fetchSitePlugins ).not.toHaveBeenCalled();

		// Once it settles, polling picks back up.
		mockSite.isFetching = false;
		await settle( rendered );
		await advance( rendered, 3000 );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( SITE_ID );
	} );
} );
