/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import {
	Product,
	SubscribersStepContent,
} from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import CompSubscribers, {
	groupCompTiers,
	getSelectedCompTierId,
	isCompSelectionSatisfied,
	isCompSelectionStale,
	willGrantComps,
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
	interval: 'month',
};
const yearlyPair = {
	id: 11,
	tier: 10,
	title: 'Supporter',
	price: '50',
	currency: 'USD',
	interval: 'year',
};
const secondTier = {
	id: 20,
	tier: 0,
	title: 'Founding member',
	price: '25',
	currency: 'USD',
	interval: 'month',
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
		expect( tiers[ 0 ].interval ).toBe( 'month' );
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

	it( 'collapses the pair when the endpoint stringifies the ids', () => {
		// This endpoint already returns `price` as a string, so numerics cannot be assumed.
		const tiers = groupCompTiers( [
			{ ...monthlyAnchor, id: '10', tier: '0' },
			{ ...yearlyPair, id: '11', tier: '10' },
		] as unknown as Product[] );

		expect( tiers ).toHaveLength( 1 );
		expect( tiers[ 0 ].id ).toBe( 10 );
	} );

	it( 'keeps a yearly tier whose monthly anchor has been deleted', () => {
		// The server leaves the back-reference pointing at the deleted anchor, and grants against
		// the survivor's own id, so following `tier` here would name a plan that no longer exists.
		const tiers = groupCompTiers( [ yearlyPair ] );

		expect( tiers ).toHaveLength( 1 );
		expect( tiers[ 0 ].id ).toBe( 11 );
	} );

	it( 'survives a null tier list', () => {
		expect( groupCompTiers( null as unknown as Product[] ) ).toEqual( [] );
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

	it( 'resolves a stringified selection against stringified tier ids', () => {
		expect(
			getSelectedCompTierId( {
				...cardData(),
				available_tiers: [
					{ ...monthlyAnchor, id: '10', tier: '0' },
					{ ...secondTier, id: '20', tier: '0' },
				],
				comp_product_id: '20',
			} as unknown as SubscribersStepContent )
		).toBe( '20' );
	} );

	it( 'does not substitute another tier when the chosen one was deleted', () => {
		// The server refuses to grant against a tier nobody chose, so pre-selecting the survivor
		// would show access that will not be granted.
		expect(
			getSelectedCompTierId( cardData( { available_tiers: [ secondTier ], comp_product_id: 10 } ) )
		).toBe( '' );
	} );

	it( 'auto-selects the only tier when no choice has been saved yet', () => {
		expect(
			getSelectedCompTierId(
				cardData( { available_tiers: [ secondTier ], comp_product_id: null } )
			)
		).toBe( '20' );
	} );

	it( 'has no selection when several tiers are available and none is saved', () => {
		expect(
			getSelectedCompTierId( cardData( { available_tiers: [ monthlyAnchor, secondTier ] } ) )
		).toBe( '' );
	} );
} );

describe( 'isCompSelectionStale', () => {
	it( 'reports a saved choice whose tier has been deleted', () => {
		expect(
			isCompSelectionStale( cardData( { available_tiers: [ secondTier ], comp_product_id: 10 } ) )
		).toBe( true );
	} );

	it( 'is not stale when the saved choice still resolves', () => {
		expect(
			isCompSelectionStale( cardData( { available_tiers: [ secondTier ], comp_product_id: 20 } ) )
		).toBe( false );
	} );

	it( 'is not stale when nothing has been chosen', () => {
		expect( isCompSelectionStale( cardData( { available_tiers: [ secondTier ] } ) ) ).toBe( false );
	} );

	it( 'leaves the no-tier warning to speak for itself', () => {
		expect( isCompSelectionStale( cardData( { available_tiers: [], comp_product_id: 10 } ) ) ).toBe(
			false
		);
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

	it( 'blocks while the chosen tier is gone and only one other remains', () => {
		expect(
			isCompSelectionSatisfied(
				cardData( { available_tiers: [ secondTier ], comp_product_id: 10 } )
			)
		).toBe( false );
	} );

	it( 'blocks while several tiers are available and none is chosen', () => {
		expect(
			isCompSelectionSatisfied( cardData( { available_tiers: [ monthlyAnchor, secondTier ] } ) )
		).toBe( false );
	} );
} );

describe( 'willGrantComps', () => {
	it( 'is true once a tier resolves, so the button cannot claim free subscribers only', () => {
		expect( willGrantComps( cardData( { available_tiers: [ secondTier ] } ) ) ).toBe( true );
	} );

	it( 'is false with no tier to grant against, where the comps do arrive as free', () => {
		expect( willGrantComps( cardData( { available_tiers: [] } ) ) ).toBe( false );
	} );

	it( 'is false while several tiers are available and none is chosen', () => {
		expect( willGrantComps( cardData( { available_tiers: [ monthlyAnchor, secondTier ] } ) ) ).toBe(
			false
		);
	} );

	it( 'is false when the file carries no comps', () => {
		expect(
			willGrantComps(
				cardData( {
					available_tiers: [ secondTier ],
					meta: { comp_count: 0 } as SubscribersStepContent[ 'meta' ],
				} )
			)
		).toBe( false );
	} );
} );

describe( '<CompSubscribers>', () => {
	it( 'warns instead of dropping comps silently when the site has no tier', () => {
		renderCompSubscribers( cardData( { available_tiers: [] } ) );

		expect(
			screen.getAllByText( '3 subscribers won’t be comped unless you set up a paid tier.' )[ 0 ]
		).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /Select a plan/ } ) ).not.toBeInTheDocument();
	} );

	it( 'offers the picker with a single tier pre-selected', () => {
		renderCompSubscribers( cardData( { available_tiers: [ monthlyAnchor, yearlyPair ] } ) );

		expect( screen.getByText( '3 complimentary subscribers' ) ).toBeVisible();
		expect( screen.getByText( 'Supporter' ) ).toBeVisible();
		expect( screen.queryByText( 'Select a plan' ) ).not.toBeInTheDocument();
	} );

	it( 'asks for a choice when several tiers are available', () => {
		renderCompSubscribers( cardData( { available_tiers: [ monthlyAnchor, secondTier ] } ) );

		expect( screen.getByText( 'Select a plan' ) ).toBeVisible();
	} );

	it( 'warns rather than crashing when the tier list comes back null', () => {
		renderCompSubscribers( {
			...cardData(),
			available_tiers: null,
		} as unknown as SubscribersStepContent );

		expect(
			screen.getAllByText( '3 subscribers won’t be comped unless you set up a paid tier.' )[ 0 ]
		).toBeVisible();
	} );

	it( 'asks for a new choice when the chosen tier was deleted', () => {
		renderCompSubscribers(
			cardData( { available_tiers: [ monthlyAnchor, yearlyPair ], comp_product_id: 99 } )
		);

		expect(
			screen.getAllByText(
				'The paid tier you chose for comped subscribers no longer exists. Choose another one.'
			)[ 0 ]
		).toBeVisible();
		expect( screen.getByText( 'Select a plan' ) ).toBeVisible();
	} );

	it( 'renders nothing when the import carries no comps', () => {
		const { container } = renderCompSubscribers(
			cardData( { meta: { comp_count: 0 } as SubscribersStepContent[ 'meta' ] } )
		);

		expect( container ).toBeEmptyDOMElement();
	} );
} );
