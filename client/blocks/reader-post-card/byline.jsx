import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
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
		openSuggestedFollows: PropTypes.func,
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
		const { post, site, feed, showSiteName, showAvatar, teams, compact, openSuggestedFollows } =
			this.props;
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
			hasAuthorName &&
			! isAuthorNameBlocked( post.author.name ) &&
			( ! hasMatchingAuthorAndSiteNames || ! showSiteName );
		const streamUrl = getStreamUrl( feedId, siteId );
		const siteIcon = get( site, 'icon.img' );

		// Use the siteName if not showing it elsewhere, otherwise use the slug.
		const bylineSiteName = ! showSiteName ? siteName : siteSlug;
		const showDate = post.date && post.URL;

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
					{ showSiteName && ! compact && (
						<div className="reader-post-card__byline-site">
							<ReaderSiteStreamLink
								className="reader-post-card__site reader-post-card__link"
								feedId={ feedId }
								siteId={ siteId }
								post={ post }
							>
								{ siteName }
							</ReaderSiteStreamLink>
						</div>
					) }
					<div className="reader-post-card__author-and-timestamp">
						{ ( shouldDisplayAuthor || bylineSiteName || showDate ) && (
							<span className="reader-post-card__byline-secondary">
								{ shouldDisplayAuthor && (
									<>
										<ReaderAuthorLink
											// className="reader-post-card__link"
											className="reader-post-card__byline-secondary-item"
											author={ post.author }
											siteUrl={ streamUrl }
											post={ post }
										>
											{ post.author.name }
										</ReaderAuthorLink>
										{ ( bylineSiteName || showDate ) && (
											<span className="reader-post-card__byline-secondary-bullet">·</span>
										) }
									</>
								) }
								{ bylineSiteName && (
									<>
										<a
											className="reader-post-card__byline-secondary-item"
											onClick={ this.recordStubClick }
											href={ siteUrl }
											target="_blank"
											rel="noopener noreferrer"
										>
											{ bylineSiteName }
										</a>
										{ showDate && (
											<span className="reader-post-card__byline-secondary-bullet">·</span>
										) }
									</>
								) }
								{ showDate && (
									<a
										className="reader-post-card__byline-secondary-item"
										onClick={ this.recordDateClick }
										href={ post.URL }
										target="_blank"
										rel="noopener noreferrer"
									>
										<TimeSince date={ post.date } />
									</a>
								) }
							</span>
						) }
					</div>
				</div>
				{ ! compact && (
					<ReaderPostEllipsisMenu
						site={ site }
						teams={ teams }
						post={ post }
						showFollow={ true }
						openSuggestedFollows={ openSuggestedFollows }
					/>
				) }
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}
}

export default PostByline;
