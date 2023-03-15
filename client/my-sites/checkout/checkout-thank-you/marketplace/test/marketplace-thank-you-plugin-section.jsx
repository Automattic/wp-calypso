/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThankYouPluginSection } from '../marketplace-thank-you-plugin-section';

jest.mock( 'react-redux', () => {
	const originalModule = jest.requireActual( 'react-redux' );
	return {
		...originalModule,
		useDispatch: () => jest.fn(),
	};
} );

const sites = [];
sites[ 1 ] = {
	ID: 1,
	URL: 'example.wordpress.com',
};

const initialState = {
	purchases: {
		hasLoadedSitePurchasesFromServer: true,
	},
	sites: {
		items: sites,
		domains: {
			items: [ 'example.wordpress.com' ],
		},
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
	// productsList: {
	// 	items: {
	// 		mock_plugin: {
	// 			product_id: 123,
	// 			product_slug: 'mock_plugin',
	// 			product_type: 'marketplace_plugin',
	// 		},
	// 	},
	// },
};

describe( 'index', () => {
	test( "Plugin without a purchase, DOESN'T expire", async () => {
		const mockStore = configureStore();
		const store = mockStore( initialState );
		const plugin = {
			variations: [
				{
					yearly: {
						product_id: 123,
					},
				},
			],
		};

		render(
			<Provider store={ store }>
				<ThankYouPluginSection plugin={ plugin } />
			</Provider>
		);

		expect( screen.getByText( "This plugin doesn't expire" ) ).toBeInTheDocument();
	} );

	test( 'Plugin with a purchase, MUST expire', async () => {
		const mockStore = configureStore();
		initialState.purchases.data = [
			{
				user_id: 12,
				expiry_date: '2021-01-01T00:00:00+00:00',
				product_id: 123,
				blog_id: 1,
			},
		];
		const store = mockStore( initialState );
		const plugin = {
			variations: {
				yearly: {
					product_id: 123,
				},
			},
		};

		render(
			<Provider store={ store }>
				<ThankYouPluginSection plugin={ plugin } />
			</Provider>
		);

		expect( screen.getByText( 'Expires on January 1, 2021' ) ).toBeInTheDocument();
	} );
} );
