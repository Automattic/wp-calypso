/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { SubscribersStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import CompSubscribers, {
	groupCompTiers,
	getSelectedCompTierId,
	isCompSelectionSatisfied,
} from '../comp-subscribers';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn() } },
} ) );

const monthlyAnchor = {
	id: 10,
	tier: 0,
	title: 'Supporter',
	price: '5',
	currency: 'USD',
	interval: '1 month',
};
const yearlyPair = {
	id: 11,
	tier: 10,
	title: 'Supporter',
	price: '50',
	currency: 'USD',
	interval: '1 year',
};
const secondTier = {
	id: 20,
	tier: 0,
	title: 'Founding member',
	price: '25',
	currency: 'USD',
	interval: '1 month',
};

function cardData( overrides: Partial< SubscribersStepContent > = {} ): SubscribersStepContent {
	return {
		is_connected_stripe: false,
		available_tiers: [],
		meta: { comp_count: 3 },
		...overrides,
	} as SubscribersStepContent;
}

function renderCompSubscribers( content: SubscribersStepContent ) {
	return render(
		<QueryClientProvider client={ new QueryClient() }>
			<CompSubscribers cardData={ content } siteId={ 1 } engine="substack" />
		</QueryClientProvider>
	);
}

describe( 'groupCompTiers', () => {
	it( 'collapses a monthly/yearly pair into one choice keyed on the monthly anchor', () => {
		const tiers = groupCompTiers( [ monthlyAnchor, yearlyPair ] );

		expect( tiers ).toHaveLength( 1 );
		expect( tiers[ 0 ].id ).toBe( 10 );
		expect( tiers[ 0 ].interval ).toBe( '1 month' );
	} );

	it( 'prefers the anchor even when the yearly entry comes first', () => {
		const tiers = groupCompTiers( [ yearlyPair, monthlyAnchor ] );

		expect( tiers ).toHaveLength( 1 );
		expect( tiers[ 0 ].price ).toBe( '5' );
	} );

	it( 'keeps separate tiers apart', () => {
		const tiers = groupCompTiers( [ monthlyAnchor, yearlyPair, secondTier ] );

		expect( tiers.map( ( tier ) => tier.id ) ).toEqual( [ 10, 20 ] );
	} );

	it( 'returns nothing when the site has no tiers', () => {
		expect( groupCompTiers( [] ) ).toEqual( [] );
		expect( groupCompTiers() ).toEqual( [] );
	} );
} );

describe( 'getSelectedCompTierId', () => {
	it( 'uses the saved selection when the tier still exists', () => {
		expect(
			getSelectedCompTierId(
				cardData( { available_tiers: [ monthlyAnchor, secondTier ], comp_product_id: 20 } )
			)
		).toBe( '20' );
	} );

	it( 'falls back to the only tier when nothing is saved', () => {
		expect(
			getSelectedCompTierId(
				cardData( { available_tiers: [ monthlyAnchor, yearlyPair ], comp_product_id: null } )
			)
		).toBe( '10' );
	} );

	it( 'drops a selection whose tier has been deleted', () => {
		expect(
			getSelectedCompTierId(
				cardData( { available_tiers: [ monthlyAnchor, secondTier ], comp_product_id: 99 } )
			)
		).toBe( '' );
	} );

	it( 'has no selection when several tiers are available and none is saved', () => {
		expect(
			getSelectedCompTierId( cardData( { available_tiers: [ monthlyAnchor, secondTier ] } ) )
		).toBe( '' );
	} );
} );

describe( 'isCompSelectionSatisfied', () => {
	it( 'does not block an import that carries no comps', () => {
		expect(
			isCompSelectionSatisfied(
				cardData( { meta: { comp_count: 0 } as SubscribersStepContent[ 'meta' ] } )
			)
		).toBe( true );
	} );

	it( 'does not block an import when the site has no tier to grant against', () => {
		expect( isCompSelectionSatisfied( cardData( { available_tiers: [] } ) ) ).toBe( true );
	} );

	it( 'does not block when the single tier resolves on its own', () => {
		expect(
			isCompSelectionSatisfied( cardData( { available_tiers: [ monthlyAnchor, yearlyPair ] } ) )
		).toBe( true );
	} );

	it( 'blocks while several tiers are available and none is chosen', () => {
		expect(
			isCompSelectionSatisfied( cardData( { available_tiers: [ monthlyAnchor, secondTier ] } ) )
		).toBe( false );
	} );
} );

describe( '<CompSubscribers>', () => {
	it( 'warns instead of dropping comps silently when the site has no tier', () => {
		renderCompSubscribers( cardData( { available_tiers: [] } ) );

		expect(
			screen.getAllByText( '3 subscribers won’t be comped unless you set up a paid tier.' )[ 0 ]
		).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /Select a tier/ } ) ).not.toBeInTheDocument();
	} );

	it( 'offers the picker with a single tier pre-selected', () => {
		renderCompSubscribers( cardData( { available_tiers: [ monthlyAnchor, yearlyPair ] } ) );

		expect( screen.getByText( '3 complimentary subscribers' ) ).toBeVisible();
		expect( screen.getByText( 'Supporter' ) ).toBeVisible();
		expect( screen.queryByText( 'Select a tier' ) ).not.toBeInTheDocument();
	} );

	it( 'asks for a choice when several tiers are available', () => {
		renderCompSubscribers( cardData( { available_tiers: [ monthlyAnchor, secondTier ] } ) );

		expect( screen.getByText( 'Select a tier' ) ).toBeVisible();
	} );

	it( 'renders nothing when the import carries no comps', () => {
		const { container } = renderCompSubscribers(
			cardData( { meta: { comp_count: 0 } as SubscribersStepContent[ 'meta' ] } )
		);

		expect( container ).toBeEmptyDOMElement();
	} );
} );
