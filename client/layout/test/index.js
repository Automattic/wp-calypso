/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';

/**
 * Internal dependencies
 */
import LayoutLoggedOut from '../logged-out';

describe( 'index', () => {
	describe( 'when trying to renderToString() LayoutLoggedOut ', () => {
		test( "doesn't throw an exception", () => {
			expect( () => {
				renderToString(
					<Provider
						store={ {
							dispatch: () => {},
							getState: () => ( {
								ui: {},
							} ),
							subscribe: () => {},
						} }
					>
						<LayoutLoggedOut />
					</Provider>
				);
			} ).not.toThrow();
		} );
	} );
} );
