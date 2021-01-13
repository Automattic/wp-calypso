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
// eslint-disable-next-line no-unused-vars
export const hasUnseen = ( state ) => {
	// force hide the unseen dot until we release the feature to all users, no easy way to show it just to a12s in prod
	// return state.readerUi.hasUnseenPosts;
	return false;
};
