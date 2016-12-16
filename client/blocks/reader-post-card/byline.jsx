/**
 * External Dependencies
 */
import React from 'react';
import { get, has } from 'lodash';

/**
 * Internal Dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';
import Gridicon from 'components/gridicon';
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
		showSiteName: React.PropTypes.bool,
		originalPost: React.PropTypes.object,
	}

	static defaultProps = {
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

	getPostAuthor = () => {
		return get( this.props, 'post.author' );
	}

	getPostTimeLinkUrl = () => {
		return get( this.props, 'post.URL' );
	}

	getStreamUrl = () => {
		const feedId = get( this.props.post, 'feed_ID' );
		const siteId = get( this.props.site, 'ID' );
		return getStreamUrl( feedId, siteId );
	}

	getSiteIcon = () => {
		return get( this.props.site, 'icon.img' );
	}

	getFeedIcon = () => {
		return get( this.props.feed, 'image' );
	}

	render() {
		const { post, site, showSiteName } = this.props;
		const feedId = get( post, 'feed_ID' );
		const siteId = get( site, 'ID' );
		const primaryTag = post && post.primary_tag;
		const siteName = siteNameFromSiteAndPost( site, post );
		const postAuthor = this.getPostAuthor();
		const hasAuthorName = has( postAuthor, 'name' );
		const hasMatchingAuthorAndSiteNames = hasAuthorName && areEqualIgnoringWhitespaceAndCase( siteName, post.author.name );
		const shouldDisplayAuthor = hasAuthorName && ( ! hasMatchingAuthorAndSiteNames || ! showSiteName );
		const streamUrl = this.getStreamUrl();
		const siteIcon = this.getSiteIcon();
		const feedIcon = this.getFeedIcon();
		const postTimeLinkUrl = this.getPostTimeLinkUrl();

		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<div className="reader-post-card__byline ignore-click">
				<ReaderAvatar
					siteIcon={ siteIcon }
					feedIcon={ feedIcon }
					author={ postAuthor }
					preferGravatar={ true }
					siteUrl={ streamUrl } />
				<div className="reader-post-card__byline-details">
					<div className="reader-post-card__byline-author-site">
						{ shouldDisplayAuthor &&
						<ReaderAuthorLink
							className="reader-post-card__link"
							author={ postAuthor }
							siteUrl={ streamUrl }
							post={ post }>
							{ postAuthor.name }
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
									href={ postTimeLinkUrl }
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
