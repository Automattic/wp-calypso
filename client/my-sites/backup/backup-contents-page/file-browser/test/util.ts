/**
 * @jest-environment jsdom
 */

import { BackupPathInfoResponse, FileBrowserItemInfo } from '../types';
import { convertBytes, encodeToBase64, parseBackupPathInfo } from '../util';

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

describe( 'encodeToBase64', () => {
	it( 'should return Base64 encoded string for English text', () => {
		const text = 'Hello, World!';
		const encoded = encodeToBase64( text );
		expect( encoded ).toBe( 'SGVsbG8sIFdvcmxkIQ==' );
	} );

	it( 'should return Base64 encoded string for Spanish text', () => {
		const text = '¡Hola, Piña!';
		const encoded = encodeToBase64( text );
		expect( encoded ).toBe( 'wqFIb2xhLCBQacOxYSE=' );
	} );

	it( 'should return Base64 encoded string for Japanese text', () => {
		const text = 'こんにちは、世界!';
		const encoded = encodeToBase64( text );
		expect( encoded ).toBe( '44GT44KT44Gr44Gh44Gv44CB5LiW55WMIQ==' );
	} );

	it( 'should return Base64 encoded string for Chinese text', () => {
		const text = '你好，世界！';
		const encoded = encodeToBase64( text );
		expect( encoded ).toBe( '5L2g5aW977yM5LiW55WM77yB' );
	} );

	it( 'should return Base64 encoded string for Arabic text', () => {
		const text = 'مرحبا، العالم!';
		const encoded = encodeToBase64( text );
		expect( encoded ).toBe( '2YXYsdit2KjYp9iMINin2YTYudin2YTZhSE=' );
	} );
} );
