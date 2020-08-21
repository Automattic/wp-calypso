/**
 * External dependencies
 */
import { isUndefined, pickBy } from 'lodash';

/**
 * Based global WP.com blog_public option, checks whether current blog is
 * private or not.
 *
 * @returns {boolean} a private WP.com blog flag
 */
export const isBlogPrivate = () =>
	typeof window === 'object' &&
	window.wpcomGutenberg &&
	Number( window.wpcomGutenberg.blogPublic ) === -1;

/**
 * Checks whether the specific post mode is active.
 *
 * @param {object} attributes block attributes
 * @param attributes.specificMode
 * @param attributes.specificPosts
 * @returns {boolean} specific mode active flag
 */
export const isSpecificPostModeActive = ( { specificMode, specificPosts } ) =>
	specificMode && specificPosts && specificPosts.length;

/**
 * Builds query criteria from given attributes.
 *
 * @param {object} attributes block attributes
 * @returns {object} criteria
 */
export const queryCriteriaFromAttributes = ( attributes ) => {
	const { postsToShow, authors, categories, tags, specificPosts, tagExclusions } = attributes;
	const criteria = pickBy(
		isSpecificPostModeActive( attributes )
			? {
					include: specificPosts,
					orderby: 'include',
					per_page: specificPosts.length,
			  }
			: {
					per_page: postsToShow,
					categories,
					author: authors,
					tags,
					tags_exclude: tagExclusions,
			  },
		( value ) => ! isUndefined( value )
	);
	return criteria;
};
