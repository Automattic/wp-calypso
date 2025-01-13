import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { some } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { resemblesUrl, withoutHttp, addSchemeIfMissing, urlToDomainAndPath } from 'calypso/lib/url';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import FollowButton from 'calypso/reader/follow-button';
import { commonExtensions } from 'calypso/state/reader/follows/selectors/get-reader-aliased-follow-feed-url';
import './style.scss';

class SearchFollowButton extends Component {
	static propTypes = {
		query: PropTypes.string,
		feeds: PropTypes.array,
	};

	/**
	 * Check if the query looks like a feed URL
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
		const { query, translate, feeds } = this.props;

		// If the search query hasn't found a feed and the query doesn't look like a feed URL then don't show the follow button
		if ( ! feeds && ! this.isPotentialFeedUrl( query ) ) {
			return null;
		}

		// Check that the query is a URL
		// Then Loop through feeds and find the feed URL that contains the query
		// If we find a feed then set the feed object
		let feed;
		if ( resemblesUrl( query ) ) {
			feed = feeds?.find( ( f ) => f?.feed_URL?.includes( urlToDomainAndPath( query ) ) );
		}

		// If no feed found, then don't show the follow button
		if ( ! feed ) {
			return null;
		}

		// If already following this feed then don't show the follow button
		if ( feed.is_following === true ) {
			return null;
		}

		let followTitle = withoutHttp( query );
		// Use the feed name if available on the feed object
		if ( feed?.name?.length > 0 ) {
			followTitle = feed.name;
		}

		let followUrl = null;
		// Use the feed URL if available on the feed object
		if ( feed?.feed_URL ) {
			followUrl = feed.feed_URL;
		}
		// Use the subscribe URL if available on the feed object
		if ( feed?.subscribe_URL ) {
			followUrl = feed.subscribe_URL;
		}

		// If the feed has no feed URL for some reason then don't show the follow button
		if ( ! followUrl ) {
			return null;
		}

		return (
			<div className="search-stream__url-follow">
				<p>
					<Gridicon icon="info" size="16" />
					<strong>{ translate( 'Click below to add this site to your Reader feed:' ) }</strong>
				</p>
				<FollowButton
					followLabel={ translate( 'Subscribe to %s', {
						args: followTitle,
						comment: '%s is the name of the site being subscribed to. For example: "Discover"',
					} ) }
					followingLabel={ translate( 'Subscribed to %s', {
						args: followTitle,
						comment: '%s is the name of the site being subscribed to. For example: "Discover"',
					} ) }
					siteUrl={ addSchemeIfMissing( followUrl, 'http' ) }
					followIcon={ ReaderFollowFeedIcon( { iconSize: 20 } ) }
					followingIcon={ ReaderFollowingFeedIcon( { iconSize: 20 } ) }
				/>
			</div>
		);
	}
}

export default localize( SearchFollowButton );
