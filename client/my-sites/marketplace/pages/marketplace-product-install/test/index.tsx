/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
	activationFailed: false,
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
	getPlugin: () => ( { slug: 'give', wporg: true } ),
	isFetched: () => true,
} ) );
jest.mock( 'calypso/state/plugins/installed/selectors-ts', () => ( {
	getPluginOnSite: () => mockSite.installedPlugin,
	getStatusForPlugin: () => null,
	isPluginActionStatus: () => mockSite.activationFailed,
	isPluginActive: () => mockSite.pluginActive,
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
	default: () => false,
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

// Getting the transfer under way takes a render and a resolved promise, so let both settle.
const startTransfer = async ( rendered: ReturnType< typeof install > ) => {
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
	let user: ReturnType< typeof userEvent.setup >;

	beforeEach( () => {
		jest.useFakeTimers();
		user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		jest.clearAllMocks();
		mockSite.installedPlugin = null;
		mockSite.pluginActive = false;
		mockSite.activationFailed = false;
		originalLocation = window.location;
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );
	} );

	afterEach( () => {
		jest.useRealTimers();
		Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
	} );

	it( 'activates a plugin the transfer installed, and only then leaves the page', async () => {
		const rendered = install();
		await startTransfer( rendered );

		// The transfer is done but the plugin has not been fetched yet, which is the bug this guards
		// against: the page must not call that an install and leave for a list the plugin is missing
		// from. It polls for the plugin instead.
		await advance( 50 * 1000 );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( SITE_ID );
		expect( activatePlugin ).not.toHaveBeenCalled();
		expect( window.location.href ).toBe( '' );

		// A late poll finds it, so it is activated.
		mockSite.installedPlugin = PLUGIN;
		await settle( rendered );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE_ID, PLUGIN );
		expect( window.location.href ).toBe( '' );

		// Activating gets its own time to run, rather than what a slow install left over.
		await advance( 30 * 1000 );
		expect( screen.getByText( /Installing plugin/ ) ).toBeVisible();

		mockSite.pluginActive = true;
		await settle( rendered );
		expect( window.location.href ).toBe(
			`${ ADMIN_URL }plugins.php?activate=true&plugin_status=active`
		);
	} );

	it( 'stops waiting for a plugin that never installs, and looks for it again on retry', async () => {
		const rendered = install();
		await startTransfer( rendered );

		await advance( 60 * 1000 );
		expect( screen.getByText( /taking longer than expected to install/ ) ).toBeVisible();
		expect( window.location.href ).toBe( '' );

		fetchSitePlugins.mockClear();
		await user.click( screen.getByRole( 'button', { name: 'Try again' } ) );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( SITE_ID );
	} );

	it( 'reports a failed activation, and activates again on retry', async () => {
		const rendered = install();
		await startTransfer( rendered );

		mockSite.installedPlugin = PLUGIN;
		mockSite.activationFailed = true;
		await settle( rendered );
		expect( screen.getByText( /could not activate it/ ) ).toBeVisible();
		expect( window.location.href ).toBe( '' );

		activatePlugin.mockClear();
		await user.click( screen.getByRole( 'button', { name: 'Try again' } ) );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE_ID, PLUGIN );
	} );
} );
