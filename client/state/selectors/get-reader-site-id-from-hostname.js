/** @format */

/**
 * External dependencies
 */

import { find } from 'lodash';
import { parse as parseUrl } from 'url';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Selector to retrieve a blog ID by hostname by looking a posts only.
 */
const getReaderSiteIdFromHostname = createSelector(
	( state, queriedHostname ) => {
		// Try to find a received post with the matching hostname
		const matchingPost = find( state.reader.posts.items, post => {
			const { hostname } = parseUrl( post.URL );
			return hostname === queriedHostname;
		} );

		if ( ! matchingPost ) {
			return null;
		}

		return matchingPost.site_ID;
	},
	state => [ state.reader.posts.items ]
);

export default getReaderSiteIdFromHostname;
