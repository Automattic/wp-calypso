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
import { MediaDateRange } from '../media-date-range';
import DatePicker from 'components/date-picker';

describe( 'MediaDateRange', () => {
	let fixedEndDate;

	beforeEach( () => {
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
		// test easier to assert again
		moment.locale( [ 'en-GB' ] );

		fixedEndDate = moment( '01-06-2018', 'DD-MM-YYYY' );

		// Set the clock for our test assertions so that new Date()
		// will return the known `fixedEndDate` set above. This helps
		// us control the non-determenism that comes from usage of
		// Date within the component
		MockDate.set( fixedEndDate );
	} );

	test( 'should render', () => {
		const wrapper = shallow( <MediaDateRange moment={ moment } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( "should render button text with date range of minus one month from today's date", () => {
		const wrapper = shallow( <MediaDateRange moment={ moment } /> );

		const triggerText = wrapper.find( '.media-library__date-range-btn span' ).text();
		const expectedText = '01/05/2018-01/06/2018';
		expect( triggerText ).toBe( expectedText );
	} );

	test( 'should update trigger button text to match currently selected dates', () => {
		const wrapper = shallow( <MediaDateRange moment={ moment } /> );

		const expectedStartDate = '01/04/2018';
		const expectedEndDate = '29/04/2018';
		const newStartDate = moment( expectedStartDate, 'DD/MM/YYYY' );
		const newEndDate = moment( expectedEndDate, 'DD/MM/YYYY' );

		// Select dates using API
		wrapper.instance().onSelectDate( newStartDate );
		wrapper.instance().onSelectDate( newEndDate );

		expect(
			wrapper
				.update() // force re-render
				.find( '.media-library__date-range-btn span' )
				.text()
		).toBe( `${ expectedStartDate }-${ expectedEndDate }` );
	} );

	test( 'should toggle Popover visibility on trigger button click', () => {
		const wrapper = shallow( <MediaDateRange moment={ moment } /> );
		const triggerBtn = wrapper.find( '.media-library__date-range-btn' );
		expect( wrapper.state().popoverVisible ).toBe( false );

		triggerBtn.simulate( 'click' );

		expect( wrapper.state().popoverVisible ).toBe( true );

		triggerBtn.simulate( 'click' );

		expect( wrapper.state().popoverVisible ).toBe( false );
	} );

	test( 'should only persist date selection when user clicks "Apply" button', () => {
		const wrapper = shallow( <MediaDateRange moment={ moment } /> );
		const triggerBtn = wrapper.find( '.media-library__date-range-btn' );
		const cancelBtn = wrapper.find( '.media-library__date-range-popover-cancel-btn' );
		const applyBtn = wrapper.find( '.media-library__date-range-popover-apply-btn' );
		const datePicker = wrapper.find( DatePicker );
		const originalStartDate = wrapper.state().startDate;
		const originalEndDate = wrapper.state().endDate;
		const newStartDate = moment( '01-04-2018', 'DD-MM-YYYY' );
		const newEndDate = moment( '29-04-2018', 'DD-MM-YYYY' );

		function selectNewDates() {
			triggerBtn.simulate( 'click' );
			datePicker.props().onSelectDay( newStartDate );
			datePicker.props().onSelectDay( newEndDate );
		}

		function assertDatesNotChanged() {
			// Expect dates not persisted to state
			expect( wrapper.state().startDate.format( 'DD-MM-YYYY' ) ).toBe(
				originalStartDate.format( 'DD-MM-YYYY' )
			);
			expect( wrapper.state().endDate.format( 'DD-MM-YYYY' ) ).toBe(
				originalEndDate.format( 'DD-MM-YYYY' )
			);
		}

		// Open and select dates
		selectNewDates();

		expect( wrapper.state().startDate.format( 'DD-MM-YYYY' ) ).toBe(
			newStartDate.format( 'DD-MM-YYYY' )
		);

		expect( wrapper.state().endDate.format( 'DD-MM-YYYY' ) ).toBe(
			newEndDate.format( 'DD-MM-YYYY' )
		);

		// Close without Applying
		triggerBtn.simulate( 'click' );

		// Expected dates to have reverted back
		assertDatesNotChanged();

		// Open picker
		selectNewDates();

		// Click "cancel" button
		cancelBtn.simulate( 'click' );

		// Expected dates to have reverted back
		assertDatesNotChanged();

		// Open picker
		selectNewDates();

		// Click on "Apply" button
		applyBtn.simulate( 'click' );

		// Expect the new dates to be persisted to state
		expect( wrapper.state().startDate.format( 'DD-MM-YYYY' ) ).toBe(
			newStartDate.format( 'DD-MM-YYYY' )
		);
		expect( wrapper.state().endDate.format( 'DD-MM-YYYY' ) ).toBe(
			newEndDate.format( 'DD-MM-YYYY' )
		);
	} );

	test( 'should pass correct props to DatePicker', () => {
		const wrapper = shallow( <MediaDateRange moment={ moment } /> );
		const instance = wrapper.instance();
		const state = wrapper.state();
		const datePicker = wrapper.find( DatePicker );
		const today = new Date();

		expect( datePicker.props() ).toEqual(
			expect.objectContaining( {
				selectedDays: {
					from: state.startDate.toDate(),
					to: state.endDate.toDate(),
				},
				numberOfMonths: 2,
				calendarViewDate: state.startDate.toDate(),
				onSelectDay: instance.onSelectDate,
				disabledDays: [
					{
						after: today,
					},
				],
			} )
		);
	} );

	test( 'should show 1 month calendar view on screens <480px', () => {
		window.matchMedia = jest.fn().mockImplementation( query => {
			return {
				matches: false,
				media: query,
				onchange: null,
				addListener: jest.fn(),
				removeListener: jest.fn(),
			};
		} );

		const wrapper = shallow( <MediaDateRange moment={ moment } /> );
		const datePicker = wrapper.find( DatePicker );

		expect( datePicker.props().numberOfMonths ).toEqual( 1 );
	} );

	describe( 'text inputs', () => {
		let startDate;
		let endDate;
		let startDateISO;
		let endDateISO;
		let momentStartDate;
		let momentEndDate;
		let startDateEvent;
		let endDateEvent;

		beforeEach( () => {
			startDate = '01/04/2018';
			startDateISO = '2018-01-04';
			endDate = '01/05/2018';
			endDateISO = '2018-01-05';
			momentStartDate = moment( startDateISO );
			momentEndDate = moment( endDateISO );

			startDateEvent = {
				target: {
					value: startDate,
					id: 'startDate',
				},
			};

			endDateEvent = {
				target: {
					value: endDate,
					id: 'endDate',
				},
			};
		} );

		test( 'should allow date selection via inputs', () => {
			const wrapper = shallow( <MediaDateRange moment={ moment } /> );

			const startDateInput = wrapper.find( '#startDate' );
			startDateInput.simulate( 'change', startDateEvent );
			startDateInput.simulate( 'blur', startDateEvent );

			const endDateInput = wrapper.find( '#endDate' );
			endDateInput.simulate( 'change', endDateEvent );
			endDateInput.simulate( 'blur', endDateEvent );

			expect( wrapper.state().startDate.format( 'DD/MM/YYYY' ) ).toEqual(
				momentStartDate.format( 'DD/MM/YYYY' )
			);

			expect( wrapper.state().endDate.format( 'DD/MM/YYYY' ) ).toEqual(
				momentEndDate.format( 'DD/MM/YYYY' )
			);
		} );

		test( 'should not update date selection before input is blurred', () => {
			const wrapper = shallow( <MediaDateRange moment={ moment } /> );

			const startDateInput = wrapper.find( '#startDate' );
			startDateInput.simulate( 'change', startDateEvent );

			expect( wrapper.state().startDate.format( 'DD/MM/YYYY' ) ).not.toEqual(
				momentStartDate.format( 'DD/MM/YYYY' )
			);
		} );

		test( 'should not update start/end date selection if the new input date value is the same as that stored in state', () => {
			const wrapper = shallow(
				<MediaDateRange startDate={ momentStartDate } endDate={ momentEndDate } moment={ moment } />
			);

			const startDateInput = wrapper.find( '#startDate' );
			startDateInput.simulate( 'blur', startDateEvent );

			expect( wrapper.state().startDate.format( 'DD/MM/YYYY' ) ).toEqual(
				momentStartDate.format( 'DD/MM/YYYY' )
			);

			expect( wrapper.state().endDate.format( 'DD/MM/YYYY' ) ).toEqual(
				momentEndDate.format( 'DD/MM/YYYY' )
			);
		} );

		test( 'should not update start/end dates if input date is invalid', () => {
			const wrapper = shallow( <MediaDateRange moment={ moment } /> );
			const invalidDateString = '01/04/invaliddatestring';

			const invalidStartDateEvent = Object.assign( {}, startDateEvent, {
				value: invalidDateString,
			} );

			const startDateInput = wrapper.find( '#startDate' );
			startDateInput.simulate( 'change', invalidStartDateEvent );

			expect( wrapper.state().startDate.format( 'DD/MM/YYYY' ) ).not.toEqual( invalidDateString );
		} );

		test( 'should not update start/end dates if input date is in the future', () => {
			const wrapper = shallow( <MediaDateRange moment={ moment } /> );
			const invalidDateString = '01/04/2154';

			const invalidEndDateEvent = Object.assign( {}, endDateEvent, {
				value: invalidDateString,
			} );

			const endDateInput = wrapper.find( '#endDate' );
			endDateInput.simulate( 'blur', invalidEndDateEvent );

			expect( wrapper.state().endDate.format( 'DD/MM/YYYY' ) ).not.toEqual( invalidDateString );
		} );

		test( 'should not update start/end dates if input date is before Epoch date (1970)', () => {
			const wrapper = shallow( <MediaDateRange moment={ moment } /> );
			const invalidDateString = '01/04/1969';

			const invalidStartDateEvent = Object.assign( {}, startDateEvent, {
				value: invalidDateString,
			} );

			const startDateInput = wrapper.find( '#startDate' );
			startDateInput.simulate( 'blur', invalidStartDateEvent );

			expect( wrapper.state().startDate.format( 'DD/MM/YYYY' ) ).not.toEqual( invalidDateString );
		} );

		test( 'should see inputs reflect date picker selection', () => {
			const wrapper = shallow( <MediaDateRange moment={ moment } /> );

			const expectedStart = '03/04/2018';
			const expectedEnd = '29/04/2018';

			const newStartDate = moment( expectedStart, 'DD/MM/YYYY' );
			const newEndDate = moment( expectedEnd, 'DD/MM/YYYY' );

			// Select dates using API
			wrapper.instance().onSelectDate( newStartDate );
			wrapper.instance().onSelectDate( newEndDate );

			// Force update
			wrapper.update();

			const startDateInput = wrapper.find( '#startDate' );
			const endDateInput = wrapper.find( '#endDate' );

			expect( startDateInput.props().value ).toBe( expectedStart );
			expect( endDateInput.props().value ).toBe( expectedEnd );
		} );
	} );

	describe( 'callbacks', () => {
		test( 'should call onDateSelect function when a date is selected', () => {
			const callback = jest.fn();

			const wrapper = shallow( <MediaDateRange moment={ moment } onDateSelect={ callback } /> );

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

			const wrapper = shallow( <MediaDateRange moment={ moment } onDateCommit={ callback } /> );

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

	afterEach( () => {
		MockDate.reset();
	} );
} );
