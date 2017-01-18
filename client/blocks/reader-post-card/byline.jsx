/**
 * External Dependencies
 */
import React from 'react';
import { get, has } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';
import PostTime from 'reader/post-time';
import { siteNameFromSiteAndPost } from 'reader/utils';
import {
	recordAction,
	recordGaEvent,
	recordTrackForPost,
	recordPermalinkClick
} from 'reader/stats';
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link';
import { getStreamUrl } from 'reader/route';
import ReaderAuthorLink from 'blocks/reader-author-link';
import { areEqualIgnoringWhitespaceAndCase } from 'lib/string';

class PostByline extends React.Component {

	static propTypes = {
		post: React.PropTypes.object.isRequired,
		site: React.PropTypes.object,
		feed: React.PropTypes.object,
		isDiscoverPost: React.PropTypes.bool,
		showSiteName: React.PropTypes.bool
	}

	static defaultProps = {
		isDiscoverPost: false,
		showSiteName: true
	}

	recordTagClick = () => {
		recordAction( 'click_tag' );
		recordGaEvent( 'Clicked Tag Link' );
		recordTrackForPost( 'calypso_reader_tag_clicked', this.props.post, {
			tag: this.props.post.primary_tag.slug
		} );
	}

	recordDateClick = () => {
		recordPermalinkClick( 'timestamp_card', this.props.post );
	}

	render() {
		const { post, site, feed, isDiscoverPost, showSiteName } = this.props;
		const feedId = get( post, 'feed_ID' );
		const siteId = get( site, 'ID' );
		const primaryTag = post && post.primary_tag;
		const siteName = siteNameFromSiteAndPost( site, post );
		const hasAuthorName = has( post, 'author.name' );
		const hasMatchingAuthorAndSiteNames = hasAuthorName && areEqualIgnoringWhitespaceAndCase( siteName, post.author.name );
		const shouldDisplayAuthor = ! isDiscoverPost && hasAuthorName && ( ! hasMatchingAuthorAndSiteNames || ! showSiteName );
		const streamUrl = getStreamUrl( feedId, siteId );
		const siteIcon = get( site, 'icon.img' );
		const feedIcon = get( feed, 'image' );

		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<div className="reader-post-card__byline ignore-click">
				<ReaderAvatar
					siteIcon={ siteIcon }
					feedIcon={ feedIcon }
					author={ post.author }
					preferGravatar={ true }
					siteUrl={ streamUrl } />
				<div className="reader-post-card__byline-details">
					<div className="reader-post-card__byline-author-site">
						{ shouldDisplayAuthor &&
						<ReaderAuthorLink
							className="reader-post-card__link"
							author={ post.author }
							siteUrl={ streamUrl }
							post={ post }>
							{ post.author.name }
						</ReaderAuthorLink>
						}
						{ shouldDisplayAuthor && showSiteName && ', ' }
						{ showSiteName && <ReaderSiteStreamLink
							className="reader-post-card__site reader-post-card__link"
							feedId={ feedId }
							siteId={ siteId }
							post={ post }>
							{ siteName }
						</ReaderSiteStreamLink> }
					</div>
					<div className="reader-post-card__timestamp-and-tag">
						{ post.date && post.URL &&
							<span className="reader-post-card__timestamp">
								<a className="reader-post-card__timestamp-link"
									onClick={ this.recordDateClick }
									href={ post.URL }
									target="_blank"
									rel="noopener noreferrer">
									<PostTime date={ post.date } />
								</a>
							</span>
						}
						{ primaryTag &&
							<span className="reader-post-card__tag">
								<Gridicon icon="tag" />
								<a href={ '/tag/' + primaryTag.slug }
									className="reader-post-card__tag-link ignore-click"
									onClick={ this.recordTagClick }>
									{ primaryTag.name }
								</a>
							</span>
						}
					</div>
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}

}

export default PostByline;
