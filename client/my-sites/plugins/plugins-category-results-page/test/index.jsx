/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import usePlugins from '../../use-plugins';
import PluginsCategoryResultsPage from '../index';

jest.mock( '../../use-plugins', () => jest.fn() );
jest.mock( '../../hooks/use-is-marketplace-redesign-enabled', () => ( {
	useIsMarketplaceRedesignEnabled: () => false,
} ) );
jest.mock( 'calypso/my-sites/plugins/plugins-browser-list', () => () => (
	<div data-testid="plugins-browser-list" />
) );
jest.mock( 'calypso/my-sites/plugins/plugins-discovery-page/upgrade-nudge', () => () => null );
jest.mock( 'calypso/components/infinite-scroll', () => () => null );

function renderPage( props, { loggedIn = false } = {} ) {
	const store = createStore( () => ( { currentUser: { id: loggedIn ? 1 : null } } ) );

	return render(
		<Provider store={ store }>
			<PluginsCategoryResultsPage category="seo" pathname="/plugins/browse/seo" { ...props } />
		</Provider>
	);
}

function mockPlugins( { hasNextPage = true, loadedPages = 1 } = {} ) {
	usePlugins.mockReturnValue( {
		plugins: [],
		isFetching: false,
		fetchNextPage: jest.fn(),
		hasNextPage,
		pagination: { page: loadedPages, results: 300 },
	} );
}

describe( 'PluginsCategoryResultsPage pagination', () => {
	test( 'requests the plugins of the given page', () => {
		mockPlugins();

		renderPage( { page: 3 } );

		expect( usePlugins ).toHaveBeenCalledWith( expect.objectContaining( { page: 3 } ) );
	} );

	test( 'links only to the next page from the first page', () => {
		mockPlugins();

		renderPage( { page: 1 } );

		expect( screen.getByRole( 'link', { name: 'Next page' } ) ).toHaveAttribute(
			'href',
			'/plugins/browse/seo?page=2'
		);
		expect( screen.queryByRole( 'link', { name: 'Previous page' } ) ).not.toBeInTheDocument();
	} );

	test( 'links to the previous and next pages', () => {
		mockPlugins();

		renderPage( { page: 2 } );

		expect( screen.getByRole( 'link', { name: 'Previous page' } ) ).toHaveAttribute(
			'href',
			'/plugins/browse/seo'
		);
		expect( screen.getByRole( 'link', { name: 'Next page' } ) ).toHaveAttribute(
			'href',
			'/plugins/browse/seo?page=3'
		);
	} );

	test( 'links past the pages infinite scroll has loaded', () => {
		mockPlugins( { loadedPages: 3 } );

		renderPage( { page: 2 } );

		expect( screen.getByRole( 'link', { name: 'Next page' } ) ).toHaveAttribute(
			'href',
			'/plugins/browse/seo?page=5'
		);
	} );

	test( 'has no next page link on the last page', () => {
		mockPlugins( { hasNextPage: false } );

		renderPage( { page: 4 } );

		expect( screen.queryByRole( 'link', { name: 'Next page' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Previous page' } ) ).toBeVisible();
	} );

	test( 'has no pagination links for logged-in users', () => {
		mockPlugins();

		renderPage( { page: 2 }, { loggedIn: true } );

		expect( screen.queryByRole( 'navigation' ) ).not.toBeInTheDocument();
	} );
} );
