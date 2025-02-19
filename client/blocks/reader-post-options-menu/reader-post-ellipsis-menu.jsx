import page from '@automattic/calypso-router';
import { localize } from 'i18n-calypso';
import { size, map } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ConversationFollowButton from 'calypso/blocks/conversation-follow-button';
import { shouldShowConversationFollowButton } from 'calypso/blocks/conversation-follow-button/helper';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import ReaderExternalIcon from 'calypso/reader/components/icons/external-icon';
import ReaderFollowConversationIcon from 'calypso/reader/components/icons/follow-conversation-icon';
import ReaderFollowingConversationIcon from 'calypso/reader/components/icons/following-conversation-icon';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { READER_POST_OPTIONS_MENU } from 'calypso/reader/follow-sources';
import { canBeMarkedAsSeen, isEligibleForUnseen } from 'calypso/reader/get-helpers';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import * as stats from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import * as PostUtils from 'calypso/state/posts/utils';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { hasReaderFollowOrganization } from 'calypso/state/reader/follows/selectors';
import {
	requestMarkAsSeen,
	requestMarkAsUnseen,
	requestMarkAsSeenBlog,
	requestMarkAsUnseenBlog,
} from 'calypso/state/reader/seen-posts/actions';
import { blockSite } from 'calypso/state/reader/site-blocks/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isFeedWPForTeams from 'calypso/state/selectors/is-feed-wpforteams';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import ReaderPostOptionsMenuBlogStickers from './blog-stickers';

const noop = () => {};

class ReaderPostEllipsisMenu extends Component {
	static propTypes = {
		post: PropTypes.object,
		feed: PropTypes.object,
		followSource: PropTypes.string,
		onBlock: PropTypes.func,
		openSuggestedFollows: PropTypes.func,
		showFollow: PropTypes.bool,
		showVisitPost: PropTypes.bool,
		showEditPost: PropTypes.bool,
		showConversationFollow: PropTypes.bool,
		showReportPost: PropTypes.bool,
		showReportSite: PropTypes.bool,
		position: PropTypes.string,
		posts: PropTypes.array,
		teams: PropTypes.array,
	};

	static defaultProps = {
		onBlock: noop,
		followSource: READER_POST_OPTIONS_MENU,
		openSuggestedFollows: noop,
		position: 'top left',
		showFollow: true,
		showVisitPost: true,
		showEditPost: true,
		showConversationFollow: true,
		showReportPost: true,
		showReportSite: false,
		posts: [],
	};

	openSuggestedFollowsModal = ( shouldOpen ) => {
		if ( shouldOpen ) {
			this.props.openSuggestedFollows( shouldOpen );
		}
	};

	blockSite = () => {
		stats.recordAction( 'blocked_blog' );
		stats.recordGaEvent( 'Clicked Block Site' );
		stats.recordTrackForPost( 'calypso_reader_block_site', this.props.post );
		this.props.blockSite( this.props.post.site_ID );
		this.props.onBlock();
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

	markAsSeen = ( event ) => {
		const { post, posts } = this.props;

		if ( ! post ) {
			return;
		}

		this.props.recordReaderTracksEvent( 'calypso_reader_mark_as_seen_clicked', {}, { post } );

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

		event.stopPropagation();
		event.preventDefault();

		this.onMenuToggle();
	};

	markAsUnSeen = ( event ) => {
		const { post, posts } = this.props;

		if ( ! post ) {
			return;
		}

		this.props.recordReaderTracksEvent( 'calypso_reader_mark_as_unseen_clicked', {}, { post } );

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

		event.stopPropagation();
		event.preventDefault();
	};

	stopPropagation = ( event ) => event.stopPropagation();

	render() {
		const {
			post,
			site,
			teams,
			translate,
			position,
			posts,
			isWPForTeamsItem,
			currentRoute,
			hasOrganization,
			isLoggedIn,
			followSource,
		} = this.props;

		const { ID: postId, site_ID: siteId } = post;

		const isEditPossible = PostUtils.userCan( 'edit_post', post );

		let isBlockPossible = false;

		if ( ! isLoggedIn ) {
			return null;
		}

		// Should we show the 'block' option?
		if ( post.site_ID && ( ! post.is_external || post.is_jetpack ) && ! isEditPossible ) {
			isBlockPossible = true;
		}

		const isTeamMember = isAutomatticTeamMember( teams );
		const showConversationFollowButton =
			this.props.showConversationFollow && shouldShowConversationFollowButton( post );

		return (
			<EllipsisMenu
				className="reader-post-options-menu__ellipsis-menu"
				popoverClassName="reader-post-options-menu__popover ignore-click"
				onToggle={ this.onMenuToggle }
				position={ position }
				onClick={ this.stopPropagation }
			>
				{ showConversationFollowButton && (
					<ConversationFollowButton
						tagName={ PopoverMenuItem }
						siteId={ siteId }
						postId={ postId }
						post={ post }
						followSource={ followSource }
						followIcon={ ReaderFollowConversationIcon( { iconSize: 20 } ) }
						followingIcon={ ReaderFollowingConversationIcon( { iconSize: 20 } ) }
					/>
				) }

				{ isEligibleForUnseen( { isWPForTeamsItem, currentRoute, hasOrganization } ) &&
					canBeMarkedAsSeen( { post, posts } ) &&
					post.is_seen && (
						<PopoverMenuItem onClick={ this.markAsUnSeen } icon="not-visible">
							{ size( posts ) > 0 && translate( 'Mark all as unseen' ) }
							{ size( posts ) === 0 && translate( 'Mark as unseen' ) }
						</PopoverMenuItem>
					) }

				{ isEligibleForUnseen( { isWPForTeamsItem, currentRoute, hasOrganization } ) &&
					canBeMarkedAsSeen( { post, posts } ) &&
					! post.is_seen && (
						<PopoverMenuItem onClick={ this.markAsSeen } icon="visible">
							{ size( posts ) > 0 && translate( 'Mark all as seen' ) }
							{ size( posts ) === 0 && translate( 'Mark as seen' ) }
						</PopoverMenuItem>
					) }

				{ this.props.showVisitPost && post.URL && (
					<PopoverMenuItem
						onClick={ this.visitPost }
						icon={ ReaderExternalIcon( { iconSize: 20 } ) }
					>
						{ translate( 'Visit post' ) }
					</PopoverMenuItem>
				) }

				{ this.props.showEditPost && isEditPossible && (
					<PopoverMenuItem onClick={ this.editPost } icon="pencil">
						{ translate( 'Edit post' ) }
					</PopoverMenuItem>
				) }

				{ this.props.showFollow && (
					<ReaderFollowButton
						tagName={ PopoverMenuItem }
						siteUrl={ post.feed_URL || post.site_URL }
						followSource={ followSource }
						iconSize={ 20 }
						followingLabel={ translate( 'Unsubscribe' ) }
						onFollowToggle={ this.openSuggestedFollowsModal }
					/>
				) }

				{ isTeamMember && site && <hr className="popover__menu-separator" /> }
				{ isTeamMember && site && <ReaderPostOptionsMenuBlogStickers blogId={ +site.ID } /> }

				{ ( this.props.showFollow || isEditPossible || post.URL ) && isBlockPossible && (
					<hr className="popover__menu-separator" />
				) }

				{ isBlockPossible && (
					<PopoverMenuItem onClick={ this.blockSite }>
						{ translate( 'Block site' ) }
					</PopoverMenuItem>
				) }

				{ this.props.showReportPost && isBlockPossible && (
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
		);
	}
}
export default connect(
	( state, { post: { feed_ID: feedId, is_external, site_ID } = {} } ) => {
		const siteId = is_external ? null : site_ID;

		return Object.assign(
			{ currentRoute: getCurrentRoute( state ) },
			{ isWPForTeamsItem: isSiteWPForTeams( state, siteId ) || isFeedWPForTeams( state, feedId ) },
			{ isLoggedIn: isUserLoggedIn( state ) },
			{
				hasOrganization: hasReaderFollowOrganization( state, feedId, siteId ),
			}
		);
	},
	{
		blockSite,
		requestMarkAsSeen,
		requestMarkAsUnseen,
		requestMarkAsSeenBlog,
		requestMarkAsUnseenBlog,
		recordReaderTracksEvent,
	}
)( localize( ReaderPostEllipsisMenu ) );
