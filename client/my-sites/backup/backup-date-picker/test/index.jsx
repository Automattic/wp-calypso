/**
 * @jest-environment jsdom
 */

/**
 * Default mock implementations
 */
const mockUseDispatch = () => () => null;
const mockUseSelector = ( func ) => func();
const mockUseTranslate = () => ( text ) => text;
const mockUseCanGoToDate = () => () => true;
const mockUseQuery = () => () => ( { isLoading: true, data: null } );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: jest.fn(),
} ) );
jest.mock( '@tanstack/react-query', () => ( {
	useQuery: jest.fn(),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
	useDispatch: jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
jest.mock( 'calypso/state/selectors/get-site-gmt-offset' );
jest.mock( 'calypso/state/selectors/get-site-timezone-value' );
jest.mock( '../hooks', () => ( {
	...jest.requireActual( '../hooks' ),
	useCanGoToDate: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/get-rewind-backups' );

jest.mock( 'calypso/state/rewind/selectors/site-has-backups', () =>
	jest.fn().mockImplementation( () => true )
);

import { useQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import BackupDatePicker from '..';
import { useCanGoToDate } from '../hooks';

const realDateNow = Date.now;

describe( 'BackupDatePicker', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		// Re-mock dependencies
		Date.now = realDateNow;
		useDispatch.mockImplementation( mockUseDispatch );
		useSelector.mockImplementation( mockUseSelector );
		useTranslate.mockImplementation( mockUseTranslate );
		useCanGoToDate.mockImplementation( mockUseCanGoToDate );
		useQuery.mockImplementation( mockUseQuery );
	} );

	// --- DATE DISPLAY ---

	test( "Shows 'Yesterday' as the previous date if the current date is today", () => {
		Date.now = jest.fn().mockReturnValue( new Date( '2020-12-04T12:00:00.000Z' ) );

		const today = moment();
		const { container } = render(
			<BackupDatePicker selectedDate={ today } onDateChange={ () => {} } />
		);

		expect( container ).toMatchSnapshot();
	} );

	test( "Shows only the month and date for the previous date if it's the same year as today", () => {
		// Mock the definition of 'now,' so that our test date is always in the same year
		Date.now = jest.fn().mockReturnValue( new Date( '2020-12-04T12:00:00.000Z' ) );
		const november4Of2020 = moment().subtract( 1, 'month' );

		const { container } = render(
			<BackupDatePicker selectedDate={ november4Of2020 } onDateChange={ () => {} } />
		);

		expect( container ).toMatchSnapshot();
	} );

	test( "Shows month, date, and year for the previous date if it's not the same year as today", () => {
		Date.now = jest.fn().mockReturnValue( new Date( '2020-12-04T12:00:00.000Z' ) );
		const oneYearAgo = moment().subtract( 1, 'year' );

		const { container } = render(
			<BackupDatePicker selectedDate={ oneYearAgo } onDateChange={ () => {} } />
		);

		expect( container ).toMatchSnapshot();
	} );

	test( "Shows month and date for the next date if it's in the same year as today", () => {
		// Mock the definition of 'now,' so that our test date is always in the same year
		Date.now = jest.fn().mockReturnValue( new Date( '2020-12-04T12:00:00.000Z' ) );
		const december4Of2020 = moment();

		const { container } = render(
			<BackupDatePicker selectedDate={ december4Of2020 } onDateChange={ () => {} } />
		);

		expect( container ).toMatchSnapshot();
	} );

	test( "Does not show the next date as 'Yesterday' even if it is yesterday", () => {
		const twoDaysBefore = moment().subtract( 2, 'days' );
		render( <BackupDatePicker selectedDate={ twoDaysBefore } onDateChange={ () => {} } /> );

		expect( screen.queryByText( 'Yesterday' ) ).not.toBeInTheDocument();
	} );

	test( "Does not show the next date as 'Today', even if it is today", () => {
		const yesterday = moment().subtract( 1, 'day' );

		render( <BackupDatePicker selectedDate={ yesterday } onDateChange={ () => {} } /> );

		expect( screen.queryByText( 'Today' ) ).not.toBeInTheDocument();
	} );

	test( "Shows month, date, and year for the next date if it's not the same year as today", () => {
		Date.now = jest.fn().mockReturnValue( new Date( '2020-12-04T12:00:00.000Z' ) );
		const twoYearsAgo = moment().subtract( 2, 'years' );

		const { container } = render(
			<BackupDatePicker selectedDate={ twoYearsAgo } onDateChange={ () => {} } />
		);

		expect( container ).toMatchSnapshot();
	} );

	// --- NAVIGATION ---

	test( 'Navigates backward when the previous date is clicked', async () => {
		const user = userEvent.setup();

		const selectedDate = moment( '2020-01-01' );
		const onDateChange = jest.fn();

		render( <BackupDatePicker selectedDate={ selectedDate } onDateChange={ onDateChange } /> );

		const button = screen.getByText( 'Dec 31, 2019' );
		await user.click( button );

		expect( onDateChange ).toHaveBeenCalledWith( selectedDate.subtract( 1, 'day' ) );
	} );

	test( 'Navigates forward when the next date is clicked', async () => {
		const user = userEvent.setup();

		const selectedDate = moment( '2020-01-01' );
		const onDateChange = jest.fn();

		render( <BackupDatePicker selectedDate={ selectedDate } onDateChange={ onDateChange } /> );
		const button = screen.getByText( 'Jan 2, 2020' );

		await user.click( button );

		expect( onDateChange ).toHaveBeenCalledWith( selectedDate.add( 1, 'day' ) );
	} );

	test( 'Navigates backward when the previous date is focused and the spacebar is pressed', async () => {
		const user = userEvent.setup();

		const selectedDate = moment( '2020-01-01' );
		const onDateChange = jest.fn();

		render( <BackupDatePicker selectedDate={ selectedDate } onDateChange={ onDateChange } /> );

		const button = screen.getByRole( 'button', { name: 'Go to previous date' } );

		button.focus();
		await user.keyboard( '[Space]' );

		expect( onDateChange ).toHaveBeenCalledWith( selectedDate.subtract( 1, 'day' ) );
	} );

	test( 'Navigates forward when the next date is focused and the spacebar is pressed', async () => {
		const user = userEvent.setup();

		const selectedDate = moment( '2020-01-01' );
		const onDateChange = jest.fn();

		render( <BackupDatePicker selectedDate={ selectedDate } onDateChange={ onDateChange } /> );

		const button = screen.getByRole( 'button', { name: 'Go to next date' } );
		button.focus();

		await user.keyboard( '[Space]' );

		expect( onDateChange ).toHaveBeenCalledWith( selectedDate.add( 1, 'day' ) );
	} );

	// --- ANALYTICS ---

	test( 'Records a Tracks event for backward navigation', async () => {
		const user = userEvent.setup();
		const selectedDate = moment( '2020-01-01' );

		const dispatchMock = jest.fn();
		useDispatch.mockImplementation( () => dispatchMock );

		render( <BackupDatePicker selectedDate={ selectedDate } onDateChange={ () => {} } /> );

		await user.click( screen.getByText( 'Dec 31, 2019' ) );

		expect( dispatchMock ).toHaveBeenCalledWith(
			expect.objectContaining( {
				meta: {
					analytics: [
						expect.objectContaining( {
							payload: expect.objectContaining( { name: 'calypso_jetpack_backup_date_previous' } ),
						} ),
					],
				},
			} )
		);
	} );

	test( 'Records a Tracks event for forward navigation', async () => {
		const user = userEvent.setup();
		const selectedDate = moment( '2020-01-01' );

		const dispatchMock = jest.fn();
		useDispatch.mockImplementation( () => dispatchMock );

		render( <BackupDatePicker selectedDate={ selectedDate } onDateChange={ () => {} } /> );

		await user.click( screen.getByText( 'Jan 2, 2020' ) );

		expect( dispatchMock ).toHaveBeenCalledWith(
			expect.objectContaining( {
				meta: {
					analytics: [
						expect.objectContaining( {
							payload: expect.objectContaining( { name: 'calypso_jetpack_backup_date_next' } ),
						} ),
					],
				},
			} )
		);
	} );
} );
