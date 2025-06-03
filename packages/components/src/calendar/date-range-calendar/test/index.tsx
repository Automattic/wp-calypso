/**
 * @jest-environment jsdom
 */

import { render, screen, within, renderHook } from '@testing-library/react';
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
import { usePreviewRange } from '../';
import { DateRangeCalendar, TZDate } from '../..';
import { getDateButton, getDateCell, monthNameFormatter } from '../../utils/test-utils';
import type { DateRange, DateRangeCalendarProps } from '../../types';

const UncontrolledDateRangeCalendar = (
	props: DateRangeCalendarProps & {
		initialSelected?: DateRange | undefined | null;
		initialMonth?: Date | undefined;
	}
) => {
	return (
		<DateRangeCalendar
			{ ...props }
			defaultSelected={ props.initialSelected ?? undefined }
			defaultMonth={ props.initialMonth }
		/>
	);
};

const ControlledDateRangeCalendar = (
	props: DateRangeCalendarProps & {
		initialSelected?: DateRange | undefined | null;
		initialMonth?: Date | undefined;
	}
) => {
	const [ selected, setSelected ] = useState< DateRange | undefined | null >(
		props.initialSelected
	);
	const [ month, setMonth ] = useState< Date | undefined >( props.initialMonth );
	return (
		<DateRangeCalendar
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

describe( 'DateRangeCalendar', () => {
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
			render( <DateRangeCalendar /> );

			expect( screen.getByRole( 'application', { name: 'Date range calendar' } ) ).toBeVisible();

			const tableGrid = screen.getByRole( 'grid', {
				name: monthNameFormatter( 'en-US' ).format( today ),
			} );
			expect( tableGrid ).toBeVisible();
			expect( tableGrid ).toHaveAttribute( 'aria-multiselectable', 'true' );

			const todayButton = getDateButton( today );
			expect( todayButton ).toBeVisible();
			expect( todayButton ).toHaveAccessibleName( /today/i );
		} );

		it( 'should show multiple months at once via the `numberOfMonths` prop', () => {
			render( <DateRangeCalendar numberOfMonths={ 2 } /> );

			const grids = screen.getAllByRole( 'grid' );
			expect( grids ).toHaveLength( 2 );
			expect( grids[ 0 ] ).toHaveAccessibleName( monthNameFormatter( 'en-US' ).format( today ) );
			expect( grids[ 1 ] ).toHaveAccessibleName(
				monthNameFormatter( 'en-US' ).format( nextMonth )
			);
		} );
	} );

	describe( 'Date selection', () => {
		it( 'should select an initial date range in uncontrolled mode via the `defaultSelected` prop', () => {
			const dateRange = { from: today, to: tomorrow };
			render( <DateRangeCalendar defaultSelected={ dateRange } /> );

			expect( getDateCell( today, { selected: true } ) ).toBeVisible();
			expect( getDateCell( tomorrow, { selected: true } ) ).toBeVisible();

			const todayButton = getDateButton( today );
			const tomorrowButton = getDateButton( tomorrow );
			expect( todayButton ).toBeVisible();
			expect( todayButton ).toHaveAccessibleName( /selected/i );
			expect( tomorrowButton ).toBeVisible();
			expect( tomorrowButton ).toHaveAccessibleName( /selected/i );
		} );

		it( 'should select an initial date range in controlled mode via the `selected` prop', () => {
			const defaultRange = { from: yesterday, to: today };
			const controlledRange = { from: today, to: tomorrow };

			// Note: the `defaultSelected` prop is ignored when the `selected` prop is set.
			render( <DateRangeCalendar defaultSelected={ defaultRange } selected={ controlledRange } /> );

			expect( getDateCell( today, { selected: true } ) ).toBeVisible();
			expect( getDateCell( tomorrow, { selected: true } ) ).toBeVisible();

			const todayButton = getDateButton( today );
			const tomorrowButton = getDateButton( tomorrow );
			expect( todayButton ).toBeVisible();
			expect( todayButton ).toHaveAccessibleName( /selected/i );
			expect( tomorrowButton ).toBeVisible();
			expect( tomorrowButton ).toHaveAccessibleName( /selected/i );
		} );

		it( 'should have no date selected in uncontrolled mode when the `selected` prop is set to `undefined`', () => {
			render( <DateRangeCalendar /> );

			expect( screen.queryByRole( 'gridcell', { selected: true } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /selected/i } ) ).not.toBeInTheDocument();
		} );

		it( 'should have no date selected in controlled mode when the `selected` prop is set to `null`', () => {
			const defaultRange = { from: today, to: tomorrow };

			// Note: the `defaultSelected` prop is ignored when the `selected` prop is set.
			render( <DateRangeCalendar defaultSelected={ defaultRange } selected={ null } /> );

			expect( screen.queryByRole( 'gridcell', { selected: true } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /selected/i } ) ).not.toBeInTheDocument();
		} );

		it( 'should select a date in uncontrolled mode via the `defaultSelected` prop even if the date is disabled`', () => {
			const defaultRange = { from: today, to: tomorrow };

			render( <DateRangeCalendar defaultSelected={ defaultRange } disabled={ defaultRange } /> );

			expect( getDateCell( today, { selected: true } ) ).toBeVisible();
			expect( getDateCell( tomorrow, { selected: true } ) ).toBeVisible();

			const todayButton = getDateButton( today );
			const tomorrowButton = getDateButton( tomorrow );
			expect( todayButton ).toBeVisible();
			expect( todayButton ).toBeDisabled();
			expect( todayButton ).toHaveAccessibleName( /selected/i );
			expect( tomorrowButton ).toBeVisible();
			expect( tomorrowButton ).toHaveAccessibleName( /selected/i );
			expect( tomorrowButton ).toBeDisabled();
		} );

		it( 'should select a date in controlled mode via the `selected` prop even if the date is disabled`', () => {
			const defaultRange = { from: today, to: tomorrow };

			render( <DateRangeCalendar selected={ defaultRange } disabled={ defaultRange } /> );

			expect( getDateCell( today, { selected: true } ) ).toBeVisible();
			expect( getDateCell( tomorrow, { selected: true } ) ).toBeVisible();

			const todayButton = getDateButton( today );
			const tomorrowButton = getDateButton( tomorrow );
			expect( todayButton ).toBeVisible();
			expect( todayButton ).toBeDisabled();
			expect( todayButton ).toHaveAccessibleName( /selected/i );
			expect( tomorrowButton ).toBeVisible();
			expect( tomorrowButton ).toHaveAccessibleName( /selected/i );
			expect( tomorrowButton ).toBeDisabled();
		} );

		describe.each( [
			[ 'Uncontrolled', UncontrolledDateRangeCalendar ],
			[ 'Controlled', ControlledDateRangeCalendar ],
		] )( '[`%s`]', ( _mode, Component ) => {
			it( 'should start selecting a range when a date button is clicked', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component onSelect={ onSelect } /> );

				const todayButton = getDateButton( today );
				await user.click( todayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenCalledWith(
					{ from: today, to: today },
					today,
					expect.objectContaining( { today: true } ),
					expect.objectContaining( { type: 'click', target: todayButton } )
				);

				expect( getDateCell( today, { selected: true } ) ).toBeVisible();
			} );

			it( 'should complete a range selection when a second date button is clicked', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component onSelect={ onSelect } /> );

				const todayButton = getDateButton( today );
				const tomorrowButton = getDateButton( tomorrow );

				// First click - start range
				await user.click( todayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenLastCalledWith(
					{ from: today, to: today },
					today,
					expect.objectContaining( { today: true } ),
					expect.objectContaining( { type: 'click', target: todayButton } )
				);

				// Second click - complete range
				await user.click( tomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 2 );
				expect( onSelect ).toHaveBeenLastCalledWith(
					{ from: today, to: tomorrow },
					tomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: tomorrowButton } )
				);

				expect( getDateCell( today, { selected: true } ) ).toBeVisible();
				expect( getDateCell( tomorrow, { selected: true } ) ).toBeVisible();
			} );

			it( 'should handle selecting dates in reverse order (end date first)', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component onSelect={ onSelect } /> );

				// First click on tomorrow
				const tomorrowButton = getDateButton( tomorrow );
				await user.click( tomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenCalledWith(
					{ from: tomorrow, to: tomorrow },
					tomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: tomorrowButton } )
				);

				// Second click on today (earlier date)
				const todayButton = getDateButton( today );
				await user.click( todayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 2 );
				expect( onSelect ).toHaveBeenNthCalledWith(
					2,
					{ from: today, to: tomorrow },
					today,
					expect.objectContaining( { today: true } ),
					expect.objectContaining( { type: 'click', target: todayButton } )
				);

				expect( getDateCell( today, { selected: true } ) ).toBeVisible();
				expect( getDateCell( tomorrow, { selected: true } ) ).toBeVisible();
			} );

			it( 'should expand the current range when clicking a third date after the existing range end', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component onSelect={ onSelect } /> );

				// First click - start range
				const todayButton = getDateButton( today );
				await user.click( todayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenCalledWith(
					{ from: today, to: today },
					today,
					expect.objectContaining( { today: true } ),
					expect.objectContaining( { type: 'click', target: todayButton } )
				);

				// Second click - complete range
				const tomorrowButton = getDateButton( tomorrow );
				await user.click( tomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 2 );
				expect( onSelect ).toHaveBeenNthCalledWith(
					2,
					{ from: today, to: tomorrow },
					tomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: tomorrowButton } )
				);

				// Third click - expand range end
				const dayAfterTomorrow = addDays( today, 2 );
				const dayAfterTomorrowButton = getDateButton( dayAfterTomorrow );
				await user.click( dayAfterTomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 3 );
				expect( onSelect ).toHaveBeenNthCalledWith(
					3,
					{ from: today, to: dayAfterTomorrow },
					dayAfterTomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: dayAfterTomorrowButton } )
				);
			} );

			it( 'should update the current range when clicking a third date in between the existing range start and end', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component onSelect={ onSelect } /> );

				// First click - start range
				const yesterdayButton = getDateButton( yesterday );
				await user.click( yesterdayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenCalledWith(
					{ from: yesterday, to: yesterday },
					yesterday,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: yesterdayButton } )
				);

				// Second click - complete range
				const dayAfterTomorrow = addDays( today, 2 );
				const dayAfterTomorrowButton = getDateButton( dayAfterTomorrow );
				await user.click( dayAfterTomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 2 );
				expect( onSelect ).toHaveBeenNthCalledWith(
					2,
					{ from: yesterday, to: dayAfterTomorrow },
					dayAfterTomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: dayAfterTomorrowButton } )
				);

				// Third click - change range end
				const todayButton = getDateButton( today );
				await user.click( todayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 3 );
				expect( onSelect ).toHaveBeenNthCalledWith(
					3,
					{ from: yesterday, to: today },
					today,
					expect.objectContaining( { today: true } ),
					expect.objectContaining( { type: 'click', target: todayButton } )
				);
			} );

			it( 'should expand the current range when clicking a third date before the existing range start', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component onSelect={ onSelect } /> );

				// First click - start range
				const todayButton = getDateButton( today );
				await user.click( todayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenCalledWith(
					{ from: today, to: today },
					today,
					expect.objectContaining( { today: true } ),
					expect.objectContaining( { type: 'click', target: todayButton } )
				);

				// Second click - complete range
				const tomorrowButton = getDateButton( tomorrow );
				await user.click( tomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 2 );
				expect( onSelect ).toHaveBeenNthCalledWith(
					2,
					{ from: today, to: tomorrow },
					tomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: tomorrowButton } )
				);

				// Third click - expand range start
				const yesterdayButton = getDateButton( yesterday );
				await user.click( yesterdayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 3 );
				expect( onSelect ).toHaveBeenNthCalledWith(
					3,
					{ from: yesterday, to: tomorrow },
					yesterday,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: yesterdayButton } )
				);
			} );

			it( 'should not select a disabled date when a date button is clicked', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component onSelect={ onSelect } disabled={ tomorrow } /> );

				const tomorrowButton = getDateButton( tomorrow );
				await user.click( tomorrowButton );

				expect( onSelect ).not.toHaveBeenCalled();
				expect( screen.queryByRole( 'button', { name: /selected/i } ) ).not.toBeInTheDocument();
			} );

			it( 'should clear the range when defining a one-day range and clicking on the same date again', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				const dayAfterTomorrow = addDays( today, 2 );

				render(
					<Component
						onSelect={ onSelect }
						initialSelected={ { from: yesterday, to: dayAfterTomorrow } }
					/>
				);

				// Third click - change range to have start and end on the same date
				const dayAfterTomorrowButton = getDateButton( dayAfterTomorrow );
				await user.click( dayAfterTomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenNthCalledWith(
					1,
					{ from: dayAfterTomorrow, to: dayAfterTomorrow },
					dayAfterTomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: dayAfterTomorrowButton } )
				);

				// Fourth click - remove date range
				await user.click( dayAfterTomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 2 );
				expect( onSelect ).toHaveBeenNthCalledWith(
					2,
					undefined,
					dayAfterTomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: dayAfterTomorrowButton } )
				);
			} );

			it( 'should not clear the range when clicking a selected date if the `required` prop is set to `true`', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				const dayAfterTomorrow = addDays( today, 2 );

				render(
					<Component
						onSelect={ onSelect }
						initialSelected={ { from: yesterday, to: dayAfterTomorrow } }
						required
					/>
				);

				// Third click - change range to have start and end on the same date
				const dayAfterTomorrowButton = getDateButton( dayAfterTomorrow );
				await user.click( dayAfterTomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenNthCalledWith(
					1,
					{ from: dayAfterTomorrow, to: dayAfterTomorrow },
					dayAfterTomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: dayAfterTomorrowButton } )
				);

				// Fourth click - doesn't remove date range
				await user.click( dayAfterTomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 2 );
				expect( onSelect ).toHaveBeenNthCalledWith(
					2,
					{ from: dayAfterTomorrow, to: dayAfterTomorrow },
					dayAfterTomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: dayAfterTomorrowButton } )
				);
			} );

			it( 'should complete a range selection even if there are disabled dates in the range', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component onSelect={ onSelect } disabled={ tomorrow } /> );

				const todayButton = getDateButton( today );

				// First click - start range
				await user.click( todayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenLastCalledWith(
					{ from: today, to: today },
					today,
					expect.objectContaining( { today: true } ),
					expect.objectContaining( { type: 'click', target: todayButton } )
				);

				// Second click - range "restarts" from newly clicked date, since
				// there was a disabled date in between
				const dayAfterTomorrow = addDays( today, 2 );
				const dayAfterTomorrowButton = getDateButton( dayAfterTomorrow );
				await user.click( dayAfterTomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 2 );
				expect( onSelect ).toHaveBeenLastCalledWith(
					{ from: today, to: dayAfterTomorrow },
					dayAfterTomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: dayAfterTomorrowButton } )
				);
			} );

			it( 'should not complete a range selection if the `excludeDisabled` prop is set to `true` and there is at least one disabled date in the range', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component onSelect={ onSelect } disabled={ tomorrow } excludeDisabled /> );

				const todayButton = getDateButton( today );

				// First click - start range
				await user.click( todayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenLastCalledWith(
					{ from: today, to: today },
					today,
					expect.objectContaining( { today: true } ),
					expect.objectContaining( { type: 'click', target: todayButton } )
				);

				// Second click - range "restarts" from newly clicked date, since
				// there was a disabled date in between
				const dayAfterTomorrow = addDays( today, 2 );
				const dayAfterTomorrowButton = getDateButton( dayAfterTomorrow );
				await user.click( dayAfterTomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 2 );
				expect( onSelect ).toHaveBeenLastCalledWith(
					{ from: dayAfterTomorrow, to: undefined },
					dayAfterTomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: dayAfterTomorrowButton } )
				);
			} );

			it( 'should not complete a range selection if the range has a duration of less than the value of the `min` prop', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component onSelect={ onSelect } min={ 3 } /> );

				const todayButton = getDateButton( today );

				// First click - start range
				await user.click( todayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenLastCalledWith(
					{ from: today, to: undefined },
					today,
					expect.objectContaining( { today: true } ),
					expect.objectContaining( { type: 'click', target: todayButton } )
				);

				// Second click - range "restarts" from newly clicked date, since
				// it was not long enough compared to the `min` prop
				const dayAfterTomorrow = addDays( today, 2 );
				const dayAfterTomorrowButton = getDateButton( dayAfterTomorrow );
				await user.click( dayAfterTomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 2 );
				expect( onSelect ).toHaveBeenLastCalledWith(
					{ from: dayAfterTomorrow, to: undefined },
					dayAfterTomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: dayAfterTomorrowButton } )
				);

				// Third click - range is correctly set, since it includes
				// at least 3 days
				const yesterdayButton = getDateButton( yesterday );
				await user.click( yesterdayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 3 );
				expect( onSelect ).toHaveBeenLastCalledWith(
					{ from: yesterday, to: dayAfterTomorrow },
					yesterday,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: yesterdayButton } )
				);
			} );

			it( 'should not complete a range selection if the range has a duration of more than the value of the `max` prop', async () => {
				const user = setupUserEvent();
				const onSelect = jest.fn();

				render( <Component onSelect={ onSelect } max={ 2 } /> );

				// First click - start range
				const yesterdayButton = getDateButton( yesterday );
				await user.click( yesterdayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 1 );
				expect( onSelect ).toHaveBeenLastCalledWith(
					{ from: yesterday, to: yesterday },
					yesterday,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: yesterdayButton } )
				);

				// Second click - range "restarts" from newly clicked date, since
				// it was too long compared to the `max` prop
				const dayAfterTomorrow = addDays( today, 2 );
				const dayAfterTomorrowButton = getDateButton( dayAfterTomorrow );
				await user.click( dayAfterTomorrowButton );

				expect( onSelect ).toHaveBeenCalledTimes( 2 );
				expect( onSelect ).toHaveBeenLastCalledWith(
					{ from: dayAfterTomorrow, to: undefined },
					dayAfterTomorrow,
					expect.objectContaining( { today: false } ),
					expect.objectContaining( { type: 'click', target: dayAfterTomorrowButton } )
				);

				// Third click - range is correctly set, since it includes
				// at most 2 days
				const todayButton = getDateButton( today );
				await user.click( todayButton );

				expect( onSelect ).toHaveBeenCalledTimes( 3 );
				expect( onSelect ).toHaveBeenLastCalledWith(
					{ from: today, to: dayAfterTomorrow },
					today,
					expect.objectContaining( { today: true } ),
					expect.objectContaining( { type: 'click', target: todayButton } )
				);
			} );
		} );
	} );

	describe( 'Month navigation', () => {
		it( 'should select an initial month in uncontrolled mode via the `defaultMonth` prop', () => {
			render( <DateRangeCalendar defaultMonth={ nextMonth } /> );

			expect(
				screen.getByRole( 'grid', { name: monthNameFormatter( 'en-US' ).format( nextMonth ) } )
			).toBeVisible();
			expect( getDateCell( nextMonth ) ).toBeVisible();
			expect( getDateButton( nextMonth ) ).toBeVisible();
		} );

		it( 'should select an initial month in controlled mode via the `month` prop', () => {
			render( <DateRangeCalendar month={ nextMonth } /> );

			expect(
				screen.getByRole( 'grid', { name: monthNameFormatter( 'en-US' ).format( nextMonth ) } )
			).toBeVisible();
			expect( getDateCell( nextMonth ) ).toBeVisible();
			expect( getDateButton( nextMonth ) ).toBeVisible();
		} );

		describe.each( [
			[ 'Uncontrolled', UncontrolledDateRangeCalendar ],
			[ 'Controlled', ControlledDateRangeCalendar ],
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
			render( <DateRangeCalendar autoFocus defaultSelected={ { from: today, to: tomorrow } } /> );
			expect( getDateButton( today ) ).toHaveFocus();
		} );

		it( "should auto-focus today's date if there is not selected date when the `autoFocus` prop is set to `true`", async () => {
			// eslint-disable-next-line jsx-a11y/no-autofocus
			render( <DateRangeCalendar autoFocus /> );
			expect( getDateButton( today ) ).toHaveFocus();
		} );

		it( 'should focus each arrow as a tab stop, but treat the grid as a 2d composite widget', async () => {
			const user = setupUserEvent();
			render( <DateRangeCalendar /> );

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
				<DateRangeCalendar
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
			render( <DateRangeCalendar selected={ { from: today, to: tomorrow } } /> );

			// Tab to the calendar grid
			await user.tab();
			await user.tab();
			await user.tab();

			expect( getDateButton( today ) ).toHaveFocus();
		} );
	} );

	describe( 'Disabled states', () => {
		it( 'should support disabling all dates via the `disabled` prop', async () => {
			const user = setupUserEvent();

			render( <DateRangeCalendar disabled /> );

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
			render( <DateRangeCalendar disabled={ tomorrow } /> );

			expect( getDateButton( tomorrow ) ).toBeDisabled();
		} );

		it( 'should support passing a custom function via the `disabled` prop', async () => {
			const primeNumbers = [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31 ];
			render(
				<DateRangeCalendar disabled={ ( date ) => primeNumbers.includes( date.getDate() ) } />
			);

			for ( const date of primeNumbers ) {
				expect(
					getDateButton( new Date( today.getFullYear(), today.getMonth(), date ) )
				).toBeDisabled();
			}
		} );

		it( 'should support disabling all dates before a certain date via the `disabled` prop', async () => {
			render( <DateRangeCalendar disabled={ { before: today } } /> );

			for ( let date = 1; date < today.getDate(); date++ ) {
				expect(
					getDateButton( new Date( today.getFullYear(), today.getMonth(), date ) )
				).toBeDisabled();
			}
			expect( getDateButton( today ) ).not.toBeDisabled();
		} );

		it( 'should support disabling all dates after a certain date via the `disabled` prop', async () => {
			render( <DateRangeCalendar disabled={ { after: today } } /> );

			for ( let date = today.getDate() + 1; date < 32; date++ ) {
				expect(
					getDateButton( new Date( today.getFullYear(), today.getMonth(), date ) )
				).toBeDisabled();
			}
			expect( getDateButton( today ) ).not.toBeDisabled();
		} );

		it( 'should support disabling all dates before a certain date and after a certain date via the `disabled` prop', async () => {
			render(
				<DateRangeCalendar disabled={ { before: yesterday, after: addDays( today, 1 ) } } />
			);

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
			render( <DateRangeCalendar disabled={ { from: yesterday, to: addDays( today, 1 ) } } /> );

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
			render( <DateRangeCalendar disabled={ { dayOfWeek: [ 0, 6 ] } } /> );

			for ( const date of weekendsInMay ) {
				expect(
					getDateButton( new Date( today.getFullYear(), today.getMonth(), date ) )
				).toBeDisabled();
			}
		} );

		it( 'should disable the previous and next months buttons if the `disableNavigation` is set to `true`', async () => {
			const user = setupUserEvent();

			render( <DateRangeCalendar disableNavigation /> );

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

			render( <DateRangeCalendar locale={ ar } /> );

			// Check computed writing direction
			expect( screen.getByRole( 'application', { name: 'Date range calendar' } ) ).toHaveAttribute(
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

			render( <DateRangeCalendar timeZone="Asia/Tokyo" onSelect={ onSelect } /> );

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

			expect( onSelect ).toHaveBeenCalledTimes( 1 );
			expect( onSelect ).toHaveBeenCalledWith(
				{
					from: tomorrowFromTokyoTimezone,
					to: tomorrowFromTokyoTimezone,
				},
				tomorrowFromTokyoTimezone,
				expect.objectContaining( { today: true } ),
				expect.objectContaining( { type: 'click', target: tomorrowButton } )
			);
		} );

		it( 'should handle timezoned dates and convert them to the calendar timezone', async () => {
			// Still the same time from UTC's POV, just expressed in Tokyo time.
			const tomorrowAtMidnightInTokyoTZ = new TZDate( tomorrow, 'Asia/Tokyo' );
			const dayAfterTomorrowInTokyoTZ = new TZDate( addDays( tomorrow, 1 ), 'Asia/Tokyo' );
			const timezoneRange = { from: tomorrowAtMidnightInTokyoTZ, to: dayAfterTomorrowInTokyoTZ };

			render( <DateRangeCalendar defaultSelected={ timezoneRange } timeZone="-02:00" /> );

			// Changing the calendar timezone to UTC-2 makes the dates become
			// earlier by 1 day (from midnight to 10pm the previous day).
			expect( getDateCell( today, { selected: true } ) ).toBeVisible();
			expect( getDateCell( tomorrow, { selected: true } ) ).toBeVisible();
		} );
	} );

	describe( 'usePreviewRange', () => {
		const today = new Date( '2024-03-15' );
		const tomorrow = addDays( today, 1 );
		const yesterday = subDays( today, 1 );
		const nextWeek = addDays( today, 7 );

		it( 'should return undefined when there is no hovered date', () => {
			const { result } = renderHook( () =>
				usePreviewRange( {
					selected: { from: today, to: tomorrow },
					hoveredDate: undefined,
				} )
			);

			expect( result.current ).toBeUndefined();
		} );

		it( 'should return undefined when there is no selected date', () => {
			const { result } = renderHook( () =>
				usePreviewRange( {
					selected: undefined,
					hoveredDate: today,
				} )
			);

			expect( result.current ).toBeUndefined();
		} );

		it( 'should return undefined when there is no selected start date', () => {
			const { result } = renderHook( () =>
				usePreviewRange( {
					selected: { from: undefined, to: tomorrow },
					hoveredDate: today,
				} )
			);

			expect( result.current ).toBeUndefined();
		} );

		it( 'should show preview when hovering before selected range', () => {
			const { result } = renderHook( () =>
				usePreviewRange( {
					selected: { from: today, to: tomorrow },
					hoveredDate: yesterday,
				} )
			);

			expect( result.current ).toEqual( {
				from: yesterday,
				to: today,
			} );
		} );

		it( 'should show preview when hovering between selected range dates', () => {
			const { result } = renderHook( () =>
				usePreviewRange( {
					selected: { from: yesterday, to: tomorrow },
					hoveredDate: today,
				} )
			);

			expect( result.current ).toEqual( {
				from: yesterday,
				to: today,
			} );
		} );

		it( 'should show preview when hovering after selected range', () => {
			const { result } = renderHook( () =>
				usePreviewRange( {
					selected: { from: yesterday, to: today },
					hoveredDate: tomorrow,
				} )
			);

			expect( result.current ).toEqual( {
				from: today,
				to: tomorrow,
			} );
		} );

		it( 'should show preview when hovering after selected range with no end date', () => {
			const { result } = renderHook( () =>
				usePreviewRange( {
					selected: { from: today },
					hoveredDate: tomorrow,
				} )
			);

			expect( result.current ).toEqual( {
				from: today,
				to: tomorrow,
			} );
		} );

		describe( 'min range constraint', () => {
			it( 'should collapse preview to single date when range is less than min', () => {
				const { result } = renderHook( () =>
					usePreviewRange( {
						selected: { from: today },
						hoveredDate: tomorrow,
						min: 3,
					} )
				);

				expect( result.current ).toEqual( {
					from: tomorrow,
					to: tomorrow,
				} );
			} );

			it( 'should allow preview when range meets min requirement', () => {
				const { result } = renderHook( () =>
					usePreviewRange( {
						selected: { from: today },
						hoveredDate: nextWeek,
						min: 3,
					} )
				);

				expect( result.current ).toEqual( {
					from: today,
					to: nextWeek,
				} );
			} );
		} );

		describe( 'max range constraint', () => {
			it( 'should collapse preview to single date when range exceeds max', () => {
				const { result } = renderHook( () =>
					usePreviewRange( {
						selected: { from: today },
						hoveredDate: nextWeek,
						max: 3,
					} )
				);

				expect( result.current ).toEqual( {
					from: nextWeek,
					to: nextWeek,
				} );
			} );

			it( 'should allow preview when range meets max requirement', () => {
				const { result } = renderHook( () =>
					usePreviewRange( {
						selected: { from: today },
						hoveredDate: tomorrow,
						max: 3,
					} )
				);

				expect( result.current ).toEqual( {
					from: today,
					to: tomorrow,
				} );
			} );
		} );

		describe( 'disabled dates', () => {
			it( 'should collapse preview to single date when range contains disabled dates and excludeDisabled is true', () => {
				const { result } = renderHook( () =>
					usePreviewRange( {
						selected: { from: today },
						hoveredDate: nextWeek,
						disabled: [ tomorrow ],
						excludeDisabled: true,
					} )
				);

				expect( result.current ).toEqual( {
					from: nextWeek,
					to: nextWeek,
				} );
			} );

			it( 'should allow preview when range contains disabled dates but excludeDisabled is false', () => {
				const { result } = renderHook( () =>
					usePreviewRange( {
						selected: { from: today },
						hoveredDate: nextWeek,
						disabled: [ tomorrow ],
						excludeDisabled: false,
					} )
				);

				expect( result.current ).toEqual( {
					from: today,
					to: nextWeek,
				} );
			} );
		} );
	} );
} );
