/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import MockDate from 'mockdate';
import { translate } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { DateRange } from '../index.js';
import DatePicker from 'components/date-picker';
import DateRangeTrigger from 'components/date-range/trigger';
import DateRangeInputs from 'components/date-range/inputs';
import DateRangeHeader from 'components/date-range/header';
import Popover from 'components/popover';

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
		const wrapper = shallow( <DateRange moment={ moment } translate={ translate } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	describe( 'Date range clamping', () => {
		test( 'should ensure the end date is not before the start date', () => {
			const selectedEndDate = moment( '2018-06-01' );

			const selectedStartDate = moment( selectedEndDate ).add( 1, 'months' );

			const wrapper = shallow(
				<DateRange
					moment={ moment }
					translate={ translate }
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
			const firstSelectableDate = moment( '2018-06-01' );

			const endDateInPast = moment( firstSelectableDate ).subtract( 1, 'months' );
			const startDateInPast = moment( endDateInPast ).subtract( 1, 'months' );

			const wrapper = shallow(
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

			const actualStartDate = dateToLocaleString( wrapper.state().startDate );
			const actualEndDate = dateToLocaleString( wrapper.state().endDate );

			// Expect start/end are both clamped to the first selectable Date
			expect( actualStartDate ).toEqual( expectedStartDate );
			expect( actualEndDate ).toEqual( expectedEndDate );
		} );

		test( 'should clamp selected dates to respect lastSelectableDate prop', () => {
			const lastSelectableDate = moment( '2018-06-01' );

			const startDateInFuture = moment( lastSelectableDate ).add( 1, 'months' );
			const endDateInFuture = moment( lastSelectableDate ).add( 2, 'months' );

			const wrapper = shallow(
				<DateRange
					moment={ moment }
					translate={ translate }
					selectedStartDate={ startDateInFuture }
					selectedEndDate={ endDateInFuture }
					lastSelectableDate={ lastSelectableDate }
				/>
			);

			const expectedStartDate = dateToLocaleString( lastSelectableDate );
			const expectedEndDate = dateToLocaleString( lastSelectableDate );

			const actualStartDate = dateToLocaleString( wrapper.state().startDate );
			const actualEndDate = dateToLocaleString( wrapper.state().endDate );

			// Expect start/end to be clamped to the last selectable date
			expect( actualStartDate ).toEqual( expectedStartDate );
			expect( actualEndDate ).toEqual( expectedEndDate );
		} );
	} );

	describe( 'Trigger element', () => {
		test( 'should render trigger with appropriate placeholders if no dates provided or selected', () => {
			const wrapper = shallow( <DateRange translate={ translate } moment={ moment } /> );

			const dateRangeTrigger = wrapper.find( DateRangeTrigger );

			const expected = {
				startDateText: 'MM/DD/YYYY',
				endDateText: 'MM/DD/YYYY',
			};

			expect( dateRangeTrigger.props() ).toEqual( expect.objectContaining( expected ) );
		} );

		test( 'should update trigger props to match currently selected dates', () => {
			const wrapper = shallow( <DateRange translate={ translate } moment={ moment } /> );

			const expectedStartDate = '2018-04-01';
			const expectedEndDate = '2018-04-29';

			const newStartDate = moment( expectedStartDate );
			const newEndDate = moment( expectedEndDate );

			// Select dates using API
			// note: not usually recommended to access component API directly
			// but it's tricky to do this via DOM on a datepicker...
			wrapper.instance().onSelectDate( newStartDate );
			wrapper.instance().onSelectDate( newEndDate );

			// Force re-render
			wrapper.update();

			const dateRangeTrigger = wrapper.find( DateRangeTrigger );

			const expected = {
				startDateText: dateToLocaleString( newStartDate ),
				endDateText: dateToLocaleString( newEndDate ),
			};

			expect( dateRangeTrigger.props() ).toEqual( expect.objectContaining( expected ) );
		} );

		test( 'should toggle popover on trigger click', () => {
			const wrapper = shallow( <DateRange translate={ translate } moment={ moment } /> );

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

		test( 'should reset Dates on trigger clear btn click', () => {
			const endDate = moment( '2018-05-30' );
			const startDate = moment( '2018-04-30' );

			const wrapper = shallow(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			const trigger = wrapper.find( DateRangeTrigger );

			trigger.props().onClearClick();

			wrapper.update();

			// Should have completed reset the Dates
			expect( wrapper.state() ).toEqual(
				expect.objectContaining( {
					startDate: null,
					endDate: null,
					staleStartDate: null,
					staleEndDate: null,
					textInputStartDate: '',
					textInputEndDate: '',
				} )
			);
		} );
	} );

	describe( 'DatePicker element', () => {
		const matchMediaDefaults = {
			onchange: null,
			addListener: jest.fn(),
			removeListener: jest.fn(),
		};

		test( 'should pass expected default props to DatePicker', () => {
			const wrapper = shallow( <DateRange translate={ translate } moment={ moment } /> );
			const instance = wrapper.instance();
			const datePicker = wrapper.find( DatePicker );

			expect( datePicker.props() ).toEqual(
				expect.objectContaining( {
					showOutsideDays: false,
					fromMonth: undefined,
					toMonth: undefined,
					onSelectDay: instance.onSelectDate,
					selectedDays: [
						null,
						{
							from: null,
							to: null,
						},
					],
					numberOfMonths: 2, // controlled via matchMedia mock
					disabledDays: [ {} ],
					calendarViewDate: null,
					rootClassNames: {
						'date-range__picker': true,
					},
					modifiers: {
						start: null,
						end: null,
						range: {
							from: null,
							to: null,
						},
						'range-end': null,
						'range-start': null,
					},
				} )
			);
		} );

		test( 'should set 2 month calendar view on screens >480px by default', () => {
			window.matchMedia = jest.fn().mockImplementation( ( query ) => {
				return {
					...matchMediaDefaults,
					matches: true, // > 480px
					media: query,
				};
			} );

			const wrapper = shallow( <DateRange translate={ translate } moment={ moment } /> );
			const datePicker = wrapper.find( DatePicker );

			expect( datePicker.props().numberOfMonths ).toEqual( 2 );
		} );

		test( 'should set 1 month calendar view on screens <480px by default', () => {
			window.matchMedia = jest.fn().mockImplementation( ( query ) => {
				return {
					...matchMediaDefaults,
					matches: false, // < 480px
					media: query,
				};
			} );

			const wrapper = shallow( <DateRange translate={ translate } moment={ moment } /> );
			const datePicker = wrapper.find( DatePicker );

			expect( datePicker.props().numberOfMonths ).toEqual( 1 );
		} );

		test( 'should disable dates before firstSelectableDate when set', () => {
			const today = new Date();
			const wrapper = shallow(
				<DateRange translate={ translate } moment={ moment } firstSelectableDate={ today } />
			);
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
			const wrapper = shallow(
				<DateRange translate={ translate } moment={ moment } lastSelectableDate={ today } />
			);
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

			const wrapper = shallow(
				<DateRange translate={ translate } moment={ moment } firstSelectableDate={ today } />
			);
			const datePicker = wrapper.find( DatePicker );

			const expected = today;
			const actual = datePicker.props().fromMonth;

			expect( actual ).toEqual( expected );
		} );

		test( 'should disable DatePicker UI for months after lastSelectableDate when set', () => {
			const today = new Date();

			const wrapper = shallow(
				<DateRange translate={ translate } moment={ moment } lastSelectableDate={ today } />
			);
			const datePicker = wrapper.find( DatePicker );

			const expected = today;
			const actual = datePicker.props().toMonth;

			expect( actual ).toEqual( expected );
		} );
	} );

	describe( 'Input elements', () => {
		test( 'should see inputs reflect date picker selection', () => {
			const wrapper = shallow( <DateRange translate={ translate } moment={ moment } /> );

			const expectedStart = '2018-04-03';
			const expectedEnd = '2018-04-29';

			const newStartDate = moment( expectedStart );
			const newEndDate = moment( expectedEnd );

			// Select dates using API
			wrapper.instance().onSelectDate( newStartDate );
			wrapper.instance().onSelectDate( newEndDate );

			// Force update
			wrapper.update();

			const dateRangeInputs = wrapper.find( DateRangeInputs );

			expect( dateRangeInputs.props() ).toEqual(
				expect.objectContaining( {
					startDateValue: dateToLocaleString( newStartDate ),
					endDateValue: dateToLocaleString( newEndDate ),
				} )
			);
		} );

		test( 'should update start date selection on start date input blur event', () => {
			const endDate = moment( '2018-05-30' );
			const startDate = moment( endDate ).subtract( 1, 'months' );

			const wrapper = shallow(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			wrapper.instance().handleInputBlur( '03/20/2018', 'Start' );

			expect( dateToLocaleString( wrapper.state().startDate ) ).toEqual(
				dateToLocaleString( '03/20/2018' )
			);
		} );

		test( 'should update end date selection on end date input blur event', () => {
			const endDate = moment( '2018-05-30' );
			const startDate = moment( endDate ).subtract( 1, 'months' );

			const wrapper = shallow(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			const inputs = wrapper.find( DateRangeInputs );

			inputs.props().onInputBlur( '05/28/2018', 'End' );

			expect( dateToLocaleString( wrapper.state().endDate ) ).toEqual(
				dateToLocaleString( '05/28/2018' )
			);
		} );

		test( 'should not update date selection on input change event', () => {
			const endDate = moment( '2018-05-28' );
			const startDate = moment( endDate ).subtract( 1, 'months' );

			const wrapper = shallow(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			wrapper.instance().handleInputChange( '05/30/2018', 'End' );

			wrapper.instance().handleInputChange( '05/01/2018', 'Start' );

			expect( dateToLocaleString( wrapper.state().endDate ) ).toEqual(
				dateToLocaleString( endDate )
			);

			expect( dateToLocaleString( wrapper.state().startDate ) ).toEqual(
				dateToLocaleString( startDate )
			);
		} );

		test( 'should update `textInput*` state on input change event', () => {
			const endDate = moment( '2018-05-28' );
			const startDate = moment( endDate ).subtract( 1, 'months' );

			const newStartDate = '03/30/2018';
			const newEndDate = '06/30/2018';

			const wrapper = shallow(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			wrapper.instance().handleInputChange( newStartDate, 'Start' );
			wrapper.instance().handleInputChange( newEndDate, 'End' );

			expect( wrapper.state().textInputStartDate ).toEqual( dateToLocaleString( newStartDate ) );
			expect( wrapper.state().textInputEndDate ).toEqual( dateToLocaleString( newEndDate ) );
		} );

		test( 'should not update either start or end date selection if the new input date value is the same as that stored in state', () => {
			const endDate = moment( '2018-05-28' );
			const startDate = moment( endDate ).subtract( 1, 'months' );

			const wrapper = shallow(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			wrapper.instance().handleInputBlur( '2018-04-28', 'Start' ); // same as original date
			wrapper.instance().handleInputBlur( '2018-05-28', 'End' ); // same as original date

			expect( dateToLocaleString( wrapper.state().startDate ) ).toEqual(
				dateToLocaleString( startDate )
			);

			expect( dateToLocaleString( wrapper.state().endDate ) ).toEqual(
				dateToLocaleString( endDate )
			);
		} );

		test( 'should not update start/end dates if input date is invalid', () => {
			const endDate = moment( '2018-05-28' );
			const startDate = moment( endDate ).subtract( 1, 'months' );

			const wrapper = shallow(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			const invalidDateString = 'inv/alid/datestring';

			wrapper.instance().handleInputBlur( invalidDateString, 'Start' );
			wrapper.instance().handleInputBlur( invalidDateString, 'End' );

			expect( dateToLocaleString( wrapper.state().startDate ) ).not.toEqual( invalidDateString );
			expect( dateToLocaleString( wrapper.state().startDate ) ).toEqual(
				dateToLocaleString( startDate )
			);
			expect( dateToLocaleString( wrapper.state().endDate ) ).not.toEqual( invalidDateString );
			expect( dateToLocaleString( wrapper.state().endDate ) ).toEqual(
				dateToLocaleString( endDate )
			);
		} );

		test( 'should not update start date if input date is outside firstSelectableDate', () => {
			const endDate = moment( '2018-05-28' );
			const startDate = moment( '2018-04-28' );

			const firstSelectableDate = moment( '2018-03-28' );

			const badDate = moment( firstSelectableDate ).subtract( 11, 'months' );

			const wrapper = shallow(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					firstSelectableDate={ firstSelectableDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			const inputs = wrapper.find( DateRangeInputs );

			inputs.props().onInputBlur( badDate, 'Start' );

			expect( dateToLocaleString( wrapper.state().startDate ) ).not.toEqual( badDate );
		} );

		test( 'should not update end date if input date is outside firstSelectableDate', () => {
			const endDate = moment( '2018-05-28' );
			const startDate = moment( '2018-04-28' );

			const firstSelectableDate = moment( '2018-03-28' );

			const badDate = moment( firstSelectableDate ).subtract( 11, 'months' );

			const wrapper = shallow(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					firstSelectableDate={ firstSelectableDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			const inputs = wrapper.find( DateRangeInputs );

			inputs.props().onInputBlur( badDate, 'End' );

			expect( dateToLocaleString( wrapper.state().startDate ) ).not.toEqual( badDate );
		} );

		test( 'should not update start or end date if the value of input for the start date is outside lastSelectableDate', () => {
			const startDate = moment( '2018-04-28' );
			const endDate = moment( '2018-05-28' );

			const lastSelectableDate = moment( '2018-06-28' );

			const badDate = dateToLocaleString( moment( lastSelectableDate ).add( 11, 'months' ) );

			const wrapper = shallow(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					lastSelectableDate={ lastSelectableDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			const inputs = wrapper.find( DateRangeInputs );

			inputs.props().onInputBlur( badDate, 'End' );

			expect( dateToLocaleString( wrapper.state().startDate ) ).not.toEqual( badDate );
			expect( dateToLocaleString( wrapper.state().endDate ) ).not.toEqual( badDate );

			expect( dateToLocaleString( wrapper.state().startDate ) ).toEqual( '04/28/2018' );
			expect( dateToLocaleString( wrapper.state().endDate ) ).toEqual( '05/28/2018' );
		} );
	} );

	describe( 'Callback props', () => {
		test( 'should call onDateSelect function when a date is selected', () => {
			const callback = jest.fn();

			const wrapper = shallow(
				<DateRange translate={ translate } moment={ moment } onDateSelect={ callback } />
			);

			const newStartDate = moment( '2018-04-01' );
			const newEndDate = moment( '2018-04-29' );

			// Select dates using API
			wrapper.instance().onSelectDate( newStartDate );
			wrapper.instance().onSelectDate( newEndDate );

			expect( callback ).toHaveBeenCalledTimes( 2 );

			expect( dateToLocaleString( callback.mock.calls[ 0 ][ 0 ] ) ).toEqual(
				dateToLocaleString( newStartDate )
			);
			expect( dateToLocaleString( callback.mock.calls[ 1 ][ 1 ] ) ).toEqual(
				dateToLocaleString( newEndDate )
			);
		} );

		test( 'should call onDateCommit function when a date is committed/applied', () => {
			const callback = jest.fn();

			const wrapper = shallow(
				<DateRange translate={ translate } moment={ moment } onDateCommit={ callback } />
			);

			const newStartDate = moment( '2018-04-01' );
			const newEndDate = moment( '2018-04-29' );

			// Select dates using API
			wrapper.instance().onSelectDate( newStartDate );
			wrapper.instance().onSelectDate( newEndDate );

			// Commit/apply those dates
			wrapper.instance().commitDates();

			expect( callback ).toHaveBeenCalledTimes( 1 );
			expect( dateToLocaleString( callback.mock.calls[ 0 ][ 0 ] ) ).toEqual(
				dateToLocaleString( newStartDate )
			);
			expect( dateToLocaleString( callback.mock.calls[ 0 ][ 1 ] ) ).toEqual(
				dateToLocaleString( newEndDate )
			);
		} );
	} );

	describe( 'Actions and Information UI', () => {
		test( 'should only persist date selection when user clicks "Apply" button', () => {
			const wrapper = shallow( <DateRange translate={ translate } moment={ moment } /> );
			const originalStartDate = wrapper.state().startDate;
			const originalEndDate = wrapper.state().endDate;

			// Get child components
			const dateRangeHeader = wrapper.find( DateRangeHeader );
			const datePicker = wrapper.find( DatePicker );

			const newStartDate = moment( '2018-04-01' );
			const newEndDate = moment( '2018-04-29' );

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
			expect( dateToLocaleString( wrapper.state().startDate ) ).toEqual(
				dateToLocaleString( newStartDate )
			);
			expect( dateToLocaleString( wrapper.state().endDate ) ).toEqual(
				dateToLocaleString( newEndDate )
			);
		} );

		test( 'Should display prompt to select first date when no start date selected', () => {
			// Note that no dates are selected
			const wrapper = shallow( <DateRange translate={ translate } moment={ moment } /> );

			const infoText = wrapper.find( '.date-range__info' ).text();

			expect( infoText ).toEqual( expect.stringContaining( 'Please select the first day' ) );
		} );

		test( 'Should display prompt to select last date when no end date selected', () => {
			const startDate = moment( '2018-04-28' );

			// Note that no dates are selected
			const wrapper = shallow(
				<DateRange selectedStartDate={ startDate } translate={ translate } moment={ moment } />
			);

			const infoText = wrapper.find( '.date-range__info' ).text();

			expect( infoText ).toEqual( expect.stringContaining( 'Please select the last day' ) );
		} );

		test( 'Should display reset button when both dates are selected', () => {
			const startDate = moment( '2018-04-28' );
			const endDate = moment( '2018-05-28' );

			// Note that no dates are selected
			const wrapper = shallow(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			const resetExists = wrapper.exists( '.date-range__info-btn' );

			expect( resetExists ).toBe( true );
		} );

		test( 'Should reset selection when reset UI clicked', () => {
			const startDate = moment( '2018-04-28' );
			const endDate = moment( '2018-05-28' );

			const wrapper = shallow(
				<DateRange
					selectedStartDate={ startDate }
					selectedEndDate={ endDate }
					translate={ translate }
					moment={ moment }
				/>
			);

			const inputs = wrapper.find( DateRangeInputs );
			const resetBtn = wrapper.find( '.date-range__info-btn' );

			inputs.props().onInputBlur( '03/20/2018', 'Start' );
			inputs.props().onInputBlur( '09/20/2018', 'End' );

			expect( dateToLocaleString( wrapper.state().startDate ) ).toEqual(
				dateToLocaleString( '03/20/2018' )
			);
			expect( dateToLocaleString( wrapper.state().endDate ) ).toEqual(
				dateToLocaleString( '09/20/2018' )
			);

			// Now click to "clear" or "reset" the selection
			resetBtn.simulate( 'click' );

			expect( dateToLocaleString( wrapper.state().startDate ) ).toEqual(
				dateToLocaleString( '04/28/2018' )
			);
			expect( dateToLocaleString( wrapper.state().endDate ) ).toEqual(
				dateToLocaleString( '05/28/2018' )
			);
		} );
	} );

	describe( 'Render props', () => {
		test( 'should allow for render prop to overide trigger render', () => {
			const spyComponent = jest.fn();

			shallow(
				<DateRange translate={ translate } moment={ moment } renderTrigger={ spyComponent } />
			);

			const props = spyComponent.mock.calls[ 0 ][ 0 ];
			const propKeys = Object.keys( props ).sort();

			expect( spyComponent ).toHaveBeenCalledTimes( 1 );

			expect( propKeys ).toEqual(
				[
					'startDate',
					'endDate',
					'startDateText',
					'endDateText',
					'isCompact',
					'buttonRef',
					'onTriggerClick',
					'onClearClick',
					'triggerText',
					'showClearBtn',
				].sort()
			);
		} );

		test( 'should allow for render prop to overide header render', () => {
			const spyComponent = jest.fn();

			shallow(
				<DateRange translate={ translate } moment={ moment } renderHeader={ spyComponent } />
			);

			const props = spyComponent.mock.calls[ 0 ][ 0 ];
			const propKeys = Object.keys( props ).sort();

			expect( spyComponent ).toHaveBeenCalledTimes( 1 );

			expect( propKeys ).toEqual( [ 'onApplyClick', 'onCancelClick' ].sort() );
		} );

		test( 'should allow for render prop to overide inputs render', () => {
			const spyComponent = jest.fn();

			shallow(
				<DateRange translate={ translate } moment={ moment } renderInputs={ spyComponent } />
			);

			const props = spyComponent.mock.calls[ 0 ][ 0 ];
			const propKeys = Object.keys( props ).sort();

			expect( spyComponent ).toHaveBeenCalledTimes( 1 );

			expect( propKeys ).toEqual(
				[ 'startDateValue', 'endDateValue', 'onInputChange', 'onInputBlur', 'onInputFocus' ].sort()
			);
		} );
	} );

	afterEach( () => {
		MockDate.reset();
	} );
} );
