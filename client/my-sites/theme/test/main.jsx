/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import ReactDomServer from 'react-dom/server';
import mockery from 'mockery';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';
import EmptyComponent from 'test/helpers/react/empty-component';

describe( 'main', function() {
	context( 'when trying to renderToString() without theme data', function() {
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

			const store = createReduxStore();
			const ThemeSheetComponent = require( '../main' );

			this.layout = (
				<ReduxProvider store={ store }>
					<ThemeSheetComponent id={ 'twentysixteen' } />
				</ReduxProvider>
			);
		} );

		it( "doesn't throw an exception", function() {
			assert.doesNotThrow( ReactDomServer.renderToString.bind( ReactDomServer, this.layout ) );
		} );
	} );
} );

