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
import { getSiteName } from 'calypso/reader/get-helpers';
import { isAuthorNameBlocked } from 'calypso/reader/lib/author-name-blocklist';
import { getStreamUrl } from 'calypso/reader/route';
import { recordPermalinkClick } from 'calypso/reader/stats';

class PostByline extends Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		showSiteName: PropTypes.bool,
		showAvatar: PropTypes.bool,
		teams: PropTypes.array,
		showFollow: PropTypes.bool,
		compact: PropTypes.bool,
	};

	static defaultProps = {
		showAvatar: true,
	};

	recordDateClick = () => {
		recordPermalinkClick( 'timestamp_card', this.props.post );
	};

	recordStubClick = () => {
		recordPermalinkClick( 'stub_url_card', this.props.post );
	};

	render() {
		const { post, site, feed, showSiteName, showAvatar, teams, compact } = this.props;
		const feedId = feed ? feed.feed_ID : get( post, 'feed_ID' );
		const feedIcon = feed ? feed.site_icon ?? get( feed, 'image' ) : null;
		const siteId = get( site, 'ID' );
		const siteSlug = get( site, 'slug' );
		const siteUrl = get( site, 'URL' );
		const siteName = getSiteName( { site, feed, post } );
		const hasAuthorName = !! get( post, 'author.name', null );
		const hasMatchingAuthorAndSiteNames =
			hasAuthorName && areEqualIgnoringWhitespaceAndCase( siteName, post.author.name );
		const shouldDisplayAuthor =
			! compact &&
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
					/>
				) }
				<div className="reader-post-card__byline-details">
					{ ( shouldDisplayAuthor || showSiteName ) && ! compact && (
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
									{ /* Use the siteName if not showing it above, otherwise use the slug */ }
									{ ! showSiteName ? siteName : siteSlug }
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
					{ ! compact && <TagsList post={ post } /> }
				</div>
				{ ! compact && (
					<ReaderPostEllipsisMenu
						site={ site }
						teams={ teams }
						post={ post }
						showFollow={ false }
					/>
				) }
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}
}

export default PostByline;
