/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop, size, map } from 'lodash';
import page from 'page';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import { blockSite } from 'calypso/state/reader/site-blocks/actions';
import * as PostUtils from 'calypso/state/posts/utils';
import FollowButton from 'calypso/reader/follow-button';
import * as DiscoverHelper from 'calypso/reader/discover/helper';
import * as stats from 'calypso/reader/stats';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { getSite } from 'calypso/state/reader/sites/selectors';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { getReaderTeams } from 'calypso/state/reader/teams/selectors';
import ReaderPostOptionsMenuBlogStickers from './blog-stickers';
import ConversationFollowButton from 'calypso/blocks/conversation-follow-button';
import { shouldShowConversationFollowButton } from 'calypso/blocks/conversation-follow-button/helper';
import { READER_POST_OPTIONS_MENU } from 'calypso/reader/follow-sources';
import {
	requestMarkAsSeen,
	requestMarkAsUnseen,
	requestMarkAsSeenBlog,
	requestMarkAsUnseenBlog,
} from 'calypso/state/reader/seen-posts/actions';
import { isEligibleForUnseen } from 'calypso/reader/get-helpers';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isFeedWPForTeams from 'calypso/state/selectors/is-feed-wpforteams';

/**
 * Style dependencies
 */
import './style.scss';

class ReaderPostOptionsMenu extends React.Component {
	static propTypes = {
		post: PropTypes.object,
		feed: PropTypes.object,
		onBlock: PropTypes.func,
		showFollow: PropTypes.bool,
		showVisitPost: PropTypes.bool,
		showEditPost: PropTypes.bool,
		showConversationFollow: PropTypes.bool,
		showReportPost: PropTypes.bool,
		showReportSite: PropTypes.bool,
		position: PropTypes.string,
		posts: PropTypes.array,
	};

	static defaultProps = {
		onBlock: noop,
		position: 'top left',
		showFollow: true,
		showVisitPost: true,
		showEditPost: true,
		showConversationFollow: true,
		showReportPost: true,
		showReportSite: false,
		posts: [],
	};

	blockSite = () => {
		stats.recordAction( 'blocked_blog' );
		stats.recordGaEvent( 'Clicked Block Site' );
		stats.recordTrackForPost( 'calypso_reader_block_site', this.props.post );
		this.props.blockSite( this.props.post.site_ID );
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

	reportSite = () => {
		if ( ! this.props.site || ! this.props.site.URL ) {
			return;
		}

		stats.recordAction( 'report_site' );
		stats.recordGaEvent( 'Clicked Report Site', 'post_options' );
		stats.recordTrackForPost( 'calypso_reader_site_reported', this.props.site );

		window.open(
			'https://wordpress.com/abuse/?report_url=' + encodeURIComponent( this.props.site.URL ),
			'_blank'
		);
	};

	getFollowUrl = () => {
		return this.props.feed
			? this.props.feed.feed_URL
			: this.props.post.feed_URL || this.props.post.site_URL;
	};

	onMenuToggle = ( isMenuVisible ) => {
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

		setTimeout( function () {
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

	markAsSeen = () => {
		const { post, posts } = this.props;

		if ( ! post ) {
			return;
		}

		const feedId = post.feed_ID;
		let postIds = [ post.ID ];
		let feedItemIds = [ post.feed_item_ID ];
		let globalIds = [ post.global_ID ];

		if ( size( posts ) ) {
			postIds = map( posts, 'ID' );
			feedItemIds = map( posts, 'feed_item_ID' );
			globalIds = map( posts, 'global_ID' );
		}

		if ( post.feed_item_ID ) {
			// is feed
			this.props.requestMarkAsSeen( {
				feedId,
				feedUrl: post.feed_URL,
				feedItemIds,
				globalIds,
			} );
		} else {
			// is blog
			this.props.requestMarkAsSeenBlog( {
				feedId,
				feedUrl: post.feed_URL,
				blogId: post.site_ID,
				postIds,
				globalIds,
			} );
		}

		this.onMenuToggle();
	};

	markAsUnSeen = () => {
		const { post, posts } = this.props;

		if ( ! post ) {
			return;
		}

		const feedId = post.feed_ID;
		let postIds = [ post.ID ];
		let feedItemIds = [ post.feed_item_ID ];
		let globalIds = [ post.global_ID ];

		if ( size( posts ) ) {
			postIds = map( posts, 'ID' );
			feedItemIds = map( posts, 'feed_item_ID' );
			globalIds = map( posts, 'global_ID' );
		}

		if ( post.feed_item_ID ) {
			// is feed
			this.props.requestMarkAsUnseen( {
				feedId,
				feedUrl: post.feed_URL,
				feedItemIds,
				globalIds,
			} );
		} else {
			// is blog
			this.props.requestMarkAsUnseenBlog( {
				feedId,
				feedUrl: post.feed_URL,
				blogId: post.site_ID,
				postIds,
				globalIds,
			} );
		}

		this.onMenuToggle();
	};

	render() {
		const { post, site, feed, teams, translate, position, posts, isWPForTeams } = this.props;

		if ( ! post ) {
			return null;
		}

		const { ID: postId, site_ID: siteId } = post;
		const isEditPossible = PostUtils.userCan( 'edit_post', post );
		const isDiscoverPost = DiscoverHelper.isDiscoverPost( post );
		const followUrl = this.getFollowUrl();
		const isTeamMember = isAutomatticTeamMember( teams );
		const showConversationFollowButton =
			this.props.showConversationFollow && shouldShowConversationFollowButton( post );

		let isBlockPossible = false;

		// Should we show the 'block' option?
		if (
			post.site_ID &&
			( ! post.is_external || post.is_jetpack ) &&
			! isEditPossible &&
			! isDiscoverPost
		) {
			isBlockPossible = true;
		}

		const classes = classnames( 'reader-post-options-menu', this.props.className );

		return (
			<span className={ classes }>
				{ ! feed && post && post.feed_ID && <QueryReaderFeed feedId={ +post.feed_ID } /> }
				{ ! site && post && ! post.is_external && post.site_ID && (
					<QueryReaderSite siteId={ +post.site_ID } />
				) }
				{ ! teams && <QueryReaderTeams /> }
				<EllipsisMenu
					className="reader-post-options-menu__ellipsis-menu"
					popoverClassName="reader-post-options-menu__popover ignore-click"
					onToggle={ this.onMenuToggle }
					position={ position }
				>
					{ isTeamMember && site && <ReaderPostOptionsMenuBlogStickers blogId={ +site.ID } /> }

					{ this.props.showFollow && (
						<FollowButton
							tagName={ PopoverMenuItem }
							siteUrl={ followUrl }
							followLabel={ showConversationFollowButton ? translate( 'Follow site' ) : null }
							followingLabel={ showConversationFollowButton ? translate( 'Following site' ) : null }
						/>
					) }

					{ showConversationFollowButton && (
						<ConversationFollowButton
							tagName={ PopoverMenuItem }
							siteId={ siteId }
							postId={ postId }
							post={ post }
							followSource={ READER_POST_OPTIONS_MENU }
						/>
					) }

					{ isEligibleForUnseen( teams, isWPForTeams ) && post.is_seen && (
						<PopoverMenuItem onClick={ this.markAsUnSeen } icon="not-visible" itemComponent={ 'a' }>
							{ size( posts ) > 0 && translate( 'Mark all as unseen' ) }
							{ size( posts ) === 0 && translate( 'Mark as unseen' ) }
						</PopoverMenuItem>
					) }

					{ isEligibleForUnseen( teams, isWPForTeams ) && ! post.is_seen && (
						<PopoverMenuItem onClick={ this.markAsSeen } icon="visible">
							{ size( posts ) > 0 && translate( 'Mark all as seen' ) }
							{ size( posts ) === 0 && translate( 'Mark as seen' ) }
						</PopoverMenuItem>
					) }

					{ this.props.showVisitPost && post.URL && (
						<PopoverMenuItem onClick={ this.visitPost } icon="external">
							{ translate( 'Visit post' ) }
						</PopoverMenuItem>
					) }

					{ this.props.showEditPost && isEditPossible && (
						<PopoverMenuItem onClick={ this.editPost } icon="pencil">
							{ translate( 'Edit post' ) }
						</PopoverMenuItem>
					) }

					{ ( this.props.showFollow || isEditPossible || post.URL ) &&
						( isBlockPossible || isDiscoverPost ) && (
							<hr className="reader-post-options-menu__hr" />
						) }

					{ isBlockPossible && (
						<PopoverMenuItem onClick={ this.blockSite }>
							{ translate( 'Block site' ) }
						</PopoverMenuItem>
					) }

					{ ( ( this.props.showReportPost && isBlockPossible ) || isDiscoverPost ) && (
						<PopoverMenuItem onClick={ this.reportPost }>
							{ translate( 'Report this post' ) }
						</PopoverMenuItem>
					) }

					{ this.props.showReportSite && site && isBlockPossible && (
						<PopoverMenuItem onClick={ this.reportSite }>
							{ translate( 'Report this site' ) }
						</PopoverMenuItem>
					) }
				</EllipsisMenu>
			</span>
		);
	}
}

export default connect(
	( state, { post: { feed_ID: feedId, is_external, site_ID } = {} } ) => {
		const siteId = is_external ? null : site_ID;

		return Object.assign(
			{ isWPForTeams: isSiteWPForTeams( state, siteId ) || isFeedWPForTeams( state, feedId ) },
			{ teams: getReaderTeams( state ) },
			feedId > 0 && { feed: getFeed( state, feedId ) },
			siteId > 0 && { site: getSite( state, siteId ) }
		);
	},
	{
		blockSite,
		requestMarkAsSeen,
		requestMarkAsUnseen,
		requestMarkAsSeenBlog,
		requestMarkAsUnseenBlog,
	}
)( localize( ReaderPostOptionsMenu ) );
