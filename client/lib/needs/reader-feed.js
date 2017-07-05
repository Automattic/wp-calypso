/**
 * Internal dependencies
 */
import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';
import { requestFeed } from 'state/reader/feeds/actions';
import { shouldFeedBeFetched } from 'state/reader/feeds/selectors';

const readerFeed = ( { feed: feedIdKey, site: siteIdKey } ) => {
	return {
		mapStateToProps: ( state, ownProps ) => {
			const siteId = ownProps[ siteIdKey ];
			const site = siteId && getSite( state, siteId );

			const feedId = ownProps[ feedIdKey ] ? ownProps[ feedIdKey ] : site && site.feed_ID;

			return {
				feed: getFeed( state, feedId ),
			};
		},

		mapStateToRequestActions: ( state, ownProps ) => {
			const siteId = ownProps[ siteIdKey ];
			const site = siteId && getSite( state, siteId );

			const feedId = ownProps[ feedIdKey ] ? ownProps[ feedIdKey ] : site && site.feed_ID;

			if ( shouldFeedBeFetched( state, feedId ) ) {
				return [ requestFeed( feedId ) ];
			}
			return [];
		},
	};
};

export default readerFeed;
