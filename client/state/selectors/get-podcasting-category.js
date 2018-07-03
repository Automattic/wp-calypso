/** @format */

/**
 * Internal dependencies
 */
import getPodcastingCategoryId from 'state/selectors/get-podcasting-category-id';
import { getTerm } from 'state/terms/selectors';

/**
 * Returns the Podcasting category object for a given site ID.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Object}          Category object or null if not found
 */
export default function getPodcastingCategory( state, siteId ) {
	const podcastingCategoryId = getPodcastingCategoryId( state, siteId );
	if ( ! podcastingCategoryId ) {
		return null;
	}

	return getTerm( state, siteId, 'category', podcastingCategoryId );
}
