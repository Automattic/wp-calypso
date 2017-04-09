/**
 * External Dependencies
 */
import classnames from 'classnames';
import React, { Component } from 'react';
import url from 'url';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import ReaderFollowButton from 'reader/follow-button';
import Site from 'blocks/site';
import HeaderBack from 'reader/header-back';

class FeedHeader extends Component {

	static propTypes = {
		showBack: React.PropTypes.bool
	};

	buildSiteish = ( site, feed ) => {
		// a siteish (site-ish) is our little lie to the <Site /> component
		// If we only have a feed, we make up an object that looks enough like a site to pass muster
		let siteish = site;
		if ( ! siteish && feed ) {
			siteish = {
				title: feed.name ||
					( feed.URL && url.parse( feed.URL ).hostname ) ||
					( feed.feed_URL && url.parse( feed.feed_URL ).hostname ),
				domain: ( feed.URL && url.parse( feed.URL ).hostname ) ||
					( feed.feed_URL && url.parse( feed.feed_URL ).hostname ),
				URL: feed.URL || feed.feed_URL
			};
		}
		return siteish;
	}

	getFollowerCount = ( feed, site ) => {
		if ( site && site.subscribers_count ) {
			return site.subscribers_count;
		}

		if ( feed && feed.subscribers_count > 0 ) {
			return feed.subscribers_count;
		}

		return null;
	}

	render() {
		const { site, feed } = this.props;
		const followerCount = this.getFollowerCount( feed, site );
		const ownerDisplayName = site && site.owner && site.owner.name;
		const siteish = this.buildSiteish( site, feed );
		const description = site && site.description;

		const classes = classnames( {
			'reader-feed-header': true,
			'is-placeholder': ! siteish,
			'has-back-button': this.props.showBack,
		} );

		return (
			<div className={ classes }>
				<div className="reader-feed-header__back-and-follow">
					{ this.props.showBack && <HeaderBack /> }
					<div className="reader-feed-header__follow">
						{ followerCount ? <span className="reader-feed-header__follow-count"> {
						this.props.translate( '%s follower', '%s followers',
						{ count: followerCount, args: [ this.props.numberFormat( followerCount ) ] } ) }
						</span> : null }
						{ this.props.feed && ! this.props.feed.is_error &&
							<div className="reader-feed-header__follow-button">
								<ReaderFollowButton siteUrl={ this.props.feed.feed_URL } iconSize={ 24 } />
							</div>
						}
					</div>
				</div>
				<Card className="reader-feed-header__site">
					{ siteish &&
						<Site
							site={ siteish }
							homeLink={ true }
							showHomeIcon={ false }
							href={ siteish.URL }
							indicator={ false } />
					}
					<div className="reader-feed-header__details">
						<span className="reader-feed-header__description">{ description }</span>
						{ ownerDisplayName && <span className="reader-feed-header__byline">
							{ this.props.translate(
								'by %(author)s',
								{
									args: {
										author: ownerDisplayName
									}
								}
							)
						}
						</span> }
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( FeedHeader );
