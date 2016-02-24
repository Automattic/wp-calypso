/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import ReactDomServer from 'react-dom/server';
import mockery from 'mockery';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';

describe( 'Server pages:', function() {
	context( 'when trying to renderToString() LayoutLoggedOut ', function() {
		before( function() {
			mockery.enable( {
				warnOnReplace: false,
				warnOnUnregistered: false
			} );

			mockery.registerMock( 'analytics', noop );

			const LayoutLoggedOut = require( 'layout/logged-out' );
			this.LayoutLoggedOutFactory = React.createFactory( LayoutLoggedOut );
			this.props = {
				store: createReduxStore(),
			};
		} );

		after( function() {
			mockery.deregisterAll();
		} );

		it( "doesn't throw an exception", function() {
			assert.doesNotThrow( ReactDomServer.renderToString.bind( ReactDomServer, this.LayoutLoggedOutFactory( this.props ) ) );
		} );
	} );
} );
