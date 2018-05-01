/** @format */
/**
 * External Dependencies
 */
import deepfreeze from 'deep-freeze';
import moment from 'moment';

/**
 * Internal Dependencies
 */
import {
	receivePage,
	selectItem,
	receiveUpdates,
	selectNextItem,
	selectPrevItem,
	requestPage,
} from '../actions';
import {
	items,
	selected,
	pendingItems,
	pageHandle,
	isRequesting,
	lastPage,
	PENDING_ITEMS_DEFAULT,
} from '../reducer';

jest.mock( 'lib/warn', () => () => {} );

const TIME1 = '2018-01-01T00:00:00.000Z';
const TIME2 = '2018-01-02T00:00:00.000Z';

const blogPostKey = { postId: '1', blogId: '2', date: TIME1 };
const feedPostKey = { postId: '2', feedId: '2', date: TIME2 };

describe( 'streams.items reducer', () => {
	it( 'should return an empty object by default', () => {
		expect( items( undefined, {} ) ).toEqual( [] );
	} );

	it( 'should accept new items', () => {
		const prevState = deepfreeze( [] );
		const action = receivePage( { streamItems: [ blogPostKey, feedPostKey ] } );
		const nextState = items( prevState, action );

		expect( nextState ).toEqual( [ blogPostKey, feedPostKey ] );
	} );

	it( 'should add new posts to existing items', () => {
		const prevState = deepfreeze( [ blogPostKey ] );
		const action = receivePage( { streamItems: [ feedPostKey ] } );
		const nextState = items( prevState, action );

		expect( nextState ).toEqual( [ blogPostKey, feedPostKey ] );
	} );

	it( 'should return referentially equal state if there are no new items', () => {
		const prevState = deepfreeze( [ blogPostKey ] );
		const action = receivePage( { streamItems: [ blogPostKey ] } );
		const nextState = items( prevState, action );

		expect( nextState ).toBe( prevState );
	} );
} );

describe( 'streams.pendingItems reducer', () => {
	it( 'should return an empty object by default', () => {
		expect( pendingItems( undefined, {} ) ).toEqual( PENDING_ITEMS_DEFAULT );
	} );

	it( 'should accept new items', () => {
		const prevState = deepfreeze( PENDING_ITEMS_DEFAULT );
		const action = receiveUpdates( { streamItems: [ blogPostKey, feedPostKey ] } );
		const nextState = pendingItems( prevState, action );

		expect( nextState ).toEqual( {
			items: [ blogPostKey, feedPostKey ],
			lastUpdated: moment( TIME2 ),
		} );
	} );

	it( 'should not create a gap if we filter out old posts', () => {
		const newKey = { postId: '3', feedId: '4', date: TIME2 };
		const prevState = deepfreeze( { items: [ feedPostKey ], lastUpdated: moment( TIME1 ) } );
		const action = receiveUpdates( { streamItems: [ newKey, feedPostKey, blogPostKey ] } );
		const nextState = pendingItems( prevState, action );

		expect( nextState ).toEqual( {
			items: [ newKey, feedPostKey ],
			lastUpdated: moment( TIME2 ),
		} );
	} );

	it( 'should create a gap if nothing is filtered out', () => {
		const prevState = deepfreeze( { items: [ feedPostKey ], lastUpdated: moment( TIME1 ) } );

		const newKey = { postId: '3', feedId: '4', date: TIME2 };
		const action = receiveUpdates( { streamItems: [ newKey, feedPostKey ] } );
		const nextState = pendingItems( prevState, action );

		expect( nextState ).toEqual( {
			items: [ newKey, feedPostKey, { isGap: true, from: moment( TIME1 ), to: moment( TIME2 ) } ],
			lastUpdated: moment( TIME2 ),
		} );
	} );

	it( 'should return the original state when no new changes come in', () => {
		const newKey = { postId: '3', feedId: '4', date: TIME2 };
		const prevState = deepfreeze( { items: [], lastUpdated: moment( TIME2 ) } );
		const action = receiveUpdates( { streamItems: [ newKey, feedPostKey ] } );
		const nextState = pendingItems( prevState, action );

		expect( nextState ).toBe( prevState );
	} );
} );

describe( 'streams.selected reducer', () => {
	const streamItems = [ blogPostKey, feedPostKey ];
	it( 'should return null by default', () => {
		expect( selected( undefined, {} ) ).toEqual( null );
	} );

	it( 'should store the selected postKey', () => {
		const action = selectItem( { postKey: blogPostKey } );
		const state = selected( undefined, action );

		expect( state ).toBe( blogPostKey );
	} );

	it( 'should update the index for a stream', () => {
		const prevState = blogPostKey;
		const action = selectItem( { postKey: feedPostKey } );
		const nextState = selected( prevState, action );
		expect( nextState ).toBe( feedPostKey );
	} );

	it( 'should return state unchanged if at last item and trying to select next one', () => {
		const prevState = feedPostKey;
		const action = selectNextItem( { items: streamItems } );
		const nextState = selected( prevState, action );
		expect( nextState ).toBe( prevState );
	} );

	it( 'should select previous item', () => {
		const prevState = feedPostKey;
		const action = selectPrevItem( { items: streamItems } );
		const nextState = selected( prevState, action );
		expect( nextState ).toBe( blogPostKey );
	} );

	it( 'should return state unchanged if at first item and trying to select previous item', () => {
		const prevState = blogPostKey;
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
		const action = receivePage( { streamKey: 'following', streamItems: [ feedPostKey ] } );
		expect( lastPage( false, action ) ).toBe( false );
	} );
} );
