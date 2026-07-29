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

let mockFreshSite: unknown;
jest.mock( '@automattic/api-queries', () => ( {
	...jest.requireActual( '@automattic/api-queries' ),
	siteByIdQuery: () => ( {
		queryKey: [ 'wiring-site' ],
		queryFn: () => Promise.resolve( mockFreshSite ),
	} ),
} ) );

const { fetchSitePlugins } = jest.requireMock( 'calypso/state/plugins/installed/actions' );

const PLUGINS_URL =
	'https://example.wpcomstaging.com/wp-admin/plugins.php?activate=true&plugin_status=active';
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
		const { rerender } = render( { automatedTransferStatus: transferStates.ACTIVE } );
		await act( async () => {} );
		expect( fetchSitePlugins ).not.toHaveBeenCalled();

		rerender( { ...uploadProps, automatedTransferStatus: transferStates.COMPLETE } );
		await waitFor( () => expect( fetchSitePlugins ).toHaveBeenCalledWith( 1 ) );
		expect( window.location.href ).toBe( '' );
	} );
} );
