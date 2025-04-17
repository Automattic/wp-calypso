import { withStorageKey } from '@automattic/state-utils';
import {
	READER_VIEW_STREAM,
	READER_CLEAR_LAST_ACTION_REQUIRES_LOGIN,
	READER_REGISTER_LAST_ACTION_REQUIRES_LOGIN,
} from 'calypso/state/reader-ui/action-types';
import { combineReducers, withPersistence } from 'calypso/state/utils';
import cardExpansions from './card-expansions/reducer';
import hasUnseenPosts from './seen-posts/reducer';
import sidebar from './sidebar/reducer';

const PENDING_ACTION_STORAGE_KEY = 'wp-reader-pending-signup-action';
const PENDING_ACTION_MAX_AGE = 5 * 60 * 1000; // 5 minutes

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
			if ( action.path && action.path.startsWith( '/reader' ) ) {
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

// We bridge the gap between logged out and logged in with local storage. A new user liking a post
// while logged out will have their state cleared when logged in, even using withPersistence. This
// allows us to complete the action after they have signed up and logged in.
const getInitialLastActionState = () => {
	const storedAction = localStorage.getItem( PENDING_ACTION_STORAGE_KEY );
	if ( ! storedAction ) {
		return null;
	}

	const parsedAction = JSON.parse( storedAction );
	localStorage.removeItem( PENDING_ACTION_STORAGE_KEY );

	// To prevent lingering storage causing bugs, we only allow this action to be used for 5
	// minutes.
	if ( parsedAction.timestamp ) {
		const { timestamp, ...actionWithoutTimestamp } = parsedAction;
		const currentTime = Date.now();
		const actionAge = currentTime - timestamp;

		if ( actionAge <= PENDING_ACTION_MAX_AGE ) {
			return actionWithoutTimestamp;
		}
	}

	return null;
};

/*
 * Holds the last action that requires the user to be logged in
 */
export const lastActionRequiresLogin = ( state = getInitialLastActionState(), action ) => {
	switch ( action.type ) {
		case READER_REGISTER_LAST_ACTION_REQUIRES_LOGIN:
			localStorage.setItem(
				PENDING_ACTION_STORAGE_KEY,
				JSON.stringify( { ...action.lastAction, timestamp: Date.now() } )
			);
			return action.lastAction;
		case READER_CLEAR_LAST_ACTION_REQUIRES_LOGIN:
			localStorage.removeItem( PENDING_ACTION_STORAGE_KEY );
			return null;
		default:
			return state;
	}
};

const combinedReducer = combineReducers( {
	sidebar,
	cardExpansions,
	lastPath,
	currentStream,
	lastActionRequiresLogin,
	hasUnseenPosts,
} );

export default withStorageKey( 'readerUi', combinedReducer );
