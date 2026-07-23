/**
 * @jest-environment jsdom
 */
import marketplaceReducer from 'calypso/state/marketplace/reducer';
import pluginsReducer from 'calypso/state/plugins/reducer';
import themesReducer from 'calypso/state/themes/reducer';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useProductInstall } from '../use-product-install';

// useProductInstall reads several section-lazy slices that the bare test store doesn't register.
const reducers = {
	plugins: pluginsReducer,
	themes: themesReducer,
	marketplace: marketplaceReducer,
};

const renderProductInstall = ( props: { pluginSlug?: string; themeSlug?: string } ) =>
	renderHookWithProvider( () => useProductInstall( props ), { reducers } );

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
} );
