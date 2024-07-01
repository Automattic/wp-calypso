/**
 * @jest-environment jsdom
 */
import { PLAN_BUSINESS } from '@automattic/calypso-products';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
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

function renderUpgradePlanDetailsComponent( Component = UpgradePlanDetails, planData = {} ) {
	const queryClient = new QueryClient();

	return renderWithProvider(
		<QueryClientProvider client={ queryClient }>
			<Component siteId={ SITE_ID }>{ CHILDREN }</Component>
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

			expect( container.querySelector( '.import__upgrade-plan-loader' ) ).toBeInTheDocument();
			expect( queryByText( CHILDREN ) ).not.toBeInTheDocument();
		} );

		it( 'should render fetch state when price is not ready', async () => {
			const { queryByText, container } = renderUpgradePlanDetailsComponent(
				UpgradePlanDetailsWithoutHoc,
				{
					rawPrice: null,
				}
			);

			expect( container.querySelector( '.import__upgrade-plan-loader' ) ).toBeInTheDocument();
			expect( queryByText( CHILDREN ) ).not.toBeInTheDocument();
		} );

		it( 'should render fetch state when currency is not ready', async () => {
			const { queryByText, container } = renderUpgradePlanDetailsComponent(
				UpgradePlanDetailsWithoutHoc,
				{
					currencyCode: null,
				}
			);

			expect( container.querySelector( '.import__upgrade-plan-loader' ) ).toBeInTheDocument();
			expect( queryByText( CHILDREN ) ).not.toBeInTheDocument();
		} );
	} );
} );
