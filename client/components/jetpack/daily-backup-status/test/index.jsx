/**
 * @jest-environment jsdom
 */

import { WPCOM_FEATURES_REAL_TIME_BACKUPS } from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import moment from 'moment';
import {
	isSuccessfulDailyBackup,
	isSuccessfulRealtimeBackup,
	isStorageOrRetentionReached,
} from 'calypso/lib/jetpack/backup-utils';
import { getRewindStorageUsageLevel } from 'calypso/state/rewind/selectors';
import { StorageUsageLevels } from 'calypso/state/rewind/storage/types';
import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DailyBackupStatus from '..';

const render = ( el, options ) => renderWithProvider( el, { ...options } );

jest.mock( 'calypso/my-sites/backup/hooks', () => ( {
	...jest.requireActual( 'calypso/my-sites/backup/hooks' ),
} ) );

jest.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
jest.mock( 'calypso/state/selectors/get-site-timezone-value' );
jest.mock( 'calypso/state/selectors/get-site-gmt-offset' );

jest.mock( 'calypso/state/selectors/get-rewind-backups' );
jest.mock( 'calypso/state/selectors/get-site-features' );
jest.mock( 'calypso/state/rewind/selectors', () => ( {
	...jest.requireActual( 'calypso/state/rewind/selectors' ),
	getRewindStorageUsageLevel: jest.fn(),
} ) );

jest.mock( 'calypso/lib/jetpack/backup-utils' );

jest.mock( 'calypso/components/data/query-rewind-policies', () => () => 'query-rewind-policies' );

jest.mock( '../status-card/no-backups-yet', () => () => <div data-testid="no-backups-yet" /> );
jest.mock( '../status-card/backup-scheduled', () => () => <div data-testid="backup-scheduled" /> );
jest.mock( '../status-card/no-backups-on-selected-date', () => () => (
	<div data-testid="no-backups-on-selected-date" />
) );
jest.mock( '../status-card/backup-failed', () => () => <div data-testid="backup-failed" /> );
jest.mock( '../status-card/backup-no-storage', () => () => (
	<div data-testid="backup-no-storage" />
) );
jest.mock( '../status-card/backup-successful', () => () => (
	<div data-testid="backup-successful" />
) );

const ARBITRARY_DATE = moment( '2019-01-01' );

describe( 'DailyBackupStatus', () => {
	beforeAll( () => {
		// NOTE: We don't care about site ID, timezone, or GMT offset in this test suite;
		// they're only important to child components or other dependencies.
		// They're mocked in the "Mock dependencies" block above,
		// but we allow them to use the default mock implementation,
		// which always returns `undefined`.
	} );

	beforeEach( () => {
		getSiteFeatures.mockReset();
		isSuccessfulDailyBackup.mockReset();
		isSuccessfulRealtimeBackup.mockReset();
		isStorageOrRetentionReached.mockReset();
		getRewindStorageUsageLevel.mockImplementation( () => StorageUsageLevels.Normal );
	} );

	test( 'shows "no backups yet" when no backup or last available backup date are provided', () => {
		render( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } /> );
		expect( screen.queryByTestId( 'no-backups-yet' ) ).toBeVisible();
	} );

	test( 'shows "backup scheduled" when no backup is provided and the selected date is today', () => {
		const now = moment();

		render( <DailyBackupStatus selectedDate={ now } lastBackupDate={ {} } /> );
		expect( screen.queryByTestId( 'backup-scheduled' ) ).toBeVisible();
	} );

	test.each( [
		[ StorageUsageLevels.Normal ],
		[ StorageUsageLevels.Warning ],
		[ StorageUsageLevels.Critical ],
		[ StorageUsageLevels.BackupsDiscarded ],
	] )(
		'shows "backup scheduled" when no backup is provided and the selected date is today and storage usage level is other than Full',
		( usageLevel ) => {
			const now = moment();

			render(
				<DailyBackupStatus selectedDate={ now } lastBackupDate={ {} } usageLevel={ usageLevel } />
			);
			expect( screen.queryByTestId( 'backup-scheduled' ) ).toBeVisible();
		}
	);

	test( 'does not shows "backup scheduled" when no backup is provided, the selected date is today, and storage usage level is full', () => {
		const now = moment();
		getRewindStorageUsageLevel.mockImplementation( () => StorageUsageLevels.Full );

		render( <DailyBackupStatus selectedDate={ now } lastBackupDate={ {} } /> );
		expect( screen.queryByTestId( 'backup-scheduled' ) ).toBeNull();
	} );

	test( 'shows "no backups on this date" when no backup is provided and the selected date is not today', () => {
		const yesterday = moment().subtract( 1, 'day' );

		render( <DailyBackupStatus selectedDate={ yesterday } lastBackupDate={ {} } /> );
		expect( screen.queryByTestId( 'no-backups-on-selected-date' ) ).toBeVisible();
	} );

	test.each( [
		[ StorageUsageLevels.Normal ],
		[ StorageUsageLevels.Warning ],
		[ StorageUsageLevels.Critical ],
		[ StorageUsageLevels.BackupsDiscarded ],
	] )(
		'shows "no backups on this date" when no backup is provided and the selected date is not today and storage usage level is other than Full',
		( usageLevel ) => {
			const yesterday = moment().subtract( 1, 'day' );

			render(
				<DailyBackupStatus
					selectedDate={ yesterday }
					lastBackupDate={ {} }
					usageLevel={ usageLevel }
				/>
			);
			expect( screen.queryByTestId( 'no-backups-on-selected-date' ) ).toBeVisible();
		}
	);

	test( 'does not shows "no backups on this date" when no backup is provided, the selected date is not today and storage usage level is full', () => {
		const yesterday = moment().subtract( 1, 'day' );
		getRewindStorageUsageLevel.mockImplementation( () => StorageUsageLevels.Full );

		render( <DailyBackupStatus selectedDate={ yesterday } lastBackupDate={ {} } /> );
		expect( screen.queryByTestId( 'no-backups-on-selected-date' ) ).toBeNull();
	} );

	test( 'shows "backup failed" for non-Backup Real-time sites when a failed daily backup is provided', () => {
		// Default mock behavior behaves as if the current site doesn't have Backup Real-time
		isSuccessfulDailyBackup.mockImplementation( () => false );
		isStorageOrRetentionReached.mockImplementation( () => false );

		render( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } backup={ {} } /> );
		expect( screen.queryByTestId( 'backup-failed' ) ).toBeVisible();
	} );

	test( 'shows "backup no storage" for Real-time sites when a not rewindable backup is provided', () => {
		isSuccessfulRealtimeBackup.mockImplementation( () => false );
		isStorageOrRetentionReached.mockImplementation( () => true );

		render( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } backup={ {} } /> );
		expect( screen.queryByTestId( 'backup-no-storage' ) ).toBeVisible();
	} );

	test( 'shows "backup failed" for Backup Real-time sites when a failed real-time backup is provided', () => {
		getSiteFeatures.mockImplementation( () => ( {
			active: [ WPCOM_FEATURES_REAL_TIME_BACKUPS ],
		} ) );
		isStorageOrRetentionReached.mockImplementation( () => false );
		isSuccessfulRealtimeBackup.mockImplementation( () => false );

		render( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } backup={ {} } /> );
		expect( screen.queryByTestId( 'backup-failed' ) ).toBeVisible();
	} );

	test( 'shows "backup successful" for non-Backup Real-time sites when a successful daily backup is provided', () => {
		// Default mock behavior behaves as if the current site doesn't have Backup Real-time
		isSuccessfulDailyBackup.mockImplementation( () => true );

		render( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } backup={ {} } /> );
		expect( screen.queryByTestId( 'backup-successful' ) ).toBeVisible();
	} );

	test( 'shows "backup successful" for Backup Real-time sites when a successful real-time backup is provided', () => {
		getSiteFeatures.mockImplementation( () => ( {
			active: [ WPCOM_FEATURES_REAL_TIME_BACKUPS ],
		} ) );
		isSuccessfulRealtimeBackup.mockImplementation( () => true );

		render( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } backup={ {} } /> );
		expect( screen.queryByTestId( 'backup-successful' ) ).toBeVisible();
	} );
} );
