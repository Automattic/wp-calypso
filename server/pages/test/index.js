jest.mock( 'lib/analytics', () => {} );

/**
 * External dependencies
 */
import React from 'react';
import ReactDomServer from 'react-dom/server';

/**
 * Internal dependencies
 */
import LayoutLoggedOut from 'layout/logged-out';

describe( 'index', () => {
	describe( 'when trying to renderToString() LayoutLoggedOut ', () => {
		it( "doesn't throw an exception", () => {
			const LayoutLoggedOutFactory = React.createFactory( LayoutLoggedOut );
			const props = {
				store: {
					dispatch: () => {},
					getState: () => ( {
						ui: {},
					} ),
					subscribe: () => {},
				},
			};

			expect(
				ReactDomServer.renderToString.bind( ReactDomServer, LayoutLoggedOutFactory( props ) ),
			).not.toThrow();
		} );
	} );
} );
