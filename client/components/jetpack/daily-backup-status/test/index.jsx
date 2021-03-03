/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';

/**
 * Internal dependencies
 */
import DailyBackupStatus from '..';

import BackupFailed from '../status-card/backup-failed';
import BackupScheduled from '../status-card/backup-scheduled';
import BackupSuccessful from '../status-card/backup-successful';
import NoBackupsYet from '../status-card/no-backups-yet';
import NoBackupsOnSelectedDate from '../status-card/no-backups-on-selected-date';

/**
 * Mock dependencies
 */
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn().mockImplementation( () => {} ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
} ) );

jest.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
jest.mock( 'calypso/state/selectors/get-site-timezone-value' );
jest.mock( 'calypso/state/selectors/get-site-gmt-offset' );

jest.mock( 'calypso/state/selectors/get-rewind-backups' );
jest.mock( 'calypso/state/selectors/get-rewind-capabilities' );
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';

jest.mock( 'calypso/lib/jetpack/backup-utils' );
import {
	isSuccessfulDailyBackup,
	isSuccessfulRealtimeBackup,
} from 'calypso/lib/jetpack/backup-utils';

const ARBITRARY_DATE = moment( '2019-01-01' );

describe( 'DailyBackupStatus', () => {
	const getStatus = ( element ) => shallow( element ).find( 'DailyBackupStatus' ).dive();

	beforeAll( () => {
		// NOTE: We don't care about site ID, timezone, or GMT offset in this test suite;
		// they're only important to child components or other dependencies.
		// They're mocked in the "Mock dependencies" block above,
		// but we allow them to use the default mock implementation,
		// which always returns `undefined`.
	} );

	beforeEach( () => {
		getRewindCapabilities.mockReset();
		isSuccessfulDailyBackup.mockReset();
		isSuccessfulRealtimeBackup.mockReset();
	} );

	test( 'shows "no backups yet" when no backup or last available backup date are provided', () => {
		const status = getStatus( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } /> );
		expect( status.type() ).toEqual( NoBackupsYet );
	} );

	test( 'shows "backup scheduled" when no backup is provided and the selected date is today', () => {
		const now = moment();

		const status = getStatus( <DailyBackupStatus selectedDate={ now } lastBackupDate={ {} } /> );
		expect( status.type() ).toEqual( BackupScheduled );
	} );

	test( 'shows "no backups on this date" when no backup is provided and the selected date is not today', () => {
		const yesterday = moment().subtract( 1, 'day' );

		const status = getStatus(
			<DailyBackupStatus selectedDate={ yesterday } lastBackupDate={ {} } />
		);
		expect( status.type() ).toEqual( NoBackupsOnSelectedDate );
	} );

	test( 'shows "backup failed" for non-Backup Real-time sites when a failed daily backup is provided', () => {
		// Default mock behavior behaves as if the current site doesn't have Backup Real-time
		isSuccessfulDailyBackup.mockImplementation( () => false );

		const status = getStatus( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } backup={ {} } /> );
		expect( status.type() ).toEqual( BackupFailed );
	} );

	test( 'shows "backup failed" for Backup Real-time sites when a failed real-time backup is provided', () => {
		getRewindCapabilities.mockImplementation( () => [ 'backup-realtime' ] );
		isSuccessfulRealtimeBackup.mockImplementation( () => false );

		const status = getStatus( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } backup={ {} } /> );
		expect( status.type() ).toEqual( BackupFailed );
	} );

	test( 'shows "backup successful" for non-Backup Real-time sites when a successful daily backup is provided', () => {
		// Default mock behavior behaves as if the current site doesn't have Backup Real-time
		isSuccessfulDailyBackup.mockImplementation( () => true );

		const status = getStatus( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } backup={ {} } /> );
		expect( status.type() ).toEqual( BackupSuccessful );
	} );

	test( 'shows "backup successful" for Backup Real-time sites when a successful real-time backup is provided', () => {
		getRewindCapabilities.mockImplementation( () => [ 'backup-realtime' ] );
		isSuccessfulRealtimeBackup.mockImplementation( () => true );

		const status = getStatus( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } backup={ {} } /> );
		expect( status.type() ).toEqual( BackupSuccessful );
	} );
} );
