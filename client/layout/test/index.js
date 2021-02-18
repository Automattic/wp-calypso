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

jest.mock( 'calypso/lib/abtest', () => ( {
	abtest: () => '',
} ) );
jest.mock( 'calypso/lib/signup/step-actions', () => ( {} ) );
jest.mock( 'calypso/lib/user', () => () => {
	return {
		get() {
			return {};
		},
	};
} );

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
								notices: {
									items: {},
									lastTimeShown: {},
								},
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
