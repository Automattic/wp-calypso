/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import DateRangeControl from '../date-range-control';
import { recordWidgetEventThenFollow } from '../record-widget-event';

vi.mock( '../record-widget-event', () => ( {
	recordWidgetEventThenFollow: vi.fn( () => vi.fn() ),
} ) );

describe( 'DateRangeControl', () => {
	it( 'names the button with the range it shows, for speech control', () => {
		render( <DateRangeControl value="last_30_days" onChange={ vi.fn() } /> );

		expect( screen.getByRole( 'button', { name: 'Date range: Last 30 days' } ) ).toHaveTextContent(
			'Last 30 days'
		);
	} );

	it( 'reports the chosen range and closes the menu', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render( <DateRangeControl value="last_7_days" onChange={ onChange } /> );

		await user.click( screen.getByRole( 'button', { name: 'Date range: Last 7 days' } ) );
		expect( screen.getByRole( 'menuitemradio', { name: 'Last 7 days' } ) ).toBeChecked();

		await user.click( screen.getByRole( 'menuitemradio', { name: 'Last 90 days' } ) );
		expect( onChange ).toHaveBeenCalledWith( 'last_90_days' );
		expect( screen.queryByRole( 'menuitemradio' ) ).not.toBeInTheDocument();
	} );

	it( 'offers no upsell where the plan locks no range', async () => {
		const user = userEvent.setup();
		render(
			<DateRangeControl
				value="last_7_days"
				onChange={ vi.fn() }
				upgradeUrl="https://wordpress.com/checkout/example.com/personal-bundle"
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Date range: Last 7 days' } ) );

		expect( screen.getByRole( 'menuitemradio', { name: 'Last 90 days' } ) ).toBeEnabled();
		expect( screen.queryByRole( 'link', { name: 'Upgrade' } ) ).not.toBeInTheDocument();
	} );

	it( 'locks the ranges the plan does not include, with an upsell', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<DateRangeControl
				value="last_7_days"
				onChange={ onChange }
				isLocked={ ( id ) => id !== 'last_7_days' }
				upgradeUrl="https://wordpress.com/checkout/example.com/personal-bundle"
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Date range: Last 7 days' } ) );

		expect( screen.getByRole( 'menuitemradio', { name: 'Last 7 days' } ) ).toBeEnabled();
		for ( const name of [ 'Last 30 days', 'Last 90 days', 'Last 12 months' ] ) {
			expect( screen.getByRole( 'menuitemradio', { name } ) ).toBeDisabled();
		}

		await user.click( screen.getByRole( 'menuitemradio', { name: 'Last 90 days' } ) );
		expect( onChange ).not.toHaveBeenCalled();

		expect( screen.getByRole( 'link', { name: 'Upgrade' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/checkout/example.com/personal-bundle'
		);
		expect( recordWidgetEventThenFollow ).toHaveBeenCalledWith( 'upgrade_clicked', {
			feature: 'date_range',
		} );
	} );
} );
