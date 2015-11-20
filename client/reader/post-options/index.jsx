/** External dependencies */
var React = require( 'react/addons' ),
	noop = require( 'lodash/utility/noop' ),
	page = require( 'page' );

/** Internal dependencies */
var PopoverMenu = require( 'components/popover/menu' ),
	PopoverMenuItem = require( 'components/popover/menu-item' ),
	FeedSubscriptionStore = require( 'lib/reader-feed-subscriptions/index' ),
	SiteStore = require( 'lib/reader-site-store' ),
	SiteBlockStore = require( 'lib/reader-site-blocks/index' ),
	SiteBlockActions = require( 'lib/reader-site-blocks/actions' ),
	postUtils = require( 'lib/posts/utils' ),
	FollowButton = require( 'reader/follow-button' ),
	stats = require( 'reader/stats' );

var PostOptions = React.createClass( {

	propTypes: {
		post: React.PropTypes.object.isRequired,
		onBlock: React.PropTypes.func
	},

	getDefaultProps: function() {
		return { onBlock: noop };
	},

	getInitialState: function() {
		var state = this.getStateFromStores();
		state.popoverPosition = 'bottom left';
		state.showPopoverMenu = false;
		return state;
	},

	componentDidMount: function() {
		SiteBlockStore.on( 'change', this.updateState );
		FeedSubscriptionStore.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		SiteBlockStore.off( 'change', this.updateState );
		FeedSubscriptionStore.off( 'change', this.updateState );
	},

	getStateFromStores: function() {
		var siteId = this.props.post.site_ID;

		return {
			isBlocked: SiteBlockStore.getIsBlocked( siteId ),
			blockError: SiteBlockStore.getLastErrorBySite( siteId ),
			followError: FeedSubscriptionStore.getLastErrorBySiteUrl( this.props.post.site_URL )
		};
	},

	updateState: function() {
		this.setState( this.getStateFromStores() );

		// Hide the popover menu if there's an error
		// Error message will be displayed on the post card
		if ( this.state.blockError || this.state.followError ) {
			this.state.showPopoverMenu = false;
		}
	},

	blockSite: function() {
		stats.recordAction( 'blocked_blog' );
		stats.recordGaEvent( 'Clicked Block Site' );
		SiteBlockActions.block( this.props.post.site_ID );
		this.props.onBlock();
	},

	reportPost: function() {
		if ( ! this.props.post || ! this.props.post.URL ) {
			return;
		}

		stats.recordAction( 'report_post' );
		stats.recordGaEvent( 'Clicked Report Post', 'post_options' );

		window.open( 'https://wordpress.com/abuse/?report_url=' + encodeURIComponent( this.props.post.URL ), '_blank' );
	},

	_showPopoverMenu: function() {
		var newState = ! this.state.showPopoverMenu;
		this.setState( {
			showPopover: false,
			showPopoverMenu: newState
		} );
		stats.recordAction( newState ? 'open_post_options_menu' : 'close_post_options_menu' );
		stats.recordGaEvent( newState ? 'Open Post Options Menu' : 'Close Post Options Menu' );
	},

	_closePopoverMenu: function() {
		if ( this.isMounted() ) {
			this.setState( { showPopoverMenu: false } );
		}
	},

	editPost: function( closeMenu ) {
		var post = this.props.post,
			editUrl = '//wordpress.com/post/' + post.site_ID + '/' + post.ID + '/',
			site = SiteStore.get( this.props.post.site_ID );

		closeMenu();

		if ( site && site.get( 'slug' ) ) {
			editUrl = postUtils.getEditURL( post, site.toJS() );
		}

		stats.recordAction( 'edit_post' );
		stats.recordGaEvent( 'Clicked Edit Post', 'post_options' );

		setTimeout( function() { // give the analytics a chance to escape
			if ( editUrl.indexOf( '//' ) === 0 ) {
				window.location.href = editUrl;
			} else {
				page( editUrl );
			}
		}, 100 );
	},

	render: function() {
		var post = this.props.post,
			triggerClasses = [ 'post-options__trigger', 'ignore-click' ],
			isBlockPossible = false,
			isEditPossible = postUtils.userCan( 'edit_post', post );

		if ( this.state.showPopoverMenu ) {
			triggerClasses.push( 'is-triggered' );
		}

		triggerClasses = triggerClasses.join( ' ' );

		// Should we show the 'block' option?
		if ( post.site_ID && ! post.is_external && ! post.is_jetpack && ! isEditPossible ) {
			isBlockPossible = true;
		}

		return (
			<span className="post-options">
				<span className={ triggerClasses }
						ref="popoverMenuButton"
						onClick={ this._showPopoverMenu }>
					<svg className="gridicon gridicon__ellipsis" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="12" cy="12" r="2"/></g></svg>
					<span className="post-options__label">{ this.translate( 'More' ) }</span>
				</span>

				<PopoverMenu isVisible={ this.state.showPopoverMenu }
						onClose={ this._closePopoverMenu }
						position={ this.state.popoverPosition }
						context={ this.refs && this.refs.popoverMenuButton }>

					<FollowButton tagName={ PopoverMenuItem } siteUrl={ post.site_URL } />

					{ isEditPossible ? <PopoverMenuItem onClick={ this.editPost } className="post-options__edit has-icon">
						<svg className="gridicon gridicon__edit" height="20" width="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M4 15v5h5l9-9-5-5-9 9zM16 3l-2 2 5 5 2-2-5-5z"/></g></svg>
						{ this.translate( 'Edit Post' ) }
					</PopoverMenuItem> : null }

					{ isBlockPossible ? <hr className="post-options__hr" /> : null }
					{ isBlockPossible ? <PopoverMenuItem onClick={ this.blockSite }>{ this.translate( 'Block Site' ) }</PopoverMenuItem> : null }
					{ isBlockPossible ? <PopoverMenuItem onClick={ this.reportPost }>{ this.translate( 'Report this Post' ) }</PopoverMenuItem> : null }
				</PopoverMenu>
			</span>
		);
	}

} );

module.exports = PostOptions;
