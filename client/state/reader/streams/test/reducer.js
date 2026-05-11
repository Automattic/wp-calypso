import deepfreeze from 'deep-freeze';
import { READER_STREAMS_PAGE_REQUEST } from 'calypso/state/reader/action-types';
import { dismissPost } from 'calypso/state/reader/site-dismissals/actions';
import { receivePage, receiveStreamError, clearStream } from '../actions';
import { items, pageHandle, isRequesting, lastPage, error } from '../reducer';

jest.mock( '@wordpress/warning', () => () => {} );

// `requestPage` is now a thunk; for reducer tests we only need the legacy
// action it would dispatch for unmigrated streams, so build it inline.
function pageRequestAction( streamKey ) {
	return { type: READER_STREAMS_PAGE_REQUEST, payload: { streamKey } };
}

const TIME1 = '2018-01-01T00:00:00.000Z';
const TIME2 = '2018-01-02T00:00:00.000Z';

const time1PostKey = { postId: '1', blogId: '2', date: TIME1 };
const time2PostKey = { postId: '2', feedId: '2', date: TIME2 };

describe( 'streams.items reducer', () => {
	it( 'should return an empty object by default', () => {
		expect( items( undefined, {} ) ).toEqual( [] );
	} );

	it( 'should accept new items', () => {
		const prevState = deepfreeze( [] );
		const action = receivePage( { streamItems: [ time2PostKey, time1PostKey ] } );
		const nextState = items( prevState, action );

		expect( nextState ).toEqual( [ time2PostKey, time1PostKey ] );
	} );

	it( 'should accept new items with duplicates removed', () => {
		const prevState = deepfreeze( [ time2PostKey ] );
		const action = receivePage( { streamItems: [ time2PostKey, time1PostKey ] } );
		const nextState = items( prevState, action );

		expect( nextState ).toEqual( [ time2PostKey, time1PostKey ] );
	} );

	it( 'should add new posts to existing items', () => {
		const prevState = deepfreeze( [ time2PostKey ] );
		const action = receivePage( { streamItems: [ time1PostKey ] } );
		const nextState = items( prevState, action );

		expect( nextState ).toEqual( [ time2PostKey, time1PostKey ] );
	} );

	it( 'should remove a dismissed post and replace it with the last item', () => {
		const lastKey = { ...time2PostKey, feedId: 42 };
		const prevState = deepfreeze( [ time1PostKey, time2PostKey, lastKey ] );
		const action = dismissPost( { postKey: time1PostKey } );
		const nextState = items( prevState, action );

		expect( nextState ).toEqual( [ lastKey, time2PostKey ] );
	} );

	it( 'should combine consecutive x-posts for the same original post', () => {
		const xPostMetadata = {
			blogId: 123,
			postId: 1,
		};

		// First x-post
		const postKey1 = {
			...time1PostKey,
			url: 'http://example.com/posts/one',
			xPostMetadata,
		};

		// Second x-post (should merge into first x-post)
		const postKey2 = {
			...time2PostKey,
			url: 'http://example.com/posts/two',
			xPostMetadata,
		};

		// Third x-post (should also merge into first x-post)
		const postKey3 = {
			...time2PostKey,
			postId: 3,
			url: 'http://example.com/posts/three',
			xPostMetadata,
		};

		const postKey4 = {
			...time2PostKey,
			postId: 4,
			url: 'http://example.com/posts/four',
			xPostMetadata: null,
		};

		const prevState = deepfreeze( [] );
		const action = receivePage( { streamItems: [ postKey1, postKey2, postKey3, postKey4 ] } );
		const nextState = items( prevState, action );

		expect( nextState ).toEqual( [
			{
				...postKey1,
				xPostUrls: [ postKey2.url, postKey3.url ],
			},
			postKey4,
		] );
	} );
} );

describe( 'streams.pageHandle', () => {
	it( 'should default to null', () => {
		expect( pageHandle( undefined, {} ) ).toBe( null );
	} );

	it( 'should get set to the returning action on pageRecieve', () => {
		const action = receivePage( { streamItems: [], pageHandle: 'chicken' } );
		expect( pageHandle( undefined, action ) ).toBe( 'chicken' );
	} );
} );

describe( 'streams.isRequesting', () => {
	it( 'should default to false', () => {
		expect( isRequesting( undefined, {} ) ).toBe( false );
	} );

	it( 'should set to true after request is initiated', () => {
		const action = pageRequestAction( 'following' );
		expect( isRequesting( undefined, action ) ).toBe( true );
	} );

	it( 'should set to false after page is received', () => {
		const action = receivePage( { streamKey: 'following' } );
		expect( isRequesting( true, action ) ).toBe( false );
	} );
} );

describe( 'streams.error', () => {
	it( 'should default to null', () => {
		expect( error( undefined, {} ) ).toBe( null );
	} );

	it( 'should return the error', () => {
		const action = receiveStreamError(
			{ payload: { streamKey: 'following' } },
			new Error( 'test error' )
		);
		expect( error( undefined, action ) ).toEqual( new Error( 'test error' ) );
	} );

	it( 'should cleanup the error after a page request', () => {
		const previousError = new Error( 'test error' );
		const action = pageRequestAction( 'following' );

		expect( error( previousError, action ) ).toBe( null );
	} );

	it( 'should cleanup the error after a stream is cleared', () => {
		const previousError = new Error( 'test error' );
		const action = clearStream( { streamKey: 'following' } );

		expect( error( previousError, action ) ).toBe( null );
	} );
} );

describe( 'streams.lastPage', () => {
	it( 'should default to false', () => {
		expect( lastPage( undefined, {} ) ).toBe( false );
	} );

	it( 'should set to true if next page has no items', () => {
		const action = receivePage( { streamKey: 'following', streamItems: [] } );
		expect( lastPage( undefined, action ) ).toBe( true );
	} );

	it( 'should maintain false if the last request had more items and a pageHandle', () => {
		const action = receivePage( {
			streamKey: 'following',
			streamItems: [ time2PostKey ],
			pageHandle: 'next-page-token',
		} );
		expect( lastPage( false, action ) ).toBe( false );
	} );

	it( 'should return true if there are items but no pageHandle', () => {
		const action = receivePage( {
			streamKey: 'following',
			streamItems: [ time2PostKey ],
			pageHandle: null,
		} );
		expect( lastPage( false, action ) ).toBe( true );
	} );
} );
