import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import TagsList from 'calypso/blocks/reader-post-card/tags-list';
import ReaderPostEllipsisMenu from 'calypso/blocks/reader-post-options-menu/reader-post-ellipsis-menu';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link';
import TimeSince from 'calypso/components/time-since';
import { areEqualIgnoringWhitespaceAndCase } from 'calypso/lib/string';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import FollowButton from 'calypso/reader/follow-button';
import { getSiteName } from 'calypso/reader/get-helpers';
import { isAuthorNameBlocked } from 'calypso/reader/lib/author-name-blocklist';
import { getStreamUrl } from 'calypso/reader/route';
import { recordPermalinkClick } from 'calypso/reader/stats';

class PostByline extends Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		isDiscoverPost: PropTypes.bool,
		showSiteName: PropTypes.bool,
		showAvatar: PropTypes.bool,
		teams: PropTypes.array,
		showFollow: PropTypes.bool,
		showPrimaryFollowButton: PropTypes.bool,
		followSource: PropTypes.string,
	};

	static defaultProps = {
		isDiscoverPost: false,
		showAvatar: true,
	};

	recordDateClick = () => {
		recordPermalinkClick( 'timestamp_card', this.props.post );
	};

	recordStubClick = () => {
		recordPermalinkClick( 'stub_url_card', this.props.post );
	};

	render() {
		const {
			post,
			site,
			feed,
			isDiscoverPost,
			showSiteName,
			showAvatar,
			teams,
			showPrimaryFollowButton,
			followSource,
		} = this.props;
		const followUrl = feed ? feed.feed_URL : post.site_URL;
		const feedId = feed ? feed.feed_ID : get( post, 'feed_ID' );
		const feedIcon = feed ? feed.site_icon ?? get( feed, 'image' ) : null;
		const siteId = get( site, 'ID' );
		const siteSlug = get( site, 'slug' );
		const siteUrl = get( site, 'URL' );
		const siteName = getSiteName( { site, feed, post } );
		const hasAuthorName = !! get( post, 'author.name', null );
		const hasMatchingAuthorAndSiteNames =
			hasAuthorName && areEqualIgnoringWhitespaceAndCase( siteName, post.author.name );
		const isLongreads = siteId === 211646052;
		const shouldDisplayAuthor =
			! isDiscoverPost &&
			! isLongreads &&
			hasAuthorName &&
			! isAuthorNameBlocked( post.author.name ) &&
			( ! hasMatchingAuthorAndSiteNames || ! showSiteName );
		const streamUrl = getStreamUrl( feedId, siteId );
		const siteIcon = get( site, 'icon.img' );

		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<div className="reader-post-card__byline ignore-click">
				{ showAvatar && (
					<ReaderAvatar
						siteIcon={ siteIcon }
						feedIcon={ feedIcon }
						author={ post.author }
						preferGravatar={ true }
						siteUrl={ streamUrl }
						isCompact={ true }
						isLongreads={ isLongreads }
					/>
				) }
				<div className="reader-post-card__byline-details">
					{ ( shouldDisplayAuthor || showSiteName ) && (
						<div className="reader-post-card__byline-author-site">
							{ shouldDisplayAuthor && (
								<ReaderAuthorLink
									className="reader-post-card__link"
									author={ post.author }
									siteUrl={ streamUrl }
									post={ post }
								>
									{ post.author.name }
								</ReaderAuthorLink>
							) }
							{ shouldDisplayAuthor && showSiteName ? ', ' : '' }
							{ showSiteName && (
								<ReaderSiteStreamLink
									className="reader-post-card__site reader-post-card__link"
									feedId={ feedId }
									siteId={ siteId }
									post={ post }
								>
									{ siteName }
								</ReaderSiteStreamLink>
							) }
						</div>
					) }
					<div className="reader-post-card__timestamp-and-tag">
						{ post.date && post.URL && (
							<span className="reader-post-card__timestamp">
								<a
									className="reader-post-card__timestamp-slug"
									onClick={ this.recordStubClick }
									href={ siteUrl }
									target="_blank"
									rel="noopener noreferrer"
								>
									{ siteSlug }
								</a>
								<span className="reader-post-card__timestamp-bullet">·</span>
								<a
									className="reader-post-card__timestamp-link"
									onClick={ this.recordDateClick }
									href={ post.URL }
									target="_blank"
									rel="noopener noreferrer"
								>
									<TimeSince date={ post.date } />
								</a>
							</span>
						) }
					</div>
					<TagsList post={ post } />
				</div>
				{ showPrimaryFollowButton && followUrl && (
					<FollowButton
						siteUrl={ followUrl }
						followSource={ followSource }
						railcar={ post.railcar }
						followIcon={ ReaderFollowFeedIcon( { iconSize: 20 } ) }
						followingIcon={ ReaderFollowingFeedIcon( { iconSize: 20 } ) }
					/>
				) }
				<ReaderPostEllipsisMenu site={ site } teams={ teams } post={ post } showFollow={ false } />
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}
}

export default PostByline;
