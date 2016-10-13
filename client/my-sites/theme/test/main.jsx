/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import ReactDomServer from 'react-dom/server';
import mockery from 'mockery';
import noop from 'lodash/noop';
import { receiveThemeDetails } from 'state/themes/actions';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';
import EmptyComponent from 'test/helpers/react/empty-component';

describe( 'main', function() {
	describe( 'Calling renderToString() on Theme Info sheet', function() {
		useMockery();
		useFakeDom();

		before( function() {
			mockery.registerMock( 'my-sites/themes/theme-preview', EmptyComponent );
			mockery.registerMock( 'my-sites/themes/thanks-modal', EmptyComponent );
			mockery.registerMock( 'my-sites/themes/themes-site-selector-modal', EmptyComponent );
			mockery.registerMock( 'components/data/query-user-purchases', EmptyComponent );
			mockery.registerMock( 'lib/analytics', {} );
			mockery.registerMock( 'my-sites/themes/helpers', {
				isPremium: noop,
				getForumUrl: noop,
				getDetailsUrl: noop,
			} );
			mockery.registerSubstitute( 'matches-selector', 'component-matches-selector' );
			mockery.registerMock( 'lib/wp', {
				me: () => ( {
					get: noop
				} ),
				undocumented: () => ( {
					getProducts: noop
				} ),
			} );

			this.ThemeSheetComponent = require( '../main' );

			this.themeData = {
				name: 'Twenty Sixteen',
				author: 'the WordPress team',
				screenshot: 'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
				description: 'Twenty Sixteen is a modernized take on an ever-popular WordPress layout — ...',
				descriptionLong: '<p>Mumble Mumble</p>',
				download: 'https://public-api.wordpress.com/rest/v1/themes/download/twentysixteen.zip',
				taxonomies: {},
				stylesheet: 'pub/twentysixteen',
				demo_uri: 'https://twentysixteendemo.wordpress.com/'
			};
		} );

		it( "doesn't throw an exception without theme data", function() {
			const store = createReduxStore();
			const layout = (
				<ReduxProvider store={ store }>
					<this.ThemeSheetComponent id={ 'twentysixteen' } />
				</ReduxProvider>
			);
			assert.doesNotThrow( ReactDomServer.renderToString.bind( ReactDomServer, layout ) );
		} );

		it( "doesn't throw an exception with theme data", function() {
			const store = createReduxStore();
			store.dispatch( receiveThemeDetails( this.themeData ) );
			const layout = (
				<ReduxProvider store={ store }>
					<this.ThemeSheetComponent id={ 'twentysixteen' } />
				</ReduxProvider>
			);
			assert.doesNotThrow( ReactDomServer.renderToString.bind( ReactDomServer, layout ) );
		} );
	} );
} );

