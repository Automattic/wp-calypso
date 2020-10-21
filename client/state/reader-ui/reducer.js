/**
 * Internal dependencies
 */
import { READER_VIEW_STREAM } from 'calypso/state/reader/action-types';
import sidebar from './sidebar/reducer';
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import cardExpansions from './card-expansions/reducer';
import hasUnseenPosts from './seen-posts/reducer';
import { DESERIALIZE, SERIALIZE } from 'calypso/state/action-types';

/**
 * Keep the last reader stream path selected by the user, for the purpose of autoselecting it
 * when user navigates back to Reader
 *
 * @param state redux state
 * @param action redux action
 *
 * @returns {null|string} last path selected
 */
export const lastPath = ( state = null, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
		case DESERIALIZE:
			return state;

		case READER_VIEW_STREAM:
			if ( action.path && action.path.startsWith( '/read' ) ) {
				return action.path;
			}
			break;
	}
	return state;
};
lastPath.hasCustomPersistence = true;

/*
 * Holds the last viewed stream for the purposes of keyboard navigation
 */
export const currentStream = ( state = null, action ) =>
	action && action.type === READER_VIEW_STREAM ? action.streamKey : state;

const combinedReducer = combineReducers( {
	sidebar,
	cardExpansions,
	lastPath,
	currentStream,
	hasUnseenPosts,
} );

export default withStorageKey( 'readerUi', combinedReducer );
