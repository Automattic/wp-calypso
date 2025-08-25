/**
 * @jest-environment jsdom
 */
import { render, within, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import { useState } from 'react';
import { DateRangePicker } from '../index';
import type { ComponentProps } from 'react';

function TestDateRangePicker( props: Partial< ComponentProps< typeof DateRangePicker > > ) {
	const [ range, setRange ] = useState( {
		start: new Date( 2025, 7, 19 ), // August 19, 2025
		end: new Date( 2025, 7, 25 ), // August 25, 2025
	} );
	return (
		<DateRangePicker
			start={ range.start }
			end={ range.end }
			onChange={ setRange }
			timezoneString=""
			gmtOffset={ 0 }
			locale="en-US"
			{ ...props }
		/>
	);
}

describe( 'DateRangePicker (new)', () => {
	// Ensure we 'freeze' the time and date so we don't get test flakiness depending on when they are run,
	// and when testing presets as well as disableFuture.
	beforeEach( () => {
		MockDate.set( '2025-08-25T12:00:00Z' );
	} );
	afterEach( () => {
		MockDate.reset();
	} );

	test( 'button label reflects normalized site days (offset-only UTC+0)', () => {
		render( <TestDateRangePicker /> );
		const btn = screen.getByRole( 'button', { name: /Date range:/i } );
		expect( btn ).toBeVisible();
		expect( btn ).toHaveAccessibleName( expect.stringContaining( 'Aug 19, 2025' ) );
		expect( btn ).toHaveAccessibleName( expect.stringContaining( 'Aug 25, 2025' ) );
	} );

	test( 'open → select two days → Apply updates label', async () => {
		render( <TestDateRangePicker /> );

		// Open picker
		await userEvent.click( screen.getByRole( 'button', { name: /Date range:/i } ) );

		// Scope to the popover
		const popover = document.querySelector( '.daterange-popover' ) as HTMLElement;
		const pop = within( popover );

		// Scope to August grid to avoid multiple matches
		const augGrid = await pop.findByRole( 'grid', { name: /August 2025/i } );

		// Pick two August days (labels may include weekday and “, selected”)
		await userEvent.click( within( augGrid ).getByRole( 'button', { name: /August 6, 2025/i } ) );
		await userEvent.click( within( augGrid ).getByRole( 'button', { name: /August 8, 2025/i } ) );

		await userEvent.click( pop.getByRole( 'button', { name: /Apply/i } ) );

		// Assert the visible text inside the toggle button
		const toggle = screen.getByRole( 'button', { name: /Date range:/i } );
		const span = await within( toggle ).findByText(
			( t ) => t.includes( 'Aug 6, 2025' ) && t.includes( 'Aug 8, 2025' )
		);
		expect( span ).toBeVisible();
	} );

	test( 'Clear resets inputs/selection', async () => {
		render( <TestDateRangePicker /> );

		// Open picker
		await userEvent.click( screen.getByRole( 'button', { name: /Date range:/i } ) );

		// Scope to the popover
		const popover = document.querySelector( '.daterange-popover' ) as HTMLElement;
		const pop = within( popover );

		// Inputs start with the current selection
		const from = pop.getByLabelText( 'Start date' ) as HTMLInputElement;
		const to = pop.getByLabelText( 'End date' ) as HTMLInputElement;
		expect( from ).toHaveValue( '2025-08-19' );
		expect( to ).toHaveValue( '2025-08-25' );

		// Clear only resets the draft inputs
		await userEvent.click( pop.getByRole( 'button', { name: /Clear/i } ) );
		expect( from ).toHaveValue( '' );
		expect( to ).toHaveValue( '' );

		// Apply should be disabled until a valid draft range exists
		expect( pop.getByRole( 'button', { name: /Apply/i } ) ).toBeDisabled();

		// External selection/label is unchanged
		const toggle = screen.getByRole( 'button', { name: /Date range:/i } );
		expect(
			within( toggle ).getByText(
				( t ) => t.includes( 'Aug 19, 2025' ) && t.includes( 'Aug 25, 2025' )
			)
		).toBeVisible();
	} );

	test( 'disableFuture prevents selecting a future date', async () => {
		render( <TestDateRangePicker disableFuture /> );

		// Open
		await userEvent.click( screen.getByRole( 'button', { name: /Date range:/i } ) );

		// Scope to popover
		const popover = document.querySelector( '.daterange-popover' ) as HTMLElement;
		const pop = within( popover );

		// August grid
		const augGrid = pop.getByRole( 'grid', { name: /August 2025/i } );

		// Future day is disabled in gridcell
		const futureCell = augGrid.querySelector(
			'td[role="gridcell"][data-day="2025-08-26"]'
		) as HTMLTableCellElement;
		expect( futureCell ).toHaveAttribute( 'data-disabled', 'true' );

		// Its button is present but not interactive
		const futureBtn = within( futureCell ).getByRole( 'button', { name: /August 26, 2025/i } );
		expect( futureBtn ).toBeDisabled();

		// Attempt to click the disabled day, and then apply changes
		await userEvent.click( futureBtn );
		await userEvent.click( pop.getByRole( 'button', { name: /Apply/i } ) );

		// Label should remain unchanged (initial Aug 19–25)
		const toggle = screen.getByRole( 'button', { name: /Date range:/i } );
		expect(
			within( toggle ).getByText(
				( t ) => t.includes( 'Aug 19, 2025' ) && t.includes( 'Aug 25, 2025' )
			)
		).toBeVisible();

		// Check: a past day is enabled
		const pastCell = augGrid.querySelector(
			'td[role="gridcell"][data-day="2025-08-24"]'
		) as HTMLTableCellElement;
		expect( pastCell ).not.toHaveAttribute( 'data-disabled', 'true' );
	} );

	test( 'preset selection updates label (Yesterday)', async () => {
		render( <TestDateRangePicker /> );
		// Open
		await userEvent.click( screen.getByRole( 'button', { name: /Date range:/i } ) );

		// Click "Yesterday" preset
		const listbox = await screen.findByRole( 'listbox', { name: /Date range presets/i } );
		await userEvent.click( within( listbox ).getByRole( 'option', { name: /yesterday/i } ) );

		// Label should reflect Aug 24 → Aug 24
		const updated = await screen.findByRole( 'button', {
			name: /Date range:.*Aug 24, 2025.*Aug 24, 2025/i,
		} );
		expect( updated ).toBeVisible();
	} );
} );
