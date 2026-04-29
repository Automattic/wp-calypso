import 'calypso/state/reader/init';

/**
 * Check for the listOwners recommended blogs list
 * @param  {Object}  state  Global state tree
 * @param  {string}  listOwner User login of list owner
 * @returns {Array} Recommended blogs
 */
export function getUserRecommendedBlogs( state, listOwner ) {
	return state.reader.lists.userRecommendedBlogs[ listOwner ];
}

/**
 * Check if a recommended blogs request is in progress for a specific user.
 * @param  {Object}  state  Global state tree
 * @param  {string}  listOwner User login of list owner
 * @returns {boolean} Is the request in progress?
 */
export function isRequestingUserRecommendedBlogs( state, listOwner ) {
	return !! state.reader.lists.isRequestingUserRecommendedBlogs[ listOwner ];
}

/**
 * Check if a recommended blogs request has happened for a specific user.
 * @param  {Object}  state  Global state tree
 * @param  {string}  listOwner User login of list owner
 * @returns {boolean} Has a request been made?
 */
export function hasRequestedUserRecommendedBlogs( state, listOwner ) {
	const requestValue = state.reader.lists.isRequestingUserRecommendedBlogs[ listOwner ];
	return requestValue === true || requestValue === false;
}
