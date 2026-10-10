/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateRangeControl from '../date-range-control';

describe( 'DateRangeControl', () => {
	it( 'names the button with the range it shows, for speech control', () => {
		render( <DateRangeControl value="last_30_days" onChange={ jest.fn() } /> );

		expect( screen.getByRole( 'button', { name: 'Date range: Last 30 days' } ) ).toHaveTextContent(
			'Last 30 days'
		);
	} );

	it( 'reports the chosen range and closes the menu', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		render( <DateRangeControl value="last_7_days" onChange={ onChange } /> );

		await user.click( screen.getByRole( 'button', { name: 'Date range: Last 7 days' } ) );
		expect( screen.getByRole( 'menuitemradio', { name: 'Last 7 days' } ) ).toBeChecked();

		await user.click( screen.getByRole( 'menuitemradio', { name: 'Last 90 days' } ) );
		expect( onChange ).toHaveBeenCalledWith( 'last_90_days' );
		expect( screen.queryByRole( 'menuitemradio' ) ).not.toBeInTheDocument();
	} );
} );
