import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryReaderFeedsSearch from 'calypso/components/data/query-reader-feeds-search';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderInfiniteStream from 'calypso/reader/components/reader-infinite-stream';
import { siteRowRenderer } from 'calypso/reader/components/reader-infinite-stream/row-renderers';
import { SEARCH_RESULTS_SITES } from 'calypso/reader/follow-sources';
import { MAX_POSTS_FOR_LOGGED_OUT_USERS } from 'calypso/reader/reader.const';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import {
	requestFeedSearch,
	SORT_BY_RELEVANCE,
	SORT_BY_LAST_UPDATED,
} from 'calypso/state/reader/feed-searches/actions';
import {
	getReaderFeedsForQuery,
	getReaderFeedsCountForQuery,
} from 'calypso/state/reader/feed-searches/selectors';
import { getFeed } from 'calypso/state/reader/feeds/selectors';

class SiteResults extends Component {
	static propTypes = {
		query: PropTypes.string,
		sort: PropTypes.oneOf( [ SORT_BY_LAST_UPDATED, SORT_BY_RELEVANCE ] ),
		requestFeedSearch: PropTypes.func,
		onReceiveSearchResults: PropTypes.func,
		searchResults: PropTypes.array,
		searchResultsCount: PropTypes.number,
		width: PropTypes.number.isRequired,
	};

	fetchNextPage = ( offset ) => {
		if ( this.isLoginPromptVisible( offset ) ) {
			return;
		}

		this.props.requestFeedSearch( {
			query: this.props.query,
			offset,
			excludeFollowed: false,
			sort: this.props.sort,
		} );
	};

	hasNextPage = ( offset ) => {
		if ( this.isLoginPromptVisible( offset ) ) {
			return false;
		}
		return offset < this.props.searchResultsCount;
	};

	isLoginPromptVisible( offset ) {
		// Show login prompt for all logged out users after few posts.
		return ! this.props.isLoggedIn && offset > MAX_POSTS_FOR_LOGGED_OUT_USERS;
	}

	render() {
		const { query, searchResults, width, sort } = this.props;
		const isEmpty = query?.length > 0 && searchResults?.length === 0;

		if ( isEmpty ) {
			return (
				<div className="search-stream__site-results-none">
					{ this.props.translate( 'No sites found.' ) }
				</div>
			);
		}

		return (
			<div>
				<QueryReaderFeedsSearch query={ query } excludeFollowed={ false } sort={ sort } />
				<ReaderInfiniteStream
					items={ searchResults || [ {}, {}, {}, {}, {} ] }
					width={ width }
					fetchNextPage={ this.fetchNextPage }
					hasNextPage={ this.hasNextPage }
					rowRenderer={ siteRowRenderer }
					extraRenderItemProps={ {
						showLastUpdatedDate: false,
						showNotificationSettings: false,
						showFollowedOnDate: false,
						followSource: SEARCH_RESULTS_SITES,
					} }
				/>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const searchResults = getReaderFeedsForQuery( state, {
			query: ownProps.query,
			excludeFollowed: false,
			sort: ownProps.sort,
		} );

		// Check if searchResults has any feeds
		if ( searchResults && searchResults.length > 0 ) {
			const feeds = searchResults;
			// We want to create a list of unique feeds based on searchResults
			// We need to do this because the search results may contain duplicate feeds URLs with different http or https schemes
			// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
			const feedResults = feeds.reduce( ( uniqueFeeds, feed ) => {
				// Strip out the URL scheme for subscribe_URL
				const strippedSubscribeURL = feed.subscribe_URL?.replace( /^https?:\/\//, '' );

				// Check if the array already has an item with the same strippedSubscribeURL or feed_ID
				const foundItem = uniqueFeeds.find(
					// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
					( uniqueFeed ) =>
						( ! feed.feed_ID &&
							uniqueFeed.subscribe_URL &&
							uniqueFeed.subscribe_URL?.replace( /^https?:\/\//, '' ) === strippedSubscribeURL ) ||
						( feed.feed_ID && uniqueFeed.feed_ID === feed.feed_ID )
				);

				// If no item is found, add the current item to the array
				if ( ! foundItem ) {
					let uniqueFeed = feed;
					if ( feed?.feed_ID?.length > 0 ) {
						// If it has a feed_ID, get the feed object from the state
						const existingFeed = getFeed( state, feed.feed_ID );
						if ( existingFeed ) {
							uniqueFeed = existingFeed;
						}
					}
					uniqueFeeds.push( uniqueFeed );
				}

				return uniqueFeeds;
			}, [] );

			ownProps.onReceiveSearchResults( feedResults );
		}
		return {
			isLoggedIn: isUserLoggedIn( state ),
			searchResults: searchResults,
			searchResultsCount: getReaderFeedsCountForQuery( state, {
				query: ownProps.query,
				excludeFollowed: false,
				sort: ownProps.sort,
			} ),
		};
	},
	{ requestFeedSearch }
)( localize( withDimensions( SiteResults ) ) );
