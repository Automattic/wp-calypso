/**
 * External Dependencies
 */
import classnames from 'classnames';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import ReaderFollowButton from 'reader/follow-button';
import { isAuthorNameBlacklisted } from 'reader/lib/author-name-blacklist';
import HeaderBack from 'reader/header-back';
import { getSiteDescription, getSiteName, getSiteUrl } from 'reader/get-helpers';
import SiteIcon from 'blocks/site-icon';
import BlogStickers from 'blocks/blog-stickers';
import ReaderFeedHeaderSiteBadge from './badge';

class FeedHeader extends Component {
	static propTypes = {
		site: React.PropTypes.object,
		feed: React.PropTypes.object,
		showBack: React.PropTypes.bool,
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

	render() {
		const { site, feed, showBack, translate } = this.props;
		const followerCount = this.getFollowerCount( feed, site );
		const ownerDisplayName = site && ! site.is_multi_author && site.owner && site.owner.name;
		const description = getSiteDescription( { site, feed } );
		const siteTitle = getSiteName( { feed, site } );
		const siteUrl = getSiteUrl( { feed, site } );

		const classes = classnames( 'reader-feed-header', {
			'is-placeholder': ! site && ! feed,
			'has-back-button': showBack,
		} );

		return (
			<div className={ classes }>
				<div className="reader-feed-header__back-and-follow">
					{ showBack && <HeaderBack /> }
					<div className="reader-feed-header__follow">
						{ followerCount &&
							<span className="reader-feed-header__follow-count">
								{ ' ' }
								{ translate( '%s follower', '%s followers', {
									count: followerCount,
									args: [ this.props.numberFormat( followerCount ) ],
								} ) }
							</span> }
						{ feed &&
							! feed.is_error &&
							<div className="reader-feed-header__follow-button">
								<ReaderFollowButton siteUrl={ feed.feed_URL } iconSize={ 24 } />
							</div> }
					</div>
				</div>
				<Card className="reader-feed-header__site">
					<a href={ siteUrl } className="reader-feed-header__site-icon">
						<SiteIcon site={ site } size={ 96 } />
					</a>
					<div className="reader-feed-header__site-title">
						{ site &&
							<span className="reader-feed-header__site-badge">
								<ReaderFeedHeaderSiteBadge site={ site } />
								<BlogStickers blogId={ site.ID } />
							</span> }
						<a className="reader-feed-header__site-title-link" href={ siteUrl }>
							{ siteTitle }
						</a>
					</div>
					<div className="reader-feed-header__details">
						<span className="reader-feed-header__description">{ description }</span>
						{ ownerDisplayName &&
							! isAuthorNameBlacklisted( ownerDisplayName ) &&
							<span className="reader-feed-header__byline">
								{ translate( 'by %(author)s', {
									args: {
										author: ownerDisplayName,
									},
								} ) }
							</span> }
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( FeedHeader );
