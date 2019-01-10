/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import moment from 'moment';
import MockDate from 'mockdate';

/**
 * Internal dependencies
 */
import { DateRange } from '../index.js';
import DatePicker from 'components/date-picker';
import DateRangeTrigger from 'components/date-range/trigger';
import DateRangeInputs from 'components/date-range/inputs';
import DateRangeHeader from 'components/date-range/header';

function toHumanDate( date ) {
	return date.format( 'DD/MM/YYYY' );
}

describe( 'DateRange', () => {
	let fixedEndDate;

	beforeEach( () => {
		// Mock matchMedia
		window.matchMedia = jest.fn().mockImplementation( query => {
			return {
				matches: true,
				media: query,
				onchange: null,
				addListener: jest.fn(),
				removeListener: jest.fn(),
			};
		} );

		// Note: forces locale to UK date format to make
		// test easier to assert against
		moment.locale( [ 'en-GB' ] );

		fixedEndDate = moment.utc( '01-06-2018', 'DD-MM-YYYY' );

		// Set the clock for our test assertions so that new Date()
		// will return the known `fixedEndDate` set above. This helps
		// us control the non-determenism that comes from usage of
		// JS `Date` within the component
		MockDate.set( fixedEndDate );
	} );

	test( 'should render', () => {
		const wrapper = shallow( <DateRange moment={ moment } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	describe( 'Trigger element', () => {
		test( "should render trigger with appropriate default date range of minus one month from today's date", () => {
			const wrapper = shallow( <DateRange moment={ moment } /> );

			const dateRangeTrigger = wrapper.find( DateRangeTrigger );

			const expected = {
				startDateText: '01/05/2018',
				endDateText: '01/06/2018',
			};

			expect( dateRangeTrigger.props() ).toEqual( expect.objectContaining( expected ) );
		} );

		test( 'should update trigger props to match currently selected dates', () => {
			const wrapper = shallow( <DateRange moment={ moment } /> );

			const expectedStartDate = '01/04/2018';
			const expectedEndDate = '29/04/2018';
			const newStartDate = moment( expectedStartDate, 'DD/MM/YYYY' );
			const newEndDate = moment( expectedEndDate, 'DD/MM/YYYY' );

			// Select dates using API
			// note: not usually recommended to access component API directly
			// but it's tricky to do this via DOM on a datepicker...
			wrapper.instance().onSelectDate( newStartDate );
			wrapper.instance().onSelectDate( newEndDate );

			// Force re-render
			wrapper.update();

			const dateRangeTrigger = wrapper.find( DateRangeTrigger );

			const expected = {
				startDateText: expectedStartDate,
				endDateText: expectedEndDate,
			};

			expect( dateRangeTrigger.props() ).toEqual( expect.objectContaining( expected ) );
		} );
	} );

	describe( 'DatePicker element', () => {
		const matchMediaDefaults = {
			onchange: null,
			addListener: jest.fn(),
			removeListener: jest.fn(),
		};

		test( 'should pass correct props to DatePicker', () => {
			const wrapper = shallow( <DateRange moment={ moment } /> );
			const instance = wrapper.instance();
			const state = wrapper.state();
			const datePicker = wrapper.find( DatePicker );

			expect( datePicker.props() ).toEqual(
				expect.objectContaining( {
					showOutsideDays: false,
					fromMonth: undefined,
					toMonth: undefined,
					onSelectDay: instance.onSelectDate,
					selectedDays: {
						from: state.startDate.toDate(),
						to: state.endDate.toDate(),
					},
					numberOfMonths: 2, // controlled via matchMedia mock
					calendarViewDate: state.startDate.toDate(),
					disabledDays: [ {} ],
				} )
			);
		} );

		test( 'should set 2 month calendar view on screens >480px', () => {
			window.matchMedia = jest.fn().mockImplementation( query => {
				return {
					...matchMediaDefaults,
					matches: true, // > 480px
					media: query,
				};
			} );

			const wrapper = shallow( <DateRange moment={ moment } /> );
			const datePicker = wrapper.find( DatePicker );

			expect( datePicker.props().numberOfMonths ).toEqual( 2 );
		} );

		test( 'should set 1 month calendar view on screens <480px', () => {
			window.matchMedia = jest.fn().mockImplementation( query => {
				return {
					...matchMediaDefaults,
					matches: false, // < 480px
					media: query,
				};
			} );

			const wrapper = shallow( <DateRange moment={ moment } /> );
			const datePicker = wrapper.find( DatePicker );

			expect( datePicker.props().numberOfMonths ).toEqual( 1 );
		} );

		test( 'should disable dates before firstSelectableDate when set', () => {
			const today = new Date();
			const wrapper = shallow( <DateRange moment={ moment } firstSelectableDate={ today } /> );
			const datePicker = wrapper.find( DatePicker );

			const expected = [
				{
					before: today,
				},
			];

			const actual = datePicker.props().disabledDays;

			expect( actual ).toEqual( expected );
		} );

		test( 'should disable dates after lastSelectableDate when set', () => {
			const today = new Date();
			const wrapper = shallow( <DateRange moment={ moment } lastSelectableDate={ today } /> );
			const datePicker = wrapper.find( DatePicker );

			const expected = [
				{
					after: today,
				},
			];

			const actual = datePicker.props().disabledDays;

			expect( actual ).toEqual( expected );
		} );

		test( 'should disable DatePicker UI for months previous to firstSelectableDate when set', () => {
			const today = new Date();

			const wrapper = shallow( <DateRange moment={ moment } firstSelectableDate={ today } /> );
			const datePicker = wrapper.find( DatePicker );

			const expected = today;
			const actual = datePicker.props().fromMonth;

			expect( actual ).toEqual( expected );
		} );

		test( 'should disable DatePicker UI for months after lastSelectableDate when set', () => {
			const today = new Date();

			const wrapper = shallow( <DateRange moment={ moment } lastSelectableDate={ today } /> );
			const datePicker = wrapper.find( DatePicker );

			const expected = today;
			const actual = datePicker.props().toMonth;

			expect( actual ).toEqual( expected );
		} );
	} );

	describe( 'Input elements', () => {
		let startDate;
		let endDate;
		let momentStartDate;
		let momentEndDate;

		beforeEach( () => {
			startDate = '20/04/2018'; // DD/MM/YYYY
			endDate = '28/05/2018'; // DD/MM/YYYY
			momentStartDate = moment( startDate, 'DD-MM-YYYY' );
			momentEndDate = moment( endDate, 'DD-MM-YYYY' );
		} );

		test( 'should update start date selection on start date input blur event', () => {
			const wrapper = shallow( <DateRange moment={ moment } /> );

			wrapper.instance().handleInputBlur( startDate, 'Start' );

			expect( wrapper.state().startDate.format( 'DD/MM/YYYY' ) ).toEqual(
				momentStartDate.format( 'DD/MM/YYYY' )
			);
		} );

		test( 'should update end date selection on end date input blur event', () => {
			const wrapper = shallow( <DateRange moment={ moment } /> );

			wrapper.instance().handleInputBlur( endDate, 'End' );

			expect( wrapper.state().endDate.format( 'DD/MM/YYYY' ) ).toEqual(
				momentEndDate.format( 'DD/MM/YYYY' )
			);
		} );

		test( 'should not update date selection on input change event', () => {
			const wrapper = shallow( <DateRange moment={ moment } /> );

			wrapper.instance().handleInputChange( endDate, 'End' );

			expect( wrapper.state().endDate.format( 'DD/MM/YYYY' ) ).toEqual(
				fixedEndDate.format( 'DD/MM/YYYY' )
			);
		} );

		test( 'should update `textInput*` state on input change event', () => {
			const wrapper = shallow( <DateRange moment={ moment } /> );

			wrapper.instance().handleInputChange( endDate, 'End' );

			expect( wrapper.state().textInputEndDate ).toEqual( momentEndDate.format( 'DD/MM/YYYY' ) );
		} );

		test( 'should not update either start or end date selection if the new input date value is the same as that stored in state', () => {
			const wrapper = shallow(
				<DateRange startDate={ momentStartDate } endDate={ momentEndDate } moment={ moment } />
			);

			wrapper.instance().handleInputBlur( startDate, 'Start' );

			expect( wrapper.state().startDate.format( 'DD/MM/YYYY' ) ).toEqual(
				momentStartDate.format( 'DD/MM/YYYY' )
			);

			expect( wrapper.state().endDate.format( 'DD/MM/YYYY' ) ).toEqual(
				momentEndDate.format( 'DD/MM/YYYY' )
			);
		} );

		test( 'should not update start/end dates if input date is invalid', () => {
			const wrapper = shallow(
				<DateRange startDate={ momentStartDate } endDate={ momentEndDate } moment={ moment } />
			);
			const invalidDateString = 'inv/alid/datestring';

			wrapper.instance().handleInputBlur( invalidDateString, 'Start' );
			wrapper.instance().handleInputBlur( invalidDateString, 'End' );

			expect( wrapper.state().startDate.format( 'DD/MM/YYYY' ) ).not.toEqual( invalidDateString );
			expect( wrapper.state().startDate.format( 'DD/MM/YYYY' ) ).toEqual(
				momentStartDate.format( 'DD/MM/YYYY' )
			);
			expect( wrapper.state().endDate.format( 'DD/MM/YYYY' ) ).not.toEqual( invalidDateString );
			expect( wrapper.state().endDate.format( 'DD/MM/YYYY' ) ).toEqual(
				momentEndDate.format( 'DD/MM/YYYY' )
			);
		} );

		test( 'should see inputs reflect date picker selection', () => {
			const wrapper = shallow( <DateRange moment={ moment } /> );

			const expectedStart = '03/04/2018';
			const expectedEnd = '29/04/2018';

			const newStartDate = moment( expectedStart, 'DD/MM/YYYY' );
			const newEndDate = moment( expectedEnd, 'DD/MM/YYYY' );

			// Select dates using API
			wrapper.instance().onSelectDate( newStartDate );
			wrapper.instance().onSelectDate( newEndDate );

			// Force update
			wrapper.update();

			const dateRangeInputs = wrapper.find( DateRangeInputs );

			expect( dateRangeInputs.props() ).toEqual(
				expect.objectContaining( {
					startDateValue: expectedStart,
					endDateValue: expectedEnd,
				} )
			);
		} );
	} );

	describe( 'Callback props', () => {
		test( 'should call onDateSelect function when a date is selected', () => {
			const callback = jest.fn();

			const wrapper = shallow( <DateRange moment={ moment } onDateSelect={ callback } /> );

			const newStartDate = moment( '01/04/2018', 'DD/MM/YYYY' );
			const newEndDate = moment( '29/04/2018', 'DD/MM/YYYY' );

			// Select dates using API
			wrapper.instance().onSelectDate( newStartDate );
			wrapper.instance().onSelectDate( newEndDate );

			expect( callback ).toHaveBeenCalledTimes( 2 );

			expect( callback.mock.calls[ 0 ][ 0 ].format( 'DD/MM/YYYY' ) ).toEqual(
				newStartDate.format( 'DD/MM/YYYY' )
			);
			expect( callback.mock.calls[ 1 ][ 1 ].format( 'DD/MM/YYYY' ) ).toEqual(
				newEndDate.format( 'DD/MM/YYYY' )
			);
		} );

		test( 'should call onDateCommit function when a date is committed/applied', () => {
			const callback = jest.fn();

			const wrapper = shallow( <DateRange moment={ moment } onDateCommit={ callback } /> );

			const newStartDate = moment( '01/04/2018', 'DD/MM/YYYY' );
			const newEndDate = moment( '29/04/2018', 'DD/MM/YYYY' );

			// Select dates using API
			wrapper.instance().onSelectDate( newStartDate );
			wrapper.instance().onSelectDate( newEndDate );

			// Commit/apply those dates
			wrapper.instance().commitDates();

			expect( callback ).toHaveBeenCalledTimes( 1 );
			expect( callback.mock.calls[ 0 ][ 0 ].format( 'DD/MM/YYYY' ) ).toEqual(
				newStartDate.format( 'DD/MM/YYYY' )
			);
			expect( callback.mock.calls[ 0 ][ 1 ].format( 'DD/MM/YYYY' ) ).toEqual(
				newEndDate.format( 'DD/MM/YYYY' )
			);
		} );
	} );

	describe( 'Apply and cancel', () => {
		test( 'should only persist date selection when user clicks "Apply" button', () => {
			const wrapper = shallow( <DateRange moment={ moment } /> );
			const originalStartDate = wrapper.state().startDate;
			const originalEndDate = wrapper.state().endDate;

			// Get child components
			const dateRangeHeader = wrapper.find( DateRangeHeader );
			const datePicker = wrapper.find( DatePicker );

			const newStartDate = moment( '01-04-2018', 'DD/MM/YYYY' );
			const newEndDate = moment( '29-04-2018', 'DD/MM/YYYY' );

			// Select dates using API
			datePicker.props().onSelectDay( newStartDate );
			datePicker.props().onSelectDay( newEndDate );

			// Force update
			wrapper.update();

			// Calls whichever method DateRange passes into DateRangeHeader component
			dateRangeHeader.props().onCancelClick();

			// Should still be the original dates...
			expect( wrapper.state() ).toEqual(
				expect.objectContaining( {
					startDate: originalStartDate,
					endDate: originalEndDate,
				} )
			);

			// Select dates using API
			datePicker.props().onSelectDay( newStartDate );
			datePicker.props().onSelectDay( newEndDate );

			// Force update
			wrapper.update();

			// Calls whichever method DateRange passes into DateRangeHeader component
			dateRangeHeader.props().onApplyClick();

			// Should now be persisted
			expect( toHumanDate( wrapper.state().startDate ) ).toEqual( toHumanDate( newStartDate ) );
			expect( toHumanDate( wrapper.state().endDate ) ).toEqual( toHumanDate( newEndDate ) );
		} );
	} );

	afterEach( () => {
		MockDate.reset();
	} );
} );
