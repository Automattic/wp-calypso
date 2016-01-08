/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import ReactDomServer from 'react-dom/server';

describe( 'Server pages:', function() {
	context( 'when trying to renderToString() LayoutLoggedOutDesign ', function() {
		before( function() {
			const LayoutLoggedOutDesign = require( 'layout/logged-out-design' );
			this.LayoutLoggedOutDesignFactory = React.createFactory( LayoutLoggedOutDesign );
		} );

		it( "doesn't throw an exception", function() {
			assert.doesNotThrow( ReactDomServer.renderToString.bind( ReactDomServer, this.LayoutLoggedOutDesignFactory() ) );
		} );
	} );
} );
