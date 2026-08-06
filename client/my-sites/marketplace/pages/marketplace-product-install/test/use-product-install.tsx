/**
 * @jest-environment jsdom
 */
import { act } from '@testing-library/react';
import marketplaceReducer from 'calypso/state/marketplace/reducer';
import pluginsReducer from 'calypso/state/plugins/reducer';
import themesReducer from 'calypso/state/themes/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useProductInstall } from '../use-product-install';

// useProductInstall reads several section-lazy slices that the bare test store doesn't register.
const reducers = {
	plugins: pluginsReducer,
	themes: themesReducer,
	marketplace: marketplaceReducer,
	ui: uiReducer,
};

// The deadline hook has its own suite; here we only assert how this hook arms it.
type DeadlineArgs = { siteId: number; productSlug: string; enabled: boolean };

const mockUseInstallDeadline = jest.fn( ( args: DeadlineArgs ) => ( {
	hasTimedOut: false,
	hasTransferFailed: false,
	receivedEnabled: args.enabled,
} ) );

jest.mock( '../use-install-deadline', () => ( {
	...jest.requireActual( '../use-install-deadline' ),
	useInstallDeadline: ( args: DeadlineArgs ) => mockUseInstallDeadline( args ),
} ) );

const SITE_ID = 1;

const renderProductInstall = (
	props: { pluginSlug?: string; themeSlug?: string },
	initialState?: object
) => renderHookWithProvider( () => useProductInstall( props ), { reducers, initialState } );

// An upload whose plugin is installed but switched off, on a site already Atomic. `uploadMethod` is
// what says which path the attempt took, and so who is responsible for activating what it left.
const uploadAwaitingActivation = ( uploadMethod: string ) => ( {
	ui: { selectedSiteId: SITE_ID },
	sites: { items: { [ SITE_ID ]: { ID: SITE_ID, options: { is_automated_transfer: true } } } },
	plugins: {
		upload: {
			uploadMethod: { [ SITE_ID ]: uploadMethod },
			uploadedPluginId: { [ SITE_ID ]: 'uploaded' },
			inProgress: { [ SITE_ID ]: false },
			progressPercent: { [ SITE_ID ]: 100 },
		},
		installed: {
			plugins: { [ SITE_ID ]: [ { slug: 'uploaded', id: 'uploaded/uploaded', active: false } ] },
		},
	},
} );

type PluginStatuses = {
	plugins: { installed: { status?: Record< number, Record< string, { action?: string } > > } };
};
const activationOf = ( store: { getState: () => PluginStatuses } ) =>
	store.getState().plugins.installed.status?.[ SITE_ID ]?.[ 'uploaded/uploaded' ]?.action;

// The browser is still sending the file: the upload is in progress and nothing has landed yet.
const uploadInFlight = () => ( {
	ui: { selectedSiteId: SITE_ID },
	sites: { items: { [ SITE_ID ]: { ID: SITE_ID, options: { is_automated_transfer: true } } } },
	marketplace: {
		purchaseFlow: {
			primaryDomain: 'example.wordpress.com',
			pluginInstallationStatus: 'in-progress',
		},
	},
	plugins: {
		upload: {
			inProgress: { [ SITE_ID ]: true },
			progressPercent: { [ SITE_ID ]: 12 },
		},
	},
} );

const withUploadError = ( uploadError: object ) => ( {
	ui: { selectedSiteId: SITE_ID },
	plugins: { upload: { uploadError: { [ SITE_ID ]: uploadError } } },
} );

describe( 'useProductInstall', () => {
	describe( 'who activates an uploaded plugin', () => {
		// The upload step advances on a timer before activation is reached.
		beforeEach( () => jest.useFakeTimers() );
		afterEach( () => jest.useRealTimers() );

		it( 'activates a direct upload itself', () => {
			const { store } = renderHookWithProvider( () => useProductInstall( {} ), {
				reducers,
				initialState: uploadAwaitingActivation( 'direct' ),
			} );

			act( () => {
				jest.advanceTimersByTime( 2000 );
			} );

			expect( activationOf( store ) ).toBe( 'ACTIVATE_PLUGIN' );
		} );

		it( 'leaves a transferred upload to the recovery poll, which can retry', () => {
			// Activating here as well would put two owners on the same plugin at once.
			const { store } = renderHookWithProvider( () => useProductInstall( {} ), {
				reducers,
				initialState: uploadAwaitingActivation( 'transfer' ),
			} );

			act( () => {
				jest.advanceTimersByTime( 2000 );
			} );

			expect( activationOf( store ) ).toBeUndefined();
		} );
	} );

	describe( 'steps', () => {
		it( 'lists set-up, install, and activate for a marketplace plugin', () => {
			const { result } = renderProductInstall( { pluginSlug: 'give' } );
			expect( result.current.steps ).toEqual( [
				'Setting up plugin installation',
				'Installing plugin',
				'Activating plugin',
			] );
		} );

		it( 'leads with the upload step when no product slug is given', () => {
			const { result } = renderProductInstall( {} );
			expect( result.current.steps ).toEqual( [
				'Uploading plugin',
				'Installing plugin',
				'Activating plugin',
			] );
		} );

		it( 'uses the two theme steps for a theme slug', () => {
			const { result } = renderProductInstall( { themeSlug: 'twentytwentyfour' } );
			expect( result.current.steps ).toEqual( [
				'Setting up theme installation',
				'Activating theme',
			] );
		} );
	} );

	describe( 'error', () => {
		it( 'has no error before any grace period elapses', () => {
			const { result } = renderProductInstall( { pluginSlug: 'give' } );
			expect( result.current.error ).toBeNull();
		} );

		it( 'reports the plan error once the grace period passes for a site that cannot install', () => {
			jest.useFakeTimers();
			try {
				const { result } = renderProductInstall( { pluginSlug: 'give' } );
				expect( result.current.error ).toBeNull();

				act( () => {
					jest.advanceTimersByTime( 2000 );
				} );
				expect( result.current.error ).toEqual( { type: 'non-installable-plan' } );
			} finally {
				jest.useRealTimers();
			}
		} );

		it.each( [
			[ 'exists', { error: 'folder_exists' } ],
			[ 'malicious', { error: 'plugin_malicious' } ],
			[ 'too-big', { statusCode: 413 } ],
		] as const )(
			'reports a rejected upload (%s) from the upload error state',
			( reason, uploadError ) => {
				const { result } = renderProductInstall( {}, withUploadError( uploadError ) );
				expect( result.current.error ).toEqual( { type: 'rejected-upload', reason } );
			}
		);

		// The upload page sends the customer here as soon as the upload starts. Counting that time
		// against a deadline calibrated for server-side transfers would fail a large file on a slow
		// connection — an install that was going to succeed.
		it( 'leaves the deadline disarmed while the browser is still sending the upload', () => {
			renderProductInstall( {}, uploadInFlight() );

			expect( mockUseInstallDeadline ).toHaveBeenCalled();
			expect( mockUseInstallDeadline.mock.calls.at( -1 )?.[ 0 ] ).toMatchObject( {
				enabled: false,
			} );
		} );

		it( 'arms the deadline once the upload has landed', () => {
			renderProductInstall( {}, uploadAwaitingActivation( 'direct' ) );

			expect( mockUseInstallDeadline.mock.calls.at( -1 )?.[ 0 ] ).toMatchObject( {
				enabled: true,
			} );
		} );
	} );
} );
