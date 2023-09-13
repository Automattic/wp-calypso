/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { getFileExtension } from 'calypso/lib/media/utils/get-file-extension';
import { useTruncatedFileName } from '../hooks';

describe( 'useTruncatedFileName', () => {
	test( 'returns original name when name length is less than max length', () => {
		const { result } = renderHook( () =>
			useTruncatedFileName( 'this-is-a-very-long-filename', 30, 'text' )
		);

		expect( result.current[ 0 ] ).toBe( 'this-is-a-very-long-filename' );
		expect( result.current[ 1 ] ).toBe( false );
	} );

	test( 'returns truncated name when name length exceeds max length with extension', () => {
		const { result } = renderHook( () =>
			useTruncatedFileName( 'this-is-a-very-long-filename.mp3', 30, 'text' )
		);

		const expectedTruncatedName = 'this-is-a-very-long-file...mp3';
		expect( result.current[ 0 ] ).toBe( expectedTruncatedName );
		expect( result.current[ 1 ] ).toBe( true );
	} );

	test( 'returns truncated name when name length exceeds max length without extension', () => {
		const { result } = renderHook( () =>
			useTruncatedFileName( 'this-is-a-very-very-very-long-filename', 30, 'text' )
		);

		const expectedTruncatedName = 'this-is-a-very-very-very-lo...';
		expect( result.current[ 0 ] ).toBe( expectedTruncatedName );
		expect( result.current[ 1 ] ).toBe( true );
	} );

	test( 'truncated name should maintain file extension if exists', () => {
		const { result } = renderHook( () =>
			useTruncatedFileName( 'this-is-a-very-long-filename.mp3', 30, 'text' )
		);

		const extension = getFileExtension( result.current[ 0 ] );
		expect( extension ).toBe( 'mp3' );
	} );

	test( 'truncated name should have no extension when original name has no extension', () => {
		const { result } = renderHook( () =>
			useTruncatedFileName( 'this-is-a-very-very-very-long-filename', 30, 'text' )
		);

		const extension = getFileExtension( result.current[ 0 ] );
		expect( extension ).toBe( '' );
	} );

	test( 'returns original name when file type is archive', () => {
		const { result } = renderHook( () =>
			useTruncatedFileName( 'original version 15.8.1 from WordPress.org', 30, 'archive' )
		);

		expect( result.current[ 0 ] ).toBe( 'original version 15.8.1 from WordPress.org' );
		expect( result.current[ 1 ] ).toBe( false );
	} );
} );
