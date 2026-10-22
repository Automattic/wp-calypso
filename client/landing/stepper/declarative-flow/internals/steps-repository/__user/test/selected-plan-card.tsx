/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/data-stores', () => ( {
	Plans: {
		usePlans: jest.fn(),
	},
} ) );

import { Plans } from '@automattic/data-stores';
import { render, screen } from '@testing-library/react';
import SelectedPlanCard from '../selected-plan-card';

const mockUsePlans = Plans.usePlans as jest.Mock;

const pricing = ( billPeriod: number, full: number, discountedFull: number | null = null ) => {
	const months = billPeriod === 31 ? 1 : ( billPeriod / 365 ) * 12;
	return {
		billPeriod,
		currencyCode: 'USD',
		originalPrice: { monthly: full / months, full },
		discountedPrice: {
			monthly: discountedFull === null ? null : discountedFull / months,
			full: discountedFull,
		},
	};
};

const plans = {
	'business-bundle-monthly': { pricing: pricing( 31, 4000 ) },
	'business-bundle': { pricing: pricing( 365, 30000 ) },
	'business-bundle-2y': { pricing: pricing( 730, 54000 ) },
	'business-bundle-3y': { pricing: pricing( 1095, 72000 ) },
	'ecommerce-bundle': { pricing: pricing( 365, 54000 ) },
};

describe( 'SelectedPlanCard', () => {
	beforeEach( () => {
		mockUsePlans.mockReset();
		mockUsePlans.mockReturnValue( { data: plans, isLoading: false } );
	} );

	it( 'renders nothing while pricing is loading', () => {
		mockUsePlans.mockReturnValue( { data: undefined, isLoading: true } );

		const { container } = render(
			<SelectedPlanCard planSlug="business-bundle" coupon={ undefined } />
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing for a plan without pricing', () => {
		const { container } = render(
			<SelectedPlanCard planSlug="unknown-plan" coupon={ undefined } />
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the yearly Business plan with its monthly-equivalent price and savings', () => {
		render( <SelectedPlanCard planSlug="business-bundle" coupon={ undefined } /> );

		expect( screen.queryByText( 'You selected:' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Business Plan' ) ).toBeVisible();
		expect( screen.getByText( '$25/mo, billed yearly' ) ).toBeVisible();
		expect( screen.getByText( 'Save 37%' ) ).toBeVisible();
	} );

	it( 'renders the monthly Business plan without a savings pill', () => {
		render( <SelectedPlanCard planSlug="business-bundle-monthly" coupon={ undefined } /> );

		expect( screen.getByText( 'Business Plan' ) ).toBeVisible();
		expect( screen.getByText( '$40/mo, billed monthly' ) ).toBeVisible();
		expect( screen.queryByText( /^Save/ ) ).not.toBeInTheDocument();
	} );

	it.each( [
		[ 'business-bundle-2y', '$22.50/mo, billed every two years', 'Save 43%' ],
		[ 'business-bundle-3y', '$20/mo, billed every three years', 'Save 50%' ],
	] )( 'renders %s with its term', ( planSlug, priceText, savingsText ) => {
		render( <SelectedPlanCard planSlug={ planSlug } coupon={ undefined } /> );

		expect( screen.getByText( priceText ) ).toBeVisible();
		expect( screen.getByText( savingsText ) ).toBeVisible();
	} );

	it( 'shows the discounted price when the API returns one', () => {
		mockUsePlans.mockReturnValue( {
			data: { ...plans, 'business-bundle': { pricing: pricing( 365, 30000, 24000 ) } },
			isLoading: false,
		} );

		render( <SelectedPlanCard planSlug="business-bundle" coupon={ undefined } /> );

		expect( screen.getByText( '$20/mo, billed yearly' ) ).toBeVisible();
		expect( screen.getByText( 'Save 50%' ) ).toBeVisible();
	} );

	it( 'omits the savings pill when the monthly plan price is unknown', () => {
		mockUsePlans.mockReturnValue( {
			data: { 'ecommerce-bundle': plans[ 'ecommerce-bundle' ] },
			isLoading: false,
		} );

		render( <SelectedPlanCard planSlug="ecommerce-bundle" coupon={ undefined } /> );

		expect( screen.getByText( 'Commerce Plan' ) ).toBeVisible();
		expect( screen.getByText( '$45/mo, billed yearly' ) ).toBeVisible();
		expect( screen.queryByText( /^Save/ ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the price and savings aligned to the start when they wrap under the plan name', () => {
		render( <SelectedPlanCard planSlug="business-bundle" coupon={ undefined } /> );

		const priceGroup = screen.getByText( '$25/mo, billed yearly' ).parentElement;

		expect( priceGroup ).toHaveStyle( { '--wp-components-flex-justify': 'flex-start' } );
	} );

	it( 'passes the coupon through to the pricing query', () => {
		render( <SelectedPlanCard planSlug="business-bundle" coupon="SAVE10" /> );

		expect( mockUsePlans ).toHaveBeenCalledWith( { coupon: 'SAVE10' } );
	} );
} );
