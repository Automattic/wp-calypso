/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import PlansWrapper from '../plans-wrapper';

const initialState = {
	sites: {
		items: [],
		requesting: {},
		plans: {},
	},
	ui: {
		selectedSiteId: 1,
	},
	currentUser: {
		id: 12,
		user: {
			email_verified: true,
		},
	},
	notices: {
		items: [],
	},
};

jest.mock( 'calypso/my-sites/plans-features-main', () => {
	return () => {
		<>some html</>;
	};
} );

describe( 'index', () => {
	test( 'Not eligible users should see a warning message at the plans page', async () => {
		const mockStore = configureStore();
		const store = mockStore( initialState );

		delete window.location;
		window.location = {
			href: '/setup/new-hosted-site/plans?hosting-trial-not-eligible=true',
			replace: jest.fn(),
		};

		render(
			<Provider store={ store }>
				<MemoryRouter>
					<PlansWrapper context="profile" siteCount={ 1 } />
				</MemoryRouter>
			</Provider>
		);

		const reduxState = store.getState();
		expect( reduxState.ui.selectedSiteId ).toBe( 1 );
		const firstActionText = store.getActions()[ 0 ].notice.text;
		expect( firstActionText ).toBe(
			'Looks like you’ve already used your free trial. Let’s find you the perfect plan.'
		);
	} );
} );
