/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import configureStore from 'redux-mock-store';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
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
};

function mockSitePurchases( purchases ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( { site: 1 } )
		.reply( 200, purchases );
}

describe( 'index', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	test( "Plugin without a purchase, DOESN'T expire", async () => {
		mockSitePurchases( [] );
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

		renderWithProvider( <ThankYouPluginSection plugin={ plugin } />, { store } );

		expect( await screen.findByText( "This plugin doesn't expire" ) ).toBeInTheDocument();
	} );

	test( 'Plugin with a purchase, MUST expire', async () => {
		mockSitePurchases( [
			{
				ID: 1,
				user_id: 12,
				expiry_date: '2021-01-01T00:00:00+00:00',
				product_id: 123,
				blog_id: 1,
			},
		] );
		const mockStore = configureStore();
		const store = mockStore( initialState );
		const plugin = {
			variations: {
				yearly: {
					product_id: 123,
				},
			},
		};

		renderWithProvider( <ThankYouPluginSection plugin={ plugin } />, { store } );

		expect( await screen.findByText( 'Expires on January 1, 2021' ) ).toBeInTheDocument();
	} );
} );
