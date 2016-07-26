/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';
import page from 'page';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import FeedSubscriptionStore from 'lib/reader-feed-subscriptions';
import SiteStore from 'lib/reader-site-store';
import FeedStore from 'lib/feed-store';
import FeedStoreActions from 'lib/feed-store/actions';
import SiteBlockStore from 'lib/reader-site-blocks';
import SiteBlockActions from 'lib/reader-site-blocks/actions';
import PostUtils from 'lib/posts/utils';
import FollowButton from 'reader/follow-button';
import * as DiscoverHelper from 'reader/discover/helper';

const stats = require( 'reader/stats' );

const PostOptions = React.createClass( {

	propTypes: {
		post: React.PropTypes.object.isRequired,
		onBlock: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			onBlock: noop,
			position: 'top left'
		};
	},

	getInitialState() {
		const state = this.getStateFromStores();
		state.popoverPosition = this.props.position;
		state.showPopoverMenu = false;
		return state;
	},

	componentDidMount() {
		SiteBlockStore.on( 'change', this.updateState );
		FeedSubscriptionStore.on( 'change', this.updateState );
		FeedStore.on( 'change', this.updateState );
	},

	componentWillUnmount() {
		SiteBlockStore.off( 'change', this.updateState );
		FeedSubscriptionStore.off( 'change', this.updateState );
		FeedStore.off( 'change', this.updateState );
	},

	getStateFromStores() {
		const siteId = this.props.post.site_ID,
			feed = this.getFeed(),
			followUrl = this.getFollowUrl( feed );

		return {
			isBlocked: SiteBlockStore.getIsBlocked( siteId ),
			blockError: SiteBlockStore.getLastErrorBySite( siteId ),
			feed: this.getFeed(),
			followUrl: followUrl,
			followError: FeedSubscriptionStore.getLastErrorBySiteUrl( followUrl )
		};
	},

	updateState() {
		this.setState( this.getStateFromStores() );

		// Hide the popover menu if there's an error
		// Error message will be displayed on the post card
		if ( this.state.blockError || this.state.followError ) {
			this.state.showPopoverMenu = false;
		}
	},

	blockSite() {
		stats.recordAction( 'blocked_blog' );
		stats.recordGaEvent( 'Clicked Block Site' );
		stats.recordTrackForPost( 'calypso_reader_block_site', this.props.post );
		SiteBlockActions.block( this.props.post.site_ID );
		this.props.onBlock();
	},

	reportPost() {
		if ( ! this.props.post || ! this.props.post.URL ) {
			return;
		}

		stats.recordAction( 'report_post' );
		stats.recordGaEvent( 'Clicked Report Post', 'post_options' );
		stats.recordTrackForPost( 'calypso_reader_post_reported', this.props.post );

		window.open( 'https://wordpress.com/abuse/?report_url=' + encodeURIComponent( this.props.post.URL ), '_blank' );
	},

	getFollowUrl( feed ) {
		return feed ? feed.get( 'feed_URL' ) : this.props.post.site_URL;
	},

	getFeed() {
		const feedId = get( this.props, 'post.feed_ID' );
		if ( ! feedId || feedId < 1 ) {
			return;
		}

		const feed = FeedStore.get( feedId );

		if ( ! feed ) {
			FeedStoreActions.fetch( feedId );
		}

		return feed;
	},

	_showPopoverMenu() {
		const newState = ! this.state.showPopoverMenu;
		this.setState( {
			showPopover: false,
			showPopoverMenu: newState
		} );
		stats.recordAction( newState ? 'open_post_options_menu' : 'close_post_options_menu' );
		stats.recordGaEvent( newState ? 'Open Post Options Menu' : 'Close Post Options Menu' );
		stats.recordTrackForPost( 'calypso_reader_post_options_menu_' + ( newState ? 'opened' : 'closed' ), this.props.post );
	},

	_closePopoverMenu() {
		if ( this.isMounted() ) {
			this.setState( { showPopoverMenu: false } );
		}
	},

	editPost( closeMenu ) {
		const post = this.props.post,
			site = SiteStore.get( this.props.post.site_ID );
		let editUrl = '//wordpress.com/post/' + post.site_ID + '/' + post.ID + '/';

		closeMenu();

		if ( site && site.get( 'slug' ) ) {
			editUrl = PostUtils.getEditURL( post, site.toJS() );
		}

		stats.recordAction( 'edit_post' );
		stats.recordGaEvent( 'Clicked Edit Post', 'post_options' );
		stats.recordTrackForPost( 'calypso_reader_edit_post_clicked', this.props.post );

		setTimeout( function() { // give the analytics a chance to escape
			if ( editUrl.indexOf( '//' ) === 0 ) {
				window.location.href = editUrl;
			} else {
				page( editUrl );
			}
		}, 100 );
	},

	render() {
		const post = this.props.post,
			isEditPossible = PostUtils.userCan( 'edit_post', post ),
			isDiscoverPost = DiscoverHelper.isDiscoverPost( post );

		let triggerClasses = [ 'post-options__trigger', 'ignore-click' ],
			isBlockPossible = false;

		if ( this.state.showPopoverMenu ) {
			triggerClasses.push( 'is-triggered' );
		}

		triggerClasses = triggerClasses.join( ' ' );

		// Should we show the 'block' option?
		if ( post.site_ID && ! post.is_external && ! post.is_jetpack && ! isEditPossible && ! isDiscoverPost ) {
			isBlockPossible = true;
		}

		return (
			<span className="post-options">
				<span className={ triggerClasses }
						ref="popoverMenuButton"
						onClick={ this._showPopoverMenu }>
					<svg className="gridicon gridicon__ellipsis" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<g><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="12" cy="12" r="2"/></g>
					</svg>
					<span className="post-options__label">{ this.translate( 'More' ) }</span>
				</span>

				<PopoverMenu isVisible={ this.state.showPopoverMenu }
						onClose={ this._closePopoverMenu }
						position={ this.state.popoverPosition }
						context={ this.refs && this.refs.popoverMenuButton }>

					<FollowButton tagName={ PopoverMenuItem } siteUrl={ this.state.followUrl } />

					{ isEditPossible ? <PopoverMenuItem onClick={ this.editPost } className="post-options__edit has-icon">
						<svg className="gridicon gridicon__edit" height="20" width="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<g><path d="M4 15v5h5l9-9-5-5-9 9zM16 3l-2 2 5 5 2-2-5-5z"/></g>
						</svg>
						{ this.translate( 'Edit Post' ) }
					</PopoverMenuItem> : null }

					{ isBlockPossible || isDiscoverPost ? <hr className="post-options__hr" /> : null }
					{ isBlockPossible ? <PopoverMenuItem onClick={ this.blockSite }>{ this.translate( 'Block Site' ) }</PopoverMenuItem> : null }
					{ isBlockPossible || isDiscoverPost ? <PopoverMenuItem onClick={ this.reportPost }>{ this.translate( 'Report this Post' ) }</PopoverMenuItem> : null }
				</PopoverMenu>
			</span>
		);
	}

} );

export default PostOptions;
