var React = require( 'react' ),
	url = require( 'url' ),
	config = require( 'config' ),
	classnames = require( 'classnames' );

var PopoverMenu = require( 'components/popover/menu' ),
	PopoverMenuItem = require( 'components/popover/menu-item' ),
	Gridicon = require( 'components/gridicon' ),
	sitesList = require( 'lib/sites-list' )(),
	stats = require( 'reader/stats' );

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

const twitterIcon = ( <svg
	xmlns="http://www.w3.org/2000/svg"
	width="171.5054"
	height="139.37839"
	viewBox="0 0 171.5054 139.37839"
	version="1.1"
	className="gridicon gridicons-twitter">
	<g
		transform="translate(-282.32053,-396.30734)">
		<path
			d="m 453.82593,412.80619 c -6.3097,2.79897 -13.09189,4.68982 -20.20852,5.54049 7.26413,-4.35454 12.84406,-11.24992 15.47067,-19.46675 -6.79934,4.03295 -14.3293,6.96055 -22.34461,8.53841 -6.41775,-6.83879 -15.56243,-11.111 -25.68298,-11.111 -19.43159,0 -35.18696,15.75365 -35.18696,35.18525 0,2.75781 0.31128,5.44359 0.91155,8.01875 -29.24344,-1.46723 -55.16995,-15.47582 -72.52461,-36.76396 -3.02879,5.19662 -4.76443,11.24048 -4.76443,17.6891 0,12.20777 6.21194,22.97747 15.65332,29.28716 -5.76773,-0.18265 -11.19331,-1.76565 -15.93716,-4.40083 -0.004,0.14663 -0.004,0.29412 -0.004,0.44248 0,17.04767 12.12889,31.26806 28.22555,34.50266 -2.95247,0.80436 -6.06101,1.23398 -9.26989,1.23398 -2.2673,0 -4.47114,-0.22124 -6.62011,-0.63114 4.47801,13.97857 17.47214,24.15143 32.86992,24.43441 -12.04227,9.43796 -27.21366,15.06335 -43.69965,15.06335 -2.84014,0 -5.64082,-0.16722 -8.39349,-0.49223 15.57186,9.98421 34.06703,15.8094 53.93768,15.8094 64.72024,0 100.11301,-53.61524 100.11301,-100.11387 0,-1.52554 -0.0343,-3.04251 -0.10204,-4.55261 6.87394,-4.95995 12.83891,-11.15646 17.55618,-18.21305 z" />
	</g>
</svg> ),
	facebookIcon = ( <svg
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		x="0px" y="0px"
		width="266.893px" height="266.895px" viewBox="0 0 266.893 266.895"
		enable-background="new 0 0 266.893 266.895"
		className="gridicon gridicons-facebook">
		<path className="facebook-background" fill="#3C5A99" d="M248.082,262.307c7.854,0,14.223-6.369,14.223-14.225V18.812
			c0-7.857-6.368-14.224-14.223-14.224H18.812c-7.857,0-14.224,6.367-14.224,14.224v229.27c0,7.855,6.366,14.225,14.224,14.225
			H248.082z"/>
		<path className="facebook-f" fill="#FFFFFF" d="M182.409,262.307v-99.803h33.499l5.016-38.895h-38.515V98.777c0-11.261,3.127-18.935,19.275-18.935
			l20.596-0.009V45.045c-3.562-0.474-15.788-1.533-30.012-1.533c-29.695,0-50.025,18.126-50.025,51.413v28.684h-33.585v38.895h33.585
			v99.803H182.409z"/>
	</svg> );

var ReaderShare = React.createClass( {

	getInitialState() {
		return { showingMenu: false };
	},

	getDefaultProps() {
		return {
			position: 'top right',
			tagName: 'li'
		};
	},

	toggle() {
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
		return React.createElement( this.props.tagName, { className: 'reader-share' }, [
			( <span key="button" ref="shareButton" className={ buttonClasses } onTouchTap={ this.toggle }>
				{ this.translate( 'Share', { comment: 'Share the post' } ) }
			</span> ),
			( <PopoverMenu key="menu" context={ this.refs && this.refs.shareButton }
				isVisible={ this.state.showingMenu }
				onClose={ this.closeMenu }
				position={ this.props.position }>
				{ canShareToWordpress ? <PopoverMenuItem action="pressThis" className="reader-share__popover-item">
					<Gridicon icon='my-sites' size={ 24 } /> WordPress</PopoverMenuItem> : null }
				<PopoverMenuItem action="twitter" className="reader-share__popover-item">
					{ twitterIcon } Twitter</PopoverMenuItem>
				<PopoverMenuItem action="facebook" className="reader-share__popover-item">
					{ facebookIcon } Facebook</PopoverMenuItem>
			</PopoverMenu> )
		] );
	}

} );

module.exports = ReaderShare;
