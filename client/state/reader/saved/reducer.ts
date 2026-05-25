import { keyToString } from 'calypso/reader/post-key';
import {
	READER_SAVED_POST_SAVE,
	READER_SAVED_POST_UNSAVE,
	READER_SAVED_POSTS_RECEIVE,
	READER_SAVED_POSTS_REQUEST,
	READER_SAVED_POSTS_REQUEST_FAILURE,
	READER_SAVED_POSTS_REORDER,
	READER_SAVED_POST_MARK_READ,
	READER_SAVED_POST_MARK_UNREAD,
} from 'calypso/state/reader/action-types';
import { combineReducers } from 'calypso/state/utils';
import { persistToLocalStorage } from './local-storage';
import type { PostKey, SavedPostItem } from './types';

interface PostKeyAction {
	type: string;
	payload: { postKey: PostKey };
}

interface ItemsAction {
	type: string;
	payload: { items: SavedPostItem[] };
}

interface ReorderAction {
	type: string;
	payload: { oldIndex: number; newIndex: number };
}

interface ErrorAction {
	type: string;
	payload: { error: string };
}

type SavedPostAction = PostKeyAction | ItemsAction | ReorderAction | ErrorAction | { type: string };

function items( state: SavedPostItem[] = [], action: SavedPostAction ) {
	let newState: SavedPostItem[];

	switch ( action.type ) {
		case READER_SAVED_POST_SAVE: {
			const { postKey } = ( action as PostKeyAction ).payload;
			const key = keyToString( postKey );
			const alreadySaved = state.some( ( item ) => keyToString( item.postKey ) === key );
			if ( alreadySaved ) {
				return state;
			}
			const newItem: SavedPostItem = {
				postKey,
				savedAt: new Date().toISOString(),
				position: 0,
				isRead: false,
			};
			newState = [ newItem, ...state ].map( ( item, index ) => ( {
				...item,
				position: index,
			} ) );
			persistToLocalStorage( newState );
			return newState;
		}

		case READER_SAVED_POST_UNSAVE: {
			const { postKey } = ( action as PostKeyAction ).payload;
			const key = keyToString( postKey );
			newState = state
				.filter( ( item ) => keyToString( item.postKey ) !== key )
				.map( ( item, index ) => ( { ...item, position: index } ) );
			persistToLocalStorage( newState );
			return newState;
		}

		case READER_SAVED_POSTS_RECEIVE:
			return ( action as ItemsAction ).payload.items;

		case READER_SAVED_POSTS_REORDER: {
			const { oldIndex, newIndex } = ( action as ReorderAction ).payload;
			if (
				oldIndex < 0 ||
				oldIndex >= state.length ||
				newIndex < 0 ||
				newIndex >= state.length ||
				oldIndex === newIndex
			) {
				return state;
			}
			newState = [ ...state ];
			const [ movedItem ] = newState.splice( oldIndex, 1 );
			newState.splice( newIndex, 0, movedItem );
			newState = newState.map( ( item, index ) => ( { ...item, position: index } ) );
			persistToLocalStorage( newState );
			return newState;
		}

		case READER_SAVED_POST_MARK_READ: {
			const { postKey } = ( action as PostKeyAction ).payload;
			const key = keyToString( postKey );
			newState = state.map( ( item ) =>
				keyToString( item.postKey ) === key ? { ...item, isRead: true } : item
			);
			persistToLocalStorage( newState );
			return newState;
		}

		case READER_SAVED_POST_MARK_UNREAD: {
			const { postKey } = ( action as PostKeyAction ).payload;
			const key = keyToString( postKey );
			newState = state.map( ( item ) =>
				keyToString( item.postKey ) === key ? { ...item, isRead: false } : item
			);
			persistToLocalStorage( newState );
			return newState;
		}

		default:
			return state;
	}
}

function isLoading( state = false, action: { type: string } ) {
	switch ( action.type ) {
		case READER_SAVED_POSTS_REQUEST:
			return true;
		case READER_SAVED_POSTS_RECEIVE:
		case READER_SAVED_POSTS_REQUEST_FAILURE:
			return false;
		default:
			return state;
	}
}

function error( state: string | null = null, action: SavedPostAction ) {
	switch ( action.type ) {
		case READER_SAVED_POSTS_REQUEST:
		case READER_SAVED_POSTS_RECEIVE:
			return null;
		case READER_SAVED_POSTS_REQUEST_FAILURE:
			return ( action as ErrorAction ).payload.error;
		default:
			return state;
	}
}

export default combineReducers( { items, isLoading, error } );
