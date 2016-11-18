/**
 * Tests for controller.jsx
 */

/**
 * External dependencies
 */
import { noop } from 'lodash';
import { assert } from 'chai';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';
import EmptyComponent from 'test/helpers/react/empty-component';
import useMockery from 'test/helpers/use-mockery';
import {
	incrementThemesPage,
	query,
	legacyReceiveThemes as receiveThemes,
	receiveServerError
} from 'state/themes/actions';

describe( 'logged-out', () => {
	context( 'when calling renderToString()', function() {
		useMockery( mockery => {
			mockery.registerMock( 'lib/analytics', noop );
			mockery.registerMock( './theme-preview', EmptyComponent );
			mockery.registerMock( 'components/popover', EmptyComponent );
			mockery.registerMock( 'lib/analytics/page-view-tracker', EmptyComponent );

			this.LoggedOutShowcase = require( '../logged-out' );

			this.themes = [
				{
					author: 'AudioTheme',
					id: 'wayfarer',
					stylesheet: 'premium/wayfarer',
					name: 'Wayfarer',
					author_uri: 'https://audiotheme.com/',
					demo_uri: 'https://wayfarerdemo.wordpress.com/',
					screenshot: 'https://i1.wp.com/theme.wordpress.com/wp-content/themes/premium/wayfarer/screenshot.png',
					price: '$69'
				},
				{
					author: 'Organic Themes',
					id: 'natural',
					stylesheet: 'premium/natural',
					name: 'Natural',
					author_uri: 'http://www.organicthemes.com',
					demo_uri: 'https://naturaldemo.wordpress.com/',
					screenshot: 'https://i2.wp.com/theme.wordpress.com/wp-content/themes/premium/natural/screenshot.png',
					price: '$69'
				},
				{
					author: 'Press75',
					id: 'attache',
					stylesheet: 'premium/attache',
					name: 'Attache',
					author_uri: 'http://www.press75.com/',
					demo_uri: 'https://attachedemo.wordpress.com/',
					screenshot: 'https://i0.wp.com/theme.wordpress.com/wp-content/themes/premium/attache/screenshot.png',
					price: '$69'
				},
				{
					author: 'Anariel Design',
					id: 'pena',
					stylesheet: 'premium/pena',
					name: 'Pena',
					author_uri: 'http://theme.wordpress.com/themes/by/anariel-design/',
					demo_uri: 'https://penademo.wordpress.com/',
					screenshot: 'https://i2.wp.com/theme.wordpress.com/wp-content/themes/premium/pena/screenshot.png',
					price: '$89'
				},
				{
					author: 'Automattic',
					id: 'karuna',
					stylesheet: 'pub/karuna',
					name: 'Karuna',
					author_uri: 'http://wordpress.com/themes/',
					demo_uri: 'https://karunademo.wordpress.com/',
					screenshot: 'https://i1.wp.com/theme.wordpress.com/wp-content/themes/pub/karuna/screenshot.png'
				}
			];

			this.queryParams = { perPage: 5, page: 1, filter: '', id: 1 };
		} );

		beforeEach( () => {
			this.store = createReduxStore();

			this.layout = (
				<ReduxProvider store={ this.store }>
					<this.LoggedOutShowcase />
				</ReduxProvider>
			);
		} );

		it( 'renders without error when no themes are present', () => {
			let markup;
			assert.doesNotThrow( () => {
				markup = renderToString( this.layout );
			} );
			// Should show a "No themes found" message
			assert.isTrue( markup.includes( 'empty-content' ) );
		} );

		it( 'renders without error when themes are present', () => {
			this.store.dispatch( query( this.queryParams ) );
			this.store.dispatch( incrementThemesPage( false ) );
			this.store.dispatch( receiveThemes( { themes: this.themes }, false, this.queryParams ) );

			let markup;
			assert.doesNotThrow( () => {
				markup = renderToString( this.layout );
			} );
			// All 5 themes should appear...
			assert.equal( 5, markup.match( /theme__content/g ).length );
			// .. and no empty content placeholders should appear
			assert.isFalse( markup.includes( 'empty-content' ) );
		} );

		it( 'renders without error when theme fetch fails', () => {
			this.store.dispatch( query( this.queryParams ) );
			this.store.dispatch( incrementThemesPage( false ) );
			this.store.dispatch( receiveServerError( 'Error' ) );

			let markup;
			assert.doesNotThrow( () => {
				markup = renderToString( this.layout );
			} );
			// Should show a "No themes found" message
			assert.isTrue( markup.includes( 'empty-content' ) );
		} );
	} );
} );
