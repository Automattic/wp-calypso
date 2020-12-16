/**
 * Default mock implementations
 */
const mockUseDispatch = () => () => null;
const mockUseSelector = ( func ) => func();
const mockUseTranslate = () => ( text ) => text;
const mockUseCanGoToDate = () => () => true;
const mockIsEnabled = () => true;

/**
 * Mock dependencies
 */
jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: jest.fn( mockUseTranslate ),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( mockUseSelector ),
	useDispatch: jest.fn( mockUseDispatch ),
} ) );
jest.mock( 'calypso/config', () => ( {
	__esModule: true,
	default: jest.requireActual( 'calypso/config' ),
	isEnabled: jest.fn( mockIsEnabled ),
} ) );
jest.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
jest.mock( 'calypso/state/selectors/get-site-gmt-offset' );
jest.mock( 'calypso/state/selectors/get-site-timezone-value' );
jest.mock( '../hooks', () => ( {
	...jest.requireActual( '../hooks' ),
	useCanGoToDate: jest.fn( mockUseCanGoToDate ),
} ) );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { isEnabled } from 'calypso/config';
import { useCanGoToDate } from '../hooks';
const realDateNow = Date.now;

/**
 * Internal dependencies
 */
import BackupDatePicker from '..';

const getTracksEventName = ( event ) => event.meta.analytics[ 0 ].payload.name;

describe( 'BackupDatePicker', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		// Re-mock dependencies
		Date.now = realDateNow;
		isEnabled.mockImplementation( mockIsEnabled );
		useDispatch.mockImplementation( mockUseDispatch );
		useSelector.mockImplementation( mockUseSelector );
		useTranslate.mockImplementation( mockUseTranslate );
		useCanGoToDate.mockImplementation( mockUseCanGoToDate );
	} );

	// --- DATE DISPLAY ---

	test( "Shows 'Yesterday' as the previous date if the current date is today", () => {
		const today = moment();

		const picker = shallow( <BackupDatePicker selectedDate={ today } onDateChange={ () => {} } /> );

		const previousDate = picker.find(
			'.backup-date-picker__select-date--previous .backup-date-picker__display-date'
		);
		expect( previousDate.text() ).toEqual( 'Yesterday' );
	} );

	test( "Shows only the month and date for the previous date if it's the same year as today", () => {
		// Mock the definition of 'now,' so that our test date is always in the same year
		Date.now = jest.fn().mockReturnValue( new Date( '2020-12-04T12:00:00.000Z' ) );
		const november4Of2020 = moment().subtract( 1, 'month' );
		expect( november4Of2020.isSame( moment( '2020-11-04' ), 'day' ) ).toEqual( true );

		const picker = shallow(
			<BackupDatePicker selectedDate={ november4Of2020 } onDateChange={ () => {} } />
		);

		const previousDate = picker.find(
			'.backup-date-picker__select-date--previous .backup-date-picker__display-date'
		);

		const expectedText = moment( november4Of2020 ).subtract( 1, 'day' ).format( 'MMM D' );
		expect( previousDate.text() ).toEqual( expectedText );
	} );

	test( "Shows month, date, and year for the previous date if it's not the same year as today", () => {
		const oneYearAgo = moment().subtract( 1, 'year' );

		const picker = shallow(
			<BackupDatePicker selectedDate={ oneYearAgo } onDateChange={ () => {} } />
		);

		const previousDate = picker.find(
			'.backup-date-picker__select-date--previous .backup-date-picker__display-date'
		);

		const expectedText = moment( oneYearAgo ).subtract( 1, 'day' ).format( 'MMM D, YYYY' );
		expect( previousDate.text() ).toEqual( expectedText );
	} );

	test( "Shows month and date for the next date if it's in the same year as today", () => {
		// Mock the definition of 'now,' so that our test date is always in the same year
		Date.now = jest.fn().mockReturnValue( new Date( '2020-12-04T12:00:00.000Z' ) );
		const december4Of2020 = moment();
		expect( december4Of2020.isSame( moment( '2020-12-04' ), 'day' ) ).toEqual( true );

		const picker = shallow(
			<BackupDatePicker selectedDate={ december4Of2020 } onDateChange={ () => {} } />
		);

		const nextDate = picker.find(
			'.backup-date-picker__select-date--next .backup-date-picker__display-date'
		);

		const expectedText = moment( december4Of2020 ).add( 1, 'day' ).format( 'MMM D' );
		expect( nextDate.text() ).toEqual( expectedText );
	} );

	test( "Does not show the next date as 'Yesterday' even if it is yesterday", () => {
		const today = moment();

		const picker = shallow( <BackupDatePicker selectedDate={ today } onDateChange={ () => {} } /> );

		const previousDate = picker.find(
			'.backup-date-picker__select-date--next .backup-date-picker__display-date'
		);
		expect( previousDate.text() ).not.toEqual( 'Yesterday' );
	} );

	test( "Does not show the next date as 'Today', even if it is today", () => {
		const yesterday = moment().subtract( 1, 'day' );

		const picker = shallow(
			<BackupDatePicker selectedDate={ yesterday } onDateChange={ () => {} } />
		);

		const previousDate = picker.find(
			'.backup-date-picker__select-date--next .backup-date-picker__display-date'
		);
		expect( previousDate.text() ).not.toEqual( 'Today' );
	} );

	test( "Shows month, date, and year for the next date if it's not the same year as today", () => {
		const twoYearsAgo = moment().subtract( 2, 'years' );

		const picker = shallow(
			<BackupDatePicker selectedDate={ twoYearsAgo } onDateChange={ () => {} } />
		);

		const previousDate = picker.find(
			'.backup-date-picker__select-date--next .backup-date-picker__display-date'
		);

		const expectedText = moment( twoYearsAgo ).add( 1, 'day' ).format( 'MMM D, YYYY' );
		expect( previousDate.text() ).toEqual( expectedText );
	} );

	// --- NAVIGATION ---

	test( 'Navigates backward when the previous date is clicked', () =>
		new Promise( ( done ) => {
			const selectedDate = moment( '2020-01-01' );
			const onDateChange = ( date ) => {
				expect( date.diff( selectedDate, 'days' ) ).toEqual( -1 );
				done();
			};

			const picker = shallow(
				<BackupDatePicker selectedDate={ selectedDate } onDateChange={ onDateChange } />
			);

			const button = picker.find( '.backup-date-picker__select-date--previous' );
			button.simulate( 'click' );
		} ) );

	test( 'Navigates forward when the next date is clicked', () =>
		new Promise( ( done ) => {
			const selectedDate = moment( '2020-01-01' );
			const onDateChange = ( date ) => {
				expect( date.diff( selectedDate, 'days' ) ).toEqual( 1 );
				done();
			};

			const picker = shallow(
				<BackupDatePicker selectedDate={ selectedDate } onDateChange={ onDateChange } />
			);

			const button = picker.find( '.backup-date-picker__select-date--next' );
			button.simulate( 'click' );
		} ) );

	test( 'Navigates backward when the previous date is focused and the spacebar is pressed', () =>
		new Promise( ( done ) => {
			const selectedDate = moment( '2020-01-01' );
			const onDateChange = ( date ) => {
				expect( date.diff( selectedDate, 'days' ) ).toEqual( -1 );
				done();
			};

			const picker = shallow(
				<BackupDatePicker selectedDate={ selectedDate } onDateChange={ onDateChange } />
			);

			const button = picker.find( '.backup-date-picker__select-date--previous' );
			button.simulate( 'keydown', { key: ' ' } );
		} ) );

	test( 'Navigates forward when the next date is focused and the spacebar is pressed', () =>
		new Promise( ( done ) => {
			const selectedDate = moment( '2020-01-01' );
			const onDateChange = ( date ) => {
				expect( date.diff( selectedDate, 'days' ) ).toEqual( 1 );
				done();
			};

			const picker = shallow(
				<BackupDatePicker selectedDate={ selectedDate } onDateChange={ onDateChange } />
			);

			const button = picker.find( '.backup-date-picker__select-date--next' );
			button.simulate( 'keydown', { key: ' ' } );
		} ) );

	// --- ANALYTICS ---

	test( 'Records a Tracks event for backward navigation', () =>
		new Promise( ( done ) => {
			const checkPreviousDateTracksEvent = ( event ) => {
				const name = getTracksEventName( event );
				expect( name ).toEqual( 'calypso_jetpack_backup_date_previous' );
				done();
			};

			useDispatch.mockImplementation( () => checkPreviousDateTracksEvent );

			const picker = shallow(
				<BackupDatePicker selectedDate={ moment() } onDateChange={ () => {} } />
			);

			picker.find( '.backup-date-picker__select-date--previous' ).simulate( 'click' );
		} ) );

	test( 'Records a Tracks event for forward navigation', () =>
		new Promise( ( done ) => {
			const checkNextDateTracksEvent = ( event ) => {
				const name = getTracksEventName( event );
				expect( name ).toEqual( 'calypso_jetpack_backup_date_next' );
				done();
			};

			useDispatch.mockImplementation( () => checkNextDateTracksEvent );

			const sometimeInThePast = moment().subtract( 1, 'year' );
			const picker = shallow(
				<BackupDatePicker selectedDate={ sometimeInThePast } onDateChange={ () => {} } />
			);

			picker.find( '.backup-date-picker__select-date--next' ).simulate( 'click' );
		} ) );

	test( 'Records a Tracks event when the search icon is clicked', () =>
		new Promise( ( done ) => {
			const checkSearchClickTracksEvent = ( event ) => {
				const name = getTracksEventName( event );
				expect( name ).toEqual( 'calypso_jetpack_backup_search' );
				done();
			};

			useDispatch.mockImplementation( () => checkSearchClickTracksEvent );

			const picker = shallow(
				<BackupDatePicker selectedDate={ moment() } onDateChange={ () => {} } />
			);

			picker.find( '.backup-date-picker__search-link' ).simulate( 'click' );
		} ) );
} );
