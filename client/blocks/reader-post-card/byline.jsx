import { Gridicon } from '@automattic/components';
import { get, values } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import ReaderPostEllipsisMenu from 'calypso/blocks/reader-post-options-menu/reader-post-ellipsis-menu';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link';
import TimeSince from 'calypso/components/time-since';
import { areEqualIgnoringWhitespaceAndCase } from 'calypso/lib/string';
import FollowButton from 'calypso/reader/follow-button';
import { getSiteName } from 'calypso/reader/get-helpers';
import { isAuthorNameBlocked } from 'calypso/reader/lib/author-name-blocklist';
import { getStreamUrl } from 'calypso/reader/route';
import {
	recordAction,
	recordGaEvent,
	recordTrackForPost,
	recordPermalinkClick,
} from 'calypso/reader/stats';

const TAGS_TO_SHOW = 3;

class TagLink extends Component {
	recordSingleTagClick = () => {
		const tag = this.props.tag;
		recordAction( 'click_tag' );
		recordGaEvent( 'Clicked Tag Link' );
		recordTrackForPost( 'calypso_reader_tag_clicked', this.props.post, {
			tag: tag.slug,
		} );
	};

	render() {
		const tag = this.props.tag;
		return (
			<span className="reader-post-card__tag">
				<a
					href={ '/tag/' + tag.slug }
					className="reader-post-card__tag-link ignore-click"
					onClick={ this.recordSingleTagClick }
				>
					{ tag.name }
				</a>
			</span>
		);
	}
}

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
			showFollow,
			showPrimaryFollowButton,
			followSource,
		} = this.props;
		const followUrl = feed ? feed.feed_URL : post.site_URL;
		const feedId = get( post, 'feed_ID' );
		const siteId = get( site, 'ID' );
		const siteSlug = get( site, 'slug' );
		const siteUrl = get( site, 'URL' );
		const siteName = getSiteName( { site, feed, post } );
		const hasAuthorName = !! get( post, 'author.name', null );
		const hasMatchingAuthorAndSiteNames =
			hasAuthorName && areEqualIgnoringWhitespaceAndCase( siteName, post.author.name );
		const shouldDisplayAuthor =
			! isDiscoverPost &&
			hasAuthorName &&
			! isAuthorNameBlocked( post.author.name ) &&
			( ! hasMatchingAuthorAndSiteNames || ! showSiteName );
		const streamUrl = getStreamUrl( feedId, siteId );
		const siteIcon = get( site, 'icon.img' );
		const feedIcon = get( feed, 'image' );
		const tagsInOccurrenceOrder = values( post.tags );
		tagsInOccurrenceOrder.sort( ( a, b ) => b.post_count - a.post_count );
		const tags = tagsInOccurrenceOrder
			.slice( 0, TAGS_TO_SHOW )
			.map( ( tag ) => <TagLink tag={ tag } key={ tag.slug } /> );

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
						{ tags.length > 0 && (
							<span className="reader-post-card__tags">
								<Gridicon icon="tag" />
								{ tags }
							</span>
						) }
					</div>
				</div>
				{ showPrimaryFollowButton && followUrl && (
					<FollowButton
						siteUrl={ followUrl }
						followSource={ followSource }
						railcar={ post.railcar }
					/>
				) }
				<ReaderPostEllipsisMenu
					site={ site }
					teams={ teams }
					post={ post }
					showFollow={ showFollow }
				/>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}
}

export default PostByline;
