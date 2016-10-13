/**
 * External Dependencies
 */
import React from 'react';
import { get, has } from 'lodash';

/**
 * Internal Dependencies
 */
import Gravatar from 'components/gravatar';
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

class PostByline extends React.Component {

	static propTypes = {
		post: React.PropTypes.object.isRequired,
		site: React.PropTypes.object,
		feed: React.PropTypes.object,
		isDiscoverPost: React.PropTypes.bool
	}

	static defaultProps = {
		isDiscoverPost: false
	}

	recordTagClick = () => {
		recordAction( 'click_tag' );
		recordGaEvent( 'Clicked Tag Link' );
		recordTrackForPost( 'calypso_reader_tag_clicked', this.props.post, {
			tag: this.props.post.primary_tag.slug
		} );
	}

	recordDateClick() {
		recordPermalinkClick( 'timestamp' );
		recordGaEvent( 'Clicked Post Permalink', 'timestamp' );
	}

	render() {
		const { post, site, feed, isDiscoverPost } = this.props;
		const feedId = get( feed, 'ID' );
		const siteId = get( site, 'ID' );
		const primaryTag = post && post.primary_tag;
		let siteName = siteNameFromSiteAndPost( site, post );
		const hasAuthorName = has( post, 'author.name' );
		const hasMatchingAuthorAndSiteNames = hasAuthorName && siteName.toLowerCase() === post.author.name.toLowerCase();
		const shouldDisplayAuthor = ! isDiscoverPost && hasAuthorName && ! hasMatchingAuthorAndSiteNames;
		const streamUrl = getStreamUrl( feedId, siteId );

		if ( ! siteName ) {
			siteName = this.translate( '(no title)' );
		}

		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<div className="reader-post-card__meta ignore-click">
				<Gravatar user={ post.author } />
				<div className="reader-post-card__meta-details">
					{ shouldDisplayAuthor &&
						<ReaderAuthorLink
							author={ post.author }
							siteUrl={ streamUrl }
							post={ post }>
							{ post.author.name }
						</ReaderAuthorLink>
					}
					{ shouldDisplayAuthor && <span className="reader-post-card__meta-separator">,</span> }
					<ReaderSiteStreamLink
						className="reader-post-card__site reader-post-card__link"
						feedId={ feedId }
						siteId={ siteId }
						post={ post }>
						{ siteName }
					</ReaderSiteStreamLink>
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
								<a href={ '/tag/' + primaryTag.slug } className="reader-post-card__tag-name ignore-click" onClick={ this.recordTagClick }>
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
