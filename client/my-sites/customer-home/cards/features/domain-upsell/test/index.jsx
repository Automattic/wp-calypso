/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
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
	productsList: {
		isFetching: false,
	},
};

let pageLink = '';
jest.mock( '@automattic/calypso-router', () => ( link ) => ( pageLink = link ) );

const domainUpsellHeadingFreePlan = 'Own a domain. Build a site.';
const domainUpsellHeadingPaidPlan = 'That perfect domain is waiting';
const buyThisDomainCta = 'Get this domain';
const searchForDomainCta = 'Search for a domain';

describe( 'index', () => {
	test( 'Should show H3 content for the Home domain upsell and test search domain button link', async () => {
		const mockStore = configureStore( [ thunk ] );
		const store = mockStore( initialState );

		render(
			<QueryClientProvider client={ new QueryClient() }>
				<Provider store={ store }>
					<DomainUpsell />
				</Provider>
			</QueryClientProvider>
		);

		expect(
			screen.getByRole( 'heading', { name: domainUpsellHeadingFreePlan } )
		).toBeInTheDocument();

		const searchLink = screen.getByRole( 'link', { name: searchForDomainCta } );
		expect( searchLink ).toBeInTheDocument();
		expect( searchLink.href ).toContain(
			'/setup/domain-and-plan?siteSlug=example.wordpress.com&back_to=%2F'
		);
	} );

	test( 'Should test the purchase button link on Free and Monthly plans', async () => {
		nock.cleanAll();

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/domains/suggestions' )
			.query( true )
			.reply( 200, [
				{
					is_free: false,
					product_slug: 'dotcom_domain',
					domain_name: 'example.com',
				},
			] );

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.post( '/rest/v1.1/me/shopping-cart/1' )
			.reply( 200 );

		const mockStore = configureStore( [ thunk ] );
		const store = mockStore( initialState );

		render(
			<QueryClientProvider client={ new QueryClient() }>
				<Provider store={ store }>
					<DomainUpsell />
				</Provider>
			</QueryClientProvider>
		);

		await waitFor( () => {
			expect( screen.getByTestId( 'domain-upsell-domain-name' ) ).toHaveTextContent(
				'example.com'
			);
		} );

		const user = userEvent.setup();
		await user.click( screen.getByRole( 'button', { name: buyThisDomainCta } ) );
		await waitFor( () => {
			expect( pageLink ).toEqual(
				'/setup/domain-and-plan/plans?siteSlug=example.wordpress.com&back_to=%2F'
			);
		} );
	} );

	test( 'Should test the purchase button link on Yearly plans', async () => {
		nock.cleanAll();

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/domains/suggestions' )
			.query( true )
			.reply( 200, [
				{
					is_free: false,
					product_slug: 'dotcom_domain',
					domain_name: 'example.com',
				},
			] );

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

		const mockStore = configureStore( [ thunk ] );
		const store = mockStore( newInitialState );

		render(
			<QueryClientProvider client={ new QueryClient() }>
				<Provider store={ store }>
					<DomainUpsell />
				</Provider>
			</QueryClientProvider>
		);

		await waitFor( () => {
			expect( screen.getByTestId( 'domain-upsell-domain-name' ) ).toHaveTextContent(
				'example.com'
			);
		} );

		const user = userEvent.setup();
		await user.click( screen.getByRole( 'button', { name: buyThisDomainCta } ) );
		await waitFor( () => {
			expect( pageLink ).toBe( '/checkout/example.wordpress.com' );
		} );
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

		const mockStore = configureStore( [ thunk ] );
		const store = mockStore( newInitialState );

		render(
			<QueryClientProvider client={ new QueryClient() }>
				<Provider store={ store }>
					<DomainUpsell />
				</Provider>
			</QueryClientProvider>
		);

		expect(
			screen.getByRole( 'heading', { name: domainUpsellHeadingPaidPlan } )
		).toBeInTheDocument();

		const searchLink = screen.getByRole( 'link', { name: searchForDomainCta } );
		expect( searchLink ).toBeInTheDocument();
		expect( searchLink.href ).toContain(
			'/setup/domain-and-plan?siteSlug=example.wordpress.com&back_to=%2F'
		);
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

		const mockStore = configureStore( [ thunk ] );
		const store = mockStore( newInitialState );

		render(
			<QueryClientProvider client={ new QueryClient() }>
				<Provider store={ store }>
					<DomainUpsell />
				</Provider>
			</QueryClientProvider>
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

		const mockStore = configureStore( [ thunk ] );
		const store = mockStore( newInitialState );

		render(
			<QueryClientProvider client={ new QueryClient() }>
				<Provider store={ store }>
					<DomainUpsell />
				</Provider>
			</QueryClientProvider>
		);

		expect(
			screen.queryByRole( 'heading', { name: domainUpsellHeadingFreePlan } )
		).not.toBeInTheDocument();
	} );
} );
