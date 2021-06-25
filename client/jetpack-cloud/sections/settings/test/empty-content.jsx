/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import { JETPACK_PRICING_PAGE } from 'calypso/lib/url/support';
import { render } from 'config/testing-library';
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
