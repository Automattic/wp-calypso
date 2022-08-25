/** @jest-environment jsdom */
import { screen, render } from '@testing-library/react';
import React from 'react';
import Products from '../products';

describe( '<Products />', () => {
	test( 'should render Product component', async () => {
		render( <Products type="products" /> );
		expect( screen.getByText( /Product/i ) ).toBeInTheDocument();
	} );

	test( 'should render Bundles component', async () => {
		render( <Products type="bundles" /> );
		expect( screen.getByText( /Bundle/i ) ).toBeInTheDocument();
	} );
} );
