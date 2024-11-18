/**
 * @jest-environment jsdom
 */

import { getEmptyResponseCart } from '@automattic/shopping-cart';
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

const domainUpsellHeadingFreePlan = 'Own a domain. Build a site.';
const domainUpsellHeadingPaidPlan = 'That perfect domain is waiting';
const buyThisDomainCta = 'Get this domain';
const searchForDomainCta = 'Search for a domain';

describe( 'index', () => {
	test( 'Should show H3 content for the Home domain upsell and test search domain button link', async () => {
		const mockStore = configureStore( [ thunk ] );
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
		wpcomRequest.mockReset();

		const mockStore = configureStore( [ thunk ] );
		const store = mockStore( initialState );

		wpcomRequest.mockImplementation( ( args ) => {
			if ( args.path.startsWith( '/me/shopping-cart' ) ) {
				return Promise.resolve( getEmptyResponseCart() );
			}
			return Promise.reject( `Unknown endpoint in test ${ args.path }:${ args.method }` );
		} );

		render(
			<Provider store={ store }>
				<DomainUpsell />
			</Provider>
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
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.post( '/rest/v1.1/me/shopping-cart/1' )
			.reply( 200 );
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

		const mockStore = configureStore( [ thunk ] );
		const store = mockStore( newInitialState );

		render(
			<Provider store={ store }>
				<DomainUpsell />
			</Provider>
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

		const mockStore = configureStore( [ thunk ] );
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

		const mockStore = configureStore( [ thunk ] );
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

		const mockStore = configureStore( [ thunk ] );
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
} );
