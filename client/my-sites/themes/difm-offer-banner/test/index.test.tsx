/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { useDifmOffer } from 'calypso/dashboard/utils/difm-offer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DifmOfferBanner from '../index';

jest.mock( 'calypso/dashboard/utils/difm-offer', () => ( {
	...jest.requireActual( 'calypso/dashboard/utils/difm-offer' ),
	useDifmOffer: jest.fn(),
} ) );

const SITE_ID = 123;

const initialState = {
	sites: {
		items: {
			[ SITE_ID ]: {
				ID: SITE_ID,
				plan: { product_slug: 'free_plan' },
				options: { created_at: '2026-10-01T00:00:00+00:00' },
			},
		},
	},
	ui: { language: { localeSlug: 'en' } },
};

function renderBanner( siteId: number | null = SITE_ID ) {
	return renderWithProvider( <DifmOfferBanner siteId={ siteId } />, {
		initialState,
		reducers: { ui: uiReducer },
	} );
}

function mockOffer( result: ReturnType< typeof useDifmOffer > ) {
	( useDifmOffer as jest.Mock ).mockReturnValue( result );
}

describe( 'DifmOfferBanner', () => {
	test( 'renders the variation copy for an eligible assigned user', () => {
		mockOffer( { isEligible: true, isLoading: false, variation: 'no_time' } );
		renderBanner();

		expect( screen.getByText( 'No time to build your site?' ) ).toBeVisible();
		expect( screen.getByText( /Ready in 4 days/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'See the offer' } ) ).toBeVisible();
		expect( useDifmOffer ).toHaveBeenCalledWith( {
			planSlug: 'free_plan',
			siteCreatedAt: '2026-10-01T00:00:00+00:00',
			localeSlug: 'en',
		} );
	} );

	test( 'renders nothing for control', () => {
		mockOffer( { isEligible: true, isLoading: false, variation: 'control' } );
		const { container } = renderBanner();
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing for an ineligible user', () => {
		mockOffer( { isEligible: false, isLoading: false, variation: 'control' } );
		const { container } = renderBanner();
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing while the assignment loads', () => {
		mockOffer( { isEligible: true, isLoading: true, variation: 'no_time' } );
		const { container } = renderBanner();
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing without a selected site', () => {
		mockOffer( { isEligible: true, isLoading: false, variation: 'no_time' } );
		const { container } = renderBanner( null );
		expect( container ).toBeEmptyDOMElement();
	} );
} );
