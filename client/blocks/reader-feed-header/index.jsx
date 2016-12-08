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
import { state as feedState } from 'lib/feed-store/constants';
import HeaderBack from 'reader/header-back';

class FeedHeader extends Component {

	static propTypes = {
		showBack: React.PropTypes.bool
	};

	componentWillReceiveProps = ( nextProps ) => {
		if ( nextProps.site !== this.props.site || nextProps.feed !== this.props.feed ) {
			this.setState( {
				siteish: this.buildSiteish( nextProps.site, nextProps.feed )
			} );
		}
	}

	buildSiteish = ( site, feed ) => {
		// a siteish (site-ish) is our little lie to the <Site /> component
		// If we only have a feed, we make up an object that looks enough like a site to pass muster
		let siteish = site && site.toJS();
		if ( ! siteish && feed ) {
			siteish = {
				title: feed.name || ( feed.URL && url.parse( feed.URL ).hostname ) || ( feed.feed_URL && url.parse( feed.feed_URL ).hostname ),
				domain: ( feed.URL && url.parse( feed.URL ).hostname ) || ( feed.feed_URL && url.parse( feed.feed_URL ).hostname ),
				URL: feed.feed_URL || feed.URL
			};
		}
		return siteish;
	}

	state = {
		siteish: this.buildSiteish( this.props.site, this.props.feed )
	}

	getFollowerCount = ( feed, site ) => {
		if ( site && site.get( 'subscribers_count' ) ) {
			return site.get( 'subscribers_count' );
		}

		if ( feed && feed.subscribers_count > 0 ) {
			return feed.subscribers_count;
		}

		return null;
	}

	render() {
		const site = this.props.site,
			feed = this.props.feed,
			followerCount = this.getFollowerCount( feed, site ),
			ownerDisplayName = site && site.getIn( [ 'owner', 'name' ] );

		const classes = classnames( {
			'reader-feed-header': true,
			'is-placeholder': ! this.state.siteish,
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
						{ this.props.feed && this.props.feed.state === feedState.COMPLETE ? <div className="reader-feed-header__follow-button">
							<ReaderFollowButton siteUrl={ this.props.feed.feed_URL } iconSize={ 24 } />
						</div> : null }
					</div>
				</div>
				<Card className="reader-feed-header__site">
					{ this.state.siteish &&
						<Site
							site={ this.state.siteish }
							homeLink={ true }
							showHomeIcon={ false }
							href={ this.state.siteish.URL }
							indicator={ false } />
					}
					<div className="reader-feed-header__details">
						<span className="reader-feed-header__description">{ ( site && site.get( 'description' ) ) }</span>
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
