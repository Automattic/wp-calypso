/**
 * @jest-environment jsdom
 */

import { render } from 'config/testing-library';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { JETPACK_PRICING_PAGE } from 'calypso/lib/url/support';
import NoSitePurchasesMessage from '../empty-content';

describe( 'NoSitePurchasesMessage', () => {
	it( 'should render correctly', () => {
		const { container } = render( <NoSitePurchasesMessage /> );

		expect( container ).toMatchSnapshot();
	} );

	it( 'should link to the pricing page', () => {
		const { container } = render( <NoSitePurchasesMessage /> );

		expect( container.querySelector( 'a' ).getAttribute( 'href' ) ).toEqual( JETPACK_PRICING_PAGE );
	} );
} );
