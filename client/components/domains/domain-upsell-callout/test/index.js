/**
 * @jest-environment jsdom
 */
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DomainUpsellCallout from '../index';

// Test that the DomainUpsellCallout component renders null when isP2Site is true
const initialState = {
	sites: {
		items: {
			1: {
				ID: 1,
				URL: 'example.wordpress.com',
				plan: {
					product_slug: 'free_plan',
				},
				options: {
					is_wpforteams_site: false,
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
	preferences: {
		remoteValues: {
			calypso__dismiss: false,
		},
	},
};

describe( 'domain-upsell-callout', () => {
	test( 'Should not render on P2 sites', () => {
		const newInitialState = {
			...initialState,
			sites: {
				...initialState.sites,
				items: {
					1: {
						...initialState.sites.items[ 1 ],
						options: {
							is_wpforteams_site: true,
						},
					},
				},
			},
		};

		const mockStore = configureStore();
		const store = mockStore( newInitialState );

		const { container } = renderWithProvider(
			<Provider store={ store }>
				<DomainUpsellCallout trackEvent="" />
			</Provider>
		);

		expect( container.getElementsByClassName( 'domain-upsell-callout' ) ).toHaveLength( 0 );
	} );

	test( 'Should render on free sites without custom domain', () => {
		const mockStore = configureStore();
		const store = mockStore( initialState );

		const { container } = renderWithProvider(
			<Provider store={ store }>
				<DomainUpsellCallout trackEvent="" />
			</Provider>
		);

		expect( container.getElementsByClassName( 'domain-upsell-callout' ) ).toHaveLength( 1 );
	} );

	test( 'Should not render on free sites with custom domain', () => {
		const newInitialState = {
			...initialState,
			sites: {
				...initialState.sites,
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
			},
		};

		const mockStore = configureStore();
		const store = mockStore( newInitialState );

		const { container } = renderWithProvider(
			<Provider store={ store }>
				<DomainUpsellCallout trackEvent="" />
			</Provider>
		);

		expect( container.getElementsByClassName( 'domain-upsell-callout' ) ).toHaveLength( 0 );
	} );

	test( 'Should not render on non free sites', () => {
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

		const { container } = renderWithProvider(
			<Provider store={ store }>
				<DomainUpsellCallout trackEvent="" />
			</Provider>
		);

		expect( container.getElementsByClassName( 'domain-upsell-callout' ) ).toHaveLength( 0 );
	} );
} );
