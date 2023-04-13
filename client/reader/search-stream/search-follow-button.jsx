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
import { SEARCH_RESULTS_URL_INPUT } from 'calypso/reader/follow-sources';
import { getReaderAliasedFollowFeedUrl } from 'calypso/state/reader/follows/selectors';
import { commonExtensions } from 'calypso/state/reader/follows/selectors/get-reader-aliased-follow-feed-url';
import './style.scss';

class SearchFollowButton extends Component {
	static propTypes = {
		query: PropTypes.string,
		feed: PropTypes.object,
	};

	render() {
		const { query, translate, readerAliasedFollowFeedUrl, feed } = this.props;
		let isPotentialFeedUrl = false;
		if ( resemblesUrl( query ) ) {
			let parsedUrl;
			try {
				parsedUrl = new URL( query );
			} catch {
				// Do nothing.
			}

			// If we got an invalid URL, add a protocol and try again.
			if ( parsedUrl === undefined ) {
				try {
					parsedUrl = new URL( 'http://' + query );
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

		// If not a potential feed then don't show the follow button
		if ( ! isPotentialFeedUrl ) {
			return null;
		}

		let isFollowing = false;
		let followTitle = withoutHttp( query );

		if ( feed && feed.name?.length ) {
			isFollowing = feed.is_following;
			followTitle = feed.name;
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
					siteUrl={ addSchemeIfMissing( readerAliasedFollowFeedUrl, 'http' ) }
					followSource={ SEARCH_RESULTS_URL_INPUT }
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
