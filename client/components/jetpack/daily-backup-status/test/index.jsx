/**
 * @jest-environment jsdom
 */

import { WPCOM_FEATURES_REAL_TIME_BACKUPS } from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import moment from 'moment';
import {
	isSuccessfulDailyBackup,
	isSuccessfulRealtimeBackup,
} from 'calypso/lib/jetpack/backup-utils';
import { useIsDateVisible } from 'calypso/my-sites/backup/hooks';
import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import DailyBackupStatus from '..';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn().mockImplementation( () => {} ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
} ) );

jest.mock( 'calypso/my-sites/backup/hooks', () => ( {
	...jest.requireActual( 'calypso/my-sites/backup/hooks' ),
	useIsDateVisible: jest.fn(),
} ) );

jest.mock( '../status-card/no-backups-yet', () => () => <div data-testid="no-backups-yet" /> );
jest.mock( '../status-card/backup-scheduled', () => () => <div data-testid="backup-scheduled" /> );
jest.mock( '../status-card/visible-days-limit', () => () => (
	<div data-testid="visible-days-limit" />
) );
jest.mock( '../status-card/no-backups-on-selected-date', () => () => (
	<div data-testid="no-backups-on-selected-date" />
) );
jest.mock( '../status-card/backup-failed', () => () => <div data-testid="backup-failed" /> );
jest.mock( '../status-card/backup-successful', () => () => (
	<div data-testid="backup-successful" />
) );

jest.mock( 'calypso/components/data/query-rewind-policies', () => () => (
	<div data-testid="query-rewind-policies"></div>
) );
jest.mock( 'calypso/components/data/query-rewind-backups', () => () => (
	<div data-testid="query-rewind-backup"></div>
) );

jest.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
jest.mock( 'calypso/state/selectors/get-site-timezone-value' );
jest.mock( 'calypso/state/selectors/get-site-gmt-offset' );

jest.mock( 'calypso/state/selectors/get-rewind-backups' );
jest.mock( 'calypso/state/selectors/get-site-features' );

jest.mock( 'calypso/lib/jetpack/backup-utils' );

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
		useIsDateVisible.mockImplementation( () => () => true );
		getSiteFeatures.mockReset();
		isSuccessfulDailyBackup.mockReset();
		isSuccessfulRealtimeBackup.mockReset();
	} );

	test( 'shows "no backups yet" when no backup or last available backup date are provided', () => {
		render( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } /> );
		expect( screen.getByTestId( 'no-backups-yet' ) ).toBeVisible();
	} );

	test( 'shows "backup scheduled" when no backup is provided and the selected date is today', () => {
		const now = moment();

		render( <DailyBackupStatus selectedDate={ now } lastBackupDate={ {} } /> );
		expect( screen.getByTestId( 'backup-scheduled' ) ).toBeVisible();
	} );

	test( 'shows a visible limit status when the selected date does not fall within display rules', () => {
		useIsDateVisible.mockImplementation( () => () => false );

		render( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } /> );
		expect( screen.getByTestId( 'visible-days-limit' ) ).toBeVisible();
	} );

	test( 'shows "no backups on this date" when no backup is provided and the selected date is not today', () => {
		const yesterday = moment().subtract( 1, 'day' );

		render( <DailyBackupStatus selectedDate={ yesterday } lastBackupDate={ {} } /> );
		expect( screen.getByTestId( 'no-backups-on-selected-date' ) ).toBeVisible();
	} );

	test( 'shows "backup failed" for non-Backup Real-time sites when a failed daily backup is provided', () => {
		// Default mock behavior behaves as if the current site doesn't have Backup Real-time
		isSuccessfulDailyBackup.mockImplementation( () => false );

		render( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } backup={ {} } /> );
		expect( screen.getByTestId( 'backup-failed' ) ).toBeVisible();
	} );

	test( 'shows "backup failed" for Backup Real-time sites when a failed real-time backup is provided', () => {
		getSiteFeatures.mockImplementation( () => ( {
			active: [ WPCOM_FEATURES_REAL_TIME_BACKUPS ],
		} ) );
		isSuccessfulRealtimeBackup.mockImplementation( () => false );

		render( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } backup={ {} } /> );
		expect( screen.getByTestId( 'backup-failed' ) ).toBeVisible();
	} );

	test( 'shows "backup successful" for non-Backup Real-time sites when a successful daily backup is provided', () => {
		// Default mock behavior behaves as if the current site doesn't have Backup Real-time
		isSuccessfulDailyBackup.mockImplementation( () => true );

		render( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } backup={ {} } /> );
		expect( screen.getByTestId( 'backup-successful' ) ).toBeVisible();
	} );

	test( 'shows "backup successful" for Backup Real-time sites when a successful real-time backup is provided', () => {
		getSiteFeatures.mockImplementation( () => ( {
			active: [ WPCOM_FEATURES_REAL_TIME_BACKUPS ],
		} ) );
		isSuccessfulRealtimeBackup.mockImplementation( () => true );

		render( <DailyBackupStatus selectedDate={ ARBITRARY_DATE } backup={ {} } /> );
		expect( screen.getByTestId( 'backup-successful' ) ).toBeVisible();
	} );
} );
