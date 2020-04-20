/**
 * External dependencies
 */
import PropTypes from 'prop-types';
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
import { blockSite } from 'state/reader/site-blocks/actions';
import * as PostUtils from 'state/posts/utils';
import FollowButton from 'reader/follow-button';
import * as DiscoverHelper from 'reader/discover/helper';
import * as stats from 'reader/stats';
import { getFeed } from 'state/reader/feeds/selectors';
import { getSite } from 'state/reader/sites/selectors';
import QueryReaderFeed from 'components/data/query-reader-feed';
import QueryReaderSite from 'components/data/query-reader-site';
import QueryReaderTeams from 'components/data/query-reader-teams';
import { isAutomatticTeamMember } from 'reader/lib/teams';
import { getReaderTeams } from 'state/reader/teams/selectors';
import ReaderPostOptionsMenuBlogStickers from './blog-stickers';
import ConversationFollowButton from 'blocks/conversation-follow-button';
import { shouldShowConversationFollowButton } from 'blocks/conversation-follow-button/helper';
import { READER_POST_OPTIONS_MENU } from 'reader/follow-sources';

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

	render() {
		const { post, site, feed, teams, translate, position } = this.props;

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
					popoverClassName="reader-post-options-menu__popover"
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
			{ teams: getReaderTeams( state ) },
			feedId > 0 && { feed: getFeed( state, feedId ) },
			siteId > 0 && { site: getSite( state, siteId ) }
		);
	},
	{
		blockSite,
	}
)( localize( ReaderPostOptionsMenu ) );
