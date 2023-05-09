/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import JetpackCompletePage from '../index';

jest.mock( 'calypso/state/ui/selectors/get-selected-site-id', () => jest.fn() );

jest.mock( 'calypso/my-sites/plans/jetpack-plans/use-item-price', () =>
	jest.fn().mockReturnValue( {
		originalPrice: 10,
		discountedPrice: 5,
		discountedPriceDuration: 1,
		isFetching: false,
	} )
);

jest.mock( 'calypso/state/products-list/selectors', () => ( {
	isProductsListFetching: jest.fn().mockReturnValue( false ),
} ) );

const renderWithRedux = ( el ) => renderWithProvider( el, {} );

describe( 'jetpack complete page', () => {
	it( 'page renders without errors with buttons', async () => {
		renderWithRedux( <JetpackCompletePage /> );

		expect( screen.getByText( 'Get Complete' ) ).toBeTruthy();
		expect( screen.getByText( 'Start for free' ) ).toBeTruthy();
	} );
} );
