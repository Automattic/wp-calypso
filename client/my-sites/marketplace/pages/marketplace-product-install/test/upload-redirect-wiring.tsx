/**
 * @jest-environment jsdom
 */
import { act, waitFor } from '@testing-library/react';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useThankYouRedirect } from '../use-thank-you-redirect';

// The redirect hook and the recovery hook run for real against each other here. Standing one of them
// in for the other hides the thing most worth checking: that what one waits for, the other produces.
jest.mock( 'calypso/state/plugins/installed/actions', () => ( {
	fetchSitePlugins: jest.fn( ( siteId: number ) => ( { type: 'FETCH_SITE_PLUGINS', siteId } ) ),
	activatePlugin: jest.fn( () => ( { type: 'ACTIVATE_PLUGIN' } ) ),
} ) );

// Drive the recovery poll's clock from the test; the hooks themselves stay real. Only a scheduled
// interval is captured — the redirect hook also registers a dormant one for theme polling.
let mockIntervalCallback: ( () => void ) | null = null;
jest.mock( 'calypso/lib/interval', () => ( {
	useInterval: ( callback: () => void, delay: number | null ) => {
		if ( delay !== null ) {
			mockIntervalCallback = callback;
		}
	},
} ) );

let mockFreshSite: unknown;
jest.mock( '@automattic/api-queries', () => ( {
	...jest.requireActual( '@automattic/api-queries' ),
	siteByIdQuery: () => ( {
		queryKey: [ 'wiring-site' ],
		queryFn: () => Promise.resolve( mockFreshSite ),
	} ),
} ) );

const { fetchSitePlugins, activatePlugin } = jest.requireMock(
	'calypso/state/plugins/installed/actions'
);
// A cycle chains several promises before it settles; let them all run.
const flush = () =>
	act( async () => {
		for ( let i = 0; i < 8; i++ ) {
			await Promise.resolve();
		}
	} );
const tick = async () => {
	act( () => void mockIntervalCallback?.() );
	await flush();
};

// A transferred upload whose plugin turned up but is not switched on.
const INACTIVE_PLUGIN: Partial< Props > = {
	transferObserved: true,
	isTransferredUpload: true,
	automatedTransferStatus: transferStates.COMPLETE,
	installedPlugin: { slug: 'uploaded', id: 'uploaded/uploaded' },
	pluginActive: false,
};

const PLUGINS_URL =
	'https://example.wpcomstaging.com/wp-admin/plugins.php?activate=true&plugin_status=active';
const PLUGINS_LIST_URL = 'https://example.wpcomstaging.com/wp-admin/plugins.php';
const ATOMIC_READY = {
	ID: 1,
	is_wpcom_atomic: true,
	capabilities: { manage_options: true },
	options: { admin_url: 'https://example.wpcomstaging.com/wp-admin/' },
};

type Props = Parameters< typeof useThankYouRedirect >[ 0 ];
const uploadProps: Props = {
	siteId: 1,
	selectedSiteSlug: 'example.wordpress.com',
	currentStep: 2,
	isPluginUploadFlow: true,
	pluginSlug: '',
	themeSlug: '',
	wpOrgTheme: null,
	isThemeActive: false,
	installedPlugin: null,
	pluginActive: false,
	atomicFlow: false,
	automatedTransferStatus: null,
	transferObserved: false,
	isTransferredUpload: false,
	uploadFailed: false,
};

const render = ( overrides?: Partial< Props > ) =>
	renderHookWithProvider( ( props: Props ) => useThankYouRedirect( props ), {
		initialProps: { ...uploadProps, ...overrides },
	} );

describe( 'upload redirect wiring', () => {
	let originalLocation: Location;

	beforeEach( () => {
		jest.clearAllMocks();
		mockFreshSite = ATOMIC_READY;
		originalLocation = window.location;
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: { ...originalLocation, href: '' },
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: originalLocation,
		} );
	} );

	it( 'redirects an upload to a site that was already Atomic, which never polls', async () => {
		// No transfer, so nothing enables the poll. Anything the redirect waits on that only the poll
		// can produce would strand this flow — it works on trunk today.
		render( {
			installedPlugin: { slug: 'uploaded', id: 'uploaded/uploaded' },
			pluginActive: true,
		} );

		await waitFor( () => expect( window.location.href ).toBe( PLUGINS_URL ) );
		expect( fetchSitePlugins ).not.toHaveBeenCalled();
	} );

	it( 'starts looking for the plugin as soon as a transferred upload lands', async () => {
		const { rerender } = render( {
			transferObserved: true,
			isTransferredUpload: true,
			automatedTransferStatus: transferStates.ACTIVE,
		} );
		await act( async () => {} );
		expect( fetchSitePlugins ).not.toHaveBeenCalled();

		rerender( {
			...uploadProps,
			transferObserved: true,
			isTransferredUpload: true,
			automatedTransferStatus: transferStates.COMPLETE,
		} );
		await waitFor( () => expect( fetchSitePlugins ).toHaveBeenCalledWith( 1 ) );
		expect( window.location.href ).toBe( '' );
	} );

	it( "looks for a transferred upload's plugin at once, not an interval later", async () => {
		// The transfer has already installed it, and the customer has already waited out the transfer.
		render( {
			transferObserved: true,
			isTransferredUpload: true,
			automatedTransferStatus: transferStates.COMPLETE,
		} );

		await waitFor( () => expect( fetchSitePlugins ).toHaveBeenCalledWith( 1 ) );
	} );

	it( 'does not activate an in-place install before its own flow has the chance', async () => {
		// This flow hands activation over at step 1; acting on the first render would take it early.
		render( {
			isPluginUploadFlow: false,
			pluginSlug: 'give',
			currentStep: 0,
			installedPlugin: { slug: 'give', id: 'give/give' },
			pluginActive: false,
		} );
		// Let the site read resolve, which is what makes recovery eligible at all.
		await act( async () => {
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		} );

		expect( activatePlugin ).not.toHaveBeenCalled();

		// And it is eligible: the interval it waits for does activate, so the check above meant it.
		await tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'ends an inactive transferred upload on the plain list once activation is spent', async () => {
		// Nothing else activates this flow's plugin, so if recovery gives up the wait has to end.
		render( INACTIVE_PLUGIN );
		await waitFor( () => expect( activatePlugin ).toHaveBeenCalled() );

		for ( let round = 0; round < 6 && ! window.location.href; round++ ) {
			await tick();
		}

		expect( activatePlugin ).toHaveBeenCalledTimes( 3 );
		expect( window.location.href ).toBe( PLUGINS_LIST_URL );
	} );

	it( 'holds the next plugin-list request until the activation before it has finished', async () => {
		// A list read taken while an activation is in flight answers for a moment already gone.
		render( INACTIVE_PLUGIN );
		await waitFor( () => expect( activatePlugin ).toHaveBeenCalledTimes( 1 ) );

		await flush();
		const activationsBefore = activatePlugin.mock.calls.length;
		const listReadsBefore = fetchSitePlugins.mock.calls.length;

		// Two ticks with nothing awaited between them: the second finds the first still running, and
		// no list request goes out alongside the activation.
		act( () => {
			mockIntervalCallback?.();
			mockIntervalCallback?.();
		} );
		expect( activatePlugin.mock.calls.length ).toBe( activationsBefore + 1 );
		expect( fetchSitePlugins.mock.calls.length ).toBe( listReadsBefore );

		// The refresh belongs to the activation's own cycle, and always follows it.
		await flush();
		expect( fetchSitePlugins.mock.calls.length ).toBeGreaterThan( listReadsBefore );
	} );
} );
