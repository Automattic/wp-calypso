/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { translate } from 'i18n-calypso';
import MockDate from 'mockdate';
import moment from 'moment';
import { DateRange } from '../index.js';

jest.mock( 'lodash', () => ( {
	...jest.requireActual( 'lodash' ),
	debounce: ( fn ) => fn,
} ) );

function dateToLocaleString( date ) {
	return moment.isDate( date ) || moment.isMoment( date ) ? moment( date ).format( 'L' ) : date;
}

describe( 'DateRange', () => {
	beforeEach( () => {
		// Mock matchMedia
		window.matchMedia = jest.fn().mockImplementation( ( query ) => {
			return {
				matches: true,
				media: query,
				onchange: null,
				addListener: jest.fn(),
				removeListener: jest.fn(),
			};
		} );

		// Set the clock for our test assertions so that new Date()
		// will return to a known deterministic date. This important
		// for the component to render the expected calendars when
		// an initial date is not passed to it in a test.
		MockDate.set( moment.utc( '2018-06-01' ) );
	} );

	test( 'should render', () => {
		const { container } = render( <DateRange moment={ moment } translate={ translate } /> );
		expect( container.firstChild ).toMatchSnapshot();
	} );

	describe( 'Date range clamping', () => {
		const splitFromDateRangeText = () =>
			screen
				.getByLabelText( 'Date range' )
				.textContent.split( '-' )
				.map( ( s ) => s.trim() );

		test( 'should ensure the end date is not before the start date', () => {
			const selectedEndDate = moment( '06-01-2018', 'MM-DD-YYYY' );
			const selectedStartDate = moment( selectedEndDate ).add( 1, 'months' );

			render(
				<DateRange
					moment={ moment }
					translate={ translate }
					selectedStartDate={ selectedStartDate }
					selectedEndDate={ selectedEndDate }
				/>
			);

			const [ actualStartDate, actualEndDate ] = splitFromDateRangeText();

			const isStartBeforeEnd = moment( actualStartDate, 'MM-DD-YYYY' ).isBefore(
				moment( actualEndDate, 'MM-DD-YYYY' )
			);

			expect( isStartBeforeEnd ).toBe( true );
		} );

		test( 'should clamp selected dates to respect firstSelectableDate prop', () => {
			const firstSelectableDate = moment( '06-01-2018', 'MM-DD-YYYY' );

			const endDateInPast = moment( firstSelectableDate ).subtract( 1, 'months' );
			const startDateInPast = moment( endDateInPast ).subtract( 1, 'months' );

			render(
				<DateRange
					moment={ moment }
					translate={ translate }
					selectedStartDate={ startDateInPast }
					selectedEndDate={ endDateInPast }
					firstSelectableDate={ firstSelectableDate }
				/>
			);

			const expectedStartDate = dateToLocaleString( firstSelectableDate );
			const expectedEndDate = dateToLocaleString( firstSelectableDate );

			let [ actualStartDate, actualEndDate ] = splitFromDateRangeText();

			actualStartDate = dateToLocaleString( moment( actualStartDate, 'MM-DD-YYYY' ) );
			actualEndDate = dateToLocaleString( moment( actualEndDate, 'MM-DD-YYYY' ) );

			// Expect start/end are both clamped to the first selectable Date
			expect( actualStartDate ).toEqual( expectedStartDate );
			expect( actualEndDate ).toEqual( expectedEndDate );
		} );

		test( 'should clamp selected dates to respect lastSelectableDate prop', () => {
			const lastSelectableDate = moment( '06-01-2018', 'MM-DD-YYYY' );
			const startDateInFuture = moment( lastSelectableDate ).add( 1, 'months' );
			const endDateInFuture = moment( lastSelectableDate ).add( 2, 'months' );

			render(
				<DateRange
					moment={ moment }
					translate={ translate }
					selectedStartDate={ startDateInFuture }
					selectedEndDate={ endDateInFuture }
					lastSelectableDate={ lastSelectableDate }
				/>
			);

			let [ actualStartDate, actualEndDate ] = splitFromDateRangeText();

			const expectedStartDate = dateToLocaleString( lastSelectableDate );
			const expectedEndDate = dateToLocaleString( lastSelectableDate );

			actualStartDate = dateToLocaleString( moment( actualStartDate, 'MM-DD-YYYY' ) );
			actualEndDate = dateToLocaleString( moment( actualEndDate, 'MM-DD-YYYY' ) );

			// Expect start/end to be clamped to the last selectable date
			expect( actualStartDate ).toEqual( expectedStartDate );
			expect( actualEndDate ).toEqual( expectedEndDate );
		} );
	} );

	describe( 'Trigger element', () => {
		test( 'should render trigger with appropriate placeholders if no dates provided or selected', () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			const rangeText = screen.getByLabelText( 'Date range' ).textContent;

			expect( rangeText ).toEqual( 'MM/DD/YYYY - MM/DD/YYYY' );
		} );

		test( 'should update trigger props to match currently selected dates', async () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			const fromInputEl = screen.getByLabelText( 'From' );
			const toInputEl = screen.getByLabelText( 'To' );
			const applyBtnEl = screen.getByText( 'Apply' );

			await userEvent.type( fromInputEl, '04/01/2018' );
			await userEvent.type( toInputEl, '04/29/2018' );

			await userEvent.click( applyBtnEl );

			const rangeText = screen.getByLabelText( 'Date range' ).textContent;

			expect( rangeText ).toEqual( '04/01/2018 - 04/29/2018' );
		} );

		test( 'should toggle popover on trigger click', async () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			// Open
			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			const popoverEl = screen.getByRole( 'tooltip' );

			expect( popoverEl ).toBeVisible();

			// Close
			const applyBtnEl = screen.getByText( 'Apply' );
			await userEvent.click( applyBtnEl );

			expect( popoverEl ).not.toBeInTheDocument();
		} );

		test( 'should reset Dates on trigger clear btn click', async () => {
			const endDate = moment( '05-30-2018', 'MM-DD-YYYY' );
			const startDate = moment( '04-30-2018', 'MM-DD-YYYY' );

			render(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			const clearBtnEl = screen.getByTitle( 'Clear date selection' );
			await userEvent.click( clearBtnEl );

			const rangeText = screen.getByLabelText( 'Date range' ).textContent;

			expect( rangeText ).toEqual( 'MM/DD/YYYY - MM/DD/YYYY' );
		} );
	} );

	describe( 'DatePicker element', () => {
		const matchMediaDefaults = {
			onchange: null,
			addListener: jest.fn(),
			removeListener: jest.fn(),
		};

		test( 'should set 2 month calendar view on screens >480px by default', async () => {
			window.matchMedia = jest.fn().mockImplementation( ( query ) => {
				return {
					...matchMediaDefaults,
					matches: true, // > 480px
					media: query,
				};
			} );

			const selectedStartDate = moment( '10-01-2018', 'MM-DD-YYYY' );
			const selectedEndDate = moment( '11-01-2018', 'MM-DD-YYYY' );

			render(
				<DateRange
					selectedStartDate={ selectedStartDate }
					selectedEndDate={ selectedEndDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			const startMonthEl = screen.getByText( 'October 2018' );
			const endMonthEl = screen.getByText( 'November 2018' );

			expect( startMonthEl ).toBeVisible();
			expect( endMonthEl ).toBeVisible();
		} );

		test( 'should set 1 month calendar view on screens <480px by default', async () => {
			window.matchMedia = jest.fn().mockImplementation( ( query ) => {
				return {
					...matchMediaDefaults,
					matches: false, // < 480px
					media: query,
				};
			} );

			const selectedStartDate = moment( '10-01-2018', 'MM-DD-YYYY' );
			const selectedEndDate = moment( '11-01-2018', 'MM-DD-YYYY' );

			render(
				<DateRange
					selectedStartDate={ selectedStartDate }
					selectedEndDate={ selectedEndDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			const startMonthEl = screen.getByText( 'October 2018' );
			const endMonthEl = screen.queryByText( 'November 2018' );

			expect( startMonthEl ).toBeVisible();
			expect( endMonthEl ).not.toBeInTheDocument();
		} );

		test( 'should disable dates before firstSelectableDate when set', async () => {
			const firstSelectableDate = moment( '10-03-2018', 'MM-DD-YYYY' );

			render(
				<DateRange
					translate={ translate }
					moment={ moment }
					firstSelectableDate={ firstSelectableDate }
				/>
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			// We assume that dates before the `firstSelectableDate` date and on/after
			// it are disabled/enabled respectively. We test two of each for good
			// measure. Testing all enabled/disabled dates wouldn't be feasible.
			const someDisabledDatesStrings = [ 'Mon, Oct 1, 2018 12:00 PM', 'Tue, Oct 2, 2018 12:00 PM' ];
			const someEnabledDatesStrings = [ 'Wed, Oct 3, 2018 12:00 PM', 'Thu, Oct 4, 2018 12:00 PM' ];

			// Dates before `10-03-2018`
			someDisabledDatesStrings.forEach( ( dateString ) => {
				const el = screen.getByLabelText( dateString );
				expect( el ).toHaveAttribute( 'aria-disabled', 'true' );
			} );

			// Dates on/after `10-03-2018`
			someEnabledDatesStrings.forEach( ( dateString ) => {
				const el = screen.getByLabelText( dateString );
				expect( el ).toHaveAttribute( 'aria-disabled', 'false' );
			} );
		} );

		test( 'should disable dates after lastSelectableDate when set', async () => {
			const lastSelectableDate = moment( '10-03-2018', 'MM-DD-YYYY' );

			render(
				<DateRange
					translate={ translate }
					moment={ moment }
					lastSelectableDate={ lastSelectableDate }
				/>
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			// We assume that dates on/before the `lastSelectableDate` date and after
			// it are enabled/disabled respectively. We test two of each for good
			// measure. Testing all enabled/disabled dates wouldn't be feasible.
			const someEnabledDatesStrings = [ 'Tue, Oct 2, 2018 12:00 PM', 'Wed, Oct 3, 2018 12:00 PM' ];
			const someDisabledDatesStrings = [ 'Thu, Oct 4, 2018 12:00 PM', 'Fri, Oct 5, 2018 12:00 PM' ];

			// Dates on/before `10-03-2018`
			someEnabledDatesStrings.forEach( ( dateString ) => {
				const el = screen.getByLabelText( dateString );
				expect( el ).toHaveAttribute( 'aria-disabled', 'false' );
			} );

			// Dates after `10-03-2018`
			someDisabledDatesStrings.forEach( ( dateString ) => {
				const el = screen.getByLabelText( dateString );
				expect( el ).toHaveAttribute( 'aria-disabled', 'true' );
			} );
		} );

		test( 'should *not* show the navigation button for the month prior to the one for `firstSelectableDate`', async () => {
			const firstSelectableDate = moment( '10-03-2018', 'MM-DD-YYYY' );

			render(
				<DateRange
					translate={ translate }
					moment={ moment }
					firstSelectableDate={ firstSelectableDate }
				/>
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			const previousMonthBtnEl = screen.queryByLabelText( /Previous month/ );
			const nextMonthBtnEl = screen.getByLabelText( 'Next month (December 2018)' );

			expect( previousMonthBtnEl ).not.toBeInTheDocument();
			expect( nextMonthBtnEl ).toBeVisible();
		} );

		test( 'should *not* show the navigation button for the month afer to the one for `lastSelectableDate`', async () => {
			const lastSelectableDate = moment( '10-03-2018', 'MM-DD-YYYY' );

			render(
				<DateRange
					translate={ translate }
					moment={ moment }
					lastSelectableDate={ lastSelectableDate }
				/>
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			const previousMonthBtnEl = screen.getByLabelText( 'Previous month (August 2018)' );
			const nextMonthBtnEl = screen.queryByLabelText( /Next month/ );

			expect( previousMonthBtnEl ).toBeVisible();
			expect( nextMonthBtnEl ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Input elements', () => {
		test( 'should see inputs reflect date picker selection', async () => {
			const firstSelectableDate = moment( '04-03-2018', 'MM-DD-YYYY' );

			const startDateString = 'Tue, Apr 3, 2018 12:00 PM';
			const endDateString = 'Tue, May 29, 2018 12:00 PM';

			render(
				<DateRange
					translate={ translate }
					moment={ moment }
					firstSelectableDate={ firstSelectableDate }
				/>
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			await userEvent.click( screen.getByLabelText( startDateString ) );
			await userEvent.click( screen.getByLabelText( endDateString ) );

			const fromInputEl = screen.queryByDisplayValue( '04/03/2018' );
			const toInputEl = screen.getByDisplayValue( '05/29/2018' );

			expect( fromInputEl ).toBeVisible();
			expect( toInputEl ).toBeVisible();
		} );

		test( 'should update start date selection on start date input blur', async () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			await userEvent.click( screen.getByLabelText( 'From' ) );
			await userEvent.keyboard( '06/30/2018' );
			// This causes a blur on the `From` input
			await userEvent.tab();

			const startDateEl = screen.getByLabelText( 'Sat, Jun 30, 2018 12:00 PM' );

			expect( startDateEl ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		test( 'should update end date selection on end date input blur', async () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			await userEvent.click( screen.getByLabelText( 'To' ) );
			await userEvent.keyboard( '06/30/2018' );
			// This causes a blur on the `To` input
			await userEvent.tab();

			const endDateEl = screen.getByLabelText( 'Sat, Jun 30, 2018 12:00 PM' );

			expect( endDateEl ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		test( 'should not update date selection on input change', async () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			await userEvent.click( screen.getByLabelText( 'From' ) );
			await userEvent.keyboard( '05/30/2018' );

			const el = screen.getByLabelText( 'Sat, Jun 30, 2018 12:00 PM' );

			expect( el ).toHaveAttribute( 'aria-selected', 'false' );
		} );

		test( 'should not update start/end dates if input date is invalid', async () => {
			const startDate = moment( '05-30-2018', 'MM-DD-YYYY' );
			const endDate = moment( startDate ).add( 1, 'months' );

			render(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			const invalidDateString = 'inv/alid/datestring';

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			const fromInputEl = screen.getByLabelText( 'From' );
			const toInputEl = screen.getByLabelText( 'To' );

			await userEvent.clear( fromInputEl );
			await userEvent.click( fromInputEl );
			await userEvent.keyboard( invalidDateString );
			await userEvent.clear( toInputEl );
			await userEvent.click( toInputEl );
			await userEvent.keyboard( invalidDateString );

			const startDateEl = screen.getByLabelText( 'Wed, May 30, 2018 12:00 PM' );
			const endDateEl = screen.getByLabelText( 'Sat, Jun 30, 2018 12:00 PM' );

			expect( startDateEl ).toHaveAttribute( 'aria-selected', 'true' );
			expect( endDateEl ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		test( 'should not update start date if input date is outside firstSelectableDate', async () => {
			const firstSelectableDate = moment( '05-27-2018', 'MM-DD-YYYY' );
			// Sat, May 26, 2018 12:00 PM, one day before the `firstSelectableDate`
			const badDateInputString = '05/26/2018';
			const badDateLabelString = 'Sat, May 26, 2018 12:00 PM';

			render(
				<DateRange
					firstSelectableDate={ firstSelectableDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			await userEvent.click( screen.getByLabelText( 'From' ) );
			await userEvent.keyboard( badDateInputString );

			const supposedStartDateEl = screen.getByLabelText( badDateLabelString );

			expect( supposedStartDateEl ).toHaveAttribute( 'aria-selected', 'false' );
		} );

		test( 'should not update end date if input date is outside firstSelectableDate', async () => {
			const firstSelectableDate = moment( '05-27-2018', 'MM-DD-YYYY' );
			// Sat, May 26, 2018 12:00 PM, one day before the `firstSelectableDate`
			const badDateInputString = '05/26/2018';
			const badDateLabelString = 'Sat, May 26, 2018 12:00 PM';

			render(
				<DateRange
					firstSelectableDate={ firstSelectableDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			await userEvent.click( screen.getByLabelText( 'To' ) );
			await userEvent.keyboard( badDateInputString );

			const supposedStartDateEl = screen.getByLabelText( badDateLabelString );

			expect( supposedStartDateEl ).toHaveAttribute( 'aria-selected', 'false' );
		} );

		test( 'should not update start date if input date is outside lastSelectableDate', async () => {
			const firstSelectableDate = moment( '05-27-2018', 'MM-DD-YYYY' );
			// Sun, May 27, 2018 12:00 PM, one day after the `lastSelectableDate`
			const badDateInputString = '05/27/2018';
			const badDateLabelString = 'Sun, May 27, 2018 12:00 PM';

			render(
				<DateRange
					lastSelectableDate={ firstSelectableDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			await userEvent.click( screen.getByLabelText( 'From' ) );
			await userEvent.keyboard( badDateInputString );

			const supposedStartDateEl = screen.getByLabelText( badDateLabelString );

			expect( supposedStartDateEl ).toHaveAttribute( 'aria-selected', 'false' );
		} );
	} );

	test( 'should not update end date if input date is outside lastSelectableDate', async () => {
		const firstSelectableDate = moment( '05-27-2018', 'MM-DD-YYYY' );
		// Sun, May 27, 2018 12:00 PM, one day after the `lastSelectableDate`
		const badDateInputString = '05/27/2018';
		const badDateLabelString = 'Sun, May 27, 2018 12:00 PM';

		render(
			<DateRange
				lastSelectableDate={ firstSelectableDate }
				translate={ translate }
				moment={ moment }
			/>
		);

		await userEvent.click( screen.getByLabelText( 'Select date range' ) );

		await userEvent.click( screen.getByLabelText( 'To' ) );
		await userEvent.keyboard( badDateInputString );

		const supposedStartDateEl = screen.getByLabelText( badDateLabelString );

		expect( supposedStartDateEl ).toHaveAttribute( 'aria-selected', 'false' );
	} );

	describe( 'Actions and Information UI', () => {
		test( 'should persist date selection when user clicks the "Apply" button', async () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			const originalRangeText = screen.getByLabelText( 'Date range' ).textContent;

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			await userEvent.click( screen.getByLabelText( 'From' ) );
			await userEvent.keyboard( '04/01/2018' );
			await userEvent.click( screen.getByLabelText( 'To' ) );
			await userEvent.keyboard( '04/29/2018' );
			await userEvent.click( screen.getByLabelText( 'Apply' ) );

			const newRangeText = screen.getByLabelText( 'Date range' ).textContent;

			expect( originalRangeText ).toEqual( 'MM/DD/YYYY - MM/DD/YYYY' );
			expect( newRangeText ).toEqual( '04/01/2018 - 04/29/2018' );
		} );

		test( 'should discard date selection when user clicks the "Cancel" button', async () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			const originalRangeText = screen.getByLabelText( 'Date range' ).textContent;

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			await userEvent.click( screen.getByLabelText( 'From' ) );
			await userEvent.keyboard( '04/01/2018' );
			await userEvent.click( screen.getByLabelText( 'To' ) );
			await userEvent.keyboard( '04/29/2018' );
			await userEvent.click( screen.getByLabelText( 'Cancel' ) );

			const newRangeText = screen.getByLabelText( 'Date range' ).textContent;

			expect( originalRangeText ).toEqual( newRangeText );
		} );

		test( 'Should display prompt to select first date when no start date selected', async () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			const infoText = screen.getByRole( 'status' ).textContent;

			expect( infoText ).toEqual( expect.stringContaining( 'Please select the first day' ) );
		} );

		test( 'Should display prompt to select last date when no end date selected', async () => {
			const startDate = moment( '04-28-2018', 'MM-DD-YYYY' );

			render(
				<DateRange selectedStartDate={ startDate } translate={ translate } moment={ moment } />
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			const infoText = screen.getByRole( 'status' ).textContent;

			expect( infoText ).toEqual( expect.stringContaining( 'Please select the last day' ) );
		} );

		test( 'Should display reset button when both dates are selected', async () => {
			const startDate = moment( '04-28-2018', 'MM-DD-YYYY' );
			const endDate = moment( '05-28-2018', 'MM-DD-YYYY' );

			render(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			const resetBtn = screen.getByLabelText( 'Reset selected dates' );

			expect( resetBtn ).toBeVisible();
		} );

		test( 'Should reset selection when reset UI clicked', async () => {
			const startDate = moment( '04-28-2018', 'MM-DD-YYYY' );
			const endDate = moment( '05-28-2018', 'MM-DD-YYYY' );

			render(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			const fromInputEl = screen.getByLabelText( 'From' );
			const toInputEl = screen.getByLabelText( 'To' );

			await userEvent.click( fromInputEl );
			await userEvent.clear( fromInputEl );
			await userEvent.keyboard( '04/13/2018' );
			await userEvent.click( toInputEl );
			await userEvent.clear( toInputEl );
			await userEvent.keyboard( '05/13/2018' );
			// Blurs out of `toInputEl`
			await userEvent.tab();

			expect( screen.getByLabelText( 'Fri, Apr 13, 2018 12:00 PM' ) ).toHaveAttribute(
				'aria-selected',
				'true'
			);
			expect( screen.getByLabelText( 'Sun, May 13, 2018 12:00 PM' ) ).toHaveAttribute(
				'aria-selected',
				'true'
			);

			const resetBtn = screen.getByLabelText( 'Reset selected dates' );
			await userEvent.click( resetBtn );

			expect( fromInputEl.value ).toEqual( '04/28/2018' );
			expect( toInputEl.value ).toEqual( '05/28/2018' );
			expect( screen.getByLabelText( 'Sat, Apr 28, 2018 12:00 PM' ) ).toHaveAttribute(
				'aria-selected',
				'true'
			);
			expect( screen.getByLabelText( 'Mon, May 28, 2018 12:00 PM' ) ).toHaveAttribute(
				'aria-selected',
				'true'
			);
		} );
	} );

	afterEach( () => {
		MockDate.reset();
	} );
} );
