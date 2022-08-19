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
jest.mock( 'react-query', () => ( {
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

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useQuery } from 'react-query';
import { useSelector, useDispatch } from 'react-redux';
import BackupDatePicker from '..';
import { useCanGoToDate } from '../hooks';

const realDateNow = Date.now;
const getTracksEventName = ( event ) => event.meta.analytics[ 0 ].payload.name;

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
		const today = moment();
		render( <BackupDatePicker selectedDate={ today } onDateChange={ () => {} } /> );

		const yesterdayTextNode = screen.getByText( 'Yesterday' );
		expect( yesterdayTextNode ).toBeInTheDocument();
		expect( yesterdayTextNode ).toHaveClass( 'backup-date-picker__display-date' );
		expect( yesterdayTextNode.parentElement ).toHaveClass(
			'backup-date-picker__select-date--previous'
		);
	} );

	test( "Shows only the month and date for the previous date if it's the same year as today", () => {
		// Mock the definition of 'now,' so that our test date is always in the same year
		Date.now = jest.fn().mockReturnValue( new Date( '2020-12-04T12:00:00.000Z' ) );
		const november4Of2020 = moment().subtract( 1, 'month' );
		expect( november4Of2020.isSame( moment( '2020-11-04' ), 'day' ) ).toEqual( true );

		render( <BackupDatePicker selectedDate={ november4Of2020 } onDateChange={ () => {} } /> );

		const expectedText = moment( november4Of2020 ).subtract( 1, 'day' ).format( 'MMM D' );

		const previousDateText = screen.getByText( expectedText );
		expect( previousDateText ).toBeInTheDocument();
		expect( previousDateText ).toHaveClass( 'backup-date-picker__display-date' );
		expect( previousDateText.parentElement ).toHaveClass(
			'backup-date-picker__select-date--previous'
		);
	} );

	test( "Shows month, date, and year for the previous date if it's not the same year as today", () => {
		const oneYearAgo = moment().subtract( 1, 'year' );

		render( <BackupDatePicker selectedDate={ oneYearAgo } onDateChange={ () => {} } /> );

		const expectedText = moment( oneYearAgo ).subtract( 1, 'day' ).format( 'MMM D, YYYY' );

		const previousDateText = screen.getByText( expectedText );
		expect( previousDateText ).toBeInTheDocument();
		expect( previousDateText ).toHaveClass( 'backup-date-picker__display-date' );
		expect( previousDateText.parentElement ).toHaveClass(
			'backup-date-picker__select-date--previous'
		);
	} );

	test( "Shows month and date for the next date if it's in the same year as today", () => {
		// Mock the definition of 'now,' so that our test date is always in the same year
		Date.now = jest.fn().mockReturnValue( new Date( '2020-12-04T12:00:00.000Z' ) );
		const december4Of2020 = moment();
		expect( december4Of2020.isSame( moment( '2020-12-04' ), 'day' ) ).toEqual( true );

		render( <BackupDatePicker selectedDate={ december4Of2020 } onDateChange={ () => {} } /> );

		const expectedText = moment( december4Of2020 ).add( 1, 'day' ).format( 'MMM D' );

		const nextDateText = screen.getByText( expectedText );
		expect( nextDateText ).toBeInTheDocument();
		expect( nextDateText ).toHaveClass( 'backup-date-picker__display-date' );
		expect( nextDateText.parentElement ).toHaveClass( 'backup-date-picker__next-date-link' );
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
		const twoYearsAgo = moment().subtract( 2, 'years' );

		render( <BackupDatePicker selectedDate={ twoYearsAgo } onDateChange={ () => {} } /> );

		const expectedText = moment( twoYearsAgo ).add( 1, 'day' ).format( 'MMM D, YYYY' );

		const nextDateText = screen.getByText( expectedText );
		expect( nextDateText ).toBeInTheDocument();
		expect( nextDateText ).toHaveClass( 'backup-date-picker__display-date' );
		expect( nextDateText.parentElement ).toHaveClass( 'backup-date-picker__next-date-link' );
	} );

	// --- NAVIGATION ---

	test( 'Navigates backward when the previous date is clicked', () =>
		new Promise( ( done ) => {
			const user = userEvent.setup();

			const selectedDate = moment( '2020-01-01' );
			const onDateChange = ( date ) => {
				expect( date.diff( selectedDate, 'days' ) ).toEqual( -1 );
				done();
			};

			render( <BackupDatePicker selectedDate={ selectedDate } onDateChange={ onDateChange } /> );

			const button = screen.getByText( 'Dec 31, 2019' );
			user.click( button );
		} ) );

	test( 'Navigates forward when the next date is clicked', () =>
		new Promise( ( done ) => {
			const user = userEvent.setup();

			const selectedDate = moment( '2020-01-01' );
			const onDateChange = ( date ) => {
				expect( date.diff( selectedDate, 'days' ) ).toEqual( 1 );
				done();
			};

			render( <BackupDatePicker selectedDate={ selectedDate } onDateChange={ onDateChange } /> );

			const button = screen.getByText( 'Jan 2, 2020' );
			user.click( button );
		} ) );

	test( 'Navigates backward when the previous date is focused and the spacebar is pressed', () =>
		new Promise( ( done ) => {
			const selectedDate = moment( '2020-01-01' );
			const onDateChange = ( date ) => {
				expect( date.diff( selectedDate, 'days' ) ).toEqual( -1 );
				done();
			};

			render( <BackupDatePicker selectedDate={ selectedDate } onDateChange={ onDateChange } /> );

			const button = screen.getByText( 'Dec 31, 2019' );
			button.focus();

			fireEvent.keyDown( button, { code: 'Space', key: ' ' } );
		} ) );

	test( 'Navigates forward when the next date is focused and the spacebar is pressed', () =>
		new Promise( ( done ) => {
			const selectedDate = moment( '2020-01-01' );
			const onDateChange = ( date ) => {
				expect( date.diff( selectedDate, 'days' ) ).toEqual( 1 );
				done();
			};

			render( <BackupDatePicker selectedDate={ selectedDate } onDateChange={ onDateChange } /> );

			const button = screen.getByText( 'Jan 2, 2020' );
			button.focus();

			fireEvent.keyDown( button, { code: 'Space', key: ' ' } );
		} ) );

	// --- ANALYTICS ---

	test( 'Records a Tracks event for backward navigation', () =>
		new Promise( ( done ) => {
			const user = userEvent.setup();
			const selectedDate = moment( '2020-01-01' );

			const checkPreviousDateTracksEvent = ( event ) => {
				const name = getTracksEventName( event );
				expect( name ).toEqual( 'calypso_jetpack_backup_date_previous' );
				done();
			};

			useDispatch.mockImplementation( () => checkPreviousDateTracksEvent );

			render( <BackupDatePicker selectedDate={ selectedDate } onDateChange={ () => {} } /> );

			user.click( screen.getByText( 'Dec 31, 2019' ) );
		} ) );

	test( 'Records a Tracks event for forward navigation', () =>
		new Promise( ( done ) => {
			const user = userEvent.setup();
			const selectedDate = moment( '2020-01-01' );

			const checkNextDateTracksEvent = ( event ) => {
				const name = getTracksEventName( event );
				expect( name ).toEqual( 'calypso_jetpack_backup_date_next' );
				done();
			};

			useDispatch.mockImplementation( () => checkNextDateTracksEvent );

			render( <BackupDatePicker selectedDate={ selectedDate } onDateChange={ () => {} } /> );

			user.click( screen.getByText( 'Jan 2, 2020' ) );
		} ) );
} );
