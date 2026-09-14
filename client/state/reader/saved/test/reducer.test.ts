import {
	savePost,
	unsavePost,
	receiveSavedPosts,
	reorderSavedPosts,
	markSavedPostRead,
	markSavedPostUnread,
	requestSavedPosts,
	savedPostsRequestFailure,
} from '../actions';
import reducer from '../reducer';
import type { SavedPostItem } from '../types';

beforeEach( () => {
	if ( typeof window === 'undefined' ) {
		( global as Record< string, unknown > ).window = {};
	}

	Object.defineProperty( window, 'localStorage', {
		value: {
			getItem: jest.fn(),
			setItem: jest.fn(),
			removeItem: jest.fn(),
		},
		writable: true,
	} );
} );

const postKeyA = { blogId: 1, postId: 100 };
const postKeyB = { feedId: 2, postId: 200 };
const postKeyC = { blogId: 3, postId: 300 };

function makeItem(
	postKey: { blogId?: number; feedId?: number; postId: number },
	position: number,
	isRead = false
): SavedPostItem {
	return {
		postKey,
		savedAt: '2026-04-13T10:00:00.000Z',
		position,
		isRead,
	};
}

describe( 'saved posts reducer', () => {
	describe( 'items', () => {
		it( 'should return an empty array by default', () => {
			const state = reducer( undefined, { type: 'INIT' } );
			expect( state.items ).toEqual( [] );
		} );

		it( 'should add a post at position 0 on save', () => {
			const state = reducer( undefined, savePost( postKeyA ) );
			expect( state.items ).toHaveLength( 1 );
			expect( state.items[ 0 ].postKey ).toEqual( postKeyA );
			expect( state.items[ 0 ].position ).toBe( 0 );
			expect( state.items[ 0 ].isRead ).toBe( false );
		} );

		it( 'should not duplicate an already-saved post', () => {
			const initial = reducer( undefined, savePost( postKeyA ) );
			const state = reducer( initial, savePost( postKeyA ) );
			expect( state.items ).toHaveLength( 1 );
		} );

		it( 'should insert new saves at the top', () => {
			let state = reducer( undefined, savePost( postKeyA ) );
			state = reducer( state, savePost( postKeyB ) );
			expect( state.items[ 0 ].postKey ).toEqual( postKeyB );
			expect( state.items[ 0 ].position ).toBe( 0 );
			expect( state.items[ 1 ].postKey ).toEqual( postKeyA );
			expect( state.items[ 1 ].position ).toBe( 1 );
		} );

		it( 'should remove a post on unsave', () => {
			let state = reducer( undefined, savePost( postKeyA ) );
			state = reducer( state, savePost( postKeyB ) );
			state = reducer( state, unsavePost( postKeyA ) );
			expect( state.items ).toHaveLength( 1 );
			expect( state.items[ 0 ].postKey ).toEqual( postKeyB );
			expect( state.items[ 0 ].position ).toBe( 0 );
		} );

		it( 'should handle unsave of a post that is not saved', () => {
			const state = reducer( undefined, unsavePost( postKeyA ) );
			expect( state.items ).toEqual( [] );
		} );

		it( 'should replace items on receive', () => {
			const received = [ makeItem( postKeyA, 0 ), makeItem( postKeyB, 1 ) ];
			const state = reducer( undefined, receiveSavedPosts( received ) );
			expect( state.items ).toEqual( received );
		} );

		it( 'should reorder items', () => {
			const items = Object.freeze( [
				makeItem( postKeyA, 0 ),
				makeItem( postKeyB, 1 ),
				makeItem( postKeyC, 2 ),
			] );
			const initial = { items, isLoading: false, error: null };
			const state = reducer( initial, reorderSavedPosts( 0, 2 ) );
			expect( state.items[ 0 ].postKey ).toEqual( postKeyB );
			expect( state.items[ 1 ].postKey ).toEqual( postKeyC );
			expect( state.items[ 2 ].postKey ).toEqual( postKeyA );
			expect( state.items[ 0 ].position ).toBe( 0 );
			expect( state.items[ 1 ].position ).toBe( 1 );
			expect( state.items[ 2 ].position ).toBe( 2 );
		} );

		it( 'should not reorder with invalid indices', () => {
			const items = Object.freeze( [ makeItem( postKeyA, 0 ), makeItem( postKeyB, 1 ) ] );
			const initial = { items, isLoading: false, error: null };
			const state = reducer( initial, reorderSavedPosts( -1, 1 ) );
			expect( state.items ).toBe( items );
		} );

		it( 'should not reorder when indices are equal', () => {
			const items = Object.freeze( [ makeItem( postKeyA, 0 ), makeItem( postKeyB, 1 ) ] );
			const initial = { items, isLoading: false, error: null };
			const state = reducer( initial, reorderSavedPosts( 0, 0 ) );
			expect( state.items ).toBe( items );
		} );

		it( 'should mark a post as read', () => {
			let state = reducer( undefined, savePost( postKeyA ) );
			state = reducer( state, markSavedPostRead( postKeyA ) );
			expect( state.items[ 0 ].isRead ).toBe( true );
		} );

		it( 'should mark a post as unread', () => {
			const items = [ makeItem( postKeyA, 0, true ) ];
			const initial = { items, isLoading: false, error: null };
			const state = reducer( initial, markSavedPostUnread( postKeyA ) );
			expect( state.items[ 0 ].isRead ).toBe( false );
		} );
	} );

	describe( 'isLoading', () => {
		it( 'should be false by default', () => {
			const state = reducer( undefined, { type: 'INIT' } );
			expect( state.isLoading ).toBe( false );
		} );

		it( 'should be true on request', () => {
			const state = reducer( undefined, requestSavedPosts() );
			expect( state.isLoading ).toBe( true );
		} );

		it( 'should be false on receive', () => {
			const initial = { items: [], isLoading: true, error: null };
			const state = reducer( initial, receiveSavedPosts( [] ) );
			expect( state.isLoading ).toBe( false );
		} );

		it( 'should be false on failure', () => {
			const initial = { items: [], isLoading: true, error: null };
			const state = reducer( initial, savedPostsRequestFailure( 'Network error' ) );
			expect( state.isLoading ).toBe( false );
		} );
	} );

	describe( 'error', () => {
		it( 'should be null by default', () => {
			const state = reducer( undefined, { type: 'INIT' } );
			expect( state.error ).toBeNull();
		} );

		it( 'should store error on failure', () => {
			const state = reducer( undefined, savedPostsRequestFailure( 'Network error' ) );
			expect( state.error ).toBe( 'Network error' );
		} );

		it( 'should clear error on new request', () => {
			const initial = { items: [], isLoading: false, error: 'Previous error' };
			const state = reducer( initial, requestSavedPosts() );
			expect( state.error ).toBeNull();
		} );

		it( 'should clear error on receive', () => {
			const initial = { items: [], isLoading: false, error: 'Previous error' };
			const state = reducer( initial, receiveSavedPosts( [] ) );
			expect( state.error ).toBeNull();
		} );
	} );
} );
