import { safeImageUrl } from '@automattic/calypso-url';
import { Card, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import BlogStickers from 'calypso/blocks/blog-stickers';
import ReaderSiteNotificationSettings from 'calypso/blocks/reader-site-notification-settings';
import ReaderSuggestedFollowsDialog from 'calypso/blocks/reader-suggested-follows/dialog';
import SiteIcon from 'calypso/blocks/site-icon';
import QueryReaderRelatedPosts from 'calypso/components/data/query-reader-related-posts';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import ReaderFollowButton from 'calypso/reader/follow-button';
import {
	getSiteDescription,
	getSiteName,
	getSiteUrl,
	isEligibleForUnseen,
} from 'calypso/reader/get-helpers';
import HeaderBack from 'calypso/reader/header-back';
import { isAuthorNameBlocked } from 'calypso/reader/lib/author-name-blocklist';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { hasReaderFollowOrganization, isFollowing } from 'calypso/state/reader/follows/selectors';
import { relatedPostsForPost } from 'calypso/state/reader/related-posts/selectors';
import { SCOPE_SUGGESTED_FOLLOWS } from 'calypso/state/reader/related-posts/utils';
import { requestMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { getSite } from 'calypso/state/reader/sites/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import isFeedWPForTeams from 'calypso/state/selectors/is-feed-wpforteams';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import ReaderFeedHeaderSiteBadge from './badge';
import './style.scss';

class FeedHeader extends Component {
	static propTypes = {
		site: PropTypes.object,
		feed: PropTypes.object,
		showBack: PropTypes.bool,
		streamKey: PropTypes.string,
		isWPForTeamsItem: PropTypes.bool,
		hasOrganization: PropTypes.bool,
	};

	state = {
		isSuggestedFollowsModalOpen: false,
	};

	getFollowerCount = ( feed, site ) => {
		if ( site && site.subscribers_count ) {
			return site.subscribers_count;
		}

		if ( feed && feed.subscribers_count > 0 ) {
			return feed.subscribers_count;
		}

		return null;
	};

	markAllAsSeen = () => {
		this.props.recordReaderTracksEvent( 'calypso_reader_mark_all_as_seen_clicked' );

		this.props.requestMarkAllAsSeen( {
			identifier: this.props.streamKey,
			feedIds: [ this.props.feed.feed_ID ],
			feedUrls: [ this.props.feed.URL ],
		} );
	};

	openSuggestedFollowsModal = ( followClicked ) => {
		this.setState( { isSuggestedFollowsModalOpen: followClicked } );
	};

	onCloseSuggestedFollowModal = () => {
		this.setState( { isSuggestedFollowsModalOpen: false } );
	};

	render() {
		const {
			site,
			feed,
			showBack,
			translate,
			following,
			isEmailBlocked,
			hasOrganization,
			isWPForTeamsItem,
			latestPostId,
			relatedPosts,
		} = this.props;
		const followerCount = this.getFollowerCount( feed, site );
		const ownerDisplayName = site && ! site.is_multi_author && site.owner && site.owner.name;
		const description = getSiteDescription( { site, feed } );
		const siteTitle = getSiteName( { feed, site } );
		const siteUrl = getSiteUrl( { feed, site } );
		const siteId = site && site.ID;
		const siteIcon = site ? get( site, 'icon.img' ) : null;

		const classes = classnames( 'reader-feed-header', {
			'is-placeholder': ! site && ! feed,
			'has-back-button': showBack,
		} );

		let feedIcon = feed ? feed.site_icon ?? get( feed, 'image' ) : null;
		// don't show the default favicon for some sites
		if ( feedIcon?.endsWith( 'wp.com/i/buttonw-com.png' ) ) {
			feedIcon = null;
		}

		let fakeSite;

		const safeSiteIcon = safeImageUrl( siteIcon );
		const safeFeedIcon = safeImageUrl( feedIcon );

		if ( safeSiteIcon ) {
			fakeSite = {
				icon: {
					img: safeSiteIcon,
				},
			};
		} else if ( safeFeedIcon ) {
			fakeSite = {
				icon: {
					img: safeFeedIcon,
				},
			};
		}

		const siteIconElement = <SiteIcon key="site-icon" size={ 116 } site={ fakeSite } />;

		return (
			<div className={ classes }>
				<QueryUserSettings />
				{ showBack && <HeaderBack /> }
				<Card className="reader-feed-header__site">
					<a href={ siteUrl } className="reader-feed-header__site-icon">
						{ siteIconElement }
					</a>
					<div className="reader-feed-header__site-title">
						{ site && (
							<span className="reader-feed-header__site-badge">
								<ReaderFeedHeaderSiteBadge site={ site } />
								<BlogStickers blogId={ site.ID } />
							</span>
						) }
						<a className="reader-feed-header__site-title-link" href={ siteUrl }>
							{ siteTitle }
						</a>
					</div>
					<div className="reader-feed-header__details">
						<span className="reader-feed-header__description">{ description }</span>
						{ ownerDisplayName && ! isAuthorNameBlocked( ownerDisplayName ) && (
							<span className="reader-feed-header__byline">
								{ translate( 'by %(author)s', {
									args: {
										author: ownerDisplayName,
									},
								} ) }
							</span>
						) }
					</div>
				</Card>
				<div className="reader-feed-header__back-and-follow">
					<div className="reader-feed-header__follow">
						{ followerCount && (
							<span className="reader-feed-header__follow-count">
								{ ' ' }
								{ translate( '%s follower', '%s followers', {
									count: followerCount,
									args: [ this.props.numberFormat( followerCount ) ],
									comment: '%s is the number of followers. For example: "12,000,000"',
								} ) }
							</span>
						) }
						<div className="reader-feed-header__follow-and-settings">
							{ siteUrl && (
								<div className="reader-feed-header__follow-button">
									<ReaderFollowButton
										siteUrl={ siteUrl }
										iconSize={ 24 }
										onFollowToggle={ this.openSuggestedFollowsModal }
									/>
								</div>
							) }

							{ site && following && ! isEmailBlocked && (
								<div className="reader-feed-header__email-settings">
									<ReaderSiteNotificationSettings siteId={ siteId } />
								</div>
							) }

							{ isEligibleForUnseen( { isWPForTeamsItem, hasOrganization } ) && feed && (
								<button
									onClick={ this.markAllAsSeen }
									className="reader-feed-header__seen-button"
									disabled={ feed.unseen_count === 0 }
								>
									<Gridicon icon="visible" size={ 24 } />
									<span
										className="reader-feed-header__visibility"
										title={ translate( 'Mark all as seen' ) }
									>
										{ translate( 'Mark all as seen' ) }
									</span>
								</button>
							) }
						</div>
					</div>
				</div>
				{ ! relatedPosts && latestPostId && ! this.state.isSuggestedFollowsModalOpen && (
					<QueryReaderRelatedPosts
						siteId={ siteId }
						postId={ latestPostId }
						scope={ SCOPE_SUGGESTED_FOLLOWS }
						size={ 5 }
					/>
				) }
				{ relatedPosts && this.state.isSuggestedFollowsModalOpen && (
					<ReaderSuggestedFollowsDialog
						onClose={ this.onCloseSuggestedFollowModal }
						relatedPosts={ relatedPosts }
					/>
				) }
			</div>
		);
	}
}

const getLatestPostId = ( siteId, posts ) => {
	if ( ! siteId || ! posts ) {
		return null;
	}

	const sitePosts = Object.values( posts )
		.filter( ( post ) => post.site_ID === siteId )
		.sort( ( a, b ) => b.ID - a.ID );

	return sitePosts[ 0 ]?.ID || null;
};

const mapStateToProps = ( state, ownProps ) => {
	let siteId = ownProps.site?.ID;
	let feedId = ownProps.feed?.feed_ID;
	let feed = feedId ? getFeed( state, feedId ) : undefined;
	let site = siteId ? getSite( state, siteId ) : undefined;

	if ( feed && ! siteId ) {
		siteId = feed.blog_ID || undefined;
		site = siteId ? getSite( state, feed.blog_ID ) : undefined;
	}

	if ( site && ! feedId ) {
		feedId = site.feed_ID;
		feed = feedId ? getFeed( state, site.feed_ID ) : undefined;
	}

	const posts = state.reader?.posts?.items;
	const latestPostId = getLatestPostId( siteId, posts );

	return {
		isWPForTeamsItem: isSiteWPForTeams( state, siteId ) || isFeedWPForTeams( state, feedId ),
		hasOrganization: hasReaderFollowOrganization( state, feedId, siteId ),
		following: feed && isFollowing( state, { feedUrl: feed.feed_URL } ),
		isEmailBlocked: getUserSetting( state, 'subscription_delivery_email_blocked' ),
		latestPostId,
		relatedPosts:
			siteId && latestPostId
				? relatedPostsForPost( state, siteId, latestPostId, SCOPE_SUGGESTED_FOLLOWS, 5 )
				: null,
	};
};

export default connect( mapStateToProps, {
	requestMarkAllAsSeen,
	recordReaderTracksEvent,
} )( localize( FeedHeader ) );
