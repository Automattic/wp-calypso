/**
 * @jest-environment jsdom
 */

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DomainUpsell from '../';

const initialState = {
	sites: {
		items: {
			1: {
				ID: 1,
				URL: 'example.wordpress.com',
				plan: {
					product_slug: 'free_plan',
				},
			},
		},
		domains: {
			items: [ 'example.wordpress.com' ],
		},
		plans: {
			1: {
				product_slug: 'free_plan',
			},
		},
	},
	ui: {
		selectedSiteId: 1,
	},
	currentUser: {
		id: 12,
		user: {
			email_verified: true,
			site_count: 1,
			primary_blog: 1,
		},
	},
};

jest.mock( '@automattic/domain-picker/src', () => {
	return {
		useDomainSuggestions: () => {
			return {
				allDomainSuggestions: [
					{
						is_free: false,
						product_slug: 'mydomain.com',
					},
				],
			};
		},
	};
} );

let pageLink = '';
jest.mock( 'page', () => ( link ) => ( pageLink = link ) );

describe( 'index', () => {
	test( 'Should show H3 content for the Home domain upsell and test search domain button link', async () => {
		const mockStore = configureStore();
		const store = mockStore( initialState );

		await act( async () => {
			render(
				<Provider store={ store }>
					<DomainUpsell />
				</Provider>
			);
		} );

		expect(
			screen.getByRole( 'heading', { name: 'Own your online identity with a custom domain' } )
		).toBeInTheDocument();

		const searchLink = screen.getByRole( 'link', { name: 'Search for a domain' } );
		expect( searchLink ).toBeInTheDocument();
		expect(
			searchLink.href.endsWith(
				'/domains/add/example.wordpress.com?domainAndPlanPackage=true&domain=true'
			)
		).toBeTruthy();
	} );

	test( 'Should test the purchase button link', async () => {
		nock.cleanAll();
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.post( '/rest/v1.1/me/shopping-cart/1' )
			.reply( 200 );

		const mockStore = configureStore();
		const store = mockStore( initialState );

		render(
			<Provider store={ store }>
				<DomainUpsell />
			</Provider>
		);

		const user = userEvent.setup();
		await user.click( screen.getByRole( 'button', { name: 'Buy this domain' } ) );
		expect( pageLink ).toBe(
			'/plans/yearly/example.wordpress.com?domain=true&domainAndPlanPackage=true'
		);
	} );

	test( 'Should show the domain upsell in the context of the profile page', async () => {
		const mockStore = configureStore();
		const store = mockStore( initialState );

		await act( async () => {
			render(
				<Provider store={ store }>
					<DomainUpsell context="profile" />
				</Provider>
			);
		} );

		expect(
			screen.getByRole( 'heading', { name: 'Own your online identity with a custom domain' } )
		).toBeInTheDocument();
	} );

	test( 'Should NOT show the domain upsell in the context of the profile page if more than one site', async () => {
		const newInitialState = {
			...initialState,
			currentUser: {
				...initialState.currentUser,
				user: {
					...initialState.currentUser.user,
					site_count: 2,
				},
			},
		};

		const mockStore = configureStore();
		const store = mockStore( newInitialState );

		await act( async () => {
			render(
				<Provider store={ store }>
					<DomainUpsell context="profile" />
				</Provider>
			);
		} );

		expect(
			screen.queryByRole( 'heading', { name: 'Own your online identity with a custom domain' } )
		).not.toBeInTheDocument();
	} );

	test( 'Should NOT show the domain upsell in the context of the profile page if Jetpack Non-Atomic site', async () => {
		const newInitialState = {
			...initialState,
			sites: {
				...initialState.sites,
				items: {
					...initialState.sites.items,
					1: {
						...initialState.sites.items[ 1 ],
						is_wpcom_atomic: false,
						jetpack: true,
					},
				},
			},
		};

		const mockStore = configureStore();
		const store = mockStore( newInitialState );

		await act( async () => {
			render(
				<Provider store={ store }>
					<DomainUpsell context="profile" />
				</Provider>
			);
		} );

		expect(
			screen.queryByRole( 'heading', { name: 'Own your online identity with a custom domain' } )
		).not.toBeInTheDocument();
	} );
} );
