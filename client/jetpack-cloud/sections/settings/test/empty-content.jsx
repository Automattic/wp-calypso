/**
 * @jest-environment jsdom
 */

import { JETPACK_PRICING_PAGE } from '@automattic/urls';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import NoSitePurchasesMessage from '../empty-content';

describe( 'NoSitePurchasesMessage', () => {
	it( 'should render correctly', () => {
		const { container } = renderWithProvider( <NoSitePurchasesMessage /> );

		expect( container ).toMatchSnapshot();
	} );

	it( 'should link to the pricing page', () => {
		const { container } = renderWithProvider( <NoSitePurchasesMessage /> );

		expect( container.querySelector( 'a' ).getAttribute( 'href' ) ).toEqual( JETPACK_PRICING_PAGE );
	} );
} );
