import { BackupPathInfoResponse, FileBrowserItemInfo } from '../types';
import { convertBytes, parseBackupPathInfo } from '../util';

describe( 'convertBytes', () => {
	it( 'should correctly convert bytes to KB', () => {
		const result = convertBytes( 1024 );
		expect( result ).toEqual( { unitAmount: '1.0', unit: 'KB' } );
	} );

	it( 'should correctly convert bytes to MB', () => {
		const result = convertBytes( 1048576 );
		expect( result ).toEqual( { unitAmount: '1.0', unit: 'MB' } );
	} );

	it( 'should correctly convert bytes to GB', () => {
		const result = convertBytes( 1073741824 );
		expect( result ).toEqual( { unitAmount: '1.0', unit: 'GB' } );
	} );

	it( 'should correctly convert bytes to TB', () => {
		const result = convertBytes( 1099511627776 );
		expect( result ).toEqual( { unitAmount: '1.0', unit: 'TB' } );
	} );

	it( 'should respect the decimals parameter', () => {
		const result = convertBytes( 1500, 2 );
		expect( result ).toEqual( { unitAmount: '1.46', unit: 'KB' } );
	} );

	it( 'should correctly handle the case where bytes are less than 1024', () => {
		const result = convertBytes( 500 );
		expect( result ).toEqual( { unitAmount: '500.0', unit: 'B' } );
	} );
} );

describe( 'parseBackupPathInfo', () => {
	it( 'should return an empty object if payload is null', () => {
		const result = parseBackupPathInfo( {} );
		expect( result ).toEqual( {} );
	} );

	it( 'should map properties correctly', () => {
		const payload: BackupPathInfoResponse = {
			download_url: 'http://example.com',
			mtime: 123,
			size: 456,
			hash: 'abc',
			data_type: 789,
			manifest_filter: 'xyz',
		};
		const expected: FileBrowserItemInfo = {
			downloadUrl: 'http://example.com',
			mtime: 123,
			size: 456,
			hash: 'abc',
			dataType: 789,
			manifestFilter: 'xyz',
		};

		const result = parseBackupPathInfo( payload );
		expect( result ).toEqual( expected );
	} );

	it( 'should omit properties that are undefined', () => {
		const payload: BackupPathInfoResponse = {
			download_url: 'http://example.com',
			// mtime is undefined
			size: 456,
			hash: 'abc',
			// data_type is undefined
			manifest_filter: 'xyz',
		};
		const expected: FileBrowserItemInfo = {
			downloadUrl: 'http://example.com',
			// mtime is omitted
			size: 456,
			hash: 'abc',
			// dataType is omitted
			manifestFilter: 'xyz',
		};

		const result = parseBackupPathInfo( payload );
		expect( result ).toEqual( expected );
	} );
} );
