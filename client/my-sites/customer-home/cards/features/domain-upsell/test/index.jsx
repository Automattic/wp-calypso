/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
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

const domainUpsellHeadingPaidPlan = 'You still have a free domain to claim!';
const domainUpsellHeadingFreePlan = 'Own your online identity with a custom domain';
const searchForDomainCta = 'Search for a domain';
const buyThisDomainCta = 'Buy this domain';

describe( 'index', () => {
	test( 'Should show H3 content for the Home domain upsell and test search domain button link', async () => {
		const mockStore = configureStore();
		const store = mockStore( initialState );

		render(
			<Provider store={ store }>
				<DomainUpsell />
			</Provider>
		);

		expect(
			screen.getByRole( 'heading', { name: domainUpsellHeadingFreePlan } )
		).toBeInTheDocument();

		const searchLink = screen.getByRole( 'link', { name: searchForDomainCta } );
		expect( searchLink ).toBeInTheDocument();
		expect(
			searchLink.href.endsWith(
				'/domains/add/example.wordpress.com?domainAndPlanPackage=true&domain=true'
			)
		).toBeTruthy();
	} );

	test( 'Should test the purchase button link on Free and Monthly plans', async () => {
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
		await user.click( screen.getByRole( 'button', { name: buyThisDomainCta } ) );
		expect( pageLink ).toBe(
			'/plans/yearly/example.wordpress.com?domain=true&domainAndPlanPackage=true'
		);
	} );

	test( 'Should test the purchase button link on Yearly plans', async () => {
		nock.cleanAll();
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.post( '/rest/v1.1/me/shopping-cart/1' )
			.reply( 200 );

		const newInitialState = {
			...initialState,
			sites: {
				...initialState.sites,
				items: {
					1: {
						...initialState.sites.items[ 1 ],
						plan: {
							product_slug: 'business-bundle',
						},
					},
				},
				plans: {
					1: {
						product_slug: 'business-bundle',
					},
				},
			},
		};

		const mockStore = configureStore();
		const store = mockStore( newInitialState );

		render(
			<Provider store={ store }>
				<DomainUpsell />
			</Provider>
		);

		const user = userEvent.setup();
		await user.click( screen.getByRole( 'button', { name: buyThisDomainCta } ) );
		expect( pageLink ).toBe( '/checkout/example.wordpress.com' );
	} );

	test( 'Should show H3 content for the Home domain upsell if paid plan with no domains', async () => {
		const newInitialState = {
			...initialState,
			sites: {
				...initialState.sites,
				items: {
					1: {
						...initialState.sites.items[ 1 ],
						plan: {
							product_slug: 'business-bundle',
						},
					},
				},
				plans: {
					1: {
						product_slug: 'business-bundle',
					},
				},
			},
		};

		const mockStore = configureStore();
		const store = mockStore( newInitialState );

		render(
			<Provider store={ store }>
				<DomainUpsell />
			</Provider>
		);

		expect(
			screen.getByRole( 'heading', { name: domainUpsellHeadingPaidPlan } )
		).toBeInTheDocument();

		const searchLink = screen.getByRole( 'link', { name: searchForDomainCta } );
		expect( searchLink ).toBeInTheDocument();
		expect(
			searchLink.href.endsWith(
				'/domains/add/example.wordpress.com?domainAndPlanPackage=true&domain=true'
			)
		).toBeTruthy();
	} );

	test( 'Should NOT show Home domain upsell if paid plan with > 0 custom domains', async () => {
		const newInitialState = {
			...initialState,
			sites: {
				...initialState.sites,
				items: {
					1: {
						...initialState.sites.items[ 1 ],
						plan: {
							product_slug: 'business-bundle',
						},
					},
				},
				domains: {
					items: {
						...initialState.sites.domains.items,
						1: [
							...initialState.sites.domains.items[ 1 ],
							{
								domain: 'example.com',
								isWPCOMDomain: false,
							},
						],
					},
				},
				plans: {
					1: {
						product_slug: 'business-bundle',
					},
				},
			},
		};

		const mockStore = configureStore();
		const store = mockStore( newInitialState );

		render(
			<Provider store={ store }>
				<DomainUpsell />
			</Provider>
		);

		expect(
			screen.queryByRole( 'heading', { name: domainUpsellHeadingPaidPlan } )
		).not.toBeInTheDocument();
	} );

	test( 'Should not show Home domain upsell if was dismissed', async () => {
		const newInitialState = {
			...initialState,
			preferences: {
				remoteValues: {
					'calypso_my_home_domain_upsell_dismiss-1': true,
				},
			},
		};

		const mockStore = configureStore();
		const store = mockStore( newInitialState );

		render(
			<Provider store={ store }>
				<DomainUpsell />
			</Provider>
		);

		expect(
			screen.queryByRole( 'heading', { name: domainUpsellHeadingFreePlan } )
		).not.toBeInTheDocument();
	} );

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
