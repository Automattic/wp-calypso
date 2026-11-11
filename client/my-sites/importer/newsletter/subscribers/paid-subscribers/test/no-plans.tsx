/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { SubscribersStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import NoPlans from '../no-plans';
import type { SiteDetails } from '@automattic/data-stores';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn(), get: jest.fn() } },
} ) );

const tier = {
	id: 10,
	tier: 0,
	title: 'Supporter',
	price: '5',
	currency: 'USD',
	interval: 'month',
};
const secondTier = { ...tier, id: 20, title: 'Founding member', price: '25' };

function renderNoPlans( content: Partial< SubscribersStepContent > ) {
	const store = configureStore()( { ui: { selectedSiteId: 1 } } );
	return render(
		<Provider store={ store }>
			<QueryClientProvider client={ new QueryClient() }>
				<NoPlans
					cardData={
						{
							is_connected_stripe: true,
							account_display: 'Test account',
							available_tiers: [],
							meta: { email_count: '8', comp_count: 2 },
							...content,
						} as SubscribersStepContent
					}
					selectedSite={ { ID: 1 } as SiteDetails }
					engine="substack"
					siteSlug="example.wordpress.com"
					onStartImport={ () => {} }
				/>
			</QueryClientProvider>
		</Provider>
	);
}

function importButton() {
	return screen.getByRole( 'button', { name: /free subscribers|without paid subscribers/i } );
}

describe( '<NoPlans>', () => {
	it( 'does not claim free subscribers only when a comp tier will be granted', () => {
		renderNoPlans( { available_tiers: [ tier ], comp_product_id: 10 } );

		expect(
			screen.getByRole( 'button', { name: 'Import without paid subscribers' } )
		).toBeVisible();
	} );

	it( 'keeps the free-subscribers wording when the comps have nowhere to go', () => {
		renderNoPlans( { available_tiers: [] } );

		expect( screen.getByRole( 'button', { name: 'Only import free subscribers' } ) ).toBeVisible();
	} );

	it( 'leaves the escape hatch open when there is no tier to grant against', () => {
		renderNoPlans( { available_tiers: [] } );

		expect( importButton() ).toBeEnabled();
	} );

	it( 'holds the import while several tiers are available and none is chosen', () => {
		renderNoPlans( { available_tiers: [ tier, secondTier ] } );

		expect( importButton() ).toBeDisabled();
	} );
} );
