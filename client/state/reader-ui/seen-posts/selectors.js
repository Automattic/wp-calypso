/**
 * Internal dependencies
 */
import 'calypso/state/reader-ui/init';

/**
 * Check if we have Reader unseen content
 *
 * @param state redux state
 * @returns {boolean} whether or not we have unseen posts
 */
export const hasUnseen = ( state ) => {
	return state.readerUi.hasUnseenPosts;
};
