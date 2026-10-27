/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { SubscribersStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import ConnectStripe from '../connect-stripe';
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

const connectUrl = `https://connect.stripe.com/oauth/authorize?state=${ btoa(
	JSON.stringify( { blog_id: 1 } )
) }`;

function renderConnectStripe( content: Partial< SubscribersStepContent > ) {
	return render(
		<QueryClientProvider client={ new QueryClient() }>
			<ConnectStripe
				cardData={
					{
						is_connected_stripe: false,
						connect_url: connectUrl,
						available_tiers: [],
						meta: { email_count: '8', comp_count: 2 },
						...content,
					} as SubscribersStepContent
				}
				status="initial"
				engine="substack"
				fromSite="https://example.substack.com"
				selectedSite={ { ID: 1 } as SiteDetails }
				setAutoFetchData={ () => {} }
				siteSlug="example.wordpress.com"
				skipNextStep={ () => {} }
				onStartImport={ () => {} }
			/>
		</QueryClientProvider>
	);
}

// The label reads differently once a comp tier resolves, so match either wording.
function continueButton() {
	return screen.getByRole( 'button', { name: /free subscribers|without paid subscribers/i } );
}

describe( '<ConnectStripe> button label', () => {
	it( 'does not claim free subscribers only when a comp tier will be granted', () => {
		renderConnectStripe( { available_tiers: [ tier ], comp_product_id: 10 } );

		expect(
			screen.getByRole( 'button', { name: 'Continue without paid subscribers' } )
		).toBeVisible();
	} );

	it( 'keeps the free-subscribers wording when the comps have nowhere to go', () => {
		renderConnectStripe( { available_tiers: [] } );

		expect( screen.getByRole( 'button', { name: /free subscribers/i } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Continue without paid subscribers' } )
		).not.toBeInTheDocument();
	} );

	it( 'keeps the free-subscribers wording when there are no comps at all', () => {
		renderConnectStripe( {
			available_tiers: [ tier ],
			meta: { email_count: '8', comp_count: 0 } as SubscribersStepContent[ 'meta' ],
		} );

		expect( screen.getByRole( 'button', { name: /free subscribers/i } ) ).toBeVisible();
	} );
} );

describe( '<ConnectStripe> comp gating', () => {
	it( 'leaves the escape hatch open when there is no tier to grant against', () => {
		renderConnectStripe( { available_tiers: [] } );

		expect( continueButton() ).toBeEnabled();
	} );

	it( 'holds the import while the chosen tier is gone', () => {
		// Importing here would drop every comp, which is the outcome this flow exists to prevent.
		renderConnectStripe( { available_tiers: [ tier ], comp_product_id: 99 } );

		expect( continueButton() ).toBeDisabled();
	} );

	it( 'holds the import while several tiers are available and none is chosen', () => {
		renderConnectStripe( { available_tiers: [ tier, secondTier ] } );

		expect( continueButton() ).toBeDisabled();
	} );

	it( 'allows the import once a tier resolves', () => {
		renderConnectStripe( { available_tiers: [ tier ], comp_product_id: 10 } );

		expect( continueButton() ).toBeEnabled();
	} );

	it( 'leaves the escape hatch open when the file carries no comps', () => {
		renderConnectStripe( {
			available_tiers: [ tier, secondTier ],
			meta: { email_count: '8', comp_count: 0 } as SubscribersStepContent[ 'meta' ],
		} );

		expect( continueButton() ).toBeEnabled();
	} );
} );
