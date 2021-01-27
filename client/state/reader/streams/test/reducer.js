/**
 * External dependencies
 */
import deepfreeze from 'deep-freeze';
import moment from 'moment';

/**
 * Internal dependencies
 */
import {
	receivePage,
	selectItem,
	receiveUpdates,
	selectNextItem,
	selectPrevItem,
	requestPage,
} from '../actions';
import { dismissPost } from 'calypso/state/reader/site-dismissals/actions';
import {
	items,
	selected,
	pendingItems,
	pageHandle,
	isRequesting,
	lastPage,
	PENDING_ITEMS_DEFAULT,
} from '../reducer';

jest.mock( '@automattic/warn', () => () => {} );
jest.mock( 'calypso/lib/user', () => () => {} );

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

describe( 'streams.pendingItems reducer', () => {
	it( 'should return an empty object by default', () => {
		expect( pendingItems( undefined, {} ) ).toEqual( PENDING_ITEMS_DEFAULT );
	} );

	it( 'should accept new items', () => {
		const prevState = deepfreeze( PENDING_ITEMS_DEFAULT );
		const action = receiveUpdates( { streamItems: [ time2PostKey, time1PostKey ] } );
		const nextState = pendingItems( prevState, action );

		expect( nextState ).toEqual( {
			items: [ time2PostKey, time1PostKey ],
			lastUpdated: moment( TIME2 ),
		} );
	} );

	it( 'should not create a gap if we can see posts from before lastUpdated', () => {
		const newKey = { postId: '3', feedId: '4', date: TIME2 };
		const prevState = deepfreeze( {
			items: [ time2PostKey ],
			lastUpdated: moment( time1PostKey.date ),
		} );
		const action = receiveUpdates( { streamItems: [ newKey, time2PostKey, time1PostKey ] } );
		const nextState = pendingItems( prevState, action );

		expect( nextState ).toEqual( {
			items: [ newKey, time2PostKey ],
			lastUpdated: moment( TIME2 ),
		} );
	} );

	it( 'should create a gap if oldest poll item is newer than lastUpdated', () => {
		const prevState = deepfreeze( { items: [], lastUpdated: moment( TIME1 ) } );

		const newKey = { postId: '3', feedId: '4', date: TIME2 };
		const action = receiveUpdates( { streamItems: [ newKey, time2PostKey ] } );
		const nextState = pendingItems( prevState, action );

		expect( nextState ).toEqual( {
			items: [ newKey, time2PostKey, { isGap: true, from: moment( TIME1 ), to: moment( TIME2 ) } ],
			lastUpdated: moment( TIME2 ),
		} );
	} );

	it( 'should return the original state when no new changes come in', () => {
		const prevState = deepfreeze( { items: [], lastUpdated: moment( TIME2 ) } );
		const action = receiveUpdates( { streamItems: [ time2PostKey ] } );
		const nextState = pendingItems( prevState, action );

		expect( nextState ).toBe( prevState );
	} );

	it( 'should return the original state with empty changes', () => {
		const prevState = deepfreeze( { items: [], lastUpdated: moment( TIME2 ) } );
		const action = receiveUpdates( { streamItems: [] } );
		const nextState = pendingItems( prevState, action );

		expect( nextState ).toBe( prevState );
	} );

	it( 'should combine consecutive x-posts for the same original post', () => {
		const xPostMetadata = {
			blogId: 123,
			postId: 1,
		};

		// First x-post
		const postKey1 = {
			...time2PostKey,
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

		const prevState = deepfreeze( { items: [], lastUpdated: moment( TIME1 ) } );
		const action = receiveUpdates( {
			streamItems: [ postKey1, postKey2, postKey3, postKey4 ],
		} );
		const nextState = pendingItems( prevState, action );

		expect( nextState.items ).toEqual( [
			{
				...postKey1,
				xPostUrls: [ postKey2.url, postKey3.url ],
			},
			postKey4,
			{ isGap: true, from: moment( TIME1 ), to: moment( TIME2 ) },
		] );
	} );
} );

describe( 'streams.selected reducer', () => {
	const streamItems = [ time1PostKey, time2PostKey ];
	it( 'should return null by default', () => {
		expect( selected( undefined, {} ) ).toEqual( null );
	} );

	it( 'should store the selected postKey', () => {
		const action = selectItem( { postKey: time1PostKey } );
		const state = selected( undefined, action );

		expect( state ).toBe( time1PostKey );
	} );

	it( 'should update the index for a stream', () => {
		const prevState = time1PostKey;
		const action = selectItem( { postKey: time2PostKey } );
		const nextState = selected( prevState, action );
		expect( nextState ).toBe( time2PostKey );
	} );

	it( 'should return state unchanged if at last item and trying to select next one', () => {
		const prevState = time2PostKey;
		const action = selectNextItem( { items: streamItems } );
		const nextState = selected( prevState, action );
		expect( nextState ).toBe( prevState );
	} );

	it( 'should select previous item', () => {
		const prevState = time2PostKey;
		const action = selectPrevItem( { items: streamItems } );
		const nextState = selected( prevState, action );
		expect( nextState ).toBe( time1PostKey );
	} );

	it( 'should return state unchanged if at first item and trying to select previous item', () => {
		const prevState = time1PostKey;
		const action = selectPrevItem( { items: streamItems } );
		const nextState = selected( prevState, action );
		expect( nextState ).toBe( prevState );
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
		const action = requestPage( { streamKey: 'following' } );
		expect( isRequesting( undefined, action ) ).toBe( true );
	} );

	it( 'should set to false after page is received', () => {
		const action = receivePage( { streamKey: 'following' } );
		expect( isRequesting( true, action ) ).toBe( false );
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

	it( 'should maintain false if the last request had more items', () => {
		const action = receivePage( { streamKey: 'following', streamItems: [ time2PostKey ] } );
		expect( lastPage( false, action ) ).toBe( false );
	} );
} );
