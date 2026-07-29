/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
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

// canManagePlugins — the plan feature gate on the redirect.
jest.mock( 'calypso/state/selectors/site-has-feature', () => () => true );

const PLUGINS_URL =
	'https://example.wpcomstaging.com/wp-admin/plugins.php?activate=true&plugin_status=active';

const ATOMIC_READY = {
	ID: 1,
	is_wpcom_atomic: true,
	capabilities: { manage_options: true },
	options: { admin_url: 'https://example.wpcomstaging.com/wp-admin/' },
};

type Props = Parameters< typeof useThankYouRedirect >[ 0 ];
const baseProps: Props = {
	siteId: 1,
	selectedSite: { ID: 1 },
	selectedSiteSlug: 'example.wordpress.com',
	currentStep: 2,
	isPluginUploadFlow: false,
	pluginSlug: 'give',
	themeSlug: '',
	wpOrgTheme: null,
	isThemeActive: false,
	installedPlugin: { slug: 'give', id: 'give/give' },
	pluginActive: false,
	uploadedPluginSlug: '',
	atomicFlow: true,
	isAtomic: true,
	automatedTransferStatus: transferStates.COMPLETE,
};
const render = ( overrides?: Partial< Props > ) =>
	renderHookWithProvider( () => useThankYouRedirect( { ...baseProps, ...overrides } ) );

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
} );
