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
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderFollowButton from 'calypso/reader/follow-button';
import {
	getSiteDescription,
	getSiteName,
	getSiteUrl,
	isEligibleForUnseen,
} from 'calypso/reader/get-helpers';
import HeaderBack from 'calypso/reader/header-back';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { hasReaderFollowOrganization, isFollowing } from 'calypso/state/reader/follows/selectors';
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
			width,
		} = this.props;
		const followerCount = this.getFollowerCount( feed, site );
		const description = getSiteDescription( { site, feed } );
		const siteTitle = getSiteName( { feed, site } );
		const siteUrl = getSiteUrl( { feed, site } );
		const siteId = site && site.ID;
		const siteIcon = site ? get( site, 'icon.img' ) : null;
		const narrowDisplay = width < 900;
		const smallDisplay = width < 480;

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

		const siteIconElement = (
			<SiteIcon key="site-icon" size={ smallDisplay ? 64 : 116 } site={ fakeSite } />
		);

		return (
			<div className={ classes }>
				<QueryUserSettings />
				{ showBack && <HeaderBack /> }
				<Card className="reader-feed-header__site">
					{ ! smallDisplay && (
						<a href={ siteUrl } className="reader-feed-header__site-icon">
							{ siteIconElement }
						</a>
					) }
					<div className="reader-feed-header__details">
						<div className="reader-feed-header__site-title">
							{ smallDisplay && (
								<a href={ siteUrl } className="reader-feed-header__site-icon">
									{ siteIconElement }
								</a>
							) }
							<a className="reader-feed-header__site-title-link" href={ siteUrl }>
								{ siteTitle }
							</a>
							{ site && (
								<span className="reader-feed-header__site-badge">
									<ReaderFeedHeaderSiteBadge site={ site } />
									<BlogStickers blogId={ site.ID } />
								</span>
							) }
						</div>
						<div className="reader-feed-header__description">{ description }</div>
						{ narrowDisplay && followerCount && (
							<div className="reader-feed-header__follow-count">
								{ ' ' }
								{ translate( '%s follower', '%s followers', {
									count: followerCount,
									args: [ this.props.numberFormat( followerCount ) ],
									comment: '%s is the number of followers. For example: "12,000,000"',
								} ) }
							</div>
						) }
					</div>
				</Card>
				{ narrowDisplay && (
					<div className="reader-feed-header__back-and-follow">
						<div className="reader-feed-header__follow">
							<div className="reader-feed-header__follow-and-settings">
								{ siteUrl && (
									<div className="reader-feed-header__follow-button">
										<ReaderFollowButton
											siteUrl={ siteUrl }
											iconSize={ 24 }
											onFollowToggle={ this.openSuggestedFollowsModal }
											hasButtonStyle={ true }
										/>
									</div>
								) }

								{ site && following && ! isEmailBlocked && (
									<div className="reader-feed-header__email-settings">
										<ReaderSiteNotificationSettings
											iconSize={ 24 }
											showLabel={ false }
											siteId={ siteId }
										/>
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
				) }
				{ siteId && (
					<ReaderSuggestedFollowsDialog
						onClose={ this.onCloseSuggestedFollowModal }
						siteId={ +siteId }
						isVisible={ this.state.isSuggestedFollowsModalOpen }
					/>
				) }
			</div>
		);
	}
}

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

	return {
		isWPForTeamsItem: isSiteWPForTeams( state, siteId ) || isFeedWPForTeams( state, feedId ),
		hasOrganization: hasReaderFollowOrganization( state, feedId, siteId ),
		following: feed && isFollowing( state, { feedUrl: feed.feed_URL } ),
		isEmailBlocked: getUserSetting( state, 'subscription_delivery_email_blocked' ),
		siteId: siteId,
		feedId: feedId,
	};
};

export default connect( mapStateToProps, {
	requestMarkAllAsSeen,
	recordReaderTracksEvent,
} )( localize( withDimensions( FeedHeader ) ) );
