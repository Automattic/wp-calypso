/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns Gutenberg's Editor current post for edit
 *
 * @param  {Object}  state       Global state tree
 * @return {Object}              Current Post
 */
const getGutenbergCurrentPost = state => get( state, [ 'gutenberg', 'currentPost' ], null );

export default getGutenbergCurrentPost;
