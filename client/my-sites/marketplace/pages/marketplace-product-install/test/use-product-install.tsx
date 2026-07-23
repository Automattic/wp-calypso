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

const SITE_ID = 1;

const renderProductInstall = (
	props: { pluginSlug?: string; themeSlug?: string },
	initialState?: object
) => renderHookWithProvider( () => useProductInstall( props ), { reducers, initialState } );

const withUploadError = ( uploadError: object ) => ( {
	ui: { selectedSiteId: SITE_ID },
	plugins: { upload: { uploadError: { [ SITE_ID ]: uploadError } } },
} );

describe( 'useProductInstall', () => {
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
