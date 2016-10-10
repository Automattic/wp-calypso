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
import { LayoutLoggedOut } from 'layout/logged-out';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';
import emptyComponent from 'test/helpers/react/empty-component';

describe( 'main', function() {
	context( 'when trying to renderToString() without theme data', function() {
		useMockery();
		useFakeDom();

		before( function() {
			mockery.registerMock( 'my-sites/themes/theme-preview', emptyComponent );
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
			const primary = <ThemeSheetComponent id={ 'twentysixteen' } />;

			this.layout = (
				<ReduxProvider store={ store }>
					<LayoutLoggedOut primary={ primary } />
				</ReduxProvider>
			);
		} );

		it( "doesn't throw an exception", function() {
			assert.doesNotThrow( ReactDomServer.renderToString( this.layout ) );
		} );
	} );
} );

