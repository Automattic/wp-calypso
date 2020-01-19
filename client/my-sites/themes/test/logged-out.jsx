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
import LoggedOutShowcase from '../logged-out';
import { createReduxStore } from 'state';
import { THEMES_REQUEST_FAILURE } from 'state/action-types';
import { receiveThemes } from 'state/themes/actions';
import { DEFAULT_THEME_QUERY } from 'state/themes/constants';

jest.mock( 'lib/abtest', () => ( { abtest: () => {} } ) );
jest.mock( 'lib/analytics', () => ( {} ) );
jest.mock( 'lib/analytics/page-view-tracker', () => require( 'components/empty-component' ) );
jest.mock( 'my-sites/themes/theme-preview', () => require( 'components/empty-component' ) );

describe( 'logged-out', () => {
	describe( 'when calling renderToString()', () => {
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
					'https://i2.wp.com/theme.wordpress.com/wp-content/themes/premium/natural/screenshot.png',
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
					'https://i2.wp.com/theme.wordpress.com/wp-content/themes/premium/pena/screenshot.png',
				price: '$89',
			},
			{
				author: 'Automattic',
				id: 'karuna',
				stylesheet: 'pub/karuna',
				name: 'Karuna',
				author_uri: 'http://wordpress.com/themes/',
				demo_uri: 'https://karunademo.wordpress.com/',
				screenshot:
					'https://i1.wp.com/theme.wordpress.com/wp-content/themes/pub/karuna/screenshot.png',
			},
		];
		let layout, store;

		beforeEach( () => {
			store = createReduxStore();

			layout = (
				<ReduxProvider store={ store }>
					<LoggedOutShowcase />
				</ReduxProvider>
			);
		} );

		test( 'renders without error when no themes are present', () => {
			let markup;
			assert.doesNotThrow( () => {
				markup = renderToString( layout );
			} );
			// Should show a "No themes found" message
			assert.isTrue( markup.includes( 'empty-content' ) );
		} );

		test( 'renders without error when themes are present', () => {
			store.dispatch( receiveThemes( themes, 'wpcom', DEFAULT_THEME_QUERY, themes.length ) );

			let markup;
			assert.doesNotThrow( () => {
				markup = renderToString( layout );
			} );
			// All 5 themes should appear...
			assert.equal( 5, markup.match( /theme__content/g ).length );
			// .. and no empty content placeholders should appear
			assert.isFalse( markup.includes( 'empty-content' ) );
		} );

		test( 'renders without error when theme fetch fails', () => {
			store.dispatch( {
				type: THEMES_REQUEST_FAILURE,
				siteId: 'wpcom',
				query: {},
				error: 'Error',
			} );

			let markup;
			assert.doesNotThrow( () => {
				markup = renderToString( layout );
			} );
			// Should show a "No themes found" message
			assert.isTrue( markup.includes( 'empty-content' ) );
		} );
	} );
} );
