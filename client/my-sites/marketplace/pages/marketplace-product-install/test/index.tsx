/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import MarketplaceProductInstall from '../index';

const PLUGIN_SLUG = 'give';
const SITE = { ID: 1, slug: 'example.wordpress.com' };
const ADMIN_URL = 'https://example.wordpress.com/wp-admin/';

// The state the component reads, as the mocked selectors below see it. A test moves the flow along
// by changing this and re-rendering.
const mockSite = {
	transferStatus: transferStates.COMPLETE,
	installedPlugin: null as { slug: string; id: string } | null,
	pluginActive: false,
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
	isPluginActive: () => mockSite.pluginActive,
} ) );
jest.mock( 'calypso/state/automated-transfer/selectors', () => ( {
	getAutomatedTransferStatus: () => mockSite.transferStatus,
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
	default: ( { currentStep }: { currentStep: number } ) => (
		<div data-testid="progress">{ currentStep }</div>
	),
} ) );

const { activatePlugin, fetchSitePlugins } = jest.requireMock(
	'calypso/state/plugins/installed/actions'
);

const renderInstallPage = () => render( <MarketplaceProductInstall pluginSlug={ PLUGIN_SLUG } /> );

// The install page starts the transfer, then hands over to the effects that wait on it. Getting to
// that point takes a render and a resolved promise, so let both settle.
const startTransfer = async ( rendered: ReturnType< typeof renderInstallPage > ) => {
	await act( async () => {} );
	rendered.rerender( <MarketplaceProductInstall pluginSlug={ PLUGIN_SLUG } /> );
	await act( async () => {} );
};

describe( 'MarketplaceProductInstall', () => {
	let originalLocation: Location;

	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		mockSite.transferStatus = transferStates.COMPLETE;
		mockSite.installedPlugin = null;
		mockSite.pluginActive = false;
		originalLocation = window.location;
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );
	} );

	afterEach( () => {
		jest.useRealTimers();
		Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
	} );

	it( 'activates a plugin the transfer installed, and only then leaves the page', async () => {
		const rendered = renderInstallPage();
		await startTransfer( rendered );

		// The transfer is done but the plugin has not been fetched yet, which is the whole bug: the
		// page must not call this an install and leave for a list the plugin is missing from.
		expect( window.location.href ).toBe( '' );
		expect( activatePlugin ).not.toHaveBeenCalled();

		// It polls for the plugin instead.
		await act( async () => {
			jest.advanceTimersByTime( 3000 );
		} );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( SITE.ID );
		expect( window.location.href ).toBe( '' );

		// A later poll finds it, so it is activated.
		mockSite.installedPlugin = { slug: PLUGIN_SLUG, id: 'give/give' };
		await act( async () => {
			rendered.rerender( <MarketplaceProductInstall pluginSlug={ PLUGIN_SLUG } /> );
		} );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE.ID, {
			slug: PLUGIN_SLUG,
			id: 'give/give',
		} );
		expect( window.location.href ).toBe( '' );

		mockSite.pluginActive = true;
		await act( async () => {
			rendered.rerender( <MarketplaceProductInstall pluginSlug={ PLUGIN_SLUG } /> );
		} );
		expect( window.location.href ).toBe(
			`${ ADMIN_URL }plugins.php?activate=true&plugin_status=active`
		);
	} );

	it( 'stops waiting for an activation that never happens', async () => {
		const rendered = renderInstallPage();
		await startTransfer( rendered );

		await act( async () => {
			jest.advanceTimersByTime( 60 * 1000 );
		} );

		expect( screen.getByText( /could not activate it/ ) ).toBeVisible();
		expect( window.location.href ).toBe( '' );
	} );
} );
