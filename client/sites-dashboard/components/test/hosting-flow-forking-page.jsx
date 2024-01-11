/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { HostingFlowForkingPage } from '../hosting-flow-forking-page';

describe( 'index', () => {
	test( 'Eligible users should see create/migrate a site CTA', async () => {
		const mockStore = configureStore();
		const store = mockStore( {
			currentUser: {
				id: 1,
				user: {
					had_hosting_trial: false,
				},
			},
		} );

		render(
			<Provider store={ store }>
				<HostingFlowForkingPage context="profile" siteCount={ 1 } />
			</Provider>
		);

		expect( screen.getByText( 'Create a site' ) ).toBeInTheDocument();
	} );

	test( 'NOT Eligible users should be redirected to /setup/new-hosted-site with query parameters on it', async () => {
		const mockStore = configureStore();
		const store = mockStore( {
			currentUser: {
				id: 1,
				user: {
					had_hosting_trial: true,
				},
			},
		} );

		delete window.location;
		window.location = {
			search: '?param1=test&param2=test2',
			replace: jest.fn(),
		};

		render(
			<Provider store={ store }>
				<HostingFlowForkingPage context="profile" siteCount={ 1 } />
			</Provider>
		);

		expect( window.location.replace ).toHaveBeenCalledWith(
			'/setup/new-hosted-site/plans?hosting-trial-not-eligible=true&param1=test&param2=test2'
		);
		expect( screen.queryByText( 'Create a site' ) ).toBeNull();
	} );
} );
