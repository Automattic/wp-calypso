/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Sidebar from '../index';

describe( '<Sitebar>', () => {
	test( 'should render correctly', () => {
		const initialState = {
			userSettings: {
				settings: {
					is_dev_account: false,
				},
			},
			currentUser: {
				capabilities: {},
				user: {
					jetpack_site_count: 0,
					site_count: 0,
				},
			},
			sites: { items: [] },
			preferences: {
				remoteValues: {},
			},
			ui: {
				selectedSiteId: null,
			},
		};
		const mockStore = configureStore();
		const store = mockStore( initialState );

		const { container } = render(
			<Provider store={ store }>
				<Sidebar path="/dashboard" />
			</Provider>
		);
		expect( container ).toContainHTML( 'All My Sites' );
	} );
} );
