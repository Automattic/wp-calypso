var React = require( 'react' ),
	url = require( 'url' ),
	defer = require( 'lodash/defer' ),
	config = require( 'config' ),
	classnames = require( 'classnames' ),
	qs = require( 'qs' ),
	page = require( 'page' );

var PopoverMenu = require( 'components/popover/menu' ),
	PopoverMenuItem = require( 'components/popover/menu-item' ),
	Gridicon = require( 'components/gridicon' ),
	sitesList = require( 'lib/sites-list' )(),
	stats = require( 'reader/stats' ),
	SocialLogo = require( 'components/social-logo' ),
	SitesPopover = require( 'components/sites-popover' ),
	sections = require( 'sections-preload' );

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
	}
};

function buildQuerystringForPost( post ) {
	const primarySite = sitesList.getPrimary();
	if ( ! primarySite ) {
		return;
	}
	const args = {};

	if ( post.content_embeds && post.content_embeds.length ) {
		args.embed = post.content_embeds[ 0 ].embedUrl || post.content_embeds[ 0 ].src;
	}
	if ( post.canonical_image && post.canonical_image.uri ) {
		args.image = post.canonical_image.uri;
	}

	args.title = `${ post.title } — ${ post.site_name }`;
	args.text = post.excerpt;
	args.url = post.URL;

	return qs.stringify( args );
}

const ReaderShare = React.createClass( {

	getInitialState() {
		return { showingMenu: false };
	},

	getDefaultProps() {
		return {
			position: 'top',
			tagName: 'li'
		};
	},

	componentWillUnmount() {
		if ( this._closeHandle ) {
			clearTimeout( this._closeHandle );
			this._closeHandle = null;
		}
	},

	_deferMenuChange( showing ) {
		if ( this._closeHandle ) {
			clearTimeout( this._closeHandle );
		}

		this._closeHandle = defer( () => {
			this._closeHandle = null;
			this.setState( { showingMenu: showing } );
		} );
	},

	toggle( event ) {
		event.preventDefault();
		if ( ! this.state.showingMenu ) {
			const target = !! sitesList.getPrimary() ? 'wordpress' : 'external';
			stats.recordAction( 'open_share' );
			stats.recordGaEvent( 'Opened Share to ' + target );
			stats.recordTrack( 'calypso_reader_share_opened', {
				target
			} );
		}
		this._deferMenuChange( ! this.state.showingMenu );
	},

	killClick( event ) {
		event.preventDefault();
	},

	closeMenu() {
		// have to defer this to let the mouseup / click escape.
		// If we don't defer and remove the DOM node on this turn of the event loop,
		// Chrome (at least) will not fire the click
		if ( this.isMounted() ) {
			this._deferMenuChange( false );
		}
	},

	pickSiteToShareTo( slug ) {
		stats.recordAction( 'share_wordpress' );
		stats.recordGaEvent( 'Clicked on Share to WordPress' );
		stats.recordTrack( 'calypso_reader_share_to_site' );
		page( `/post/${slug}?` + buildQuerystringForPost( this.props.post ) );
		return true;
	},

	closeExternalShareMenu( action ) {
		this.closeMenu();
		const actionFunc = actionMap[ action ];
		if ( actionFunc ) {
			stats.recordAction( 'share_' + action );
			stats.recordGaEvent( 'Clicked on Share to ' + action );
			stats.recordTrack( 'calypso_reader_share_action_picked', {
				action: action
			} );
			actionFunc( this.props.post );
		}
	},

	preloadEditor() {
		sections.preload( 'post-editor' );
	},

	render() {
		const canShareToWordpress = !! sitesList.getPrimary(),
			buttonClasses = classnames( {
				'reader-share_button': true,
				'ignore-click': true,
				'is-active': this.state.showingMenu
			} );

		return React.createElement( this.props.tagName, {
			className: 'reader-share',
			onClick: this.killClick,
			onTouchTap: this.toggle,
			onTouchStart: this.preloadEditor,
			onMouseEnter: this.preloadEditor,
			ref: 'shareButton' },
			[
				( <span key="button" ref="shareButton" className={ buttonClasses }>
					<Gridicon icon="share" size={ 24 } />
					<span className="reader-share__button-label">{ this.translate( 'Share', { comment: 'Share the post' } ) }</span>
				</span> ),
				( this.state.showingMenu &&
						( canShareToWordpress
						? <SitesPopover
								key="menu"
								header={ <div>{ this.translate( 'Share on:' ) }</div> }
								sites={ sitesList }
								context={ this.refs && this.refs.shareButton }
								visible={ this.state.showingMenu }
								groups={ true }
								onSiteSelect={ this.pickSiteToShareTo }
								onClose={ this.closeMenu }
								position={ this.props.position }
								className="is-reader"/>
						: <PopoverMenu key="menu" context={ this.refs && this.refs.shareButton }
								isVisible={ this.state.showingMenu }
								onClose={ this.closeExternalShareMenu }
								position={ this.props.position }
								className="popover reader-share__popover">
								<PopoverMenuItem action="twitter" className="reader-share__popover-item">
									<SocialLogo icon="twitter" /><span>Twitter</span></PopoverMenuItem>
								<PopoverMenuItem action="facebook" className="reader-share__popover-item">
									<SocialLogo icon="facebook" /><span>Facebook</span></PopoverMenuItem>
							</PopoverMenu>
						)
					)
			]
		);
	}

} );

module.exports = ReaderShare;
