/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the selected comments for the specified siteId.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      SiteId to query
 * @return {Array}               Selected comments
 */
export default function getSelectedComments( state, siteId ) {
	return get( state, [ 'ui', 'comments', 'selected', siteId ], {} );
}
