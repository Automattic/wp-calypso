/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import MarketplaceProductInstall from '../index';

const PLUGIN_SLUG = 'give';
const PLUGIN = { slug: PLUGIN_SLUG, id: 'give/give' };
const SITE_ID = 1;
const ADMIN_URL = 'https://example.wordpress.com/wp-admin/';

// The state the component reads, as the mocked selectors below see it. A test moves the flow along
// by changing this and re-rendering.
const mockSite = {
	installedPlugin: null as typeof PLUGIN | null,
	pluginActive: false,
	// Redux keys a plugin's status by its id, which is what an activation error comes back under.
	failedPluginId: null as string | null,
	// A paid marketplace plugin is not a wp.org one, and its site is already atomic: checkout
	// transferred it and started the install.
	isAtomic: false,
	isWporgPlugin: true,
};

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
	getStatusForPlugin: ( _state: unknown, _siteId: number, pluginId: string ) =>
		pluginId === mockSite.failedPluginId ? { error: { message: 'Activation failed' } } : null,
	isPluginActive: () => mockSite.pluginActive,
	isRequesting: () => false,
} ) );
jest.mock( 'calypso/state/automated-transfer/selectors', () => ( {
	getAutomatedTransferStatus: () => 'complete',
} ) );
jest.mock( 'calypso/state/marketplace/purchase-flow/selectors', () => ( {
	getPurchaseFlowState: () => ( {
		pluginInstallationStatus: 'PENDING',
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
	default: () => true,
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
	isAtomicTransferredSite: () => true,
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

const { activatePlugin, fetchSitePlugins } = jest.requireMock(
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

const advance = async ( ms: number ) => {
	await act( async () => {
		jest.advanceTimersByTime( ms );
	} );
};

describe( 'MarketplaceProductInstall', () => {
	let originalLocation: Location;

	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		mockSite.installedPlugin = null;
		mockSite.pluginActive = false;
		mockSite.failedPluginId = null;
		mockSite.isAtomic = false;
		mockSite.isWporgPlugin = true;
		originalLocation = window.location;
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );
	} );

	afterEach( () => {
		jest.useRealTimers();
		Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
	} );

	it( 'activates a plugin the transfer installed, and only then leaves the page', async () => {
		const rendered = install();
		await start( rendered );

		// The transfer is done but the plugin has not been fetched yet, which is the bug this guards
		// against: the page must not call that an install and leave for a list the plugin is missing
		// from. It polls for the plugin instead.
		await advance( 3000 );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( SITE_ID );
		expect( activatePlugin ).not.toHaveBeenCalled();
		expect( screen.getByText( /Installing plugin/ ) ).toBeVisible();
		expect( window.location.href ).toBe( '' );

		// A later poll finds it, so it is activated.
		mockSite.installedPlugin = PLUGIN;
		await settle( rendered );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE_ID, PLUGIN );
		expect( window.location.href ).toBe( '' );

		mockSite.pluginActive = true;
		await settle( rendered );
		expect( window.location.href ).toBe(
			`${ ADMIN_URL }plugins.php?activate=true&plugin_status=active`
		);
	} );

	it( 'stops polling once the plugin is found, and reports an activation that fails', async () => {
		const rendered = install();
		await start( rendered );

		await advance( 3000 );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( SITE_ID );

		// Polling was only ever about finding the plugin. Activating it updates the store itself.
		mockSite.installedPlugin = PLUGIN;
		mockSite.failedPluginId = PLUGIN.id;
		await settle( rendered );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE_ID, PLUGIN );

		fetchSitePlugins.mockClear();
		await advance( 10 * 1000 );
		expect( fetchSitePlugins ).not.toHaveBeenCalled();

		expect( screen.getByText( /An error occurred while installing the plugin/ ) ).toBeVisible();
		expect( window.location.href ).toBe( '' );
	} );

	it( 'keeps polling for a paid plugin, which checkout installs', async () => {
		mockSite.isAtomic = true;
		mockSite.isWporgPlugin = false;
		const rendered = install();
		await start( rendered );

		await advance( 3000 );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( SITE_ID );
		expect( window.location.href ).toBe( '' );

		mockSite.installedPlugin = PLUGIN;
		await settle( rendered );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE_ID, PLUGIN );

		mockSite.pluginActive = true;
		await settle( rendered );
		expect( window.location.href ).toBe(
			`${ ADMIN_URL }plugins.php?activate=true&plugin_status=active`
		);
	} );
} );
