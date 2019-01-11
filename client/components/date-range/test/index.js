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
import Popover from 'components/popover';

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

	describe( 'Date range clamping', () => {
		test( 'should ensure selectedStartDate is before selectedEndDate', () => {
			const selectedEndDate = moment( '01-06-2018', 'DD-MM-YYYY' );

			const selectedStartDate = moment( selectedEndDate ).add( 1, 'months' );

			const wrapper = shallow(
				<DateRange
					moment={ moment }
					selectedStartDate={ selectedStartDate }
					selectedEndDate={ selectedEndDate }
				/>
			);

			const actualStartDate = wrapper.state().startDate;
			const actualEndDate = wrapper.state().endDate;

			// Check whether start is before end date
			const isStartBeforeEnd = moment( actualStartDate ).isBefore( actualEndDate );

			expect( isStartBeforeEnd ).toBe( true );
		} );

		test( 'should clamp selected dates to respect firstSelectableDate prop', () => {
			const firstSelectableDate = moment( '01-06-2018', 'DD-MM-YYYY' );

			const endDateInPast = moment( firstSelectableDate ).subtract( 1, 'months' );

			const wrapper = shallow(
				<DateRange
					moment={ moment }
					selectedEndDate={ endDateInPast }
					firstSelectableDate={ firstSelectableDate }
				/>
			);

			const expectedStartDate = toHumanDate( firstSelectableDate );
			const expectedEndDate = toHumanDate( firstSelectableDate );

			const actualStartDate = toHumanDate( wrapper.state().startDate );
			const actualEndDate = toHumanDate( wrapper.state().endDate );

			expect( actualStartDate ).toEqual( expectedStartDate );
			expect( actualEndDate ).toEqual( expectedEndDate );
		} );

		test( 'should clamp selected dates to respect lastSelectableDate prop', () => {
			const lastSelectableDate = moment( '01-06-2018', 'DD-MM-YYYY' );

			const endDateInFuture = moment( lastSelectableDate ).add( 1, 'months' );

			const wrapper = shallow(
				<DateRange
					moment={ moment }
					selectedEndDate={ endDateInFuture }
					lastSelectableDate={ lastSelectableDate }
				/>
			);

			const expectedStartDate = toHumanDate( moment( lastSelectableDate ).subtract( 1, 'months' ) );
			const expectedEndDate = toHumanDate( lastSelectableDate );

			const actualStartDate = toHumanDate( wrapper.state().startDate );
			const actualEndDate = toHumanDate( wrapper.state().endDate );

			expect( actualStartDate ).toEqual( expectedStartDate );
			expect( actualEndDate ).toEqual( expectedEndDate );
		} );
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

		test( 'should toggle popover on trigger click', () => {
			const wrapper = shallow( <DateRange moment={ moment } /> );

			const trigger = wrapper.find( DateRangeTrigger );

			let popover;

			// Open
			trigger.props().onTriggerClick();

			wrapper.update();

			popover = wrapper.find( Popover );

			expect( popover.props().isVisible ).toBe( true );

			// Close
			trigger.props().onTriggerClick();

			wrapper.update();

			popover = wrapper.find( Popover );

			expect( popover.props().isVisible ).toBe( false );
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

		test( 'should set 2 month calendar view on screens >480px by default', () => {
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

		test( 'should set 1 month calendar view on screens <480px by default', () => {
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

		test( 'should allow custom function to determine numer of months to show', () => {
			// Custom function that always return true which should
			// ensure we always see 2 months
			const mock = jest.fn().mockImplementation( () => true );

			const wrapper = shallow( <DateRange moment={ moment } numMonths={ mock } /> );
			const datePicker = wrapper.find( DatePicker );

			expect( datePicker.props().numberOfMonths ).toEqual( 2 );
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
				<DateRange
					selectedStartDate={ momentStartDate }
					selectedEndDate={ momentEndDate }
					moment={ moment }
				/>
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
				<DateRange
					selectedStartDate={ momentStartDate }
					selectedEndDate={ momentEndDate }
					moment={ moment }
				/>
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

		test( 'should not update start date if input date is outside firstSelectableDate', () => {
			const now = new Date();

			// Shouldn't be able to select dates before "today"
			const pastDate = toHumanDate( moment.utc( now ).subtract( 6, 'months' ) );

			const wrapper = shallow( <DateRange firstSelectableDate={ now } moment={ moment } /> );

			wrapper.instance().handleInputBlur( pastDate, 'Start' );

			expect( wrapper.state().startDate.format( 'DD/MM/YYYY' ) ).not.toEqual( pastDate );
		} );

		test( 'should not update end date if input date is outside firstSelectableDate', () => {
			const now = new Date();

			// Shouldn't be able to select dates before "today"
			const pastDate = toHumanDate( moment.utc( now ).subtract( 6, 'months' ) );

			const wrapper = shallow( <DateRange firstSelectableDate={ now } moment={ moment } /> );

			wrapper.instance().handleInputBlur( pastDate, 'End' );

			expect( wrapper.state().endDate.format( 'DD/MM/YYYY' ) ).not.toEqual( pastDate );
		} );

		test( 'should not update start or end date if the value of input for the start date is outside lastSelectableDate', () => {
			const now = new Date();

			// Shouldn't be able to select dates before "today"
			const futureDate = toHumanDate( moment.utc( now ).add( 3, 'days' ) );

			const wrapper = shallow( <DateRange lastSelectableDate={ now } moment={ moment } /> );

			wrapper.instance().handleInputBlur( futureDate, 'Start' );

			// We must check BOTH because due to the the need to ensure start is always before end
			// in a range, if you select a start which is after "end" in the range then the range
			// automatically causes it to become the new value for "end" and leave "start" untouched
			// This means we have to test that neither start nor end have taken on the invalid date
			expect( wrapper.state().startDate.format( 'DD/MM/YYYY' ) ).not.toEqual( futureDate );
			expect( wrapper.state().endDate.format( 'DD/MM/YYYY' ) ).not.toEqual( futureDate );
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

	describe( 'Render props', () => {
		test( 'should allow for render prop to overide trigger render', () => {
			const spyComponent = jest.fn();

			shallow( <DateRange moment={ moment } renderTrigger={ spyComponent } /> );

			const props = spyComponent.mock.calls[ 0 ][ 0 ];
			const propKeys = Object.keys( props ).sort();

			expect( spyComponent ).toHaveBeenCalledTimes( 1 );

			expect( propKeys ).toEqual(
				[ 'startDateText', 'endDateText', 'buttonRef', 'onTriggerClick' ].sort()
			);
		} );

		test( 'should allow for render prop to overide header render', () => {
			const spyComponent = jest.fn();

			shallow( <DateRange moment={ moment } renderHeader={ spyComponent } /> );

			const props = spyComponent.mock.calls[ 0 ][ 0 ];
			const propKeys = Object.keys( props ).sort();

			expect( spyComponent ).toHaveBeenCalledTimes( 1 );

			expect( propKeys ).toEqual( [ 'onApplyClick', 'onCancelClick' ].sort() );
		} );

		test( 'should allow for render prop to overide inputs render', () => {
			const spyComponent = jest.fn();

			shallow( <DateRange moment={ moment } renderInputs={ spyComponent } /> );

			const props = spyComponent.mock.calls[ 0 ][ 0 ];
			const propKeys = Object.keys( props ).sort();

			expect( spyComponent ).toHaveBeenCalledTimes( 1 );

			expect( propKeys ).toEqual(
				[ 'startDateValue', 'endDateValue', 'onInputChange', 'onInputBlur' ].sort()
			);
		} );
	} );

	afterEach( () => {
		MockDate.reset();
	} );
} );
