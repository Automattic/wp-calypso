/** @jest-environment jsdom */
import { screen, render } from '@testing-library/react';
import React from 'react';
import { ItemsList } from '../items-list';

describe( '<ItemsList />', () => {
	test( 'should render Product component', async () => {
		render( <ItemsList currentView="products" /> );
		expect( screen.getByText( /Product/i ) ).toBeInTheDocument();
	} );

	test( 'should render Bundles component', async () => {
		render( <ItemsList currentView="bundles" /> );
		expect( screen.getByText( /Bundle/i ) ).toBeInTheDocument();
	} );
} );
