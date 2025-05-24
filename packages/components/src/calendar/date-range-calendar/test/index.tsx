/**
 * @jest-environment jsdom
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	startOfDay,
	startOfWeek,
	startOfMonth,
	endOfWeek,
	addDays,
	subDays,
	addWeeks,
	addMonths,
	subMonths,
	subYears,
	addHours,
} from 'date-fns';
import { ar } from 'date-fns/locale';
import { useState, default as React } from 'react';
import '@testing-library/jest-dom';
import { DateCalendar, TZDate } from '../../';
import {
	getDateButton,
	getDateCell,
	queryDateCell,
	monthNameFormatter,
} from '../../utils/test-utils';
import type { DateCalendarProps } from '../../types';

const UncontrolledDateCalendar = (
	props: DateCalendarProps & {
		initialSelected?: Date | undefined | null;
		initialMonth?: Date | undefined;
	}
) => {
	return (
		<DateCalendar
			{ ...props }
			defaultSelected={ props.initialSelected ?? undefined }
			defaultMonth={ props.initialMonth }
		/>
	);
};

const ControlledDateCalendar = (
	props: DateCalendarProps & {
		initialSelected?: Date | undefined | null;
		initialMonth?: Date | undefined;
	}
) => {
	const [ selected, setSelected ] = useState< Date | undefined | null >( props.initialSelected );
	const [ month, setMonth ] = useState< Date | undefined >( props.initialMonth );
	return (
		<DateCalendar
			{ ...props }
			selected={ selected ?? null }
			onSelect={ ( ...args ) => {
				setSelected( args[ 0 ] );
				props.onSelect?.( ...args );
			} }
			month={ month }
			onMonthChange={ ( month ) => {
				setMonth( month );
				props.onMonthChange?.( month );
			} }
		/>
	);
};

function setupUserEvent() {
	// The `advanceTimersByTime` is needed since we're using jest
	// fake timers to simulate a fixed date for tests.
	return userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
}

describe( 'DateCalendar', () => {
	let today;
	let tomorrow;
	let yesterday;
	let currentMonth;
	let nextMonth;
	let nextNextMonth;
	let prevMonth;
	let prevPrevMonth;

	beforeAll( () => {
		jest.useFakeTimers();
		// For consistent tests, set the system time to a fixed date:
		// Thursday, May 15, 2025, 20:00 UTC
		jest.setSystemTime( 1747339200000 );

		today = startOfDay( new Date() );
		tomorrow = addDays( today, 1 );
		yesterday = subDays( today, 1 );
		currentMonth = startOfMonth( today );
		nextMonth = startOfMonth( addMonths( today, 1 ) );
		nextNextMonth = startOfMonth( addMonths( today, 2 ) );
		prevMonth = startOfMonth( subMonths( today, 1 ) );
		prevPrevMonth = startOfMonth( subMonths( today, 2 ) );
	} );

	afterAll( () => {
		jest.useRealTimers();
	} );

	describe( 'Semantics and basic behavior', () => {
		it( 'should apply the correct roles, semantics and attributes', async () => {
			render( <DateCalendar /> );

			expect( screen.getByRole( 'application', { name: 'Date calendar' } ) ).toBeVisible();

			const tableGrid = screen.getByRole( 'grid', {
				name: monthNameFormatter( 'en-US' ).format( today ),
			} );
			expect( tableGrid ).toBeVisible();
			expect( tableGrid ).toHaveAttribute( 'aria-multiselectable', 'false' );

			const todayButton = getDateButton( today );
			expect( todayButton ).toBeVisible();
			expect( todayButton ).toHaveAccessibleName( /today/i );
		} );

		it( 'should show multiple months at once via the `numberOfMonths` prop', () => {
			render( <DateCalendar numberOfMonths={ 2 } /> );

			const grids = screen.getAllByRole( 'grid' );
			expect( grids ).toHaveLength( 2 );
			expect( grids[ 0 ] ).toHaveAccessibleName( monthNameFormatter( 'en-US' ).format( today ) );
			expect( grids[ 1 ] ).toHaveAccessibleName(
				monthNameFormatter( 'en-US' ).format( nextMonth )
			);
		} );
	} );

	describe( 'Date selection', () => {
		it( 'should select an initial date in uncontrolled mode via the `defaultSelected` prop', () => {
			render( <DateCalendar defaultSelected={ today } /> );

			expect( getDateCell( today, { selected: true } ) ).toBeVisible();

			const todayButton = getDateButton( today );
			expect( todayButton ).toBeVisible();
			expect( todayButton ).toHaveAccessibleName( /selected/i );
		} );

		it( 'should select an initial date in controlled mode via the `selected` prop', () => {
			// Note: the `defaultSelected` prop is ignored when the `selected` prop is set.
			render( <DateCalendar defaultSelected={ tomorrow } selected={ today } /> );

			expect( getDateCell( today, { selected: true } ) ).toBeVisible();

			const todayButton = getDateButton( today );
			expect( todayButton ).toBeVisible();
			expect( todayButton ).toHaveAccessibleName( /selected/i );
		} );

		it( 'should have no date selected in uncontrolled mode when the `selected` and `defaultSelected` props are set to `undefined`', () => {
			render( <DateCalendar /> );

			expect( screen.queryByRole( 'gridcell', { selected: true } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /selected/i } ) ).not.toBeInTheDocument();
		} );

		it( 'should have no date selected in controlled mode when the `selected` prop is set to `null`', () => {
			// Note: the `defaultSelected` prop is ignored when the `selected` prop is set.
			render( <DateCalendar defaultSelected={ tomorrow } selected={ null } /> );

			expect( screen.queryByRole( 'gridcell', { selected: true } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /selected/i } ) ).not.toBeInTheDocument();
		} );

		it( 'should select a date in uncontrolled mode via the `defaultSelected` prop even if the date is disabled`', () => {
			render( <DateCalendar defaultSelected={ tomorrow } disabled={ tomorrow } /> );

			expect( getDateCell( tomorrow, { selected: true } ) ).toBeVisible();

			const tomorrowButton = getDateButton( tomorrow );
			expect( tomorrowButton ).toBeVisible();
			expect( tomorrowButton ).toHaveAccessibleName( /selected/i );
			expect( tomorrowButton ).toBeDisabled();
		} );

		it( 'should select a date in controlled mode via the `selected` prop even if the date is disabled`', () => {
			render( <DateCalendar selected={ tomorrow } disabled={ tomorrow } /> );

			expect( getDateCell( tomorrow, { selected: true } ) ).toBeVisible();

			const tomorrowButton = getDateButton( tomorrow );
			expect( tomorrowButton ).toBeVisible();
			expect( tomorrowButton ).toHaveAccessibleName( /selected/i );
			expect( tomorrowButton ).toBeDisabled();
		} );

		describe.each( [
			[ 'Uncontrolled', UncontrolledDateCalendar ],
			[ 'Controlled', ControlledDateCalendar ],
		] )( '[`%s`]', ( _mode, Component ) => {
			it( 'should select a date when a date button is clicked', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component onSelect={ onSelect } /> );

				const todayButton = getDateButton( today );
				await user.click( todayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenCalledWith(
					today,
					today,
					expect.objectContaining( { today: true } ),
					expect.objectContaining( { type: 'click', target: todayButton } )
				);

				expect( getDateCell( today, { selected: true } ) ).toBeVisible();
			} );

			it( 'should not select a disabled date when a date button is clicked', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component onSelect={ onSelect } disabled={ tomorrow } /> );

				await user.click( getDateButton( tomorrow ) );

				expect( onSelect ).not.toHaveBeenCalled();
				expect( screen.queryByRole( 'button', { name: /selected/i } ) ).not.toBeInTheDocument();
			} );

			it( 'should select a new date when a different date button is clicked', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component initialSelected={ today } onSelect={ onSelect } /> );

				const tomorrowButton = getDateButton( tomorrow );
				await user.click( tomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenCalledWith(
					tomorrow,
					tomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: tomorrowButton } )
				);

				expect( getDateCell( tomorrow, { selected: true } ) ).toBeVisible();
			} );

			it( 'should de-select the selected date when the selected date button is clicked', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component initialSelected={ today } onSelect={ onSelect } /> );

				const todayButton = getDateButton( today );
				await user.click( todayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenCalledWith(
					undefined,
					today,
					expect.objectContaining( { today: true, selected: true } ),
					expect.objectContaining( { type: 'click', target: todayButton } )
				);

				expect( queryDateCell( today, { selected: true } ) ).not.toBeInTheDocument();
			} );

			it( 'should not de-select the selected date when the selected date button is clicked if the `required` prop is set to `true`', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component initialSelected={ today } onSelect={ onSelect } required /> );

				const todayButton = getDateButton( today );
				await user.click( todayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenCalledWith(
					today,
					today,
					expect.objectContaining( { today: true, selected: true } ),
					expect.objectContaining( { type: 'click', target: todayButton } )
				);
				expect( queryDateCell( today, { selected: true } ) ).toBeVisible();
			} );
		} );
	} );

	describe( 'Month navigation', () => {
		it( 'should select an initial month in uncontrolled mode via the `defaultMonth` prop', () => {
			render( <DateCalendar defaultMonth={ nextMonth } /> );

			expect(
				screen.getByRole( 'grid', { name: monthNameFormatter( 'en-US' ).format( nextMonth ) } )
			).toBeVisible();
			expect( getDateCell( nextMonth ) ).toBeVisible();
			expect( getDateButton( nextMonth ) ).toBeVisible();
		} );

		it( 'should select an initial month in controlled mode via the `month` prop', () => {
			render( <DateCalendar month={ nextMonth } /> );

			expect(
				screen.getByRole( 'grid', { name: monthNameFormatter( 'en-US' ).format( nextMonth ) } )
			).toBeVisible();
			expect( getDateCell( nextMonth ) ).toBeVisible();
			expect( getDateButton( nextMonth ) ).toBeVisible();
		} );

		describe.each( [
			[ 'Uncontrolled', UncontrolledDateCalendar ],
			[ 'Controlled', ControlledDateCalendar ],
		] )( '[`%s`]', ( _mode, Component ) => {
			it( 'should navigate to the previous and next months when the previous and next month buttons are clicked', async () => {
				const user = setupUserEvent();
				const onMonthChange = jest.fn();

				render( <Component onMonthChange={ onMonthChange } /> );

				const prevButton = screen.getByRole( 'button', { name: /previous month/i } );
				const nextButton = screen.getByRole( 'button', { name: /next month/i } );
				await user.click( prevButton );

				expect( onMonthChange ).toHaveBeenCalledTimes( 1 );
				expect( onMonthChange ).toHaveBeenCalledWith( prevMonth );

				expect(
					screen.getByRole( 'grid', { name: monthNameFormatter( 'en-US' ).format( prevMonth ) } )
				).toBeVisible();
				expect( getDateCell( prevMonth ) ).toBeVisible();
				expect( getDateButton( prevMonth ) ).toBeVisible();

				await user.click( nextButton );

				expect( onMonthChange ).toHaveBeenCalledTimes( 2 );
				expect( onMonthChange ).toHaveBeenCalledWith( currentMonth );

				expect(
					screen.getByRole( 'grid', { name: monthNameFormatter( 'en-US' ).format( currentMonth ) } )
				).toBeVisible();
				expect( getDateCell( currentMonth ) ).toBeVisible();
				expect( getDateButton( currentMonth ) ).toBeVisible();

				await user.click( nextButton );

				expect( onMonthChange ).toHaveBeenCalledTimes( 3 );
				expect( onMonthChange ).toHaveBeenCalledWith( nextMonth );

				expect(
					screen.getByRole( 'grid', { name: monthNameFormatter( 'en-US' ).format( nextMonth ) } )
				).toBeVisible();
				expect( getDateCell( nextMonth ) ).toBeVisible();
				expect( getDateButton( nextMonth ) ).toBeVisible();
			} );

			it( 'should not navigate to a month that is before the `startMonth` prop', async () => {
				const user = setupUserEvent();
				const onMonthChange = jest.fn();

				render( <Component startMonth={ nextMonth } onMonthChange={ onMonthChange } /> );

				const prevButton = screen.getByRole( 'button', { name: /previous month/i } );
				const nextButton = screen.getByRole( 'button', { name: /next month/i } );

				expect(
					screen.getByRole( 'grid', { name: monthNameFormatter( 'en-US' ).format( nextMonth ) } )
				).toBeVisible();
				expect( getDateCell( nextMonth ) ).toBeVisible();
				expect( getDateButton( nextMonth ) ).toBeVisible();

				expect( prevButton ).toHaveAttribute( 'aria-disabled', 'true' );

				await user.click( prevButton );

				expect( onMonthChange ).not.toHaveBeenCalled();

				await user.click( nextButton );

				expect( onMonthChange ).toHaveBeenCalledTimes( 1 );
				expect( onMonthChange ).toHaveBeenCalledWith( nextNextMonth );

				expect(
					screen.getByRole( 'grid', {
						name: monthNameFormatter( 'en-US' ).format( nextNextMonth ),
					} )
				).toBeVisible();
				expect( getDateCell( nextNextMonth ) ).toBeVisible();
				expect( getDateButton( nextNextMonth ) ).toBeVisible();

				expect( prevButton ).not.toHaveAttribute( 'aria-disabled' );
			} );

			it( 'should not navigate to a month that is after the `endMonth` prop', async () => {
				const user = setupUserEvent();
				const onMonthChange = jest.fn();

				render( <Component endMonth={ prevMonth } onMonthChange={ onMonthChange } /> );

				const prevButton = screen.getByRole( 'button', { name: /previous month/i } );
				const nextButton = screen.getByRole( 'button', { name: /next month/i } );

				expect(
					screen.getByRole( 'grid', { name: monthNameFormatter( 'en-US' ).format( prevMonth ) } )
				).toBeVisible();
				expect( getDateCell( prevMonth ) ).toBeVisible();
				expect( getDateButton( prevMonth ) ).toBeVisible();

				expect( nextButton ).toHaveAttribute( 'aria-disabled', 'true' );

				await user.click( nextButton );

				expect( onMonthChange ).not.toHaveBeenCalled();

				await user.click( prevButton );

				expect( onMonthChange ).toHaveBeenCalledTimes( 1 );
				expect( onMonthChange ).toHaveBeenCalledWith( prevPrevMonth );

				expect(
					screen.getByRole( 'grid', {
						name: monthNameFormatter( 'en-US' ).format( prevPrevMonth ),
					} )
				).toBeVisible();
				expect( getDateCell( prevPrevMonth ) ).toBeVisible();
				expect( getDateButton( prevPrevMonth ) ).toBeVisible();

				expect( nextButton ).not.toHaveAttribute( 'aria-disabled' );
			} );
		} );
	} );

	describe( 'Keyboard focus and navigation', () => {
		it( 'should auto-focus the selected day when the `autoFocus` prop is set to `true`', async () => {
			// eslint-disable-next-line jsx-a11y/no-autofocus
			render( <DateCalendar autoFocus defaultSelected={ tomorrow } /> );
			expect( getDateButton( tomorrow ) ).toHaveFocus();
		} );

		it( "should auto-focus today's date if there is not selected date when the `autoFocus` prop is set to `true`", async () => {
			// eslint-disable-next-line jsx-a11y/no-autofocus
			render( <DateCalendar autoFocus /> );
			expect( getDateButton( today ) ).toHaveFocus();
		} );

		it( 'should focus each arrow as a tab stop, but treat the grid as a 2d composite widget', async () => {
			const user = setupUserEvent();
			render( <DateCalendar /> );

			// Focus previous month button
			await user.tab();
			expect( screen.getByRole( 'button', { name: /previous month/i } ) ).toHaveFocus();

			// Focus next month button
			await user.tab();
			expect( screen.getByRole( 'button', { name: /next month/i } ) ).toHaveFocus();

			// Focus today button
			await user.tab();
			expect( getDateButton( today ) ).toHaveFocus();

			// Focus next day
			await user.keyboard( '{ArrowRight}' );
			expect( getDateButton( addDays( today, 1 ) ) ).toHaveFocus();

			// Focus to next week
			await user.keyboard( '{ArrowDown}' );
			expect( getDateButton( addDays( today, 8 ) ) ).toHaveFocus();

			// Focus previous day
			await user.keyboard( '{ArrowLeft}' );
			expect( getDateButton( addDays( today, 7 ) ) ).toHaveFocus();

			// Focus previous week
			await user.keyboard( '{ArrowUp}' );
			expect( getDateButton( today ) ).toHaveFocus();

			// Focus first day of week
			await user.keyboard( '{Home}' );
			expect( getDateButton( startOfWeek( today ) ) ).toHaveFocus();

			// Focus last day of week
			await user.keyboard( '{End}' );
			expect( getDateButton( endOfWeek( today ) ) ).toHaveFocus();

			// Focus previous month
			await user.keyboard( '{PageUp}' );
			expect( getDateButton( subMonths( endOfWeek( today ), 1 ) ) ).toHaveFocus();

			expect(
				screen.getByRole( 'grid', {
					name: monthNameFormatter( 'en-US' ).format( subMonths( endOfWeek( today ), 1 ) ),
				} )
			).toBeVisible();

			// Navigate to next month
			await user.keyboard( '{PageDown}' );
			expect( getDateButton( endOfWeek( today ) ) ).toHaveFocus();
			expect(
				screen.getByRole( 'grid', {
					name: monthNameFormatter( 'en-US' ).format( endOfWeek( today ) ),
				} )
			).toBeVisible();

			// Focus previous year
			await user.keyboard( '{Shift>}{PageUp}{/Shift}' );
			expect( getDateButton( subYears( endOfWeek( today ), 1 ) ) ).toHaveFocus();

			expect(
				screen.getByRole( 'grid', {
					name: monthNameFormatter( 'en-US' ).format( subYears( endOfWeek( today ), 1 ) ),
				} )
			).toBeVisible();

			// Focus next year
			await user.keyboard( '{Shift>}{PageDown}{/Shift}' );
			expect( getDateButton( endOfWeek( today ) ) ).toHaveFocus();

			expect(
				screen.getByRole( 'grid', {
					name: monthNameFormatter( 'en-US' ).format( endOfWeek( today ) ),
				} )
			).toBeVisible();
		} );

		// Note: the following test is not testing advanced keyboard interactions
		// (pageUp, pageDown, shift+pageUp, shift+pageDown, home, end)
		it( 'should not focus disabled dates and skip over them when navigating using arrow keys', async () => {
			const user = setupUserEvent();

			render(
				<DateCalendar
					disabled={ [
						tomorrow,
						addWeeks( addDays( tomorrow, 1 ), 1 ),
						addWeeks( today, 2 ),
						addWeeks( tomorrow, 2 ),
					] }
				/>
			);

			await user.tab();
			await user.tab();
			await user.tab();
			expect( getDateButton( today ) ).toHaveFocus();

			await user.keyboard( '{ArrowRight}' );
			expect( getDateButton( addDays( tomorrow, 1 ) ) ).toHaveFocus();

			await user.keyboard( '{ArrowDown}' );
			expect( getDateButton( addWeeks( addDays( tomorrow, 1 ), 2 ) ) ).toHaveFocus();

			await user.keyboard( '{ArrowLeft}' );
			expect( getDateButton( addWeeks( yesterday, 2 ) ) ).toHaveFocus();

			await user.keyboard( '{ArrowUp}' );
			expect( getDateButton( addWeeks( yesterday, 1 ) ) ).toHaveFocus();
		} );

		it( 'should focus the selected date when tabbing into the calendar', async () => {
			const user = setupUserEvent();
			render( <DateCalendar selected={ tomorrow } /> );

			// Tab to the calendar grid
			await user.tab();
			await user.tab();
			await user.tab();

			expect( getDateButton( tomorrow ) ).toHaveFocus();
		} );
	} );

	describe( 'Disabled states', () => {
		it( 'should support disabling all dates via the `disabled` prop', async () => {
			const user = setupUserEvent();

			render( <DateCalendar disabled /> );

			within( screen.getByRole( 'grid' ) )
				.getAllByRole( 'button' )
				.forEach( ( button ) => {
					expect( button ).toBeDisabled();
				} );

			await user.click( screen.getByRole( 'button', { name: /previous/i } ) );

			within( screen.getByRole( 'grid' ) )
				.getAllByRole( 'button' )
				.forEach( ( button ) => {
					expect( button ).toBeDisabled();
				} );

			await user.click( screen.getByRole( 'button', { name: /next/i } ) );
			await user.click( screen.getByRole( 'button', { name: /next/i } ) );

			within( screen.getByRole( 'grid' ) )
				.getAllByRole( 'button' )
				.forEach( ( button ) => {
					expect( button ).toBeDisabled();
				} );
		} );

		it( 'should support disabling single dates via the `disabled` prop', async () => {
			render( <DateCalendar disabled={ tomorrow } /> );

			expect( getDateButton( tomorrow ) ).toBeDisabled();
		} );

		it( 'should support passing a custom function via the `disabled` prop', async () => {
			const primeNumbers = [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31 ];
			render( <DateCalendar disabled={ ( date ) => primeNumbers.includes( date.getDate() ) } /> );

			for ( const date of primeNumbers ) {
				expect(
					getDateButton( new Date( today.getFullYear(), today.getMonth(), date ) )
				).toBeDisabled();
			}
		} );

		it( 'should support disabling all dates before a certain date via the `disabled` prop', async () => {
			render( <DateCalendar disabled={ { before: today } } /> );

			for ( let date = 1; date < today.getDate(); date++ ) {
				expect(
					getDateButton( new Date( today.getFullYear(), today.getMonth(), date ) )
				).toBeDisabled();
			}
			expect( getDateButton( today ) ).not.toBeDisabled();
		} );

		it( 'should support disabling all dates after a certain date via the `disabled` prop', async () => {
			render( <DateCalendar disabled={ { after: today } } /> );

			for ( let date = today.getDate() + 1; date < 32; date++ ) {
				expect(
					getDateButton( new Date( today.getFullYear(), today.getMonth(), date ) )
				).toBeDisabled();
			}
			expect( getDateButton( today ) ).not.toBeDisabled();
		} );

		it( 'should support disabling all dates before a certain date and after a certain date via the `disabled` prop', async () => {
			render( <DateCalendar disabled={ { before: yesterday, after: addDays( today, 1 ) } } /> );

			let date;

			for ( date = 1; date < today.getDate() - 1; date++ ) {
				expect(
					getDateButton( new Date( today.getFullYear(), today.getMonth(), date ) )
				).toBeDisabled();
			}
			expect( getDateButton( yesterday ) ).not.toBeDisabled();
			expect( getDateButton( today ) ).not.toBeDisabled();
			expect( getDateButton( addDays( today, 1 ) ) ).not.toBeDisabled();

			for ( date = today.getDate() + 2; date < 32; date++ ) {
				expect(
					getDateButton( new Date( today.getFullYear(), today.getMonth(), date ) )
				).toBeDisabled();
			}
		} );

		it( 'should support disabling all dates within a certain date range via the `disabled` prop', async () => {
			render( <DateCalendar disabled={ { from: yesterday, to: addDays( today, 1 ) } } /> );

			let date;

			for ( date = 1; date < today.getDate() - 1; date++ ) {
				expect(
					getDateButton( new Date( today.getFullYear(), today.getMonth(), date ) )
				).not.toBeDisabled();
			}
			expect( getDateButton( yesterday ) ).toBeDisabled();
			expect( getDateButton( today ) ).toBeDisabled();
			expect( getDateButton( addDays( today, 1 ) ) ).toBeDisabled();

			for ( date = today.getDate() + 2; date < 32; date++ ) {
				expect(
					getDateButton( new Date( today.getFullYear(), today.getMonth(), date ) )
				).not.toBeDisabled();
			}
		} );

		it( 'should support disabling specific days of the week via the `disabled` prop', async () => {
			const weekendsInMay = [ 3, 4, 10, 11, 17, 18, 24, 25, 31 ];
			render( <DateCalendar disabled={ { dayOfWeek: [ 0, 6 ] } } /> );

			for ( const date of weekendsInMay ) {
				expect(
					getDateButton( new Date( today.getFullYear(), today.getMonth(), date ) )
				).toBeDisabled();
			}
		} );

		it( 'should disable the previous and next months buttons if the `disableNavigation` is set to `true`', async () => {
			const user = setupUserEvent();

			render( <DateCalendar disableNavigation /> );

			expect( screen.getByRole( 'button', { name: /previous month/i } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			);
			expect( screen.getByRole( 'button', { name: /next month/i } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			);

			await user.tab();
			expect( screen.getByRole( 'button', { name: /today/i } ) ).toHaveFocus();
		} );
	} );

	// Note: we're not testing localization of strings. We're only testing
	// that the date formatting, computed dir, and calendar format are correct.
	describe( 'Localization', () => {
		it( 'should localize the calendar based on the `locale` prop', async () => {
			const user = setupUserEvent();

			render( <DateCalendar locale={ ar } /> );

			// Check computed writing direction
			expect( screen.getByRole( 'application', { name: 'Date calendar' } ) ).toHaveAttribute(
				'dir',
				'rtl'
			);

			// Check month name
			const grid = screen.getByRole( 'grid', {
				name: monthNameFormatter( 'ar' ).format( today ),
			} );
			expect( grid ).toBeVisible();

			// Check today button
			expect( getDateButton( today, {}, 'ar' ) ).toHaveAccessibleName( /today/i );

			await user.tab();
			await user.tab();
			await user.tab();
			expect( getDateButton( today, {}, 'ar' ) ).toHaveFocus();

			await user.keyboard( '{Home}' );
			expect( getDateButton( startOfWeek( today, { locale: ar } ), {}, 'ar' ) ).toHaveFocus();
		} );

		it( 'should support timezones according to the `timeZone` prop', async () => {
			const user = setupUserEvent();
			const onSelect = jest.fn();

			render( <DateCalendar timeZone="Asia/Tokyo" onSelect={ onSelect } /> );

			// For someone in Tokyo, the current time simulated in the test
			// (ie. 20:00 UTC) is the next day.
			expect( getDateButton( tomorrow ) ).toHaveAccessibleName( /today/i );

			// Select tomorrow's button (which is today in Tokyo)
			const tomorrowButton = getDateButton( tomorrow );
			await user.click( tomorrowButton );

			const tomorrowFromTokyoTimezone = addHours(
				tomorrow,
				new TZDate( tomorrow, 'Asia/Tokyo' ).getTimezoneOffset() / 60
			);

			expect( onSelect ).toHaveBeenCalledWith(
				tomorrowFromTokyoTimezone,
				tomorrowFromTokyoTimezone,
				expect.objectContaining( { today: true } ),
				expect.objectContaining( { type: 'click', target: tomorrowButton } )
			);
		} );

		it( 'should handle timezoned dates and convert them to the calendar timezone', async () => {
			// Still the same time from UTC's POV, just expressed in Tokyo time.
			const tomorrowAtMidnightInTokyo = new TZDate( tomorrow, 'Asia/Tokyo' );

			render( <DateCalendar defaultSelected={ tomorrowAtMidnightInTokyo } timeZone="-02:00" /> );

			// Changing the calendar timezone to UTC-2 makes the dates become
			// earlier by 1 day (from midnight to 10pm the previous day).
			expect( getDateCell( today, { selected: true } ) ).toBeVisible();
		} );
	} );
} );
