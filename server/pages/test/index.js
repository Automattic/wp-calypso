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
	describe( 'when trying to renderToString() LayoutLoggedOut ', function() {
		let LayoutLoggedOutFactory, props;

		useMockery();

		beforeAll( function() {
			mockery.registerMock( 'lib/analytics', noop );

			const LayoutLoggedOut = require( 'layout/logged-out' );
			LayoutLoggedOutFactory = React.createFactory( LayoutLoggedOut );
			props = {
				store: createReduxStore(),
			};
		} );

		it( "doesn't throw an exception", function() {
			assert.doesNotThrow(
				ReactDomServer.renderToString.bind(
					ReactDomServer,
					LayoutLoggedOutFactory( props )
				)
			);
		} );
	} );
} );
