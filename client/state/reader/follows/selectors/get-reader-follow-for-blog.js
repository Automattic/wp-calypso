/**
 * External dependencies
 */
import { find } from 'lodash';

import 'state/reader/init';

/*
 * Find the first follow for a given blog ID
 *
 * @param  {object}  state  Global state tree
 * @param  {number} blogId  The blogId to find
 * @returns {object} The subscription
 */
export default ( state, blogId ) =>
	find( state.reader.follows.items, ( item ) => item.blog_ID == blogId ); // eslint-disable-line eqeqeq
