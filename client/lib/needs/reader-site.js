/**
 * Internal dependencies
 */
import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';
import { shouldSiteBeFetched } from 'state/reader/sites/selectors';
import { requestSite } from 'state/reader/sites/actions';

const getReaderSiteId = ( { state, feedId, siteId } ) => {
	if ( siteId ) {
		return siteId;
	}

	// If the blog_ID of a reader feed is 0, that means no site exists for it.
	const feed = feedId && getFeed( state, feedId );
	return ( ! feed || feed.blog_ID === 0 ) ? null : feed.blog_ID;
};

/**
 *  Need for reader site.
 * @param {String} site - which prop represents the siteId that is needed
 * @param {String} feed - which prop represents the feed for which to grab its corresponding site
 *
 * @returns {Object} the wrapped component that will fetch reader tags
 */
const readerSite = ( { site: siteIdKey, feed: feedIdKey } ) => ( {
	mapStateToProps: ( state, ownProps ) => {
		const siteId = getReaderSiteId(
			{ state, feedId: ownProps[ feedIdKey ], siteId: ownProps[ siteIdKey ] }
		);
		const site = getSite( state, siteId );
		return { site };
	},

	mapStateToRequestActions: ( state, ownProps ) => {
		const siteId = getReaderSiteId(
			{ state, feedId: ownProps[ feedIdKey ], siteId: ownProps[ siteIdKey ] }
		);

		if ( siteId && shouldSiteBeFetched( state, siteId ) ) {
			return [ requestSite( siteId ) ];
		}
		return [];
	},
} );

export default readerSite;
