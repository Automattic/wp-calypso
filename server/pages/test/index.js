jest.mock( 'lib/analytics', () => {} );

import React from 'react';
import ReactDomServer from 'react-dom/server';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';

describe( 'index', function() {
	describe( 'when trying to renderToString() LayoutLoggedOut ', function() {
		let LayoutLoggedOutFactory, props;

		beforeAll( function() {
			const LayoutLoggedOut = require( 'layout/logged-out' );
			LayoutLoggedOutFactory = React.createFactory( LayoutLoggedOut );
			props = {
				store: createReduxStore(),
			};
		} );

		it( "doesn't throw an exception", function() {
			expect(
                ReactDomServer.renderToString.bind( ReactDomServer, LayoutLoggedOutFactory( props ) )
            ).not.toThrow();
		} );
	} );
} );
