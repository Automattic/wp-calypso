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

// Capture the pre-redirect delay call instead of navigating.
jest.mock( 'calypso/my-sites/marketplace/util', () => ( {
	waitFor: jest.fn( () => new Promise( () => {} ) ),
} ) );
const { waitFor: navDelay } = jest.requireMock( 'calypso/my-sites/marketplace/util' );

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
	beforeEach( () => {
		jest.clearAllMocks();
		mockRecoveryProps = undefined;
		mockFreshSite = undefined;
	} );

	it( 'owns activation at every step except the step-driven effect window (currentStep 1)', () => {
		render( { currentStep: 0 } );
		expect( mockRecoveryProps?.ownsActivation ).toBe( true );
		render( { currentStep: 1 } );
		expect( mockRecoveryProps?.ownsActivation ).toBe( false );
		render( { currentStep: 2 } );
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
		expect( navDelay ).not.toHaveBeenCalled();
	} );

	it( 'redirects once the plugin is active', async () => {
		mockFreshSite = ATOMIC_READY;
		render( { atomicFlow: true, pluginActive: true } );
		await waitFor( () => expect( navDelay ).toHaveBeenCalled() );
	} );
} );
