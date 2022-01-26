import { withStorageKey } from '@automattic/state-utils';
import { READER_VIEW_STREAM } from 'calypso/state/reader-ui/action-types';
import { combineReducers, withPersistence } from 'calypso/state/utils';
import cardExpansions from './card-expansions/reducer';
import hasUnseenPosts from './seen-posts/reducer';
import sidebar from './sidebar/reducer';

/**
 * Keep the last reader stream path selected by the user, for the purpose of autoselecting it
 * when user navigates back to Reader
 *
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

const combinedReducer = combineReducers( {
	sidebar,
	cardExpansions,
	lastPath,
	hasUnseenPosts,
} );

export default withStorageKey( 'readerUi', combinedReducer );
