/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import ReactDomServer from 'react-dom/server';
import { createReduxStore } from 'state';
import ReactInjection from 'react/lib/ReactInjection';
import i18n from 'lib/mixins/i18n';

describe( 'Server pages:', function() {
	context( 'when trying to renderToString() LayoutLoggedOutDesign ', function() {
		before( function() {
			i18n.initialize();
			ReactInjection.Class.injectMixin( i18n.mixin );
			const LayoutLoggedOutDesign = require( 'layout/logged-out-design' );
			this.LayoutLoggedOutDesignFactory = React.createFactory( LayoutLoggedOutDesign );
			this.props = {
				tier: 'free',
				store: createReduxStore(),
			};
		} );

		it( "doesn't throw an exception", function() {
			assert.doesNotThrow( ReactDomServer.renderToString.bind( ReactDomServer, this.LayoutLoggedOutDesignFactory( this.props ) ) );
		} );
	} );
} );
