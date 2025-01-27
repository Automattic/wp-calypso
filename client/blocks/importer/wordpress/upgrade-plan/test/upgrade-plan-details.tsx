/**
 * @jest-environment jsdom
 */
import { PLAN_BUSINESS } from '@automattic/calypso-products';
import { type PricingMetaForGridPlan } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React, { type ComponentPropsWithoutRef } from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { UpgradePlanDetails } from '../upgrade-plan-details';

function renderUpgradePlanDetailsComponent(
	props: ComponentPropsWithoutRef< typeof UpgradePlanDetails >
) {
	const queryClient = new QueryClient();

	return renderWithProvider(
		<QueryClientProvider client={ queryClient }>
			<UpgradePlanDetails { ...props } children="Content" />
		</QueryClientProvider>,
		{
			initialState: {},
			reducers: {},
		}
	);
}

function getPricing(): PricingMetaForGridPlan {
	return {
		currencyCode: 'USD',
		originalPrice: {
			monthly: 2500,
			full: 30000,
		},
		discountedPrice: {
			monthly: 0,
			full: 0,
		},
		introOffer: {
			formattedPrice: '$150',
			rawPrice: {
				monthly: 1250,
				full: 15000,
			},
			isOfferComplete: false,
			intervalUnit: 'year',
			intervalCount: 1,
		},
	};
}

describe( 'UpgradePlanDetails', () => {
	beforeAll( () => nock.disableNetConnect() );

	it( 'should show the pricing description for the introductory offer when the intro offer is avaiable', async () => {
		renderUpgradePlanDetailsComponent( {
			planSlugs: [ PLAN_BUSINESS ],
			pricing: { [ PLAN_BUSINESS ]: getPricing() },
			introOfferAvailable: true,
			children: 'Content',
			upgradePlanHostingDetailsList: [],
		} );

		await waitFor( () => {
			expect( screen.getByText( '50% off your first year' ) ).toBeInTheDocument();

			// Introductory offer price per month (calculated from the full price).
			expect( screen.getByText( '12' ) ).toBeInTheDocument();
			expect( screen.getByText( '.50' ) ).toBeInTheDocument();

			// Original price per month, paid annually.
			expect( screen.getByText( '25' ) ).toBeInTheDocument();

			expect(
				screen.getByText(
					'per month, $150 billed annually for the first year, $300 per year afterwards, excl. taxes'
				)
			).toBeInTheDocument();

			expect( screen.queryByText( 'Pay monthly' ) ).toBeNull();
			expect( screen.queryByText( 'Pay annually' ) ).toBeNull();
		} );
	} );

	it( 'should show the standard pricing offer description when the introductory offer is not avaiable', async () => {
		renderUpgradePlanDetailsComponent( {
			planSlugs: [ PLAN_BUSINESS ],
			pricing: { [ PLAN_BUSINESS ]: getPricing() },
			introOfferAvailable: false,
			children: 'Content',
			upgradePlanHostingDetailsList: [],
		} );

		await waitFor( () => {
			expect( screen.queryByText( '50% off your first year' ) ).toBeNull();

			// Introductory offer price per month (calculated from the full price).
			expect( screen.queryByText( '12' ) ).toBeNull();
			expect( screen.queryByText( '.50' ) ).toBeNull();

			// Original price per month, paid annually.
			expect( screen.getByText( '25' ) ).toBeInTheDocument();

			expect( screen.getByText( 'per month, billed annually' ) ).toBeInTheDocument();

			expect( screen.getByText( 'Pay monthly' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Pay annually' ) ).toBeInTheDocument();
		} );
	} );
} );
