/**
 * @jest-environment jsdom
 */
import { act, waitFor } from '@testing-library/react';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useThankYouRedirect } from '../use-thank-you-redirect';

// Capture what the recovery hook is wired with.
let mockRecoveryProps:
	| { enabled: boolean; canActivate: boolean; ownsActivation: boolean }
	| undefined;
jest.mock( '../use-post-transfer-plugin-recovery', () => ( {
	usePostTransferPluginRecovery: ( props: typeof mockRecoveryProps ) => {
		mockRecoveryProps = props;
	},
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
const CONFIRMATION_GRACE_MS = 10000;

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
		jest.useFakeTimers();
		mockFreshSite = ATOMIC_READY;
		const { rerender } = render( UPLOAD_PROPS );
		await waitFor( () => expect( mockRecoveryProps?.canActivate ).toBe( true ) );

		rerender( { automatedTransferStatus: transferStates.COMPLETE } );
		expect( window.location.href ).toBe( '' );
		act( () => jest.advanceTimersByTime( CONFIRMATION_GRACE_MS ) );
		expect( window.location.href ).toBe( PLUGINS_LIST_URL );
	} );

	it( 'waits for the transferred site to become reachable before giving up on an uploaded zip', async () => {
		// Atomic, but the capabilities wp-admin needs have not propagated yet.
		jest.useFakeTimers();
		mockFreshSite = { ...ATOMIC_READY, capabilities: { manage_options: false } };
		const { rerender } = render( UPLOAD_PROPS );
		await act( async () => {} );

		rerender( { automatedTransferStatus: transferStates.COMPLETE } );
		act( () => jest.advanceTimersByTime( CONFIRMATION_GRACE_MS ) );
		expect( window.location.href ).toBe( '' );
	} );

	it( 'does not redirect an upload that never transferred', async () => {
		// A completed status left over from an earlier transfer must not stand in for this install.
		jest.useFakeTimers();
		mockFreshSite = ATOMIC_READY;
		render( { ...UPLOAD_PROPS, automatedTransferStatus: transferStates.COMPLETE } );
		// Readiness is satisfied, so an arm that trusted the status alone would have redirected.
		await waitFor( () => expect( mockRecoveryProps?.canActivate ).toBe( true ) );

		act( () => jest.advanceTimersByTime( CONFIRMATION_GRACE_MS ) );
		expect( window.location.href ).toBe( '' );
	} );
} );
