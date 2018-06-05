/*
 * @format
 */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { key } from 'state/reader/remembered-posts/utils';

/*
 * Check whether a given post has been remembered
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object} params Params including siteId and postId
 * @return {String|null} Remembered status (true for remembered, null for forgotten)
 */
export default function getReaderRememberedPostStatus( state, { siteId, postId } ) {
	return get( state, [ 'reader', 'remembered-posts', 'items', key( siteId, postId ) ], null );
}
