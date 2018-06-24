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
import MediaDateRange from '../media-date-range';
import DatePicker from 'components/date-picker';

describe( 'MediaDateRange', () => {
	let fixedEndDate;

	beforeEach( () => {
		fixedEndDate = moment( '01-06-2018', 'DD-MM-YYYY' );

		// Set the clock for our test assertions so that new Date()
		// will return the known `fixedEndDate` set above. This helps
		// us control the non-determenism that comes from usage of
		// Date within the component
		MockDate.set( fixedEndDate );
	} );

	test( 'should render', () => {
		const wrapper = shallow( <MediaDateRange /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( "should render button text with date range of minus one month from today's date", () => {
		const wrapper = shallow( <MediaDateRange /> );

		const triggerText = wrapper.find( '.media-library__date-range-btn span' ).text();
		const expectedText = '01/05/2018-01/06/2018';
		expect( triggerText ).toBe( expectedText );
	} );

	test( 'should update trigger button text to match currently selected dates', () => {
		const wrapper = shallow( <MediaDateRange /> );

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
		const wrapper = shallow( <MediaDateRange /> );
		const triggerBtn = wrapper.find( '.media-library__date-range-btn' );
		expect( wrapper.state().popoverVisible ).toBe( false );

		triggerBtn.simulate( 'click' );

		expect( wrapper.state().popoverVisible ).toBe( true );

		triggerBtn.simulate( 'click' );

		expect( wrapper.state().popoverVisible ).toBe( false );
	} );

	test( 'should only persist date selection when user clicks "Apply" button', () => {
		const wrapper = shallow( <MediaDateRange /> );
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
		const wrapper = shallow( <MediaDateRange /> );
		const instance = wrapper.instance();
		const state = wrapper.state();
		const datePicker = wrapper.find( DatePicker );
		const today = new Date();

		// console.log( wrapper.onSelectDate );
		// console.log( datePicker.props() );
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

	afterEach( () => {
		MockDate.reset();
	} );
} );
