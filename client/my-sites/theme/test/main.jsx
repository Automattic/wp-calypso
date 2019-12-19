/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import ThemeSheetComponent from '../main';
import { createReduxStore } from 'state';
import { receiveTheme, themeRequestFailure } from 'state/themes/actions';

jest.mock( 'lib/analytics', () => ( {} ) );
jest.mock( 'lib/wp', () => ( {
	undocumented: () => ( {
		getProducts: () => {},
	} ),
} ) );
jest.mock( 'my-sites/themes/theme-preview', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/themes/themes-site-selector-modal', () =>
	require( 'components/empty-component' )
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

		test( "doesn't throw an exception without theme data", () => {
			const store = createReduxStore();
			const layout = (
				<ReduxProvider store={ store }>
					<ThemeSheetComponent id={ 'twentysixteen' } />
				</ReduxProvider>
			);
			let markup;
			assert.doesNotThrow( () => {
				markup = renderToString( layout );
			} );
			assert.isTrue( markup.includes( 'theme__sheet' ) );
		} );

		test( "doesn't throw an exception with theme data", () => {
			const store = createReduxStore();
			store.dispatch( receiveTheme( themeData ) );
			const layout = (
				<ReduxProvider store={ store }>
					<ThemeSheetComponent id={ 'twentysixteen' } />
				</ReduxProvider>
			);
			let markup;
			assert.doesNotThrow( () => {
				markup = renderToString( layout );
			} );
			assert.isTrue( markup.includes( 'theme__sheet' ) );
		} );

		test( "doesn't throw an exception with invalid theme data", () => {
			const store = createReduxStore();
			store.dispatch( themeRequestFailure( 'wpcom', 'invalidthemeid', 'not found' ) );
			const layout = (
				<ReduxProvider store={ store }>
					<ThemeSheetComponent id={ 'invalidthemeid' } />
				</ReduxProvider>
			);
			let markup;
			assert.doesNotThrow( () => {
				markup = renderToString( layout );
			} );
			assert.isTrue( markup.includes( 'empty-content' ) );
		} );
	} );
} );
