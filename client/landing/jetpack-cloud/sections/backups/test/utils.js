/**
 * Internal dependencies
 */
import { getBackupAttemptsForDate } from '../utils';

describe( 'getBackupAttemptsForDate', () => {
	test( 'should filter out rewind complete items not on date in utc', () => {
		const logs = [
			{
				activityName: 'rewind__backup_complete_full',
				activityDate: '2020-03-02T23:02:10.215+00:00',
			},
			{
				activityName: 'rewind__backup_complete_full',
				activityDate: '2020-03-03T13:02:10.215+00:00',
			},
			{
				activityName: 'rewind__backup_complete_full',
				activityDate: '2020-03-04T23:02:10.215+00:00',
			},
		];

		const filteredLogs = getBackupAttemptsForDate(
			logs,
			new Date( '2020-03-03T19:02:10.215+00:00' )
		);

		expect( filteredLogs.complete ).toHaveLength( 1 );
	} );

	test( 'should filter out rewind complete items not on date in other timezone', () => {
		const logs = [
			{
				activityName: 'rewind__backup_complete_full',
				activityDate: '2020-03-02T11:02:10.215+00:00',
			},
		];

		const filteredLogs = getBackupAttemptsForDate(
			logs,
			new Date( '2020-03-03T19:02:10.215+10:00' )
		);

		expect( filteredLogs.complete ).toHaveLength( 0 );
	} );

	test( 'should not filter out rewind complete items on date in other timezone', () => {
		const logs = [
			{
				activityName: 'rewind__backup_complete_full',
				activityDate: '2020-03-04T05:02:10.215+00:00',
			},
		];

		const filteredLogs = getBackupAttemptsForDate(
			logs,
			new Date( '2020-03-03T19:02:10.215+08:00' )
		);

		expect( filteredLogs.complete ).toHaveLength( 1 );
	} );
} );
