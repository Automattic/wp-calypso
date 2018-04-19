/** @format */
/**
 * External Dependencies
 */
import freeze from 'deep-freeze';

/**
 * Internal Dependencies
 */
import { getReaderStreamOffsetItem as getOffsetItem } from 'state/selectors';

jest.mock( 'lib/user/utils', () => ( { getLocaleSlug: () => 'en' } ) );
jest.mock( 'reader/stream/utils' );
jest.mock( 'state/selectors/get-reader-follows' );

const postKey1 = { postId: 1, feedId: 1 };
const postKey2 = { postId: 1, blogId: 1 };
const postKey3 = { postId: 2, feedId: 1 };

const currentStream = { ui: { reader: { currentStream: 'following' } } };

describe( 'getOffsetItem', () => {
	test( 'should return null when not given a currentItem', () => {
		const state = freeze( { reader: { streams: {} }, ...currentStream } );
		expect( getOffsetItem( state ) ).toBe( null );
	} );

	test( 'should return null for out of bounds', () => {
		const state = freeze( {
			reader: { streams: { following: { items: [ postKey1 ] } } },
			...currentStream,
		} );
		expect( getOffsetItem( state, postKey1, 1 ) ).toBe( null );
		expect( getOffsetItem( state, postKey1, -1 ) ).toBe( null );
	} );

	test( 'should return items offset by one in either direction', () => {
		const state = freeze( {
			reader: { streams: { following: { items: [ postKey1, postKey2, postKey3 ] } } },
			...currentStream,
		} );
		expect( getOffsetItem( state, postKey2, 1 ) ).toBe( postKey3 );
		expect( getOffsetItem( state, postKey2, -1 ) ).toBe( postKey1 );
	} );
} );
