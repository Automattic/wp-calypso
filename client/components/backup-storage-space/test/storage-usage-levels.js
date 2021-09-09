import {
	getUsageLevel,
	StorageUsageLevels,
} from 'calypso/components/backup-storage-space/storage-usage-levels';

describe( 'getUsageLevel', () => {
	test( 'returns Full when storage is 100% utilized', () => {
		const result = getUsageLevel( 100, 100 );
		expect( result ).toEqual( StorageUsageLevels.Full );
	} );

	test.each( [ [ 80 ], [ 88.7 ], [ 99.999 ] ] )(
		'returns Critical when storage is 80-99% utilized',
		( used ) => {
			const result = getUsageLevel( used, 100 );
			expect( result ).toEqual( StorageUsageLevels.Critical );
		}
	);

	test.each( [ [ 65 ], [ 74.2 ], [ 79.999 ] ] )(
		'returns Warning when storage is 65-79% utilized',
		( used ) => {
			const result = getUsageLevel( used, 100 );
			expect( result ).toEqual( StorageUsageLevels.Warning );
		}
	);

	test.each( [ [ 0 ], [ 20.3 ], [ 64.999 ] ] )(
		'returns Normal when storage is <65% utilized',
		( used ) => {
			const result = getUsageLevel( used, 100 );
			expect( result ).toEqual( StorageUsageLevels.Normal );
		}
	);
} );
