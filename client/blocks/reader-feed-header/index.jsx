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
import Gridicon from 'gridicons';
import SiteIcon from 'blocks/site-icon';

const getBadgeForSite = site => {
	/* eslint-disable wpcalypso/jsx-gridicon-size */
	if ( site && site.is_private ) {
		return <Gridicon icon="lock" size={ 14 } />;
	} else if ( site && site.options && site.options.is_redirect ) {
		return <Gridicon icon="block" size={ 14 } />;
	} else if ( site && site.options && site.options.is_domain_only ) {
		return <Gridicon icon="domains" size={ 14 } />;
	}
	return null;
	/* eslint-enable wpcalypso/jsx-gridicon-size */
};

class FeedHeader extends Component {
	static propTypes = {
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
		const { site, feed } = this.props;
		const followerCount = this.getFollowerCount( feed, site );
		const ownerDisplayName = site && ! site.is_multi_author && site.owner && site.owner.name;
		const description = getSiteDescription( { site, feed } );
		const siteTitle = getSiteName( { feed, site } );
		const siteBadge = getBadgeForSite( site );
		const siteUrl = getSiteUrl( { feed, site } );

		const classes = classnames( 'reader-feed-header', {
			'is-placeholder': ! site && ! feed,
			'has-back-button': this.props.showBack,
		} );

		return (
			<div className={ classes }>
				<div className="reader-feed-header__back-and-follow">
					{ this.props.showBack && <HeaderBack /> }
					<div className="reader-feed-header__follow">
						{ followerCount
							? <span className="reader-feed-header__follow-count">
									{ ' ' }
									{ this.props.translate( '%s follower', '%s followers', {
										count: followerCount,
										args: [ this.props.numberFormat( followerCount ) ],
									} ) }
								</span>
							: null }
						{ this.props.feed &&
							! this.props.feed.is_error &&
							<div className="reader-feed-header__follow-button">
								<ReaderFollowButton siteUrl={ this.props.feed.feed_URL } iconSize={ 24 } />
							</div> }
					</div>
				</div>
				<Card className="reader-feed-header__site">
					<a href={ siteUrl } className="reader-feed-header__site-icon">
						<SiteIcon site={ site } size={ 96 } />
					</a>
					<div className="reader-feed-header__site-title">
						<a className="reader-feed-header__site-title-link" href={ siteUrl }>
							{ siteBadge &&
								<span className="reader-feed-header__site-badge">
									{ siteBadge }
								</span> }
							{ siteTitle }
						</a>
					</div>
					<div className="reader-feed-header__details">
						<span className="reader-feed-header__description">{ description }</span>
						{ ownerDisplayName &&
							! isAuthorNameBlacklisted( ownerDisplayName ) &&
							<span className="reader-feed-header__byline">
								{ this.props.translate( 'by %(author)s', {
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
