import { getUsageLevel } from 'calypso/components/backup-storage-space/storage-usage-levels';
import { StorageUsageLevels } from 'calypso/state/rewind/storage/types';

describe( 'getUsageLevel', () => {
	const MINIMUM_DAYS_OF_BACKUPS = 7;

	test( 'returns Full when storage is 100% utilized', () => {
		const result = getUsageLevel( 100, 100, MINIMUM_DAYS_OF_BACKUPS, 0, 0, 0 );
		expect( result ).toEqual( StorageUsageLevels.Full );
	} );

	test( 'returns Full when days of backups saved is less than or equal to minimum allowed days of backups', () => {
		// let's take 7 as minimum allowed days of backups and allowed days of backups as 7 too!
		// 30 as plan retention days and 1 as days of backups saved.
		let result = getUsageLevel( 100, 100, MINIMUM_DAYS_OF_BACKUPS, 7, 30, 1 );
		expect( result ).toEqual( StorageUsageLevels.Full );

		// Same case but when we had 7 days of backups saved
		result = getUsageLevel( 100, 100, MINIMUM_DAYS_OF_BACKUPS, 7, 30, 7 );
		expect( result ).toEqual( StorageUsageLevels.Full );
	} );

	test( 'returns BackupsDiscarded when allowed days of backup is less than plan retention days', () => {
		// let's take 7 as minimum allowed days of backups and allowed days of backups as 10
		// 30 as plan retention days and 10 as days of backups saved.
		const result = getUsageLevel( 100, 100, MINIMUM_DAYS_OF_BACKUPS, 10, 30, 10 );
		expect( result ).toEqual( StorageUsageLevels.BackupsDiscarded );
	} );

	test.each( [ [ 80 ], [ 88.7 ], [ 99.999 ] ] )(
		'returns Critical when storage is 80-99% utilized',
		( used ) => {
			// let's assume there are 20 backups available in last 30 days and all of the backups can under-fit
			// the current storage and still it can fit more, so as per the rule allowed days of backup would
			// always be same as plan retention days!
			const result = getUsageLevel( used, 100, MINIMUM_DAYS_OF_BACKUPS, 30, 30, 15 );
			expect( result ).toEqual( StorageUsageLevels.Critical );
		}
	);

	test.each( [ [ 65 ], [ 74.2 ], [ 79.999 ] ] )(
		'returns Warning when storage is 65-79% utilized',
		( used ) => {
			const result = getUsageLevel( used, 100, MINIMUM_DAYS_OF_BACKUPS, 30, 30, 15 );
			expect( result ).toEqual( StorageUsageLevels.Warning );
		}
	);

	test.each( [ [ 0 ], [ 20.3 ], [ 64.999 ] ] )(
		'returns Normal when storage is <65% utilized',
		( used ) => {
			const result = getUsageLevel( used, 100, 7, 30, 30, 10 );
			expect( result ).toEqual( StorageUsageLevels.Normal );
		}
	);

	test( 'returns FullButForecastOk when storage is full but forecast looks good', () => {
		const bytesUsed = 100;
		const bytesAvailable = 100;
		const allowedDaysOfBackups = 7;
		const planRetentionDays = 30;
		const daysOfBackupsSaved = 1;
		const lastBackupSize = 10; // 100 / 10 = 10 days forecast >= 7 days required ✓

		const result = getUsageLevel(
			bytesUsed,
			bytesAvailable,
			MINIMUM_DAYS_OF_BACKUPS,
			allowedDaysOfBackups,
			planRetentionDays,
			daysOfBackupsSaved,
			lastBackupSize
		);
		expect( result ).toEqual( StorageUsageLevels.FullButForecastOk );
	} );

	test( 'returns Full when storage is full and forecast is not good enough', () => {
		const bytesUsed = 100;
		const bytesAvailable = 100;
		const allowedDaysOfBackups = 7;
		const planRetentionDays = 30;
		const daysOfBackupsSaved = 1;
		const lastBackupSize = 20; // 100 / 20 = 5 days forecast < 7 days required ✗

		const result = getUsageLevel(
			bytesUsed,
			bytesAvailable,
			MINIMUM_DAYS_OF_BACKUPS,
			allowedDaysOfBackups,
			planRetentionDays,
			daysOfBackupsSaved,
			lastBackupSize
		);
		expect( result ).toEqual( StorageUsageLevels.Full );
	} );

	test( 'returns Full when storage is full and lastBackupSize is not provided', () => {
		const bytesUsed = 100;
		const bytesAvailable = 100;
		const allowedDaysOfBackups = 7;
		const planRetentionDays = 30;
		const daysOfBackupsSaved = 1;

		const result = getUsageLevel(
			bytesUsed,
			bytesAvailable,
			MINIMUM_DAYS_OF_BACKUPS,
			allowedDaysOfBackups,
			planRetentionDays,
			daysOfBackupsSaved
		);
		expect( result ).toEqual( StorageUsageLevels.Full );
	} );
} );
