/**
 * @jest-environment jsdom
 */
import { act, waitFor } from '@testing-library/react';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useThankYouRedirect } from '../use-thank-you-redirect';

// Capture what the recovery hook is wired with, and stand in for the fetches it reports back.
let mockRecoveryProps:
	| { enabled: boolean; canActivate: boolean; ownsActivation: boolean }
	| undefined;
let mockSettledFetches = 0;
jest.mock( '../use-post-transfer-plugin-recovery', () => ( {
	...jest.requireActual( '../use-post-transfer-plugin-recovery' ),
	usePostTransferPluginRecovery: ( props: typeof mockRecoveryProps ) => {
		mockRecoveryProps = props;
		return { settledFetches: mockSettledFetches };
	},
} ) );

// Whether an activation request is outstanding, which the hook reads from the plugin action status.
let mockActivationInProgress = false;
jest.mock( 'calypso/state/plugins/installed/selectors-ts', () => ( {
	...jest.requireActual( 'calypso/state/plugins/installed/selectors-ts' ),
	isPluginActionInProgress: () => mockActivationInProgress,
} ) );

// Control the post-transfer site fetch.
let mockFreshSite: unknown;
jest.mock( '@automattic/api-queries', () => ( {
	...jest.requireActual( '@automattic/api-queries' ),
	siteByIdQuery: () => ( {
		queryKey: [ 'tyr-site' ],
		queryFn: () => Promise.resolve( mockFreshSite ),
	} ),
} ) );

const PLUGINS_URL =
	'https://example.wpcomstaging.com/wp-admin/plugins.php?activate=true&plugin_status=active';
// Where an install that could not be confirmed lands: the list itself, claiming nothing.
const PLUGINS_LIST_URL = 'https://example.wpcomstaging.com/wp-admin/plugins.php';
// Fetches that have to come back empty before an upload is given up on.
const CONFIRMATION_FETCHES = 3;

const ATOMIC_READY = {
	ID: 1,
	is_wpcom_atomic: true,
	capabilities: { manage_options: true },
	options: { admin_url: 'https://example.wpcomstaging.com/wp-admin/' },
};

type Props = Parameters< typeof useThankYouRedirect >[ 0 ];
const baseProps: Props = {
	siteId: 1,
	selectedSiteSlug: 'example.wordpress.com',
	currentStep: 2,
	isPluginUploadFlow: false,
	pluginSlug: 'give',
	themeSlug: '',
	wpOrgTheme: null,
	isThemeActive: false,
	installedPlugin: { slug: 'give', id: 'give/give' },
	pluginActive: false,
	atomicFlow: true,
	automatedTransferStatus: transferStates.COMPLETE,
};

// A zip upload mid-transfer: no product slug in the route, and no plugin in the store, since the
// list was fetched while the site was still Simple.
const UPLOAD_PROPS: Partial< Props > = {
	isPluginUploadFlow: true,
	pluginSlug: '',
	installedPlugin: null,
	pluginActive: false,
	atomicFlow: false,
	automatedTransferStatus: transferStates.ACTIVE,
};

const render = ( overrides?: Partial< Props > ) => {
	const { rerender, ...rest } = renderHookWithProvider(
		( props: Props ) => useThankYouRedirect( props ),
		{ initialProps: { ...baseProps, ...overrides } }
	);
	return {
		...rest,
		rerender: ( next: Partial< Props > ) => rerender( { ...baseProps, ...overrides, ...next } ),
	};
};

describe( 'useThankYouRedirect', () => {
	// jsdom can't navigate, so stand in a plain location object and read back the href the hook sets.
	let originalLocation: Location;

	beforeEach( () => {
		jest.clearAllMocks();
		mockRecoveryProps = undefined;
		mockFreshSite = null;
		// The poll has answered by default, so tests that don't care read a confirmed plugin list.
		mockSettledFetches = CONFIRMATION_FETCHES;
		mockActivationInProgress = false;
		originalLocation = window.location;
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: { ...originalLocation, href: '' },
		} );
	} );

	afterEach( () => {
		jest.useRealTimers();
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: originalLocation,
		} );
	} );

	it( 'owns activation only in the two recovery windows', () => {
		// Checkout-initiated flow observes a background transfer from step 0.
		render( { atomicFlow: false, currentStep: 0 } );
		expect( mockRecoveryProps?.ownsActivation ).toBe( true );
		render( { atomicFlow: false, currentStep: 2 } );
		expect( mockRecoveryProps?.ownsActivation ).toBe( false );

		// Component-driven transfer lands the plugin at step 2.
		render( { atomicFlow: true, currentStep: 0 } );
		expect( mockRecoveryProps?.ownsActivation ).toBe( false );
		render( { atomicFlow: true, currentStep: 1 } );
		expect( mockRecoveryProps?.ownsActivation ).toBe( false );
		render( { atomicFlow: true, currentStep: 2 } );
		expect( mockRecoveryProps?.ownsActivation ).toBe( true );
	} );

	it( 'enables recovery for the component-driven atomic-transfer flow once the site is Atomic', async () => {
		mockFreshSite = ATOMIC_READY;
		render( { atomicFlow: true, pluginActive: false } );
		await waitFor( () => expect( mockRecoveryProps?.enabled ).toBe( true ) );
	} );

	it( 'does not redirect after an atomic transfer while the plugin is still inactive', async () => {
		mockFreshSite = ATOMIC_READY;
		render( { atomicFlow: true, pluginActive: false } );
		// Wait for the fresh site to resolve (readiness satisfied), so a premature redirect would fire.
		await waitFor( () => expect( mockRecoveryProps?.canActivate ).toBe( true ) );
		expect( window.location.href ).toBe( '' );
	} );

	it( 'redirects once the plugin is active', async () => {
		mockFreshSite = ATOMIC_READY;
		render( { atomicFlow: true, pluginActive: true } );
		await waitFor( () => expect( window.location.href ).toBe( PLUGINS_URL ) );
	} );

	it( 'looks for the uploaded plugin once its transfer completes', async () => {
		mockFreshSite = ATOMIC_READY;
		const { rerender } = render( UPLOAD_PROPS );
		await waitFor( () => expect( mockRecoveryProps?.canActivate ).toBe( true ) );
		expect( mockRecoveryProps?.enabled ).toBe( false );

		rerender( { automatedTransferStatus: transferStates.COMPLETE } );
		await waitFor( () => expect( mockRecoveryProps?.enabled ).toBe( true ) );
	} );

	it( 'redirects an uploaded zip to the activated view once its plugin reads active', async () => {
		mockFreshSite = ATOMIC_READY;
		const { rerender } = render( UPLOAD_PROPS );
		await waitFor( () => expect( mockRecoveryProps?.canActivate ).toBe( true ) );

		// The polled plugin list turns up the uploaded plugin, active.
		rerender( {
			automatedTransferStatus: transferStates.COMPLETE,
			installedPlugin: { slug: 'uploaded', id: 'uploaded/uploaded' },
			pluginActive: true,
		} );
		await waitFor( () => expect( window.location.href ).toBe( PLUGINS_URL ) );
	} );

	it( 'sends an unconfirmed upload to the plain plugin list, not the activated view', async () => {
		// The transfer reports complete whether or not the archive installed, so with no plugin to
		// show for it the destination must not announce one.
		mockFreshSite = ATOMIC_READY;
		const { rerender } = render( UPLOAD_PROPS );
		await waitFor( () => expect( mockRecoveryProps?.canActivate ).toBe( true ) );

		rerender( { automatedTransferStatus: transferStates.COMPLETE } );
		await waitFor( () => expect( window.location.href ).toBe( PLUGINS_LIST_URL ) );
	} );

	it( 'keeps waiting while the poll still has fetches to make', async () => {
		mockFreshSite = ATOMIC_READY;
		mockSettledFetches = CONFIRMATION_FETCHES - 1;
		const { rerender } = render( UPLOAD_PROPS );
		await waitFor( () => expect( mockRecoveryProps?.canActivate ).toBe( true ) );

		rerender( { automatedTransferStatus: transferStates.COMPLETE } );
		await act( async () => {} );
		expect( window.location.href ).toBe( '' );
	} );

	it( 'does not navigate over an activation that is still in flight', async () => {
		// Navigating would abandon the request and leave an installed plugin switched off.
		mockFreshSite = ATOMIC_READY;
		mockActivationInProgress = true;
		const { rerender } = render( UPLOAD_PROPS );
		await waitFor( () => expect( mockRecoveryProps?.canActivate ).toBe( true ) );

		rerender( {
			automatedTransferStatus: transferStates.COMPLETE,
			installedPlugin: { slug: 'uploaded', id: 'uploaded/uploaded' },
		} );
		await act( async () => {} );
		expect( window.location.href ).toBe( '' );
	} );

	it( 'does not take a plugin the poll has not answered for as confirmation', async () => {
		// A re-upload restores the same slug, so an entry left over from an earlier install would
		// otherwise read as this one and announce a success that has not happened.
		mockFreshSite = ATOMIC_READY;
		mockSettledFetches = 0;
		const { rerender } = render( {
			...UPLOAD_PROPS,
			installedPlugin: { slug: 'uploaded', id: 'uploaded/uploaded' },
			pluginActive: true,
		} );
		await waitFor( () => expect( mockRecoveryProps?.canActivate ).toBe( true ) );

		rerender( { automatedTransferStatus: transferStates.COMPLETE } );
		await act( async () => {} );
		expect( window.location.href ).toBe( '' );
	} );

	it( 'waits for the transferred site to become reachable before giving up on an uploaded zip', async () => {
		// Atomic, but the capabilities wp-admin needs have not propagated yet.
		mockFreshSite = { ...ATOMIC_READY, capabilities: { manage_options: false } };
		const { rerender } = render( UPLOAD_PROPS );
		await act( async () => {} );

		rerender( { automatedTransferStatus: transferStates.COMPLETE } );
		await act( async () => {} );
		expect( window.location.href ).toBe( '' );
	} );

	it( 'recognises a transfer it first sees mid-upload, past the early phases', async () => {
		// Loading this section can outlast the first status polls, so the flow can arrive at any live
		// phase — `uploading` is what the initiate response itself reports.
		mockFreshSite = ATOMIC_READY;
		const { rerender } = render( {
			...UPLOAD_PROPS,
			automatedTransferStatus: transferStates.UPLOADING,
		} );
		await waitFor( () => expect( mockRecoveryProps?.canActivate ).toBe( true ) );

		rerender( { automatedTransferStatus: transferStates.COMPLETE } );
		await waitFor( () => expect( window.location.href ).toBe( PLUGINS_LIST_URL ) );
	} );

	it( 'does not redirect an upload that never transferred', async () => {
		// A completed status left over from an earlier transfer must not stand in for this install.
		mockFreshSite = ATOMIC_READY;
		render( { ...UPLOAD_PROPS, automatedTransferStatus: transferStates.COMPLETE } );
		// Readiness is satisfied, so an arm that trusted the status alone would have redirected.
		await waitFor( () => expect( mockRecoveryProps?.canActivate ).toBe( true ) );

		await act( async () => {} );
		expect( window.location.href ).toBe( '' );
	} );
} );
