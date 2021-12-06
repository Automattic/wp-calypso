/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import { THEMES_REQUEST_FAILURE } from 'calypso/state/themes/action-types';
import { receiveThemes } from 'calypso/state/themes/actions';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import LoggedOutShowcase from '../logged-out';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'calypso/my-sites/themes/theme-preview', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'calypso/my-sites/themes/themes-magic-search-card', () =>
	require( 'calypso/components/empty-component' )
);

const themes = [
	{
		author: 'AudioTheme',
		id: 'wayfarer',
		stylesheet: 'premium/wayfarer',
		name: 'Wayfarer',
		author_uri: 'https://audiotheme.com/',
		demo_uri: 'https://wayfarerdemo.wordpress.com/',
		screenshot:
			'https://i1.wp.com/theme.wordpress.com/wp-content/themes/premium/wayfarer/screenshot.png',
		price: '$69',
	},
	{
		author: 'Organic Themes',
		id: 'natural',
		stylesheet: 'premium/natural',
		name: 'Natural',
		author_uri: 'http://www.organicthemes.com',
		demo_uri: 'https://naturaldemo.wordpress.com/',
		screenshot:
			'https://i0.wp.com/theme.wordpress.com/wp-content/themes/premium/natural/screenshot.png',
		price: '$69',
	},
	{
		author: 'Press75',
		id: 'attache',
		stylesheet: 'premium/attache',
		name: 'Attache',
		author_uri: 'http://www.press75.com/',
		demo_uri: 'https://attachedemo.wordpress.com/',
		screenshot:
			'https://i0.wp.com/theme.wordpress.com/wp-content/themes/premium/attache/screenshot.png',
		price: '$69',
	},
	{
		author: 'Anariel Design',
		id: 'pena',
		stylesheet: 'premium/pena',
		name: 'Pena',
		author_uri: 'http://theme.wordpress.com/themes/by/anariel-design/',
		demo_uri: 'https://penademo.wordpress.com/',
		screenshot:
			'https://i0.wp.com/theme.wordpress.com/wp-content/themes/premium/pena/screenshot.png',
		price: '$89',
	},
	{
		author: 'Automattic',
		id: 'karuna',
		stylesheet: 'pub/karuna',
		name: 'Karuna',
		author_uri: 'http://wordpress.com/themes/',
		demo_uri: 'https://karunademo.wordpress.com/',
		screenshot: 'https://i1.wp.com/theme.wordpress.com/wp-content/themes/pub/karuna/screenshot.png',
	},
];

const TestComponent = ( { store } ) => {
	const queryClient = new QueryClient();
	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<LoggedOutShowcase />
			</QueryClientProvider>
		</ReduxProvider>
	);
};

describe( 'logged-out', () => {
	test( 'renders without error when no themes are present', async () => {
		const store = createReduxStore();
		setStore( store );
		render( <TestComponent store={ store } /> );

		await waitFor( () => {
			expect( screen.getByText( 'Sorry, no themes found.' ) ).toBeInTheDocument();
		} );
	} );

	test( 'renders without error when themes are present', async () => {
		const store = createReduxStore();
		setStore( store );
		store.dispatch( receiveThemes( themes, 'wpcom', DEFAULT_THEME_QUERY, themes.length ) );
		render( <TestComponent store={ store } /> );

		await waitFor( () => {
			themes.forEach( ( theme ) => {
				expect( screen.getByText( theme.name ) ).toBeInTheDocument();
			} );
			expect( screen.queryByText( 'Sorry, no themes found.' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'renders without error when theme fetch fails', async () => {
		const store = createReduxStore();
		setStore( store );

		store.dispatch( {
			type: THEMES_REQUEST_FAILURE,
			siteId: 'wpcom',
			query: {},
			error: 'Error',
		} );
		render( <TestComponent store={ store } /> );

		await waitFor( () => {
			expect( screen.queryByText( 'Sorry, no themes found.' ) ).toBeInTheDocument();
		} );
	} );
} );
