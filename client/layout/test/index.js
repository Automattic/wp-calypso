/** @format */
/**
 * External dependencies
 */
import React from 'react';
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
					<LayoutLoggedOut
						store={ {
							dispatch: () => {},
							getState: () => ( {
								ui: {},
							} ),
							subscribe: () => {},
						} }
					/>
				);
			} ).not.toThrow();
		} );
	} );
} );
