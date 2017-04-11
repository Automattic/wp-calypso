/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';
import page from 'page';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { requestSiteBlock } from 'state/reader/site-blocks/actions';
import PostUtils from 'lib/posts/utils';
import FollowButton from 'reader/follow-button';
import * as DiscoverHelper from 'reader/discover/helper';
import * as stats from 'reader/stats';
import { getFeed } from 'state/reader/feeds/selectors';
import { getSite } from 'state/reader/sites/selectors';
import QueryReaderFeed from 'components/data/query-reader-feed';
import QueryReaderSite from 'components/data/query-reader-site';

class ReaderPostOptionsMenu extends React.Component {

	static propTypes = {
		post: React.PropTypes.object.isRequired,
		feed: React.PropTypes.object,
		onBlock: React.PropTypes.func,
		showFollow: React.PropTypes.bool
	};

	static defaultProps = {
		onBlock: noop,
		position: 'top left',
		showFollow: true
	};

	blockSite = () => {
		stats.recordAction( 'blocked_blog' );
		stats.recordGaEvent( 'Clicked Block Site' );
		stats.recordTrackForPost( 'calypso_reader_block_site', this.props.post );
		this.props.requestSiteBlock( this.props.post.site_ID );
		this.props.onBlock();
	};

	reportPost = () => {
		if ( ! this.props.post || ! this.props.post.URL ) {
			return;
		}

		stats.recordAction( 'report_post' );
		stats.recordGaEvent( 'Clicked Report Post', 'post_options' );
		stats.recordTrackForPost( 'calypso_reader_post_reported', this.props.post );

		window.open( 'https://wordpress.com/abuse/?report_url=' + encodeURIComponent( this.props.post.URL ), '_blank' );
	};

	getFollowUrl = () => {
		return this.props.feed ? this.props.feed.feed_URL : ( this.props.post.feed_URL || this.props.post.site_URL );
	};

	onMenuToggle = ( isMenuVisible ) => {
		stats.recordAction( isMenuVisible ? 'open_post_options_menu' : 'close_post_options_menu' );
		stats.recordGaEvent( isMenuVisible ? 'Open Post Options Menu' : 'Close Post Options Menu' );
		stats.recordTrackForPost( 'calypso_reader_post_options_menu_' + ( isMenuVisible ? 'opened' : 'closed' ), this.props.post );
	};

	editPost = () => {
		const { post, site } = this.props;
		let editUrl = '//wordpress.com/post/' + post.site_ID + '/' + post.ID + '/';

		if ( site && site.slug ) {
			editUrl = PostUtils.getEditURL( post, site );
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
	};

	render() {
		const post = this.props.post,
			isEditPossible = PostUtils.userCan( 'edit_post', post ),
			isDiscoverPost = DiscoverHelper.isDiscoverPost( post ),
			followUrl = this.getFollowUrl();
		const { site, feed } = this.props;

		let isBlockPossible = false;

		// Should we show the 'block' option?
		if ( post.site_ID && ! post.is_external && ! post.is_jetpack && ! isEditPossible && ! isDiscoverPost ) {
			isBlockPossible = true;
		}

		const classes = classnames( 'reader-post-options-menu', this.props.className );

		return (
			<span className={ classes }>
				{ ! feed && post && post.feed_ID && <QueryReaderFeed feedId={ +post.feed_ID } /> }
				{ ! site && post && post.site_ID && <QueryReaderSite siteId={ +post.site_ID } /> }
				<EllipsisMenu
					className="reader-post-options-menu__ellipsis-menu"
					popoverClassName="reader-post-options-menu__popover"
					onToggle={ this.onMenuToggle }>
					{ this.props.showFollow && <FollowButton tagName={ PopoverMenuItem } siteUrl={ followUrl } /> }

					{ isEditPossible ? <PopoverMenuItem onClick={ this.editPost } icon="pencil">
						{ this.props.translate( 'Edit Post' ) }
					</PopoverMenuItem> : null }

					{ ( this.props.showFollow || isEditPossible ) && ( isBlockPossible || isDiscoverPost ) &&
						<hr className="reader-post-options-menu__hr" /> }
					{ isBlockPossible
						? <PopoverMenuItem onClick={ this.blockSite }>{ this.props.translate( 'Block Site' ) }</PopoverMenuItem>
						: null
					}
					{ isBlockPossible || isDiscoverPost
						? <PopoverMenuItem onClick={ this.reportPost }>{ this.props.translate( 'Report this Post' ) }</PopoverMenuItem>
						: null
					}
				</EllipsisMenu>
			</span>
		);
	}

}

export default connect(
	( state, ownProps ) => {
		const feedId = ownProps.post.feed_ID;
		const siteId = ownProps.post.is_external ? null : ownProps.post.site_ID;
		return {
			feed: ( feedId && feedId > 0 ) ? getFeed( state, feedId ) : undefined,
			site: ( siteId && siteId > 0 ) ? getSite( state, siteId ) : undefined,
		};
	},
	{
		requestSiteBlock,
	}
)( localize( ReaderPostOptionsMenu ) );
