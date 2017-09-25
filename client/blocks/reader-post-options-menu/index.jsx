/** @format */
/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ReaderPostOptionsMenuBlogStickers from './blog-stickers';
import QueryReaderFeed from 'components/data/query-reader-feed';
import QueryReaderSite from 'components/data/query-reader-site';
import QueryReaderTeams from 'components/data/query-reader-teams';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import PostUtils from 'lib/posts/utils';
import * as DiscoverHelper from 'reader/discover/helper';
import FollowButton from 'reader/follow-button';
import { isAutomatticTeamMember } from 'reader/lib/teams';
import * as stats from 'reader/stats';
import { getFeed } from 'state/reader/feeds/selectors';
import { requestSiteBlock } from 'state/reader/site-blocks/actions';
import { getSite } from 'state/reader/sites/selectors';
import { getReaderTeams } from 'state/selectors';

class ReaderPostOptionsMenu extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		feed: PropTypes.object,
		onBlock: PropTypes.func,
		showFollow: PropTypes.bool,
		position: PropTypes.string,
	};

	static defaultProps = {
		onBlock: noop,
		position: 'top left',
		showFollow: true,
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

		window.open(
			'https://wordpress.com/abuse/?report_url=' + encodeURIComponent( this.props.post.URL ),
			'_blank'
		);
	};

	getFollowUrl = () => {
		return this.props.feed
			? this.props.feed.feed_URL
			: this.props.post.feed_URL || this.props.post.site_URL;
	};

	onMenuToggle = isMenuVisible => {
		stats.recordAction( isMenuVisible ? 'open_post_options_menu' : 'close_post_options_menu' );
		stats.recordGaEvent( isMenuVisible ? 'Open Post Options Menu' : 'Close Post Options Menu' );
		stats.recordTrackForPost(
			'calypso_reader_post_options_menu_' + ( isMenuVisible ? 'opened' : 'closed' ),
			this.props.post
		);
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

		setTimeout( function() {
			// give the analytics a chance to escape
			if ( editUrl.indexOf( '//' ) === 0 ) {
				window.location.href = editUrl;
			} else {
				page( editUrl );
			}
		}, 100 );
	};

	visitPost = () => {
		const post = this.props.post;

		if ( ! post || ! post.URL ) {
			return;
		}

		stats.recordAction( 'visit_post' );
		stats.recordGaEvent( 'Clicked Visit Post', 'post_options' );
		stats.recordTrackForPost( 'calypso_reader_visit_post_clicked', post );

		window.open( post.URL, '_blank' );
	};

	render() {
		const { post, site, feed, teams, translate, position } = this.props;
		const isEditPossible = PostUtils.userCan( 'edit_post', post );
		const isDiscoverPost = DiscoverHelper.isDiscoverPost( post );
		const followUrl = this.getFollowUrl();
		const isTeamMember = isAutomatticTeamMember( teams );

		let isBlockPossible = false;

		// Should we show the 'block' option?
		if (
			post.site_ID &&
			! post.is_external &&
			! post.is_jetpack &&
			! isEditPossible &&
			! isDiscoverPost
		) {
			isBlockPossible = true;
		}

		const classes = classnames( 'reader-post-options-menu', this.props.className );

		return (
			<span className={ classes }>
				{ ! feed && post && post.feed_ID && <QueryReaderFeed feedId={ +post.feed_ID } /> }
				{ ! site &&
				post &&
				! post.is_external &&
				post.site_ID && <QueryReaderSite siteId={ +post.site_ID } /> }
				{ ! teams && <QueryReaderTeams /> }
				<EllipsisMenu
					className="reader-post-options-menu__ellipsis-menu"
					popoverClassName="reader-post-options-menu__popover"
					onToggle={ this.onMenuToggle }
					position={ position }
				>
					{ isTeamMember && site && <ReaderPostOptionsMenuBlogStickers blogId={ +site.ID } /> }

					{ this.props.showFollow && (
						<FollowButton tagName={ PopoverMenuItem } siteUrl={ followUrl } />
					) }

					{ post.URL && (
						<PopoverMenuItem onClick={ this.visitPost } icon="external">
							{ translate( 'Visit Post' ) }
						</PopoverMenuItem>
					) }

					{ isEditPossible && (
						<PopoverMenuItem onClick={ this.editPost } icon="pencil">
							{ translate( 'Edit Post' ) }
						</PopoverMenuItem>
					) }

					{ ( this.props.showFollow || isEditPossible || post.URL ) &&
					( isBlockPossible || isDiscoverPost ) && <hr className="reader-post-options-menu__hr" /> }

					{ isBlockPossible && (
						<PopoverMenuItem onClick={ this.blockSite }>
							{ translate( 'Block Site' ) }
						</PopoverMenuItem>
					) }

					{ ( isBlockPossible || isDiscoverPost ) && (
						<PopoverMenuItem onClick={ this.reportPost }>
							{ translate( 'Report this Post' ) }
						</PopoverMenuItem>
					) }
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
			feed: feedId && feedId > 0 ? getFeed( state, feedId ) : undefined,
			site: siteId && siteId > 0 ? getSite( state, siteId ) : undefined,
			teams: getReaderTeams( state ),
		};
	},
	{
		requestSiteBlock,
	}
)( localize( ReaderPostOptionsMenu ) );
