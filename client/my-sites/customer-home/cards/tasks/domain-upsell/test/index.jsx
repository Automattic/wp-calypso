/**
 * @jest-environment jsdom
 */

import { getEmptyResponseCart } from '@automattic/shopping-cart';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import wpcomRequest from 'wpcom-proxy-request';
import DomainUpsell from '../';

jest.mock( 'wpcom-proxy-request', () => jest.fn() );

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
	route: {
		query: {
			current: {},
			initial: {},
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
jest.mock( '@automattic/calypso-router', () => ( link ) => ( pageLink = link ) );

const domainUpsellHeadingPaidPlan = 'That perfect domain is waiting';
const domainUpsellHeadingFreePlan = 'Own a domain. Build a site.';
const buyThisDomainCta = 'Get this domain';
const searchForDomainCta = 'Find other domains';

describe( 'index', () => {
	test( 'Should show H3 content for the Home domain upsell and test search domain button link', async () => {
		const queryClient = new QueryClient();
		const mockStore = configureStore( [ thunk ] );
		const store = mockStore( initialState );

		render(
			<QueryClientProvider client={ queryClient }>
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
		expect(
			searchLink.href.endsWith(
				'/domains/add/example.wordpress.com?domainAndPlanPackage=true&domain=true'
			)
		).toBeTruthy();
	} );

	test( 'Should test the purchase button link on Free and Monthly plans', async () => {
		nock.cleanAll();
		wpcomRequest.mockReset();

		wpcomRequest.mockImplementation( ( args ) => {
			if ( args.path.startsWith( '/me/shopping-cart' ) ) {
				return Promise.resolve( getEmptyResponseCart() );
			}
			return Promise.reject( `Unknown endpoint in test ${ args.path }:${ args.method }` );
		} );

		const queryClient = new QueryClient();
		const mockStore = configureStore( [ thunk ] );
		const store = mockStore( initialState );

		render(
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>
					<DomainUpsell />
				</Provider>
			</QueryClientProvider>
		);

		const user = userEvent.setup();
		await user.click( screen.getByRole( 'button', { name: buyThisDomainCta } ) );
		await waitFor( () => {
			expect( pageLink ).toBe(
				'/plans/yearly/example.wordpress.com?domain=true&domainAndPlanPackage=true'
			);
		} );
	} );

	test( 'Should test the purchase button link on Yearly plans', async () => {
		nock.cleanAll();
		wpcomRequest.mockReset();

		wpcomRequest.mockImplementation( ( args ) => {
			if ( args.path.startsWith( '/me/shopping-cart' ) ) {
				return Promise.resolve( getEmptyResponseCart() );
			}
			return Promise.reject( `Unknown endpoint in test ${ args.path }:${ args.method }` );
		} );

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

		const queryClient = new QueryClient();
		const mockStore = configureStore( [ thunk ] );
		const store = mockStore( newInitialState );

		render(
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>
					<DomainUpsell />
				</Provider>
			</QueryClientProvider>
		);

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

		const queryClient = new QueryClient();
		const mockStore = configureStore( [ thunk ] );
		const store = mockStore( newInitialState );

		render(
			<QueryClientProvider client={ queryClient }>
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

		const queryClient = new QueryClient();
		const mockStore = configureStore( [ thunk ] );
		const store = mockStore( newInitialState );

		render(
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>
					<DomainUpsell />
				</Provider>
			</QueryClientProvider>
		);

		expect(
			screen.queryByRole( 'heading', { name: domainUpsellHeadingPaidPlan } )
		).not.toBeInTheDocument();
	} );
} );
