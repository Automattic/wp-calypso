/**
 * @jest-environment jsdom
 */
import { PLAN_BUSINESS, PLAN_BUSINESS_MONTHLY, PLAN_PREMIUM } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanUpgradeBanner from '../plan-upgrade-banner';

const mockRecordTracksEvent = jest.fn();
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	Plans: {
		...jest.requireActual( '@automattic/data-stores' ).Plans,
		usePricingMetaForGridPlans: jest.fn(),
	},
} ) );
jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn( () => null ),
} ) );
jest.mock(
	'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase',
	() => jest.fn()
);

const noDiscount = { monthly: null, full: null };
const mockPricingMeta = (
	pricing: Partial< Record< string, Partial< Plans.PricingMetaForGridPlan > > > = {}
) =>
	( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {
		[ PLAN_BUSINESS ]: {
			currencyCode: 'USD',
			originalPrice: { monthly: 2500, full: 30000 },
			discountedPrice: noDiscount,
			...pricing[ PLAN_BUSINESS ],
		},
		[ PLAN_BUSINESS_MONTHLY ]: {
			currencyCode: 'USD',
			originalPrice: { monthly: 4000, full: 4000 },
			discountedPrice: noDiscount,
			...pricing[ PLAN_BUSINESS_MONTHLY ],
		},
	} );

const yearlyIntroOffer = {
	formattedPrice: '$120',
	rawPrice: { monthly: 1000, full: 12000 },
	intervalUnit: 'year',
	intervalCount: 1,
	isOfferComplete: false,
};

// The banner resolves the plan path slug from the `/plans` query and keeps its
// CTA disabled until that data loads, so provide it.
jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: () => ( {
		data: [
			{ product_slug: 'business-bundle', path_slug: 'business' },
			{ product_slug: 'business-bundle-monthly', path_slug: 'business-monthly' },
			{ product_slug: 'value_bundle', path_slug: 'premium' },
			{ product_slug: 'value_bundle_monthly', path_slug: 'premium-monthly' },
		],
	} ),
} ) );

describe( 'PlanUpgradeBanner', () => {
	beforeEach( () => {
		mockRecordTracksEvent.mockClear();
		mockPricingMeta();
	} );

	test( 'shows the regular yearly and monthly prices without an intro offer', async () => {
		const user = userEvent.setup();
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );

		expect( screen.getByText( '$300' ) ).toBeVisible();
		expect( screen.getByText( '(save 37%)' ) ).toBeVisible();
		expect( screen.queryByText( /renewal/ ) ).not.toBeInTheDocument();

		await user.click( screen.getByLabelText( /Monthly/ ) );
		expect( screen.getByText( '$40' ) ).toBeVisible();
	} );

	test( 'shows the first-year intro offer price instead of the renewal price', () => {
		mockPricingMeta( { [ PLAN_BUSINESS ]: { introOffer: yearlyIntroOffer } } );
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );

		expect( screen.getByText( '$120' ) ).toBeVisible();
		expect( screen.getByText( '$300/year renewal.' ) ).toBeVisible();
		expect( screen.getByText( '(save 75%)' ) ).toBeVisible();
	} );

	test( 'hides the renewal price when the monthly plan is selected', async () => {
		const user = userEvent.setup();
		mockPricingMeta( { [ PLAN_BUSINESS ]: { introOffer: yearlyIntroOffer } } );
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );

		await user.click( screen.getByLabelText( /Monthly/ ) );
		expect( screen.queryByText( /renewal/ ) ).not.toBeInTheDocument();
	} );

	test( 'shows the first-month intro offer price for the monthly plan', async () => {
		const user = userEvent.setup();
		mockPricingMeta( {
			[ PLAN_BUSINESS_MONTHLY ]: {
				introOffer: {
					...yearlyIntroOffer,
					formattedPrice: '$20',
					rawPrice: { monthly: 2000, full: 2000 },
					intervalUnit: 'month',
				},
			},
		} );
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );

		await user.click( screen.getByLabelText( /Monthly/ ) );
		expect( screen.getByText( '$20' ) ).toBeVisible();
	} );

	test( 'ignores an intro offer that does not cover exactly one billing term', () => {
		mockPricingMeta( {
			[ PLAN_BUSINESS ]: {
				introOffer: { ...yearlyIntroOffer, intervalUnit: 'month', intervalCount: 3 },
			},
		} );
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );

		expect( screen.getByText( '$300' ) ).toBeVisible();
	} );

	test( 'ignores a completed intro offer', () => {
		mockPricingMeta( {
			[ PLAN_BUSINESS ]: { introOffer: { ...yearlyIntroOffer, isOfferComplete: true } },
		} );
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );

		expect( screen.getByText( '$300' ) ).toBeVisible();
	} );

	test( 'prefers a discounted price over the intro offer', () => {
		mockPricingMeta( {
			[ PLAN_BUSINESS ]: {
				introOffer: yearlyIntroOffer,
				discountedPrice: { monthly: 1500, full: 18000 },
			},
		} );
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );

		expect( screen.getByText( '$180' ) ).toBeVisible();
	} );

	test( 'renders plan title and description', () => {
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );
		expect( screen.getByRole( 'heading', { level: 2 } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { level: 3 } ) ).toBeVisible();
	} );

	test( 'renders features list', () => {
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );
		const items = screen.getAllByRole( 'listitem' );
		expect( items.length ).toBeGreaterThan( 0 );
	} );

	test( 'renders CTA button', () => {
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );
		const button = screen.getByRole( 'link', { name: /Get/ } );
		expect( button ).toBeVisible();
		expect( button ).toHaveAttribute( 'href', expect.stringContaining( '/start/' ) );
	} );

	test( 'tracks click event with plan slug when CTA is clicked', async () => {
		const user = userEvent.setup();
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );
		const button = screen.getByRole( 'link', { name: /Get/ } );
		await user.click( button );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_themeshowcase_plan_upgrade_banner_click',
			expect.objectContaining( { plan: expect.any( String ) } )
		);
	} );

	test( 'renders light variant by default', () => {
		const { container } = render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );
		expect( container.querySelector( '.plan-upgrade-banner' ) ).not.toHaveClass( 'is-dark' );
	} );

	test( 'renders dark variant when specified', () => {
		const { container } = render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } variant="dark" /> );
		expect( container.querySelector( '.plan-upgrade-banner' ) ).toHaveClass( 'is-dark' );
	} );

	test( 'toggles billing period between monthly and annually', async () => {
		const user = userEvent.setup();
		render( <PlanUpgradeBanner planSlug={ PLAN_BUSINESS } /> );

		const monthlyRadio = screen.getByLabelText( /Monthly/ );
		const annuallyRadio = screen.getByLabelText( /Annually/ );

		// Starts on annually
		expect( annuallyRadio ).toBeChecked();
		expect( monthlyRadio ).not.toBeChecked();

		await user.click( monthlyRadio );
		expect( monthlyRadio ).toBeChecked();
		expect( annuallyRadio ).not.toBeChecked();
	} );

	test( 'renders with different plan slugs', () => {
		const { container } = render( <PlanUpgradeBanner planSlug={ PLAN_PREMIUM } /> );
		expect( container.querySelector( '.plan-upgrade-banner' ) ).toBeVisible();
	} );
} );
