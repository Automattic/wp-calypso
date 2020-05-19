/**
 * External Dependencies
 */
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import config from 'config';

/**
 * Internal Dependencies
 */
import { Card } from '@automattic/components';
import ReaderFollowButton from 'reader/follow-button';
import { isAuthorNameBlocked } from 'reader/lib/author-name-blocklist';
import HeaderBack from 'reader/header-back';
import { getSiteDescription, getSiteName, getSiteUrl } from 'reader/get-helpers';
import SiteIcon from 'blocks/site-icon';
import BlogStickers from 'blocks/blog-stickers';
import ReaderFeedHeaderSiteBadge from './badge';
import ReaderSiteNotificationSettings from 'blocks/reader-site-notification-settings';
import getUserSetting from 'state/selectors/get-user-setting';
import { isFollowing } from 'state/reader/follows/selectors';
import QueryUserSettings from 'components/data/query-user-settings';
import Gridicon from 'components/gridicon';
import { subSectionHasUnseen } from 'state/reader/seen-posts/selectors';
import { requestMarkAllAsSeen, requestMarkAllAsUnseen } from 'state/reader/seen-posts/actions';

/**
 * Style dependencies
 */
import './style.scss';

class FeedHeader extends Component {
	static propTypes = {
		site: PropTypes.object,
		feed: PropTypes.object,
		showBack: PropTypes.bool,
		hasUnseen: PropTypes.bool,
		streamKey: PropTypes.string,
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

	markAsSeen = () => {
		this.props.requestMarkAllAsSeen( { section: this.props.streamKey } );
	};

	markAsUnseen = () => {
		this.props.requestMarkAllAsUnseen( { section: this.props.streamKey } );
	};

	render() {
		const {
			site,
			feed,
			showBack,
			translate,
			following,
			isEmailBlocked,
			hasUnseen,
			streamKey,
		} = this.props;
		const followerCount = this.getFollowerCount( feed, site );
		const ownerDisplayName = site && ! site.is_multi_author && site.owner && site.owner.name;
		const description = getSiteDescription( { site, feed } );
		const siteTitle = getSiteName( { feed, site } );
		const siteUrl = getSiteUrl( { feed, site } );
		const siteId = site && site.ID;

		const classes = classnames( 'reader-feed-header', {
			'is-placeholder': ! site && ! feed,
			'has-back-button': showBack,
		} );

		return (
			<div className={ classes }>
				<QueryUserSettings />
				<div className="reader-feed-header__back-and-follow">
					{ showBack && <HeaderBack /> }
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
							{ feed && ! feed.is_error && (
								<div className="reader-feed-header__follow-button">
									<ReaderFollowButton siteUrl={ feed.feed_URL } iconSize={ 24 } />
								</div>
							) }

							{ config.isEnabled( 'reader/seen-posts' ) && streamKey && hasUnseen && (
								<button onClick={ this.markAsSeen } className="reader-feed-header__seen-button">
									<Gridicon icon="visible" size={ 18 } />
									<span title={ translate( 'Mark all as seen' ) }>
										{ translate( 'Mark all as seen' ) }
									</span>
								</button>
							) }

							{ config.isEnabled( 'reader/seen-posts' ) && streamKey && ! hasUnseen && (
								<button onClick={ this.markAsUnseen } className="reader-feed-header__seen-button">
									<Gridicon icon="not-visible" size={ 18 } />
									<span title={ translate( 'Mark all as unseen' ) }>
										{ translate( 'Mark all as unseen' ) }
									</span>
								</button>
							) }

							{ site && following && ! isEmailBlocked && (
								<div className="reader-feed-header__email-settings">
									<ReaderSiteNotificationSettings siteId={ siteId } />
								</div>
							) }
						</div>
					</div>
				</div>
				<Card className="reader-feed-header__site">
					<a href={ siteUrl } className="reader-feed-header__site-icon">
						<SiteIcon site={ site } size={ 96 } />
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
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		following: ownProps.feed && isFollowing( state, { feedUrl: ownProps.feed.feed_URL } ),
		isEmailBlocked: getUserSetting( state, 'subscription_delivery_email_blocked' ),
		hasUnseen: subSectionHasUnseen( state, ownProps.streamKey ),
	} ),
	{ requestMarkAllAsSeen, requestMarkAllAsUnseen }
)( localize( FeedHeader ) );
