/** @format */
/**
 * External dependencies
 */
import { find } from 'lodash';

/*
 * Find the first follow for a given blog ID
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number} blogId  The blogId to find
 * @return {Object} The subscription
 */
export default ( state, blogId ) =>
	find( state.reader.follows.items, item => item.blog_ID == blogId ); // eslint-disable-line eqeqeq
