/**
 * @jest-environment jsdom
 */
import { PLAN_BUSINESS } from '@automattic/calypso-products';
import { type SitePlanPricing } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React, { type ComponentPropsWithoutRef } from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { useUpgradePlanHostingDetailsList } from '../hooks/use-get-upgrade-plan-hosting-details-list';
import UpgradePlanDetails, {
	UpgradePlanDetails as UpgradePlanDetailsWithoutHoc,
} from '../upgrade-plan-details';

jest.mock( '../hooks/use-get-upgrade-plan-hosting-details-list' );

const SITE_ID = 123;
const CHILDREN = 'CTA';

const mockUseUpgradePlanHostingDetailsList = ( isFetching: boolean ) => {
	( useUpgradePlanHostingDetailsList as jest.Mock ).mockReturnValue( {
		list: [],
		isFetching,
	} );
};

function renderUpgradePlanDetailsComponent(
	Component = UpgradePlanDetails,
	props: ComponentPropsWithoutRef< typeof UpgradePlanDetails > = {
		pricing: getPricing(),
		introOfferAvailable: false,
		children: CHILDREN,
	},
	planData = {}
) {
	const queryClient = new QueryClient();

	return renderWithProvider(
		<QueryClientProvider client={ queryClient }>
			<Component { ...props } />
		</QueryClientProvider>,
		{
			initialState: {
				sites: {
					plans: {
						[ SITE_ID ]: {
							data: [
								{
									currencyCode: 'USD',
									rawPrice: 0,
									rawDiscount: 0,
									productSlug: PLAN_BUSINESS,
									...planData,
								},
							],
						},
					},
				},
			},
			reducers: {},
		}
	);
}

function getPricing(): SitePlanPricing {
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
			rawPrice: 150,
			isOfferComplete: false,
			intervalUnit: 'year',
			intervalCount: 1,
		},
	};
}

describe( 'UpgradePlanDetails', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		mockUseUpgradePlanHostingDetailsList( false );
	} );

	describe( 'with migration sticker HOC', () => {
		it( 'should render children', async () => {
			const { queryByText } = renderUpgradePlanDetailsComponent();

			await waitFor( () => {
				expect( queryByText( CHILDREN ) ).toBeInTheDocument();
			} );
		} );

		it( 'should call the sticker endpoint creation when rendering the component', async () => {
			nock.cleanAll();
			const scope = nock( 'https://public-api.wordpress.com:443' )
				.post( `/wpcom/v2/sites/${ SITE_ID }/migration-flow` )
				.reply( 200 );

			renderUpgradePlanDetailsComponent();

			await waitFor( () => {
				expect( scope.isDone() ).toBe( true );
			} );
		} );
	} );

	describe( 'without migration sticker HOC', () => {
		it( 'should render fetch state when hosting details are fetching', async () => {
			mockUseUpgradePlanHostingDetailsList( true );

			const { queryByText, container } = renderUpgradePlanDetailsComponent(
				UpgradePlanDetailsWithoutHoc
			);

			expect(
				container.querySelector( '.import__upgrade-plan-details--loading' )
			).toBeInTheDocument();
			expect( queryByText( CHILDREN ) ).not.toBeInTheDocument();
		} );

		it( 'should render fetch state when price is not ready', async () => {
			const { queryByText, container } = renderUpgradePlanDetailsComponent(
				UpgradePlanDetailsWithoutHoc,
				{
					rawPrice: null,
				}
			);

			expect(
				container.querySelector( '.import__upgrade-plan-details--loading' )
			).toBeInTheDocument();
			expect( queryByText( CHILDREN ) ).not.toBeInTheDocument();
		} );

		it( 'should render fetch state when currency is not ready', async () => {
			const { queryByText, container } = renderUpgradePlanDetailsComponent(
				UpgradePlanDetailsWithoutHoc,
				{
					currencyCode: null,
				}
			);

			expect(
				container.querySelector( '.import__upgrade-plan-details--loading' )
			).toBeInTheDocument();
			expect( queryByText( CHILDREN ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'should show the pricing description for the introductory offer when the intro offer is avaiable', async () => {
		renderUpgradePlanDetailsComponent( UpgradePlanDetailsWithoutHoc, {
			pricing: getPricing(),
			introOfferAvailable: true,
			children: 'Content',
		} );

		await waitFor( () => {
			expect( screen.getByText( 'One time offer' ) ).toBeInTheDocument();

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
		renderUpgradePlanDetailsComponent( UpgradePlanDetailsWithoutHoc, {
			pricing: getPricing(),
			introOfferAvailable: false,
			children: 'Content',
		} );

		await waitFor( () => {
			expect( screen.queryByText( 'One time offer' ) ).toBeNull();

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
