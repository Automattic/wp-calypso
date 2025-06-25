/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
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
			items: {
				1: [
					{
						domain: 'example.wordpress.com',
						isWPCOMDomain: true,
					},
				],
			},
		},
		plans: {
			1: {
				product_slug: 'free_plan',
			},
		},
	},
	preferences: {
		remoteValues: {
			'calypso_my_home_domain_upsell_dismiss-1': false,
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

jest.mock( '@automattic/domain-picker', () => {
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

const domainUpsellHeadingFreePlan = 'Own your online identity with a custom domain';

describe( 'index', () => {
	test( 'Should show the domain upsell in the context of the profile page', async () => {
		const mockStore = configureStore();
		const store = mockStore( initialState );

		render(
			<Provider store={ store }>
				<DomainUpsell context="profile" />
			</Provider>
		);

		expect(
			screen.getByRole( 'heading', { name: domainUpsellHeadingFreePlan } )
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

		render(
			<Provider store={ store }>
				<DomainUpsell context="profile" />
			</Provider>
		);

		expect(
			screen.queryByRole( 'heading', { name: domainUpsellHeadingFreePlan } )
		).not.toBeInTheDocument();
	} );

	test( 'Should NOT show the domain upsell in the context of the profile page if zero sites', async () => {
		const newInitialState = {
			...initialState,
			sites: {
				...initialState.sites,
				items: {},
				domains: {
					items: [],
				},
				plans: {},
			},
			currentUser: {
				...initialState.currentUser,
				user: {
					...initialState.currentUser.user,
					site_count: 0,
				},
			},
		};

		const mockStore = configureStore();
		const store = mockStore( newInitialState );

		render(
			<Provider store={ store }>
				<DomainUpsell context="profile" />
			</Provider>
		);

		expect(
			screen.queryByRole( 'heading', { name: domainUpsellHeadingFreePlan } )
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

		render(
			<Provider store={ store }>
				<DomainUpsell context="profile" />
			</Provider>
		);

		expect(
			screen.queryByRole( 'heading', { name: domainUpsellHeadingFreePlan } )
		).not.toBeInTheDocument();
	} );
} );
