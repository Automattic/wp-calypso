/**
 * @jest-environment jsdom
 */
import { act } from '@testing-library/react';
import automatedTransferReducer from 'calypso/state/automated-transfer/reducer';
import marketplaceReducer from 'calypso/state/marketplace/reducer';
import pluginsReducer from 'calypso/state/plugins/reducer';
import themesReducer from 'calypso/state/themes/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useProductInstall } from '../use-product-install';

// useProductInstall reads several section-lazy slices that the bare test store doesn't register.
const reducers = {
	automatedTransfer: automatedTransferReducer,
	plugins: pluginsReducer,
	themes: themesReducer,
	marketplace: marketplaceReducer,
	ui: uiReducer,
};

const SITE_ID = 1;

const renderProductInstall = (
	props: { pluginSlug?: string; themeSlug?: string },
	initialState?: object
) => renderHookWithProvider( () => useProductInstall( props ), { reducers, initialState } );

// An upload whose plugin is installed but switched off, on a site already Atomic. `uploadMethod` is
// what says which path the attempt took; the transfer status is site-wide and may describe another.
const uploadAwaitingActivation = ( uploadMethod: string, transferStatus: string | null ) => ( {
	ui: { selectedSiteId: SITE_ID },
	sites: { items: { [ SITE_ID ]: { ID: SITE_ID, options: { is_automated_transfer: true } } } },
	automatedTransfer: { [ SITE_ID ]: { status: transferStatus } },
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

const withUploadError = ( uploadError: object ) => ( {
	ui: { selectedSiteId: SITE_ID },
	plugins: { upload: { uploadError: { [ SITE_ID ]: uploadError } } },
} );

describe( 'useProductInstall', () => {
	describe( 'who activates an uploaded plugin', () => {
		// The upload step advances on a timer before activation is reached.
		beforeEach( () => jest.useFakeTimers() );
		afterEach( () => jest.useRealTimers() );

		// A tab closed mid-transfer leaves a live-looking status behind for good. Reading the attempt
		// off that would hand a later direct upload's plugin to a poll that is not watching for it.
		it( 'activates a direct upload itself, whatever the site transfer status says', () => {
			const { store } = renderHookWithProvider( () => useProductInstall( {} ), {
				reducers,
				initialState: uploadAwaitingActivation( 'direct', 'active' ),
			} );

			act( () => {
				jest.advanceTimersByTime( 2000 );
			} );

			const activations =
				store.getState().plugins.installed.status?.[ SITE_ID ]?.[ 'uploaded/uploaded' ];
			expect( activations?.action ).toBe( 'ACTIVATE_PLUGIN' );
		} );

		it( 'leaves a transferred upload to the recovery poll', () => {
			const { store } = renderHookWithProvider( () => useProductInstall( {} ), {
				reducers,
				initialState: uploadAwaitingActivation( 'transfer', 'complete' ),
			} );

			act( () => {
				jest.advanceTimersByTime( 2000 );
			} );

			expect(
				store.getState().plugins.installed.status?.[ SITE_ID ]?.[ 'uploaded/uploaded' ]
			).toBeUndefined();
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
	} );
} );
