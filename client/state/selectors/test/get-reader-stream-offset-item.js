/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getOffsetItem } from 'calypso/state/reader/streams/selectors';

jest.mock( 'lib/user/utils', () => ( { getLocaleSlug: () => 'en' } ) );
jest.mock( 'reader/stream/utils' );
jest.mock( 'state/reader/follows/selectors/get-reader-follows' );

const postKey1 = { postId: 1, feedId: 1 };
const postKey2 = { postId: 1, blogId: 1 };
const postKey3 = { postId: 2, feedId: 1 };
const postKey4 = { postId: 1, feedId: 4, xPostMetadata: { blogId: 123, postId: 456 } };
const postKey5 = { postId: 2, feedId: 4 };

const currentStream = { readerUi: { currentStream: 'following' } };

describe( 'getOffsetItem', () => {
	test( 'should return null when not given a currentItem', () => {
		const state = deepFreeze( { reader: { streams: {} }, ...currentStream } );
		expect( getOffsetItem( state ) ).toBe( null );
	} );

	test( 'should return null for out of bounds', () => {
		const state = deepFreeze( {
			reader: { streams: { following: { items: [ postKey1 ] } } },
			...currentStream,
		} );
		expect( getOffsetItem( state, postKey1, 1 ) ).toBe( null );
		expect( getOffsetItem( state, postKey1, -1 ) ).toBe( null );
	} );

	test( 'should return items offset by one in either direction', () => {
		const state = deepFreeze( {
			reader: { streams: { following: { items: [ postKey1, postKey2, postKey3 ] } } },
			...currentStream,
		} );
		expect( getOffsetItem( state, postKey2, 1 ) ).toBe( postKey3 );
		expect( getOffsetItem( state, postKey2, -1 ) ).toBe( postKey1 );
	} );

	test( 'should return items offset by one in either direction for a x-post', () => {
		const state = deepFreeze( {
			reader: {
				streams: {
					following: { items: [ postKey1, postKey2, postKey3, postKey4, postKey5 ] },
				},
			},
			...currentStream,
		} );
		const xPostKey = { blogId: 123, postId: 456 };
		expect( getOffsetItem( state, xPostKey, 1 ) ).toBe( postKey5 );
		expect( getOffsetItem( state, xPostKey, -1 ) ).toBe( postKey3 );
	} );

	test( 'should return the x-post details if the offset item is a x-post', () => {
		const state = deepFreeze( {
			reader: {
				streams: {
					following: { items: [ postKey1, postKey2, postKey3, postKey4, postKey5 ] },
				},
			},
			...currentStream,
		} );
		expect( getOffsetItem( state, postKey3, 1 ) ).toEqual( postKey4.xPostMetadata );
	} );
} );
