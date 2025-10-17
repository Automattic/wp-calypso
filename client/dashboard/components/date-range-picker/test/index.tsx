/**
 * @jest-environment jsdom
 */
import { render, within } from '@testing-library/react';
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
		const { getByRole } = render( <TestDateRangePicker /> );
		const btn = getByRole( 'button', { name: /Date range:/i } );
		expect( btn ).toBeVisible();
		expect( btn ).toHaveAccessibleName( expect.stringContaining( 'Aug 19, 2025' ) );
		expect( btn ).toHaveAccessibleName( expect.stringContaining( 'Aug 25, 2025' ) );
	} );

	test( 'open → select two days → Apply updates label', async () => {
		const { getByRole, findByRole } = render( <TestDateRangePicker /> );

		// Open picker
		await userEvent.click( getByRole( 'button', { name: /Date range:/i } ) );

		// Scope to calendar grid directly by role (popover may render via portal)
		const augGrid = await findByRole( 'grid', { name: /August 2025/i } );
		const grid = within( augGrid );

		// Pick two August days (labels may include weekday and “, selected”)
		await userEvent.click( grid.getByRole( 'button', { name: /August 6, 2025/i } ) );
		await userEvent.click( grid.getByRole( 'button', { name: /August 8, 2025/i } ) );

		await userEvent.click( getByRole( 'button', { name: /Apply/i } ) );

		// Assert the visible text inside the toggle button
		const toggle = getByRole( 'button', { name: /Date range:/i } );
		const span = await within( toggle ).findByText(
			( t ) => t.includes( 'Aug 6, 2025' ) && t.includes( 'Aug 8, 2025' )
		);
		expect( span ).toBeVisible();
	} );

	test( 'Clear resets inputs/selection', async () => {
		const { getByRole, getByLabelText } = render( <TestDateRangePicker /> );

		// Open picker
		await userEvent.click( getByRole( 'button', { name: /Date range:/i } ) );

		// Inputs start with the current selection
		const from = getByLabelText( 'Start date' ) as HTMLInputElement;
		const to = getByLabelText( 'End date' ) as HTMLInputElement;
		expect( from ).toHaveValue( '2025-08-19' );
		expect( to ).toHaveValue( '2025-08-25' );

		// Clear only resets the draft inputs
		await userEvent.click( getByRole( 'button', { name: /Clear/i } ) );
		expect( from ).toHaveValue( '' );
		expect( to ).toHaveValue( '' );

		// Apply should be disabled until a valid draft range exists
		expect( getByRole( 'button', { name: /Apply/i } ) ).toBeDisabled();

		// External selection/label is unchanged
		const toggle = getByRole( 'button', { name: /Date range:/i } );
		expect(
			within( toggle ).getByText(
				( t ) => t.includes( 'Aug 19, 2025' ) && t.includes( 'Aug 25, 2025' )
			)
		).toBeVisible();
	} );

	test( 'disableFuture prevents selecting a future date', async () => {
		const { getByRole, findByRole } = render( <TestDateRangePicker disableFuture /> );

		// Open
		await userEvent.click( getByRole( 'button', { name: /Date range:/i } ) );

		// August grid
		const augGrid = await findByRole( 'grid', { name: /August 2025/i } );

		// Future day button is disabled
		const futureBtn = within( augGrid ).getByRole( 'button', { name: /August 26, 2025/i } );
		expect( futureBtn ).toBeDisabled();

		// Attempt to click the disabled day, and then apply changes
		await userEvent.click( futureBtn );
		await userEvent.click( getByRole( 'button', { name: /Apply/i } ) );

		// Label should remain unchanged (initial Aug 19–25)
		const toggle = getByRole( 'button', { name: /Date range:/i } );
		expect(
			within( toggle ).getByText(
				( t ) => t.includes( 'Aug 19, 2025' ) && t.includes( 'Aug 25, 2025' )
			)
		).toBeVisible();

		// Check: a past day button is enabled
		const pastBtn = within( augGrid ).getByRole( 'button', { name: /August 24, 2025/i } );
		expect( pastBtn ).toBeEnabled();
	} );

	test( 'preset selection updates label (Yesterday)', async () => {
		const { getByRole, findByRole } = render( <TestDateRangePicker /> );
		// Open
		await userEvent.click( getByRole( 'button', { name: /Date range:/i } ) );

		// Click "Yesterday" preset
		const listbox = await findByRole( 'listbox', { name: /Date range presets/i } );
		await userEvent.click( within( listbox ).getByRole( 'option', { name: /yesterday/i } ) );

		// Label should reflect Aug 24 → Aug 24
		const updated = await findByRole( 'button', {
			name: /Date range:.*Aug 24, 2025.*Aug 24, 2025/i,
		} );
		expect( updated ).toBeVisible();
	} );

	test( 'blank timezoneString with non-zero gmtOffset normalizes and selects correctly', async () => {
		const { getByRole, findByRole } = render(
			<TestDateRangePicker timezoneString="" gmtOffset={ -5 } />
		);
		const btn = getByRole( 'button', { name: /Date range:/i } );
		expect( btn ).toHaveAccessibleName( expect.stringContaining( 'Aug 19, 2025' ) );
		expect( btn ).toHaveAccessibleName( expect.stringContaining( 'Aug 25, 2025' ) );

		// Open and select a range
		await userEvent.click( btn );
		const augGrid = await findByRole( 'grid', { name: /August 2025/i } );
		await userEvent.click( within( augGrid ).getByRole( 'button', { name: /August 1, 2025/i } ) );
		await userEvent.click( within( augGrid ).getByRole( 'button', { name: /August 2, 2025/i } ) );
		await userEvent.click( getByRole( 'button', { name: /Apply/i } ) );

		// Label should reflect Aug 1 → Aug 2
		const updated = getByRole( 'button', { name: /Date range:/i } );
		expect(
			within( updated ).getByText(
				( t ) => t.includes( 'Aug 1, 2025' ) && t.includes( 'Aug 2, 2025' )
			)
		).toBeVisible();
	} );

	test( 'invalid IANA timezone falls back gracefully (no crash, label correct)', async () => {
		// Silence and assert the Moment Timezone warning for invalid zone
		const errorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		try {
			const { getByRole, findByRole } = render(
				<TestDateRangePicker timezoneString="Foo/Bar" gmtOffset={ 0 } />
			);
			const btn = getByRole( 'button', { name: /Date range:/i } );
			expect( btn ).toBeVisible();
			// Label remains the initial normalized dates
			expect( btn ).toHaveAccessibleName( expect.stringContaining( 'Aug 19, 2025' ) );
			expect( btn ).toHaveAccessibleName( expect.stringContaining( 'Aug 25, 2025' ) );

			// Open and ensure calendar renders and selection works
			await userEvent.click( btn );
			const augGrid = await findByRole( 'grid', { name: /August 2025/i } );
			await userEvent.click( within( augGrid ).getByRole( 'button', { name: /August 3, 2025/i } ) );
			await userEvent.click( within( augGrid ).getByRole( 'button', { name: /August 4, 2025/i } ) );
			await userEvent.click( getByRole( 'button', { name: /Apply/i } ) );

			const updated = getByRole( 'button', { name: /Date range:/i } );
			expect(
				within( updated ).getByText(
					( t ) => t.includes( 'Aug 3, 2025' ) && t.includes( 'Aug 4, 2025' )
				)
			).toBeVisible();

			// Expect a warning logged about invalid timezone data
			const warned = errorSpy.mock.calls.some( ( args ) =>
				args.some( ( a ) => typeof a === 'string' && /has no data for/i.test( a ) )
			);
			expect( warned ).toBe( true );
		} finally {
			errorSpy.mockRestore();
		}
	} );
} );
