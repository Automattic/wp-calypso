/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useDifmOffer } from 'calypso/dashboard/utils/difm-offer';
import { getCacheKey } from 'calypso/data/home/use-home-layout-query';
import { FEATURE_DIFM_OFFER } from 'calypso/my-sites/customer-home/cards/constants';
import DifmOffer from '../';

jest.mock( 'calypso/dashboard/utils/difm-offer', () => ( {
	...jest.requireActual( 'calypso/dashboard/utils/difm-offer' ),
	useDifmOffer: jest.fn(),
} ) );

const mockUseDifmOffer = useDifmOffer as jest.MockedFunction< typeof useDifmOffer >;

const initialState = {
	sites: {
		items: {
			1: {
				ID: 1,
				URL: 'example.wordpress.com',
				plan: { product_slug: 'free_plan' },
				options: { created_at: '2026-10-01T00:00:00+00:00' },
				is_a4a_dev_site: false,
			},
		},
	},
	ui: { selectedSiteId: 1 },
};

const renderCard = ( layout: object = { primary: [], secondary: [ FEATURE_DIFM_OFFER ] } ) => {
	const queryClient = new QueryClient();
	queryClient.setQueryData( getCacheKey( 1 ), layout );

	return render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ configureStore()( initialState ) }>
				<DifmOffer />
			</Provider>
		</QueryClientProvider>
	);
};

describe( 'DifmOffer', () => {
	test( 'renders the variation copy for an eligible, assigned user', () => {
		mockUseDifmOffer.mockReturnValue( {
			isEligible: true,
			isLoading: false,
			variation: 'no_time',
		} );

		renderCard();

		expect( mockUseDifmOffer ).toHaveBeenCalledWith(
			expect.objectContaining( {
				planSlug: 'free_plan',
				siteCreatedAt: '2026-10-01T00:00:00+00:00',
				localeSlug: 'en',
				isA4ADevSite: false,
			} )
		);
		expect( screen.getByRole( 'heading', { name: 'No time to build your site?' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'See the offer' } ) ).toBeVisible();
	} );

	test.each( [
		[ 'control', { isEligible: true, isLoading: false, variation: 'control' } ],
		[ 'ineligible', { isEligible: false, isLoading: false, variation: 'no_time' } ],
		[ 'loading', { isEligible: true, isLoading: true, variation: 'no_time' } ],
	] as const )( 'renders nothing for %s', ( _, result ) => {
		mockUseDifmOffer.mockReturnValue( result );

		const { container } = renderCard();

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing when the home layout does not list the card', () => {
		mockUseDifmOffer.mockReturnValue( {
			isEligible: true,
			isLoading: false,
			variation: 'no_time',
		} );

		const { container } = renderCard( { primary: [], secondary: [] } );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
