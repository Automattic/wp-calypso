/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import ReactDomServer from 'react-dom/server';
import mockery from 'mockery';
import useMockery from 'test/helpers/use-mockery';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';

describe( 'index', function() {
	context( 'when trying to renderToString() LayoutLoggedOut ', function() {
		useMockery();

		before( function() {
			mockery.registerMock( 'lib/analytics', noop );

			const LayoutLoggedOut = require( 'layout/logged-out' );
			this.LayoutLoggedOutFactory = React.createFactory( LayoutLoggedOut );
			this.props = {
				store: createReduxStore(),
			};
		} );

		it( "doesn't throw an exception", function() {
			assert.doesNotThrow( ReactDomServer.renderToString.bind( ReactDomServer, this.LayoutLoggedOutFactory( this.props ) ) );
		} );
	} );
} );
