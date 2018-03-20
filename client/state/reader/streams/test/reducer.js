/** @format */
/**
 * External Dependencies
 */
import deepfreeze from 'deep-freeze';

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
import { items, selected, pendingItems, pageHandle, isRequesting, lastPage } from '../reducer';

jest.mock( 'lib/warn', () => () => {} );

const blogPost = { ID: '1', site_ID: '2' };
const feedPost = { feed_item_ID: '2', feed_ID: '2' };

const blogPostKey = { postId: '1', blogId: '2' };
const feedPostKey = { postId: '2', feedId: '2' };

describe( 'streams.items reducer', () => {
	it( 'should return an empty object by default', () => {
		expect( items( undefined, {} ) ).toEqual( [] );
	} );

	it( 'should accept new posts', () => {
		const prevState = deepfreeze( [] );
		const action = receivePage( { posts: [ blogPost, feedPost ] } );
		const nextState = items( prevState, action );

		expect( nextState ).toEqual( [ blogPostKey, feedPostKey ] );
	} );

	it( 'should add new posts to existing items', () => {
		const prevState = deepfreeze( [ blogPostKey ] );
		const action = receivePage( { posts: [ feedPost ] } );
		const nextState = items( prevState, action );

		expect( nextState ).toEqual( [ blogPostKey, feedPostKey ] );
	} );

	it( 'should return referentially equal state if there are no new items', () => {
		const prevState = deepfreeze( [ blogPostKey ] );
		const action = receivePage( { posts: [ blogPost ] } );
		const nextState = items( prevState, action );

		expect( nextState ).toBe( prevState );
	} );
} );

describe( 'streams.pendingItems reducer', () => {
	it( 'should return an empty object by default', () => {
		expect( items( undefined, {} ) ).toEqual( [] );
	} );

	it( 'should accept new posts', () => {
		const prevState = deepfreeze( [] );
		const action = receiveUpdates( { posts: [ blogPost, feedPost ] } );
		const nextState = pendingItems( prevState, action );

		expect( nextState ).toEqual( [ blogPostKey, feedPostKey ] );
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
		const action = receivePage( { posts: [], pageHandle: 'chicken' } );
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
		const action = receivePage( { streamKey: 'following', posts: [] } );
		expect( lastPage( undefined, action ) ).toBe( true );
	} );

	it( 'should maintain false if the last request had more items', () => {
		const action = receivePage( { streamKey: 'following', posts: [ feedPost ] } );
		expect( lastPage( false, action ) ).toBe( false );
	} );
} );
