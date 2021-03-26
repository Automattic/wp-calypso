/**
 * External dependencies
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import ThemeSheetComponent from '../main';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import { receiveTheme, themeRequestFailure } from 'calypso/state/themes/actions';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/wp', () => ( {
	undocumented: () => ( {
		getProducts: () => {},
	} ),
} ) );
jest.mock( 'calypso/my-sites/themes/theme-preview', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'calypso/my-sites/themes/themes-site-selector-modal', () =>
	require( 'calypso/components/empty-component' )
);

describe( 'main', () => {
	describe( 'Calling renderToString() on Theme Info sheet', () => {
		const themeData = {
			name: 'Twenty Sixteen',
			author: 'the WordPress team',
			screenshot:
				'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
			description: 'Twenty Sixteen is a modernized take on an ever-popular WordPress layout — ...',
			descriptionLong: '<p>Mumble Mumble</p>',
			download: 'https://public-api.wordpress.com/rest/v1/themes/download/twentysixteen.zip',
			taxonomies: {},
			stylesheet: 'pub/twentysixteen',
			demo_uri: 'https://twentysixteendemo.wordpress.com/',
		};

		let store;
		let initialState;

		beforeAll( () => {
			store = createReduxStore();
			setStore( store );
			// Preserve initial theme state by deep cloning it.
			initialState = JSON.parse( JSON.stringify( store.getState().themes ) );
		} );

		beforeEach( () => {
			// Ensure initial theme state at the beginning of every test.
			store.getState().themes = initialState;
		} );

		test( "doesn't throw an exception without theme data", () => {
			const layout = (
				<ReduxProvider store={ store }>
					<ThemeSheetComponent id={ 'twentysixteen' } />
				</ReduxProvider>
			);
			let markup;
			expect( () => {
				markup = renderToString( layout );
			} ).not.toThrow();
			expect( markup.includes( 'theme__sheet' ) ).toBeTruthy();
		} );

		test( "doesn't throw an exception with theme data", () => {
			store.dispatch( receiveTheme( themeData ) );
			const layout = (
				<ReduxProvider store={ store }>
					<ThemeSheetComponent id={ 'twentysixteen' } />
				</ReduxProvider>
			);
			let markup;
			expect( () => {
				markup = renderToString( layout );
			} ).not.toThrow();
			expect( markup.includes( 'theme__sheet' ) ).toBeTruthy();
		} );

		test( "doesn't throw an exception with invalid theme data", () => {
			store.dispatch( themeRequestFailure( 'wpcom', 'invalidthemeid', 'not found' ) );
			const layout = (
				<ReduxProvider store={ store }>
					<ThemeSheetComponent id={ 'invalidthemeid' } />
				</ReduxProvider>
			);
			let markup;
			expect( () => {
				markup = renderToString( layout );
			} ).not.toThrow();
			expect( markup.includes( 'empty-content' ) ).toBeTruthy();
		} );
	} );
} );
