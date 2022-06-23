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
	let fixedEndDate;

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

		// Forces the date to be UTC format which avoids offset woes
		// in the tests
		fixedEndDate = moment.utc( '2018-06-01' );

		// Set the clock for our test assertions so that new Date()
		// will return the known `fixedEndDate` set above. This helps
		// us control the non-determenism that comes from usage of
		// JS `Date` within the component
		MockDate.set( fixedEndDate );
	} );

	test( 'should render', () => {
		const { container } = render( <DateRange moment={ moment } translate={ translate } /> );
		expect( container.firstChild ).toMatchSnapshot();
	} );

	describe( 'Date range clamping', () => {
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

			const [ actualStartDate, actualEndDate ] = screen
				.getByLabelText( 'Select date range' )
				.querySelector( 'span' )
				.innerHTML.split( '-' )
				.map( ( s ) => s.trim() );

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

			let [ actualStartDate, actualEndDate ] = screen
				.getByLabelText( 'Select date range' )
				.querySelector( 'span' )
				.innerHTML.split( '-' )
				.map( ( s ) => s.trim() );

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

			let [ actualStartDate, actualEndDate ] = screen
				.getByLabelText( 'Select date range' )
				.querySelector( 'span' )
				.innerHTML.split( '-' )
				.map( ( s ) => s.trim() );

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

			const range = screen.getByLabelText( 'Select date range' ).querySelector( 'span' ).innerHTML;

			expect( range ).toEqual( 'MM/DD/YYYY - MM/DD/YYYY' );
		} );

		test( 'should update trigger props to match currently selected dates', async () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			const from = screen.getByLabelText( 'From' );
			const to = screen.getByLabelText( 'To' );
			const applyBtn = screen.getByText( 'Apply' );

			await userEvent.type( from, '04-01-2018' );
			await userEvent.type( to, '04-29-2018' );

			await userEvent.click( applyBtn );

			const range = screen.getByLabelText( 'Select date range' ).querySelector( 'span' ).innerHTML;

			expect( range ).toEqual( '04/01/2018 - 04/29/2018' );
		} );

		test( 'should toggle popover on trigger click', async () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			// Open
			await userEvent.click( screen.getByLabelText( 'Select date range' ) );

			const popover = screen.getByRole( 'tooltip' );

			expect( popover ).toBeVisible();

			// Close
			const applyBtn = screen.getByText( 'Apply' );
			await userEvent.click( applyBtn );

			expect( popover ).not.toBeVisible();
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

			const clearBtn = screen.getByTitle( 'Clear date selection' );
			await userEvent.click( clearBtn );

			const range = screen.getByLabelText( 'Select date range' ).querySelector( 'span' ).innerHTML;
			expect( range ).toEqual( 'MM/DD/YYYY - MM/DD/YYYY' );
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

			const startMonth = screen.getByText( 'October 2018' );
			const endMonth = screen.getByText( 'November 2018' );

			expect( startMonth ).toBeVisible();
			expect( endMonth ).toBeVisible();
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

			const startMonth = screen.getByText( 'October 2018' );
			const endMonth = screen.queryByText( 'November 2018' );

			expect( startMonth ).toBeVisible();
			expect( endMonth ).toBeNull();
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
			const someDisabledDates = [ 'Mon, Oct 1, 2018 12:00 PM', 'Tue, Oct 2, 2018 12:00 PM' ];
			const someEnabledDates = [ 'Wed, Oct 3, 2018 12:00 PM', 'Thu, Oct 4, 2018 12:00 PM' ];

			// Dates before `10-03-2018`
			someDisabledDates.forEach( ( timestamp ) => {
				const el = screen.getByLabelText( timestamp );
				expect( el ).toHaveAttribute( 'aria-disabled', 'true' );
			} );

			// Dates on/after `10-03-2018`
			someEnabledDates.forEach( ( timestamp ) => {
				const el = screen.getByLabelText( timestamp );
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
			const someEnabledDates = [ 'Tue, Oct 2, 2018 12:00 PM', 'Wed, Oct 3, 2018 12:00 PM' ];
			const someDisabledDates = [ 'Thu, Oct 4, 2018 12:00 PM', 'Fri, Oct 5, 2018 12:00 PM' ];

			// Dates on/before `10-03-2018`
			someEnabledDates.forEach( ( timestamp ) => {
				const el = screen.getByLabelText( timestamp );
				expect( el ).toHaveAttribute( 'aria-disabled', 'false' );
			} );

			// Dates after `10-03-2018`
			someDisabledDates.forEach( ( timestamp ) => {
				const el = screen.getByLabelText( timestamp );
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

			const previousMonthBtn = screen.queryByLabelText( /Previous month/ );
			const nextMonthBtn = screen.getByLabelText( 'Next month (December 2018)' );

			expect( previousMonthBtn ).toBeNull();
			expect( nextMonthBtn ).toBeVisible();
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

			const previousMonthBtn = screen.getByLabelText( 'Previous month (August 2018)' );
			const nextMonthBtn = screen.queryByLabelText( /Next month/ );

			expect( previousMonthBtn ).toBeVisible();
			expect( nextMonthBtn ).toBeNull();
		} );
	} );

	describe( 'Input elements', () => {
		test( 'should see inputs reflect date picker selection', async () => {
			const firstSelectableDate = moment( '04-03-2018', 'MM-DD-YYYY' );

			const startDate = 'Tue, Apr 3, 2018 12:00 PM';
			const endDate = 'Tue, May 29, 2018 12:00 PM';

			render(
				<DateRange
					translate={ translate }
					moment={ moment }
					firstSelectableDate={ firstSelectableDate }
				/>
			);

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			await userEvent.click( screen.getByLabelText( startDate ) );
			await userEvent.click( screen.getByLabelText( endDate ) );

			const fromInput = screen.queryByDisplayValue( '04/03/2018' );
			const toInput = screen.getByDisplayValue( '05/29/2018' );

			expect( fromInput ).toBeVisible();
			expect( toInput ).toBeVisible();
		} );

		test( 'should update start date selection on start date input blur', async () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			await userEvent.click( screen.getByLabelText( 'From' ) );
			await userEvent.keyboard( '05/30/2018' );
			// This causes a blur on the `From` input
			await userEvent.tab();

			const startDateEl = screen.getByLabelText( 'Wed, May 30, 2018 12:00 PM' );

			expect( startDateEl ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		test( 'should update end date selection on end date input blur', async () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			await userEvent.click( screen.getByLabelText( 'To' ) );
			await userEvent.keyboard( '06/30/2018' );
			// This causes a blur on the `To`
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

			const fromEl = screen.getByLabelText( 'From' );
			const toEl = screen.getByLabelText( 'To' );

			await userEvent.clear( fromEl );
			await userEvent.click( fromEl );
			await userEvent.keyboard( invalidDateString );
			await userEvent.clear( toEl );
			await userEvent.click( toEl );
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

			const originalRange = screen
				.getByLabelText( 'Select date range' )
				.querySelector( 'span' ).innerHTML;

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			await userEvent.click( screen.getByLabelText( 'From' ) );
			await userEvent.keyboard( '04/01/2018' );
			await userEvent.click( screen.getByLabelText( 'To' ) );
			await userEvent.keyboard( '04/29/2018' );
			await userEvent.click( screen.getByLabelText( 'Apply' ) );

			const newRange = screen
				.getByLabelText( 'Select date range' )
				.querySelector( 'span' ).innerHTML;

			expect( originalRange ).toEqual( 'MM/DD/YYYY - MM/DD/YYYY' );
			expect( newRange ).toEqual( '04/01/2018 - 04/29/2018' );
		} );

		test( 'should discard date selection when user clicks the "Cancel" button', async () => {
			render( <DateRange translate={ translate } moment={ moment } /> );

			const originalRange = screen
				.getByLabelText( 'Select date range' )
				.querySelector( 'span' ).innerHTML;

			await userEvent.click( screen.getByLabelText( 'Select date range' ) );
			await userEvent.click( screen.getByLabelText( 'From' ) );
			await userEvent.keyboard( '04/01/2018' );
			await userEvent.click( screen.getByLabelText( 'To' ) );
			await userEvent.keyboard( '04/29/2018' );
			await userEvent.click( screen.getByLabelText( 'Cancel' ) );

			const newRange = screen
				.getByLabelText( 'Select date range' )
				.querySelector( 'span' ).innerHTML;

			expect( originalRange ).toEqual( newRange );
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

			expect( resetBtn ).toBeTruthy();
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

			const fromEl = screen.getByLabelText( 'From' );
			const toEl = screen.getByLabelText( 'To' );

			await userEvent.click( fromEl );
			await userEvent.clear( fromEl );
			await userEvent.keyboard( '04/13/2018' );
			await userEvent.click( toEl );
			await userEvent.clear( toEl );
			await userEvent.keyboard( '05/13/2018' );
			// force a blur out of `toEl`
			await userEvent.click( fromEl );

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

			expect( fromEl.value ).toEqual( '04/28/2018' );
			expect( toEl.value ).toEqual( '05/28/2018' );
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

	// TODO Other tests?
	// - Navigate to next/prev months

	afterEach( () => {
		MockDate.reset();
	} );
} );
