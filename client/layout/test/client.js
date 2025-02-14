/**
 * @jest-environment jsdom
 */

import accessibleFocus from '@automattic/accessible-focus';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import LayoutLoggedOut from '../logged-out';

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

describe( 'LayoutLoggedOut', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'when mounting', () => {
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
