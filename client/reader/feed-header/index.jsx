var classnames = require( 'classnames' ),
	React = require( 'react' ),
	url = require( 'url' );

var Card = require( 'components/card' ),
	ReaderFollowButton = require( 'reader/follow-button' ),
	resizeImageUrl = require( 'lib/resize-image-url' ),
	safeImageUrl = require( 'lib/safe-image-url' ),
	Site = require( 'my-sites/site' );

var FeedHeader = React.createClass( {

	getFollowerCount: function( feed, site ) {
		if ( feed && feed.subscribers_count > 0 ) {
			return feed.subscribers_count;
		}

		if ( site && site.get( 'subscribers_count' ) ) {
			return site.get( 'subscribers_count' );
		}

		return null;
	},

	render: function() {
		var site = this.props.site,
			feed = this.props.feed,
			headerImage = site && site.getIn( [ 'options', 'header_image' ] ),
			headerColor = site && site.getIn( [ 'options', 'background_color' ] ),
			followerCount = this.getFollowerCount( feed, site ),
			headerImageUrl, siteish, classes;

		if ( headerImage && headerImage.get( 'width' ) > 300 ) {
			headerImageUrl = resizeImageUrl(
				safeImageUrl( headerImage.get( 'url' ) ),
				{ w: 600 }
			);
		}

		// a siteish (site-ish) is our little lie to the <Site /> component
		// If we only have a feed, we make up an object that looks enough like a site to pass muster
		siteish = site && site.toJS();
		if ( ! siteish && feed ) {
			siteish = {
				title: feed.name || ( feed.URL && url.parse( feed.URL ).hostname ) || ( feed.feed_URL && url.parse( feed.feed_URL ).hostname ),
				domain: ( feed.URL && url.parse( feed.URL ).hostname ) || ( feed.feed_URL && url.parse( feed.feed_URL ).hostname ),
				URL: feed.feed_URL || feed.URL
			};
		}

		classes = classnames( {
			'feed-header': true,
			'is-placeholder': ! siteish
		} );

		return (
			<div className={ classes } >
				<Card className="feed-header__site">
					<div className="feed-header__image" style={ headerColor ? { backgroundColor: '#' + headerColor } : null }>
						{ headerImageUrl ? <img src={ headerImageUrl } /> : null }
					</div>

					{ siteish ? <Site site={ siteish } href={ siteish.URL } indicator={ false } /> : null }

					{ siteish ? <div className="feed-header__follow">
						<ReaderFollowButton siteUrl={ siteish.URL } iconSize={ 24 } />
					</div> : null }
				</Card>

				<div className="feed-header__details">
					<p className="feed-header__description">{ ( site && site.get( 'description' ) ) }</p>
					{ followerCount ? <small className="feed-header__follow-count"> {
						this.translate( '%s follower', '%s followers',
						{ count: followerCount, args: [ this.numberFormat( followerCount ) ] } ) }
						</small> : null }
				</div>
			</div>
		);
	}

} );

module.exports = FeedHeader;
