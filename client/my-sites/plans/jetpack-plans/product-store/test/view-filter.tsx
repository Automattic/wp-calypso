/** @jest-environment jsdom */
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ViewFilter } from '../view-filter';
describe( '<ViewFilter />', () => {
	test( 'should render the filter with Products selected', async () => {
		const setCurrentView = jest.fn();
		render( <ViewFilter currentView={ 'products' } setCurrentView={ setCurrentView } /> );
		expect( screen.getByRole( 'radio', { name: 'Products' } ) ).toBeChecked();
	} );

	test( 'should switch the filter on click', async () => {
		const user = userEvent.setup();
		const setCurrentView = jest.fn();
		render( <ViewFilter currentView={ 'products' } setCurrentView={ setCurrentView } /> );
		expect( screen.getByRole( 'radio', { name: 'Products' } ) ).toBeChecked();

		await user.click( screen.getByRole( 'radio', { name: 'Bundles' } ) );
		expect( setCurrentView ).toHaveBeenLastCalledWith( 'bundles' );
	} );
} );
