var React = require( 'react' ),
	url = require( 'url' ),
	config = require( 'config' ),
	classnames = require( 'classnames' );

var PopoverMenu = require( 'components/popover/menu' ),
	PopoverMenuItem = require( 'components/popover/menu-item' ),
	Gridicon = require( 'components/gridicon' ),
	sitesList = require( 'lib/sites-list' )(),
	stats = require( 'reader/stats' ),
	SocialLogo = require( 'components/social-logo' );

var actionMap = {
	twitter: function( post ) {
		var twitterUrl = {
			scheme: 'https',
			hostname: 'twitter.com',
			pathname: '/intent/tweet',
			query: {
				text: post.title,
				url: post.URL,
				via: 'wordpressdotcom'
			}
		};

		twitterUrl = url.format( twitterUrl );

		window.open( twitterUrl, 'twitter', 'width=550,height=420,resizeable,scrollbars' );
	},
	facebook: function( post ) {
		var fackbookUrl = {
			scheme: 'https',
			hostname: 'www.facebook.com',
			pathname: '/sharer.php',
			query: {
				u: post.URL,
				app_id: config( 'facebook_api_key' )
			}
		};

		fackbookUrl = url.format( fackbookUrl );

		window.open( fackbookUrl, 'facebook', 'width=626,height=436,resizeable,scrollbars' );
	},
	pressThis: function( post ) {
		var primarySite = sitesList.getPrimary(), wordpressUrl;

		if ( ! primarySite ) {
			return;
		}

		if ( primarySite.wpcom_url && ! primarySite.jetpack ) {
			wordpressUrl = url.parse( 'https://' + primarySite.wpcom_url + '/wp-admin/press-this.php' );
		} else {
			wordpressUrl = url.parse( url.resolve( primarySite.URL, 'wp-admin/press-this.php' ) );
		}

		delete wordpressUrl.search;
		wordpressUrl.query = {
			u: post.URL,
			t: post.title
		};

		wordpressUrl = url.format( wordpressUrl );

		window.open( wordpressUrl, 'pressThis', 'width=626,height=436,resizeable,scrollbars' );
	}
};

var ReaderShare = React.createClass( {

	getInitialState() {
		return { showingMenu: false };
	},

	getDefaultProps() {
		return {
			position: 'top left',
			tagName: 'li'
		};
	},

	toggle( event ) {
		event.preventDefault();
		this.setState( { showingMenu: ! this.state.showingMenu } );
	},

	closeMenu( action ) {
		var actionFunc = actionMap[ action ];
		if ( actionFunc ) {
			stats.recordAction( 'share_' + action );
			stats.recordGaEvent( 'Clicked on Share to ' + action );
			actionFunc( this.props.post );
		}
		this.setState( { showingMenu: false } );
	},

	render() {
		const canShareToWordpress = !! sitesList.getPrimary(),
			buttonClasses = classnames( {
				'reader-share_button': true,
				'ignore-click': true,
				'is-active': this.state.showingMenu
			} );
		if ( ! config.isEnabled( 'reader/share' ) ) {
			return null;
		}
		return React.createElement( this.props.tagName, {
			className: 'reader-share',
			onClick: this.toggle,
			ref: 'shareButton' },
			[
				( <span key="button" ref="shareButton" className={ buttonClasses }>
					<Gridicon icon="share" size={ 24 } />
					<span className="reader-share__button-label">{ this.translate( 'Share', { comment: 'Share the post' } ) }</span>
				</span> ),
				( <PopoverMenu key="menu" context={ this.refs && this.refs.shareButton }
					isVisible={ this.state.showingMenu }
					onClose={ this.closeMenu }
					position={ this.props.position }
					className="popover reader-share__popover">
					{ canShareToWordpress ? <PopoverMenuItem action="pressThis" className="reader-share__popover-item">
						<Gridicon icon="my-sites" size={ 24 } /> WordPress</PopoverMenuItem> : null }
					<PopoverMenuItem action="twitter" className="reader-share__popover-item">
						<SocialLogo icon="twitter" /> Twitter</PopoverMenuItem>
					<PopoverMenuItem action="facebook" className="reader-share__popover-item">
						<SocialLogo icon="facebook" /> Facebook</PopoverMenuItem>
				</PopoverMenu> )
			]
		);
	}

} );

module.exports = ReaderShare;
