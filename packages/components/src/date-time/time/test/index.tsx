/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Internal dependencies
 */
import TimePicker from '..';

describe( 'TimePicker', () => {
	it( 'should call onChange with updated date values', async () => {
		const user = userEvent.setup();

		const onChangeSpy = jest.fn();

		render(
			<TimePicker
				currentTime="1986-10-18T11:00:00"
				onChange={ onChangeSpy }
				is12Hour
			/>
		);

		const monthInput = screen.getByLabelText( 'Month' );
		const dayInput = screen.getByLabelText( 'Day' );
		const yearInput = screen.getByLabelText( 'Year' );
		const hoursInput = screen.getByLabelText( 'Hours' );
		const minutesInput = screen.getByLabelText( 'Minutes' );

		await user.selectOptions( monthInput, '12' );
		await user.keyboard( '{Tab}' );

		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-12-18T11:00:00' );
		onChangeSpy.mockClear();

		await user.clear( dayInput );
		await user.type( dayInput, '22' );
		await user.keyboard( '{Tab}' );

		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-12-22T11:00:00' );
		onChangeSpy.mockClear();

		await user.clear( yearInput );
		await user.type( yearInput, '2018' );
		await user.keyboard( '{Tab}' );

		expect( onChangeSpy ).toHaveBeenCalledWith( '2018-12-22T11:00:00' );
		onChangeSpy.mockClear();

		await user.clear( hoursInput );
		await user.type( hoursInput, '12' );
		await user.keyboard( '{Tab}' );

		expect( onChangeSpy ).toHaveBeenCalledWith( '2018-12-22T00:00:00' );
		onChangeSpy.mockClear();

		await user.clear( minutesInput );
		await user.type( minutesInput, '35' );
		await user.keyboard( '{Tab}' );

		expect( onChangeSpy ).toHaveBeenCalledWith( '2018-12-22T00:35:00' );
		onChangeSpy.mockClear();
	} );

	it( 'should call onChange with an updated hour (12-hour clock)', async () => {
		const user = userEvent.setup();

		const onChangeSpy = jest.fn();

		render(
			<TimePicker
				currentTime="1986-10-18T11:00:00"
				onChange={ onChangeSpy }
				is12Hour
			/>
		);

		const hoursInput = screen.getByLabelText( 'Hours' );

		await user.clear( hoursInput );
		await user.type( hoursInput, '10' );
		await user.keyboard( '{Tab}' );

		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-10-18T10:00:00' );
	} );

	it( 'should call onChange with a bounded hour (12-hour clock) if the hour is out of bounds', async () => {
		const user = userEvent.setup();

		const onChangeSpy = jest.fn();

		render(
			<TimePicker
				currentTime="1986-10-18T11:00:00"
				onChange={ onChangeSpy }
				is12Hour
			/>
		);

		const hoursInput = screen.getByLabelText( 'Hours' );

		await user.clear( hoursInput );
		await user.type( hoursInput, '22' );
		await user.keyboard( '{Tab}' );

		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-10-18T00:00:00' );
	} );

	it( 'should call onChange with an updated hour (24-hour clock)', async () => {
		const user = userEvent.setup();

		const onChangeSpy = jest.fn();

		render(
			<TimePicker
				currentTime="1986-10-18T11:00:00"
				onChange={ onChangeSpy }
				is12Hour={ false }
			/>
		);

		const hoursInput = screen.getByLabelText( 'Hours' );

		await user.clear( hoursInput );
		await user.type( hoursInput, '22' );
		await user.keyboard( '{Tab}' );

		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-10-18T22:00:00' );
	} );

	it( 'should call onChange with a bounded minute if out of bounds', async () => {
		const user = userEvent.setup();

		const onChangeSpy = jest.fn();

		render(
			<TimePicker
				currentTime="1986-10-18T11:00:00"
				onChange={ onChangeSpy }
				is12Hour
			/>
		);

		const minutesInput = screen.getByLabelText( 'Minutes' );

		await user.clear( minutesInput );
		await user.type( minutesInput, '99' );
		await user.keyboard( '{Tab}' );

		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-10-18T11:59:00' );
	} );

	it( 'should switch to PM correctly', async () => {
		const user = userEvent.setup();

		const onChangeSpy = jest.fn();

		render(
			<TimePicker
				currentTime="1986-10-18T11:00:00"
				onChange={ onChangeSpy }
				is12Hour
			/>
		);

		const pmButton = screen.getByText( 'PM' );

		await user.click( pmButton );

		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-10-18T23:00:00' );
	} );

	it( 'should switch to AM correctly', async () => {
		const user = userEvent.setup();

		const onChangeSpy = jest.fn();

		render(
			<TimePicker
				currentTime="1986-10-18T23:00:00"
				onChange={ onChangeSpy }
				is12Hour
			/>
		);

		const amButton = screen.getByText( 'AM' );

		await user.click( amButton );

		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-10-18T11:00:00' );
	} );

	it( 'should allow to set the time correctly when the PM period is selected', async () => {
		const user = userEvent.setup();

		const onChangeSpy = jest.fn();

		render(
			<TimePicker
				currentTime="1986-10-18T11:00:00"
				onChange={ onChangeSpy }
				is12Hour
			/>
		);

		const pmButton = screen.getByText( 'PM' );
		await user.click( pmButton );

		const hoursInput = screen.getByLabelText( 'Hours' );
		await user.clear( hoursInput );
		await user.type( hoursInput, '6' );
		await user.keyboard( '{Tab}' );

		// When clicking on 'PM', we expect the time to be 11pm
		expect( onChangeSpy ).toHaveBeenNthCalledWith(
			1,
			'1986-10-18T23:00:00'
		);
		// When changing the hours to '6', we expect the time to be 6pm
		expect( onChangeSpy ).toHaveBeenNthCalledWith(
			2,
			'1986-10-18T18:00:00'
		);
	} );

	it( 'should truncate at the minutes on change', async () => {
		const user = userEvent.setup();

		const onChangeSpy = jest.fn();

		render(
			<TimePicker
				currentTime="1986-10-18T23:12:35"
				onChange={ onChangeSpy }
				is12Hour
			/>
		);

		const minutesInput = screen.getByLabelText( 'Minutes' );

		await user.clear( minutesInput );
		await user.type( minutesInput, '22' );
		await user.keyboard( '{Tab}' );

		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-10-18T23:22:00' );
	} );

	it( 'should reset the date when currentTime changed', () => {
		const onChangeSpy = jest.fn();

		const { rerender } = render(
			<TimePicker
				currentTime="1986-10-18T11:00:00"
				onChange={ onChangeSpy }
				is12Hour
			/>
		);

		rerender(
			<TimePicker
				currentTime="2020-07-13T18:00:00"
				onChange={ onChangeSpy }
				is12Hour
			/>
		);

		expect(
			( screen.getByLabelText( 'Month' ) as HTMLInputElement ).value
		).toBe( '07' );
		expect(
			( screen.getByLabelText( 'Day' ) as HTMLInputElement ).value
		).toBe( '13' );
		expect(
			( screen.getByLabelText( 'Year' ) as HTMLInputElement ).value
		).toBe( '2020' );
		expect(
			( screen.getByLabelText( 'Hours' ) as HTMLInputElement ).value
		).toBe( '06' );
		expect(
			( screen.getByLabelText( 'Minutes' ) as HTMLInputElement ).value
		).toBe( '00' );

		expect( screen.getByRole( 'radio', { name: 'AM' } ) ).not.toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'PM' } ) ).toBeChecked();
	} );

	it( 'should have different layouts/orders for 12/24 hour formats', () => {
		const onChangeSpy = jest.fn();

		const { rerender } = render(
			<form aria-label="form">
				<TimePicker
					currentTime="1986-10-18T11:00:00"
					onChange={ onChangeSpy }
					is12Hour={ false }
				/>
			</form>
		);

		const form = screen.getByRole( 'form' ) as HTMLFormElement;

		let monthInputIndex = Array.from( form.elements ).indexOf(
			screen.getByLabelText( 'Month' )
		);
		let dayInputIndex = Array.from( form.elements ).indexOf(
			screen.getByLabelText( 'Day' )
		);

		expect( monthInputIndex > dayInputIndex ).toBe( true );

		rerender(
			<form aria-label="form">
				<TimePicker
					currentTime="1986-10-18T11:00:00"
					onChange={ onChangeSpy }
					is12Hour
				/>
			</form>
		);

		monthInputIndex = Array.from( form.elements ).indexOf(
			screen.getByLabelText( 'Month' )
		);
		dayInputIndex = Array.from( form.elements ).indexOf(
			screen.getByLabelText( 'Day' )
		);

		expect( monthInputIndex < dayInputIndex ).toBe( true );
	} );

	it( 'Should change layouts/orders when `dateOrder` prop is passed', () => {
		const onChangeSpy = jest.fn();

		render(
			<form aria-label="form">
				<TimePicker
					currentTime="1986-10-18T11:00:00"
					onChange={ onChangeSpy }
					dateOrder="ymd"
				/>
			</form>
		);

		const form = screen.getByRole( 'form' ) as HTMLFormElement;

		const yearInputIndex = Array.from( form.elements ).indexOf(
			screen.getByLabelText( 'Year' )
		);

		const monthInputIndex = Array.from( form.elements ).indexOf(
			screen.getByLabelText( 'Month' )
		);
		const dayInputIndex = Array.from( form.elements ).indexOf(
			screen.getByLabelText( 'Day' )
		);

		expect( monthInputIndex > yearInputIndex ).toBe( true );
		expect( dayInputIndex > monthInputIndex ).toBe( true );
	} );

	it( 'Should ignore `is12Hour` prop setting when `dateOrder` prop is explicitly passed', () => {
		const onChangeSpy = jest.fn();

		render(
			<form aria-label="form">
				<TimePicker
					currentTime="1986-10-18T11:00:00"
					onChange={ onChangeSpy }
					dateOrder="ymd"
					is12Hour
				/>
			</form>
		);

		const form = screen.getByRole( 'form' ) as HTMLFormElement;

		const yearInputIndex = Array.from( form.elements ).indexOf(
			screen.getByLabelText( 'Year' )
		);

		const monthInputIndex = Array.from( form.elements ).indexOf(
			screen.getByLabelText( 'Month' )
		);
		const dayInputIndex = Array.from( form.elements ).indexOf(
			screen.getByLabelText( 'Day' )
		);

		expect( monthInputIndex > yearInputIndex ).toBe( true );
		expect( dayInputIndex > monthInputIndex ).toBe( true );
	} );

	it( 'Should set a time when passed a null currentTime', () => {
		const onChangeSpy = jest.fn();

		render(
			<TimePicker
				currentTime={ null }
				onChange={ onChangeSpy }
				is12Hour
			/>
		);

		const monthInput = (
			screen.getByLabelText( 'Month' ) as HTMLInputElement
		 ).value;
		const dayInput = ( screen.getByLabelText( 'Day' ) as HTMLInputElement )
			.value;
		const yearInput = (
			screen.getByLabelText( 'Year' ) as HTMLInputElement
		 ).value;
		const hoursInput = (
			screen.getByLabelText( 'Hours' ) as HTMLInputElement
		 ).value;
		const minutesInput = (
			screen.getByLabelText( 'Minutes' ) as HTMLInputElement
		 ).value;

		expect( Number.isNaN( parseInt( monthInput, 10 ) ) ).toBe( false );
		expect( Number.isNaN( parseInt( dayInput, 10 ) ) ).toBe( false );
		expect( Number.isNaN( parseInt( yearInput, 10 ) ) ).toBe( false );
		expect( Number.isNaN( parseInt( hoursInput, 10 ) ) ).toBe( false );
		expect( Number.isNaN( parseInt( minutesInput, 10 ) ) ).toBe( false );
	} );
} );
