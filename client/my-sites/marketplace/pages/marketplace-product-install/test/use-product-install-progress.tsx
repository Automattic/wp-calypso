/**
 * @jest-environment jsdom
 */
import { act, waitFor } from '@testing-library/react';
import { setAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import automatedTransferReducer from 'calypso/state/automated-transfer/reducer';
import marketplaceReducer from 'calypso/state/marketplace/reducer';
import { receiveSitePlugins } from 'calypso/state/plugins/installed/actions';
import pluginsReducer from 'calypso/state/plugins/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { receiveSite } from 'calypso/state/sites/actions';
import { fetchSiteFeaturesCompleted } from 'calypso/state/sites/features/actions';
import { THEMES_REQUEST_SUCCESS } from 'calypso/state/themes/action-types';
import themesReducer from 'calypso/state/themes/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { INSTALL_DEADLINE_MS } from '../use-install-deadline';
import { useProductInstall } from '../use-product-install';

const mockFetchLatestAtomicTransfer = jest.fn();

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchLatestAtomicTransfer: ( siteId: number ) => mockFetchLatestAtomicTransfer( siteId ),
} ) );

// Keep the post-transfer site fetch off the network, leaving the rest of the package intact.
jest.mock( '@automattic/api-queries', () => ( {
	...jest.requireActual( '@automattic/api-queries' ),
	siteByIdQuery: ( siteId: number ) => ( {
		queryKey: [ 'site', siteId ],
		queryFn: async () => null,
	} ),
} ) );

// Replace the initiators with inert, assertable actions; keep the rest of each module real.
jest.mock( 'calypso/state/plugins/installed/actions', () => ( {
	...jest.requireActual( 'calypso/state/plugins/installed/actions' ),
	installPlugin: jest.fn( ( siteId: number, plugin: unknown, active: boolean ) => ( {
		type: 'MOCK_INSTALL_PLUGIN',
		siteId,
		plugin,
		active,
	} ) ),
	activatePlugin: jest.fn( ( siteId: number, plugin: unknown ) => ( {
		type: 'MOCK_ACTIVATE_PLUGIN',
		siteId,
		plugin,
	} ) ),
	fetchSitePlugins: jest.fn( ( siteId: number ) => ( {
		type: 'MOCK_FETCH_SITE_PLUGINS',
		siteId,
	} ) ),
} ) );
jest.mock( 'calypso/state/themes/actions', () => ( {
	// Emit the real action so the transfer status moves to START, as in production.
	initiateThemeTransfer: jest.fn( ( siteId: number ) => ( {
		type: 'THEME_TRANSFER_INITIATE_REQUEST',
		siteId,
	} ) ),
	installAndActivateTheme: jest.fn( ( themeId: string, siteId: number ) => ( {
		type: 'MOCK_INSTALL_ACTIVATE_THEME',
		themeId,
		siteId,
	} ) ),
	requestActiveTheme: jest.fn( ( siteId: number ) => ( {
		type: 'MOCK_REQUEST_ACTIVE_THEME',
		siteId,
	} ) ),
	requestTheme: jest.fn( () => ( { type: 'MOCK_REQUEST_THEME' } ) ),
} ) );
jest.mock( 'calypso/state/atomic/transfers/actions', () => ( {
	initiateAtomicTransfer: jest.fn( ( siteId: number, options: unknown ) => ( {
		type: 'MOCK_INITIATE_ATOMIC_TRANSFER',
		siteId,
		options,
	} ) ),
} ) );
jest.mock( 'calypso/state/plugins/wporg/actions', () => ( {
	...jest.requireActual( 'calypso/state/plugins/wporg/actions' ),
	fetchPluginData: jest.fn( () => ( { type: 'MOCK_FETCH_PLUGIN_DATA' } ) ),
} ) );

const { installPlugin, activatePlugin } = jest.requireMock(
	'calypso/state/plugins/installed/actions'
);
// initiateThemeTransfer is the (confusingly named) action that starts a plugin's Atomic transfer.
const { initiateThemeTransfer: initiatePluginTransfer, installAndActivateTheme } = jest.requireMock(
	'calypso/state/themes/actions'
);
const { initiateAtomicTransfer } = jest.requireMock( 'calypso/state/atomic/transfers/actions' );

const reducers = {
	plugins: pluginsReducer,
	themes: themesReducer,
	marketplace: marketplaceReducer,
	ui: uiReducer,
	route: routeReducer,
	automatedTransfer: automatedTransferReducer,
};

const SITE_ID = 1;
const SITE_SLUG = 'example.com';

const latestTransfer = ( status: string, agoMs = 0 ) => ( {
	atomic_transfer_id: 10,
	blog_id: SITE_ID,
	status,
	created_at: new Date( Date.now() - agoMs ).toISOString(),
	is_stuck: false,
	is_stuck_reset: false,
	in_lossless_revert: false,
} );

const renderProgress = (
	props: { pluginSlug?: string; themeSlug?: string },
	initialState: object
) => renderHookWithProvider( () => useProductInstall( props ), { reducers, initialState } );

// The step advances via waitFor(), a setTimeout wrapped in a Promise, so flushing the timer also
// needs the microtask queue drained — hence async act.
const advance = async ( ms: number ) =>
	act( async () => {
		jest.advanceTimersByTime( ms );
	} );

const wporgItems = { give: { slug: 'give', fetched: true, name: 'GiveWP' } };

// The handoff that authorizes an install: matching domain and product, not yet complete.
const marketplaceHandoff = {
	marketplace: {
		purchaseFlow: {
			primaryDomain: SITE_SLUG,
			productSlugInstalled: 'give',
			pluginInstallationStatus: 'IN_PROGRESS',
		},
	},
};

const directInstallAuthorization = {
	route: { query: { current: { directInstall: '1' } } },
};

const jetpackSite = {
	ui: { selectedSiteId: SITE_ID },
	sites: { items: { [ SITE_ID ]: { ID: SITE_ID, URL: `https://${ SITE_SLUG }`, jetpack: true } } },
	plugins: { wporg: { items: wporgItems } },
};

// A Simple site that qualifies for an Atomic transfer (has the Atomic feature).
const simpleAtomicEligibleSite = {
	ui: { selectedSiteId: SITE_ID },
	sites: {
		items: {
			[ SITE_ID ]: {
				ID: SITE_ID,
				URL: `https://${ SITE_SLUG }`,
				options: { is_wpcom_simple: true },
			},
		},
		features: { [ SITE_ID ]: { data: { active: [ 'atomic' ] } } },
	},
};

const atomicSite = {
	ui: { selectedSiteId: SITE_ID },
	sites: {
		items: {
			[ SITE_ID ]: {
				ID: SITE_ID,
				URL: `https://${ SITE_SLUG }`,
				options: { is_automated_transfer: true },
			},
		},
	},
};

const THEME_SLUG = 'twentytwentyfour';
const themeHandoff = {
	marketplace: {
		purchaseFlow: {
			primaryDomain: SITE_SLUG,
			productSlugInstalled: THEME_SLUG,
			pluginInstallationStatus: 'IN_PROGRESS',
		},
	},
};

const beginAtomicPluginTransfer = async () => {
	const rendered = renderProgress(
		{ pluginSlug: 'give' },
		{
			...marketplaceHandoff,
			...simpleAtomicEligibleSite,
			plugins: { wporg: { items: wporgItems } },
		}
	);
	await waitFor( () => expect( initiatePluginTransfer ).toHaveBeenCalledTimes( 1 ) );
	rendered.unmount();
	mockFetchLatestAtomicTransfer.mockClear();
	initiatePluginTransfer.mockClear();
};

describe( 'useProductInstall progression', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		window.sessionStorage.clear();
		mockFetchLatestAtomicTransfer.mockReset();
		mockFetchLatestAtomicTransfer.mockRejectedValue(
			Object.assign( new Error( '404' ), { status: 404 } )
		);
		installPlugin.mockClear();
		activatePlugin.mockClear();
		initiatePluginTransfer.mockClear();
		installAndActivateTheme.mockClear();
		initiateAtomicTransfer.mockClear();
	} );
	afterEach( () => jest.useRealTimers() );

	it( 'installs in place, advances to the install step, then activates on completion', async () => {
		const { result, store } = renderProgress(
			{ pluginSlug: 'give' },
			{ ...marketplaceHandoff, ...jetpackSite }
		);

		expect( installPlugin ).toHaveBeenCalledTimes( 1 );
		expect( installPlugin ).toHaveBeenCalledWith(
			SITE_ID,
			expect.objectContaining( { slug: 'give' } ),
			false
		);
		expect( initiatePluginTransfer ).not.toHaveBeenCalled();

		expect( result.current.currentStep ).toBe( 1 );

		await act( async () => {
			store.dispatch(
				receiveSitePlugins( SITE_ID, [ { slug: 'give', id: 'give/give', active: false } ] )
			);
		} );
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
		expect( activatePlugin ).toHaveBeenCalledWith( SITE_ID, { slug: 'give', id: 'give/give' } );
		expect( result.current.currentStep ).toBe( 2 );
	} );

	it( 'installs in place despite an unrelated non-settled transfer record', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'cleanup' ) );

		renderProgress( { pluginSlug: 'give' }, { ...marketplaceHandoff, ...jetpackSite } );

		expect( installPlugin ).toHaveBeenCalledTimes( 1 );
		expect( initiatePluginTransfer ).not.toHaveBeenCalled();
		await waitFor( () => expect( mockFetchLatestAtomicTransfer ).toHaveBeenCalled() );
		expect( installPlugin ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'activates a plugin that is already present when the install step begins', async () => {
		const { result, store } = renderProgress(
			{ pluginSlug: 'give' },
			{ ...marketplaceHandoff, ...jetpackSite }
		);

		await act( async () => {
			store.dispatch(
				receiveSitePlugins( SITE_ID, [ { slug: 'give', id: 'give/give', active: false } ] )
			);
		} );

		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
		expect( result.current.currentStep ).toBe( 2 );
	} );

	it( 'installs in place only once when the site data changes underneath it', async () => {
		const { result, store } = renderProgress(
			{ pluginSlug: 'give' },
			{ ...marketplaceHandoff, ...jetpackSite }
		);

		expect( installPlugin ).toHaveBeenCalledTimes( 1 );
		await advance( 1000 );
		expect( result.current.currentStep ).toBe( 1 );

		// getPlugin returns a fresh object each render, so the initiation effect re-runs constantly;
		// the re-entry guard is what holds it to one install (without it, this reaches several).
		await act( async () => {
			store.dispatch(
				receiveSite( {
					ID: SITE_ID,
					URL: `https://${ SITE_SLUG }`,
					jetpack: true,
					options: { is_automated_transfer: true },
				} )
			);
		} );
		expect( installPlugin ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'transfers a Simple site to Atomic and advances to the activation step on completion', async () => {
		const { result, store } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( initiatePluginTransfer ).toHaveBeenCalledTimes( 1 ) );

		expect( initiatePluginTransfer ).toHaveBeenCalledWith(
			SITE_ID,
			null,
			'give',
			'',
			'plugin_install'
		);
		expect( installPlugin ).not.toHaveBeenCalled();

		expect( result.current.currentStep ).toBe( 1 );

		// Production reports completion from polling first, and only then refreshes the site. The
		// hook must consume the completed status to advance, before the site reads as Atomic.
		await act( async () => {
			store.dispatch( setAutomatedTransferStatus( SITE_ID, transferStates.COMPLETE, '' ) );
		} );
		expect( result.current.currentStep ).toBe( 2 );

		// The later site refresh (now Atomic) re-runs the initiation effect; the guard prevents any
		// second initiation.
		await act( async () => {
			store.dispatch(
				receiveSite( {
					ID: SITE_ID,
					URL: `https://${ SITE_SLUG }`,
					options: { is_automated_transfer: true },
				} )
			);
		} );
		expect( initiatePluginTransfer ).toHaveBeenCalledTimes( 1 );
		expect( installPlugin ).not.toHaveBeenCalled();
	} );

	it( 'does not initiate another transfer after a timed-out refresh sees one still running', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'active' ) );

		const firstRender = renderProgress(
			{ pluginSlug: 'give' },
			{
				...directInstallAuthorization,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( firstRender.result.current.currentStep ).toBe( 1 ) );
		firstRender.unmount();

		initiatePluginTransfer.mockClear();
		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...directInstallAuthorization,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);

		await advance( INSTALL_DEADLINE_MS + 10000 );

		expect( initiatePluginTransfer ).not.toHaveBeenCalled();
		expect( result.current.error ).toEqual( { type: 'timeout' } );
	} );

	it.each( [
		'pending',
		'active',
		'provisioned',
		'relocating_switcheroo',
		'renaming',
		'exporting',
		'importing',
		'cleanup',
	] )( 'adopts a %s transfer after refresh without initiating another one', async ( status ) => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( status ) );

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( result.current.currentStep ).toBe( 1 ) );

		expect( mockFetchLatestAtomicTransfer ).toHaveBeenCalledWith( SITE_ID );
		expect( initiatePluginTransfer ).not.toHaveBeenCalled();
		expect( initiateAtomicTransfer ).not.toHaveBeenCalled();
		expect( installPlugin ).not.toHaveBeenCalled();
	} );

	it( 'advances an adopted transfer when the durable status completes', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'active' ) );

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( result.current.currentStep ).toBe( 1 ) );

		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'completed' ) );
		await advance( 6000 );

		await waitFor( () => expect( result.current.currentStep ).toBe( 2 ) );
		expect( initiatePluginTransfer ).not.toHaveBeenCalled();
	} );

	// The transfer's own deadline must not condemn a transfer that completed — but the wait is not
	// over, so the activation phase gets a fresh deadline of the same length rather than none.
	it( 'gives activation its own deadline after a completed recovery', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'completed' ) );

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...directInstallAuthorization,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( result.current.currentStep ).toBe( 2 ) );

		await advance( INSTALL_DEADLINE_MS - 10000 );
		expect( result.current.currentStep ).toBe( 2 );
		expect( result.current.error ).toBeNull();

		await advance( 20000 );
		expect( result.current.error ).toEqual( { type: 'activation-timeout' } );
	} );

	it( 'reaches no activation verdict once the plugin is active', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'completed' ) );

		const { result, store } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...directInstallAuthorization,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( result.current.currentStep ).toBe( 2 ) );

		await act( async () => {
			store.dispatch(
				receiveSitePlugins( SITE_ID, [ { slug: 'give', id: 'give/give', active: true } ] )
			);
		} );
		await advance( INSTALL_DEADLINE_MS + 10000 );

		expect( result.current.error ).toBeNull();
	} );

	// This component survives an SPA navigation from one install to the next, and one install's
	// success must not leave the next install's activation phase unbounded.
	it( 'arms the activation deadline again for the next product after a success', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'completed' ) );

		const { result, store, rerender } = renderHookWithProvider(
			( { pluginSlug }: { pluginSlug: string } ) => useProductInstall( { pluginSlug } ),
			{
				reducers,
				initialState: {
					...directInstallAuthorization,
					...simpleAtomicEligibleSite,
					plugins: { wporg: { items: wporgItems } },
				},
				initialProps: { pluginSlug: 'give' },
			}
		);
		await waitFor( () => expect( result.current.currentStep ).toBe( 2 ) );
		await act( async () => {
			store.dispatch(
				receiveSitePlugins( SITE_ID, [ { slug: 'give', id: 'give/give', active: true } ] )
			);
		} );

		window.sessionStorage.setItem(
			`marketplace-product-install-transfer:${ SITE_ID }:akismet`,
			JSON.stringify( {
				initiatedAt: Date.now() - 5000,
				previousTransferId: null,
				lookupSettled: true,
			} )
		);
		rerender( { pluginSlug: 'akismet' } );

		await advance( INSTALL_DEADLINE_MS + 10000 );

		expect( result.current.error ).toEqual( { type: 'activation-timeout' } );
	} );

	it( 'does not carry a completed transfer latch across products', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'completed' ) );

		const { result, rerender } = renderHookWithProvider(
			( { pluginSlug }: { pluginSlug: string } ) => useProductInstall( { pluginSlug } ),
			{
				reducers,
				initialState: {
					...directInstallAuthorization,
					...simpleAtomicEligibleSite,
					plugins: { wporg: { items: wporgItems } },
				},
				initialProps: { pluginSlug: 'give' },
			}
		);
		await waitFor( () => expect( result.current.currentStep ).toBe( 2 ) );

		rerender( { pluginSlug: 'akismet' } );
		await advance( INSTALL_DEADLINE_MS + 10000 );

		expect( result.current.error ).toEqual( { type: 'timeout' } );
	} );

	it( 'adopts a recently completed transfer after refresh', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'completed', 1000 ) );

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( result.current.currentStep ).toBe( 2 ) );

		expect( initiatePluginTransfer ).not.toHaveBeenCalled();
		expect( installPlugin ).not.toHaveBeenCalled();
	} );

	it( 'adopts a completed transfer after refreshed site data reads Atomic', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'completed', 1000 ) );

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				...atomicSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( result.current.currentStep ).toBe( 2 ) );

		expect( initiatePluginTransfer ).not.toHaveBeenCalled();
		expect( installPlugin ).not.toHaveBeenCalled();
	} );

	it( 'adopts its own transfer dated before the attempt by clock skew', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'completed', 5000 ) );

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...directInstallAuthorization,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);

		await waitFor( () => expect( result.current.currentStep ).toBe( 2 ) );
		expect( initiatePluginTransfer ).not.toHaveBeenCalled();
	} );

	it( 'recovers through direct-install authorization after refresh', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'active' ) );

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...directInstallAuthorization,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( result.current.currentStep ).toBe( 1 ) );

		expect( initiatePluginTransfer ).not.toHaveBeenCalled();
	} );

	it( 'starts a fresh authorized transfer instead of adopting a stale completion', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue(
			latestTransfer( 'completed', INSTALL_DEADLINE_MS + 1000 )
		);

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( initiatePluginTransfer ).toHaveBeenCalledTimes( 1 ) );

		expect( result.current.currentStep ).toBe( 1 );
		expect( installPlugin ).not.toHaveBeenCalled();
	} );

	it( 'does not advance from a recent completion that predates its new attempt', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'completed', 1000 ) );

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( initiatePluginTransfer ).toHaveBeenCalledTimes( 1 ) );
		await advance( 6000 );

		expect( result.current.currentStep ).toBe( 1 );
	} );

	it( 'does not start beside a product-blind active transfer', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'active' ) );

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( mockFetchLatestAtomicTransfer ).toHaveBeenCalled() );
		expect( initiatePluginTransfer ).not.toHaveBeenCalled();
		expect( result.current.error ).toBeNull();
	} );

	it( 'adopts its persisted transfer when the handoff survives', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'active' ) );

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( result.current.currentStep ).toBe( 1 ) );

		expect( initiatePluginTransfer ).not.toHaveBeenCalled();
	} );

	it( 'waits for the latest-transfer lookup before initiating', async () => {
		let rejectLookup: ( reason: unknown ) => void = () => {};
		mockFetchLatestAtomicTransfer.mockReturnValue(
			new Promise( ( _resolve, reject ) => {
				rejectLookup = reject;
			} )
		);

		renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		expect( initiatePluginTransfer ).not.toHaveBeenCalled();

		await act( async () => {
			rejectLookup( Object.assign( new Error( '404' ), { status: 404 } ) );
		} );
		await waitFor( () => expect( initiatePluginTransfer ).toHaveBeenCalledTimes( 1 ) );
	} );

	it( 'initiates after the latest-transfer lookup grace period', async () => {
		mockFetchLatestAtomicTransfer.mockReturnValue( new Promise( () => undefined ) );

		renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		expect( initiatePluginTransfer ).not.toHaveBeenCalled();

		await advance( 1999 );
		expect( initiatePluginTransfer ).not.toHaveBeenCalled();
		await advance( 1 );
		expect( initiatePluginTransfer ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not adopt a previous failed transfer when lookup finishes after initiation', async () => {
		let resolveLookup: ( transfer: unknown ) => void = () => {};
		mockFetchLatestAtomicTransfer.mockReturnValue(
			new Promise( ( resolve ) => {
				resolveLookup = resolve;
			} )
		);

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...directInstallAuthorization,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);

		await advance( 2000 );
		await waitFor( () => expect( initiatePluginTransfer ).toHaveBeenCalledTimes( 1 ) );

		await act( async () => {
			resolveLookup( latestTransfer( 'error', 40000 ) );
		} );
		await waitFor( () => expect( mockFetchLatestAtomicTransfer ).toHaveBeenCalled() );

		expect( result.current.error ).toBeNull();
		expect( initiatePluginTransfer ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not re-initiate a persisted attempt when the transfer lookup never settles', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockReturnValue( new Promise( () => undefined ) );

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);

		await advance( INSTALL_DEADLINE_MS + 10000 );

		expect( initiatePluginTransfer ).not.toHaveBeenCalled();
		expect( result.current.error ).toEqual( { type: 'timeout' } );
	} );

	it( 'does not re-initiate a persisted attempt when the transfer lookup errors', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockRejectedValue( new Error( 'network failure' ) );

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);

		await waitFor( () => expect( mockFetchLatestAtomicTransfer ).toHaveBeenCalled() );
		await advance( INSTALL_DEADLINE_MS + 10000 );

		expect( initiatePluginTransfer ).not.toHaveBeenCalled();
		expect( result.current.error ).toEqual( { type: 'timeout' } );
	} );

	it( 're-initiates a persisted attempt when lookup returns 404', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockRejectedValue(
			Object.assign( new Error( '404' ), { status: 404 } )
		);

		renderProgress(
			{ pluginSlug: 'give' },
			{
				...directInstallAuthorization,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);

		await waitFor( () => expect( initiatePluginTransfer ).toHaveBeenCalledTimes( 1 ) );
	} );

	it( 're-initiates a persisted attempt after a successful lookup proves no match', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue(
			latestTransfer( 'completed', INSTALL_DEADLINE_MS + 1000 )
		);

		renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);

		await waitFor( () => expect( initiatePluginTransfer ).toHaveBeenCalledTimes( 1 ) );
	} );

	it.each( [ 'error', 'reverted', 'reverting', 'relocating_revert' ] )(
		'reports a persisted %s transfer as failed and stops polling',
		async ( status ) => {
			await beginAtomicPluginTransfer();
			mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( status ) );

			const { result } = renderProgress(
				{ pluginSlug: 'give' },
				{
					...marketplaceHandoff,
					...simpleAtomicEligibleSite,
					plugins: { wporg: { items: wporgItems } },
				}
			);
			await waitFor( () => expect( result.current.error ).toEqual( { type: 'transfer-failed' } ) );

			expect( initiatePluginTransfer ).not.toHaveBeenCalled();
			await advance( 6000 );
			expect( mockFetchLatestAtomicTransfer ).toHaveBeenCalledTimes( 1 );
		}
	);

	it( 'clears the persisted attempt after successful installation', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'active' ) );
		expect( window.sessionStorage ).toHaveLength( 1 );

		const { result, store } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( result.current.currentStep ).toBe( 1 ) );

		await act( async () => {
			store.dispatch(
				receiveSitePlugins( SITE_ID, [ { slug: 'give', id: 'give/give', active: true } ] )
			);
		} );

		await waitFor( () => expect( window.sessionStorage ).toHaveLength( 0 ) );
	} );

	it( 'clears the persisted attempt after a terminal transfer error', async () => {
		await beginAtomicPluginTransfer();
		mockFetchLatestAtomicTransfer.mockResolvedValue( latestTransfer( 'error' ) );
		expect( window.sessionStorage ).toHaveLength( 1 );

		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);

		await waitFor( () => expect( result.current.error ).toEqual( { type: 'transfer-failed' } ) );
		await waitFor( () => expect( window.sessionStorage ).toHaveLength( 0 ) );
	} );

	it( 'uploads a plugin and activates it once the upload completes', async () => {
		const { result, store } = renderProgress(
			{},
			{
				// The upload page authorizes the flow by setting the primary domain.
				marketplace: { purchaseFlow: { primaryDomain: SITE_SLUG } },
				ui: { selectedSiteId: SITE_ID },
				sites: {
					items: { [ SITE_ID ]: { ID: SITE_ID, URL: `https://${ SITE_SLUG }`, jetpack: true } },
				},
				plugins: {
					upload: {
						progressPercent: { [ SITE_ID ]: 100 },
						uploadedPluginId: { [ SITE_ID ]: 'give' },
						inProgress: { [ SITE_ID ]: false },
					},
				},
			}
		);

		await advance( 1000 );
		expect( result.current.currentStep ).toBe( 1 );

		await act( async () => {
			store.dispatch(
				receiveSitePlugins( SITE_ID, [ { slug: 'give', id: 'give/give', active: false } ] )
			);
		} );
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
		expect( result.current.currentStep ).toBe( 2 );
	} );

	it( 'installs and activates a theme in place on a Jetpack site', async () => {
		const { result, store } = renderProgress(
			{ themeSlug: THEME_SLUG },
			{
				...themeHandoff,
				ui: { selectedSiteId: SITE_ID },
				sites: {
					items: { [ SITE_ID ]: { ID: SITE_ID, URL: `https://${ SITE_SLUG }`, jetpack: true } },
				},
			}
		);

		await act( async () => {
			store.dispatch( {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 'wporg',
				query: {},
				themes: [ { id: THEME_SLUG, name: 'Twenty Twenty-Four' } ],
				found: 1,
			} );
		} );
		expect( installAndActivateTheme ).toHaveBeenCalledWith( THEME_SLUG, SITE_ID );
		expect( initiateAtomicTransfer ).not.toHaveBeenCalled();

		await advance( 1000 );
		expect( result.current.currentStep ).toBe( 1 );
	} );

	it( 'transfers a Simple site to Atomic for a theme install', async () => {
		const { store } = renderProgress(
			{ themeSlug: THEME_SLUG },
			{ ...themeHandoff, ...simpleAtomicEligibleSite }
		);

		await act( async () => {
			store.dispatch( {
				type: THEMES_REQUEST_SUCCESS,
				siteId: 'wporg',
				query: {},
				themes: [ { id: THEME_SLUG, name: 'Twenty Twenty-Four' } ],
				found: 1,
			} );
		} );
		expect( initiateAtomicTransfer ).toHaveBeenCalledWith( SITE_ID, {
			themeSlug: THEME_SLUG,
			context: 'theme_install',
		} );
		expect( installAndActivateTheme ).not.toHaveBeenCalled();
	} );

	it( 'shows no plan error for an already-Atomic site even without feature data', async () => {
		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				ui: { selectedSiteId: SITE_ID },
				// Already Atomic (installs in place), but the feature list never loads.
				sites: {
					items: {
						[ SITE_ID ]: {
							ID: SITE_ID,
							URL: `https://${ SITE_SLUG }`,
							options: { is_automated_transfer: true },
						},
					},
				},
				plugins: { wporg: { items: wporgItems } },
			}
		);

		await advance( 2000 );
		expect( result.current.error ).toBeNull();
		expect( installPlugin ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'clears the plan error when Atomic eligibility arrives after the timeout', async () => {
		const { result, store } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				ui: { selectedSiteId: SITE_ID },
				sites: {
					items: {
						[ SITE_ID ]: {
							ID: SITE_ID,
							URL: `https://${ SITE_SLUG }`,
							options: { is_wpcom_simple: true },
						},
					},
				},
				plugins: { wporg: { items: wporgItems } },
			}
		);

		// With no feature data, the plan error appears after the grace period.
		await advance( 2000 );
		expect( result.current.error ).toEqual( { type: 'non-installable-plan' } );
		expect( initiatePluginTransfer ).not.toHaveBeenCalled();

		// Eligibility arrives late: the error must clear and the transfer must start.
		await act( async () => {
			store.dispatch( fetchSiteFeaturesCompleted( SITE_ID, { active: [ 'atomic' ] } ) );
		} );
		expect( result.current.error ).toBeNull();
		expect( initiatePluginTransfer ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not borrow a settled transfer status left in Redux by an earlier wait', async () => {
		mockFetchLatestAtomicTransfer.mockRejectedValue( { status: 404 } );
		const { result, store } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...marketplaceHandoff,
				...simpleAtomicEligibleSite,
				plugins: { wporg: { items: wporgItems } },
			}
		);
		await waitFor( () => expect( initiatePluginTransfer ).toHaveBeenCalledTimes( 1 ) );

		// A previous wait's completion is still in the slice while our own transfer has not been
		// polled yet. Borrowing it would put the staged wait on "finishing" for the whole transfer.
		await act( async () => {
			store.dispatch( setAutomatedTransferStatus( SITE_ID, transferStates.COMPLETE, '' ) );
		} );
		expect( result.current.isTransferWait ).toBe( true );
		expect( result.current.transferStatus ).toBeNull();

		// An in-flight status is still worth borrowing before the poll lands.
		await act( async () => {
			store.dispatch( setAutomatedTransferStatus( SITE_ID, transferStates.START, '' ) );
		} );
		expect( result.current.transferStatus ).toBe( transferStates.START );
	} );

	it( 'stays idle when revisited with a stale completed handoff', async () => {
		const { result } = renderProgress(
			{ pluginSlug: 'give' },
			{
				...jetpackSite,
				marketplace: {
					purchaseFlow: {
						primaryDomain: SITE_SLUG,
						productSlugInstalled: 'give',
						pluginInstallationStatus: 'COMPLETED',
					},
				},
			}
		);

		await advance( 2000 );
		// No install is initiated and the progress bar never leaves step 0. This documents the
		// pre-existing dead-end for a completed handoff revisited in the same session.
		expect( installPlugin ).not.toHaveBeenCalled();
		expect( result.current.currentStep ).toBe( 0 );
	} );
} );
