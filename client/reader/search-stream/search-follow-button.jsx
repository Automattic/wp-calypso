import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { some } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { resemblesUrl, withoutHttp, addSchemeIfMissing } from 'calypso/lib/url';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import FollowButton from 'calypso/reader/follow-button';
import { getReaderAliasedFollowFeedUrl } from 'calypso/state/reader/follows/selectors';
import { commonExtensions } from 'calypso/state/reader/follows/selectors/get-reader-aliased-follow-feed-url';
import './style.scss';

class SearchFollowButton extends Component {
	static propTypes = {
		query: PropTypes.string,
		feed: PropTypes.object,
	};

	/**
	 * Check if the query looks like a feed URL
	 *
	 * @param url
	 * @returns {boolean}
	 */
	isPotentialFeedUrl = ( url ) => {
		let isPotentialFeedUrl = false;
		if ( resemblesUrl( url ) ) {
			let parsedUrl;
			try {
				parsedUrl = new URL( url );
			} catch {
				// Do nothing.
			}

			// If we got an invalid URL, add a protocol and try again.
			if ( parsedUrl === undefined ) {
				try {
					parsedUrl = new URL( 'http://' + url );
				} catch {
					// Do nothing.
				}
			}

			if ( parsedUrl ) {
				isPotentialFeedUrl = some( commonExtensions, ( ext ) =>
					parsedUrl.toString().includes( ext )
				);
			}
		}
		return isPotentialFeedUrl;
	};

	render() {
		const { query, translate, readerAliasedFollowFeedUrl, feed } = this.props;

		// If the search query hasn't found a feed and the query doesn't look like a feed URL then don't show the follow button
		if ( ! feed && ! this.isPotentialFeedUrl( query ) ) {
			return null;
		}

		let isFollowing = false;
		let followTitle = withoutHttp( query );
		let followUrl = readerAliasedFollowFeedUrl;

		// If we have a feed object from the search query then we can use it to create the follow button
		if ( feed ) {
			isFollowing = feed.is_following;
			// Use the feed name if available on the feed object
			if ( feed?.name ) {
				followTitle = feed.name;
			}
			// Use the feed URL if available on the feed object
			if ( feed?.feed_URL ) {
				followUrl = feed.feed_URL;
			}
			// Use the subscribe URL if available on the feed object
			if ( feed?.subscribe_URL ) {
				followUrl = feed.subscribe_URL;
			}
		}

		// If already following this feed then don't show the follow button
		if ( isFollowing ) {
			return null;
		}

		return (
			<div className="search-stream__url-follow">
				<p>
					<Gridicon icon="info" size="16" />
					<strong>{ translate( 'Click below to add this site to your Reader feed:' ) }</strong>
				</p>
				<FollowButton
					followLabel={ translate( 'Follow %s', {
						args: followTitle,
						comment: '%s is the name of the site being followed. For example: "Discover"',
					} ) }
					followingLabel={ translate( 'Following %s', {
						args: followTitle,
						comment: '%s is the name of the site being followed. For example: "Discover"',
					} ) }
					siteUrl={ addSchemeIfMissing( followUrl, 'http' ) }
					followIcon={ ReaderFollowFeedIcon( { iconSize: 20 } ) }
					followingIcon={ ReaderFollowingFeedIcon( { iconSize: 20 } ) }
				/>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		readerAliasedFollowFeedUrl:
			ownProps.query && getReaderAliasedFollowFeedUrl( state, ownProps.query ),
	};
} )( localize( SearchFollowButton ) );
