import accessibleFocus from '@automattic/accessible-focus';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import LayoutLoggedOut from '../logged-out';

jest.mock( 'calypso/lib/signup/step-actions', () => ( {} ) );
jest.mock( '@automattic/accessible-focus', () => jest.fn() );

const store = {
	dispatch: () => {},
	getState: () => ( {
		ui: {},
		notices: {
			items: {},
			lastTimeShown: {},
		},
	} ),
	subscribe: () => {},
};

describe( 'index', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'when trying to renderToString() LayoutLoggedOut', () => {
		test( "doesn't throw an exception", () => {
			expect( () => {
				renderToString(
					<Provider store={ store }>
						<LayoutLoggedOut />
					</Provider>
				);
			} ).not.toThrow();
		} );
	} );

	describe( 'when mounting LayoutLoggedOut', () => {
		test( 'calls accessibleFocus', () => {
			render(
				<Provider store={ store }>
					<LayoutLoggedOut />
				</Provider>
			);

			expect( accessibleFocus ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
