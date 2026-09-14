/**
 * @jest-environment jsdom
 */
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import { useState } from 'react';
import { DateRangePicker } from '../date-range-picker';
import type { ComponentProps } from 'react';

function renderDateRangePicker( {
	start = new Date( 2025, 7, 19 ),
	end = new Date( 2025, 7, 25 ),
	defaultFallbackPreset,
	...props
}: Partial< ComponentProps< typeof DateRangePicker > > & {
	start?: Date;
	end?: Date;
} = {} ) {
	function Harness( harnessProps: Partial< ComponentProps< typeof DateRangePicker > > ) {
		const [ range, setRange ] = useState( { start, end } );
		return (
			<DateRangePicker
				start={ range.start }
				end={ range.end }
				onChange={ setRange }
				timezoneString={ props.timezoneString || '' }
				gmtOffset={ props.gmtOffset || 0 }
				locale="en-US"
				defaultFallbackPreset={ defaultFallbackPreset }
				{ ...props }
				{ ...harnessProps }
			/>
		);
	}
	return render( <Harness /> );
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
		const { getByRole } = renderDateRangePicker();
		const btn = getByRole( 'button', { name: /Date range:/i } );
		expect( btn ).toBeVisible();
		expect( btn ).toHaveAccessibleName( expect.stringContaining( 'Aug 19, 2025' ) );
		expect( btn ).toHaveAccessibleName( expect.stringContaining( 'Aug 25, 2025' ) );
	} );

	test( 'open → select two days → Apply updates label', async () => {
		const { getByRole, findByRole } = renderDateRangePicker();

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
		const toggle = await findByRole( 'button', { name: /Date range:/i } );
		const span = await within( toggle ).findByText(
			( t ) => t.includes( 'Aug 6, 2025' ) && t.includes( 'Aug 8, 2025' )
		);
		expect( span ).toBeVisible();
	} );

	test( 'Clear → shows “Apply last 7 days”; click applies and closes', async () => {
		const { getByRole, findByRole, getByLabelText } = renderDateRangePicker( {
			start: new Date( 2025, 7, 1 ),
			end: new Date( 2025, 7, 3 ),
		} );
		await userEvent.click( getByRole( 'button', { name: /Date range:/i } ) );

		// Clear resets inputs
		await userEvent.click( getByRole( 'button', { name: /Clear/i } ) );
		expect( getByLabelText( 'Start date' ) ).toHaveValue( '' );
		expect( getByLabelText( 'End date' ) ).toHaveValue( '' );

		// “Apply default” is enabled
		const applyDefault = await findByRole( 'button', { name: /Apply Last 7 days/i } );
		expect( applyDefault ).toBeEnabled();

		// Click and assert Last 7 days (Aug 19–25 with MockDate 2025‑08‑25)
		await userEvent.click( applyDefault );
		const toggle = await findByRole( 'button', { name: /Date range:/i } );
		expect( toggle ).toHaveAccessibleName( expect.stringContaining( 'Aug 19, 2025' ) );
		expect( toggle ).toHaveAccessibleName( expect.stringContaining( 'Aug 25, 2025' ) );
	} );

	test( 'Clear → shows “Apply last 30 days” when defaultFallbackPreset=last-30-days; click applies and closes', async () => {
		const { findByRole, getByRole } = renderDateRangePicker( {
			defaultFallbackPreset: 'last-30-days',
		} );

		// Open picker
		await userEvent.click( getByRole( 'button', { name: /Date range:/i } ) );

		// Clear then re-query
		await userEvent.click( getByRole( 'button', { name: /Clear/i } ) );
		const applyDefault = await findByRole( 'button', { name: /^Apply last 30 days$/i } );
		expect( applyDefault ).toBeEnabled();

		// Apply default
		await userEvent.click( applyDefault );
		const toggle = await findByRole( 'button', { name: /Date range:/i } );
		expect( toggle ).toHaveAccessibleName( expect.stringContaining( 'Jul 27, 2025' ) );
		expect( toggle ).toHaveAccessibleName( expect.stringContaining( 'Aug 25, 2025' ) );
	} );

	test( 'Typing after Clear hides default and requires both dates', async () => {
		const { getByRole, getByLabelText, queryByRole } = renderDateRangePicker();
		await userEvent.click( getByRole( 'button', { name: /Date range:/i } ) );
		await userEvent.click( getByRole( 'button', { name: /Clear/i } ) );

		// Start typing
		const from = getByLabelText( 'Start date' ) as HTMLInputElement;
		await userEvent.click( from );
		await userEvent.type( from, '2025-08-01' );

		// Default label gone; apply disabled until both dates set
		expect( queryByRole( 'button', { name: /Apply default/i } ) ).toBeNull();
		const apply = getByRole( 'button', { name: /^Apply$/i } );
		expect( apply ).toBeDisabled();

		// Type end date and expect Apply to be enabled
		const to = getByLabelText( 'End date' ) as HTMLInputElement;
		await userEvent.type( to, '2025-08-10' );
		expect( apply ).toBeEnabled();
	} );

	test( 'Clear after typing resets inputs and enables Apply default', async () => {
		const { getByRole, getByLabelText, findByRole, findByLabelText } = renderDateRangePicker();

		// Open and start typing a date
		await userEvent.click( getByRole( 'button', { name: /Date range:/i } ) );
		const from = getByLabelText( 'Start date' ) as HTMLInputElement;
		const to = getByLabelText( 'End date' ) as HTMLInputElement;

		await userEvent.type( from, '2025-08-01' );
		await userEvent.type( to, '2025-08-10' );

		// Click Clear
		await userEvent.click( getByRole( 'button', { name: /Clear/i } ) );

		// Re-query fresh inputs by label
		const from2 = ( await findByLabelText( 'Start date' ) ) as HTMLInputElement;
		const to2 = ( await findByLabelText( 'End date' ) ) as HTMLInputElement;

		expect( from2 ).toHaveValue( '' );
		expect( to2 ).toHaveValue( '' );

		// Re-query the default-apply button and wait for enable
		const applyDefault = await findByRole( 'button', { name: /Apply Last 7 days/i } );
		expect( applyDefault ).toBeEnabled();
	} );

	test( 'disableFuture prevents selecting a future date', async () => {
		const { getByRole, findByRole } = renderDateRangePicker( { disableFuture: true } );

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
		const toggle = await findByRole( 'button', { name: /Date range:/i } );
		expect(
			within( toggle ).getByText(
				( t ) => t.includes( 'Aug 19, 2025' ) && t.includes( 'Aug 25, 2025' )
			)
		).toBeVisible();

		// Check: a past day button is enabled
		const pastBtn = within( augGrid ).getByRole( 'button', { name: /August 24, 2025/i } );
		expect( pastBtn ).toBeEnabled();
	} );

	test( 'disabledBefore disables dates before the boundary', async () => {
		const { getByRole, findByRole } = renderDateRangePicker( {
			disabledBefore: new Date( 2025, 7, 15 ),
		} );

		await userEvent.click( getByRole( 'button', { name: /Date range:/i } ) );

		const augGrid = await findByRole( 'grid', { name: /August 2025/i } );

		// Day before the boundary is disabled
		const earlyBtn = within( augGrid ).getByRole( 'button', { name: /August 10, 2025/i } );
		expect( earlyBtn ).toBeDisabled();

		// Day on/after the boundary is enabled
		const okBtn = within( augGrid ).getByRole( 'button', { name: /August 20, 2025/i } );
		expect( okBtn ).toBeEnabled();
	} );

	test( 'disabledBefore sets the start input min so native pickers cannot offer earlier days', async () => {
		const { getByRole, getByLabelText } = renderDateRangePicker( {
			disabledBefore: new Date( 2025, 7, 15 ),
		} );

		await userEvent.click( getByRole( 'button', { name: /Date range:/i } ) );

		const startInput = getByLabelText( 'Start date' ) as HTMLInputElement;
		expect( startInput.min ).toBe( '2025-08-15' );
	} );

	test( 'preset selection updates label (Yesterday)', async () => {
		const { getByRole, findByRole } = renderDateRangePicker();
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

	test( 'hiddenPresets removes presets from the listbox', async () => {
		const { getByRole, findByRole } = renderDateRangePicker( {
			hiddenPresets: [ 'yesterday', 'last-3-years' ],
		} );
		await userEvent.click( getByRole( 'button', { name: /Date range:/i } ) );

		const listbox = await findByRole( 'listbox', { name: /Date range presets/i } );
		expect( within( listbox ).queryByRole( 'option', { name: /yesterday/i } ) ).toBeNull();
		expect( within( listbox ).queryByRole( 'option', { name: /last 3 years/i } ) ).toBeNull();
		expect( within( listbox ).getByRole( 'option', { name: /last 7 days/i } ) ).toBeInTheDocument();
	} );

	test( 'last-90-days preset applies a 90-day window', async () => {
		const { getByRole, findByRole } = renderDateRangePicker();
		await userEvent.click( getByRole( 'button', { name: /Date range:/i } ) );

		const listbox = await findByRole( 'listbox', { name: /Date range presets/i } );
		await userEvent.click( within( listbox ).getByRole( 'option', { name: /last 90 days/i } ) );

		// 89 days back from Aug 25 2025 → May 28 2025 (inclusive 90 days)
		const updated = await findByRole( 'button', {
			name: /Date range:.*May 28, 2025.*Aug 25, 2025/i,
		} );
		expect( updated ).toBeVisible();
	} );

	test( 'blank timezoneString with non-zero gmtOffset normalizes and selects correctly', async () => {
		const { getByRole, findByRole } = renderDateRangePicker( {
			timezoneString: '',
			gmtOffset: -5,
		} );
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
			const { getByRole, findByRole } = renderDateRangePicker( {
				timezoneString: 'Invalid/Timezone',
				gmtOffset: 0,
			} );
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
