/** @jest-environment jsdom */
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ProductFilter from '../product-filter';
describe( '<ProductFilter />', () => {
	test( 'should render the filter with Products selected', async () => {
		const setFilterType = jest.fn();
		render( <ProductFilter filterType={ 'products' } setFilterType={ setFilterType } /> );
		expect( screen.getByRole( 'radio', { name: 'Products' } ) ).toBeChecked();
	} );

	test( 'should switch the filter on click', async () => {
		const user = userEvent.setup();
		const setFilterType = jest.fn();
		render( <ProductFilter filterType={ 'products' } setFilterType={ setFilterType } /> );
		expect( screen.getByRole( 'radio', { name: 'Products' } ) ).toBeChecked();

		await user.click( screen.getByRole( 'radio', { name: 'Bundles' } ) );
		expect( setFilterType ).toHaveBeenLastCalledWith( 'bundles' );
	} );
} );
