import { withStorageKey } from '@automattic/state-utils';
import {
	READER_TRIGGERED_LOGGED_IN_ACTION,
	READER_VIEW_STREAM,
} from 'calypso/state/reader-ui/action-types';
import { combineReducers, withPersistence } from 'calypso/state/utils';
import cardExpansions from './card-expansions/reducer';
import hasUnseenPosts from './seen-posts/reducer';
import sidebar from './sidebar/reducer';

/**
 * Keep the last reader stream path selected by the user, for the purpose of autoselecting it
 * when user navigates back to Reader
 * @param state redux state
 * @param action redux action
 * @returns {null|string} last path selected
 */
export const lastPath = withPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case READER_VIEW_STREAM:
			if ( action.path && action.path.startsWith( '/read' ) ) {
				return action.path;
			}
			break;
	}
	return state;
} );

/*
 * Holds the last viewed stream for the purposes of keyboard navigation
 */
export const currentStream = ( state = null, action ) => {
	switch ( action.type ) {
		case READER_VIEW_STREAM:
			return action.streamKey;
		default:
			return state;
	}
};

/*
 * Holds the last action that requires the user to be logged in
 */
export const loggedInAction = ( state = null, action ) => {
	switch ( action.type ) {
		case READER_TRIGGERED_LOGGED_IN_ACTION:
			return action.name;
		default:
			return state;
	}
};

const combinedReducer = combineReducers( {
	sidebar,
	cardExpansions,
	lastPath,
	currentStream,
	loggedInAction,
	hasUnseenPosts,
} );

export default withStorageKey( 'readerUi', combinedReducer );
