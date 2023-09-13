/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useExtractedBackupTitle, { extractBackupTextValues } from '../use-extracted-backup-title';
import type { Backup } from '../../../types';

const createFakeBackup = ( { title = 'Backup title', description = '' } ): Backup => ( {
	activityTitle: title,
	activityDescription: [ { children: [ { text: description } ] } ],
	activityName: '',
	activityTs: 0,
} );

describe( 'useExtractedBackupTitle', () => {
	it( 'should return the backup title when backupText is empty', () => {
		const noDescription = createFakeBackup( { description: '' } );

		const {
			result: { current: title },
		} = renderHook( () => useExtractedBackupTitle( noDescription ) );
		expect( title ).toEqual( 'Backup title' );
	} );

	it( 'should extract and format post and page counts from backupText', () => {
		const withPostAndPageCounts = createFakeBackup( { description: '3 posts and 1 page' } );

		const {
			result: { current: title },
		} = renderHook( () => useExtractedBackupTitle( withPostAndPageCounts ) );
		expect( title ).toEqual( '3 posts, 1 page' );
	} );

	it( 'should correctly handle a missing post count', () => {
		const missingPostCount = createFakeBackup( { description: '3 pages' } );

		const {
			result: { current: title },
		} = renderHook( () => useExtractedBackupTitle( missingPostCount ) );
		expect( title ).toEqual( '3 pages' );
	} );

	it( 'should correctly handle a missing page count', () => {
		const missingPageCount = createFakeBackup( { description: '5 posts' } );

		const {
			result: { current: title },
		} = renderHook( () => useExtractedBackupTitle( missingPageCount ) );
		expect( title ).toEqual( '5 posts' );
	} );
} );

describe( 'extractBackupTextValues', () => {
	it( 'should extract values for multiple keys from a string', () => {
		const str = '1 theme, 2 posts and 5 pages';
		const expectedValues = { post: 2, page: 5, theme: 1 };
		const result = extractBackupTextValues( str );
		expect( result ).toEqual( expectedValues );
	} );

	it( 'should handle singular and plural forms correctly', () => {
		const str = '1 post and 3 pages';
		const expectedValues = { post: 1, page: 3 };
		const result = extractBackupTextValues( str );
		expect( result ).toEqual( expectedValues );
	} );

	it( 'should return an empty object for a string without values', () => {
		const str = '';
		const expectedValues = {};
		const result = extractBackupTextValues( str );
		expect( result ).toEqual( expectedValues );
	} );
} );
