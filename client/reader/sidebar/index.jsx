/**
 * External dependencies
 */
import closest from 'component-closest';
import { localize } from 'i18n-calypso';
import { defer, startsWith, identity } from 'lodash';
import page from 'page';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ReaderSidebarHelper from './helper';
import ReaderSidebarLists from './reader-sidebar-lists';
import ReaderSidebarTags from './reader-sidebar-tags';
import ReaderSidebarOrganizations from './reader-sidebar-organizations';
import ReaderSidebarNudges from './reader-sidebar-nudges';
import QueryReaderLists from 'calypso/components/data/query-reader-lists';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import Sidebar from 'calypso/layout/sidebar';
import SidebarFooter from 'calypso/layout/sidebar/footer';
import SidebarHeading from 'calypso/layout/sidebar/heading';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarRegion from 'calypso/layout/sidebar/region';
import { isDiscoverEnabled } from 'calypso/reader/discover/helper';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { getTagStreamUrl } from 'calypso/reader/route';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { getSubscribedLists } from 'calypso/state/reader/lists/selectors';
import { getReaderTeams } from 'calypso/state/reader/teams/selectors';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import {
	toggleReaderSidebarLists,
	toggleReaderSidebarTags,
} from 'calypso/state/reader-ui/sidebar/actions';
import { isListsOpen, isTagsOpen } from 'calypso/state/reader-ui/sidebar/selectors';
import ReaderSidebarPromo from './promo';
import QueryReaderOrganizations from 'calypso/components/data/query-reader-organizations';
import { getReaderOrganizations } from 'calypso/state/reader/organizations/selectors';
import ReaderSidebarFollowedSites from 'calypso/reader/sidebar/reader-sidebar-followed-sites';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import { isEnabled } from 'calypso/config';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';
import 'calypso/my-sites/sidebar-unified/style.scss'; // nav-unification overrides. Should be removed once launched.

const A8CConversationsIcon = () => (
	<svg
		className="sidebar__menu-icon"
		width="24"
		height="24"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
	>
		<path d="M12.2 7.1c.5.3.6 1 .3 1.4L10 12.4c-.3.5-1 .7-1.4.3-.6-.3-.8-1-.4-1.5l2.5-3.9c.3-.4 1-.5 1.5-.2zM17.3 21.2h2.8c1 0 1.9-.8 1.9-1.9v-4.7c0-1-.8-1.9-1.9-1.9h-7.6c-1 .1-1.7.9-1.7 1.9v4.7c0 1 .8 1.8 1.7 1.9h2V24l2.8-2.8z" />
		<path d="M8.8 15.2c-2.7-.7-4.1-2.9-4.1-5.2 0-5.8 5.8-5.7 5.8-5.7 5.8 0 5.8 5.7 5.8 5.7 0 .3 0 .6-.1.8H19v-.7C19 1.6 10.4 2 10.4 2c-8.6 0-8.5 8.1-8.5 8.1 0 3.5 2.7 6.8 6.9 7.5v-2.4z" />
	</svg>
);

export class ReaderSidebar extends React.Component {
	state = {};

	componentDidMount() {
		// If we're browsing a tag or list, open the sidebar menu
		this.openExpandableMenuForCurrentTagOrList();
	}

	handleClick = ( event ) => {
		if ( ! event.isDefaultPrevented() && closest( event.target, 'a,span' ) ) {
			this.props.setNextLayoutFocus( 'content' );
			window.scrollTo( 0, 0 );
		}
	};

	highlightNewTag( tagSlug ) {
		const tagStreamUrl = getTagStreamUrl( tagSlug );
		if ( tagStreamUrl !== page.current ) {
			defer( function () {
				page( tagStreamUrl );
				window.scrollTo( 0, 0 );
			} );
		}
	}

	openExpandableMenuForCurrentTagOrList = () => {
		const pathParts = this.props.path.split( '/' );

		if ( startsWith( this.props.path, '/tag/' ) ) {
			const tagSlug = pathParts[ 2 ];
			if ( tagSlug ) {
				// Open the sidebar
				if ( ! this.props.isTagsOpen ) {
					this.props.toggleTagsVisibility();
					this.setState( { currentTag: tagSlug } );
				}
			}
		}

		if ( startsWith( this.props.path, '/read/list/' ) ) {
			const listOwner = pathParts[ 3 ];
			const listSlug = pathParts[ 4 ];
			if ( listOwner && listSlug ) {
				// Open the sidebar
				if ( ! this.props.isListsOpen ) {
					this.props.toggleListsVisibility();
					this.setState( { currentListOwner: listOwner, currentListSlug: listSlug } );
				}
			}
		}
	};

	handleReaderSidebarFollowedSitesClicked = () => {
		recordAction( 'clicked_reader_sidebar_followed_sites' );
		recordGaEvent( 'Clicked Reader Sidebar Followed Sites' );
		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_followed_sites_clicked' );
	};

	handleReaderSidebarConversationsClicked = () => {
		recordAction( 'clicked_reader_sidebar_conversations' );
		recordGaEvent( 'Clicked Reader Sidebar Conversations' );
		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_conversations_clicked' );
	};

	handleReaderSidebarA8cConversationsClicked = () => {
		recordAction( 'clicked_reader_sidebar_a8c_conversations' );
		recordGaEvent( 'Clicked Reader Sidebar A8C Conversations' );
		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_automattic_conversations_clicked' );
	};

	handleReaderSidebarDiscoverClicked = () => {
		recordAction( 'clicked_reader_sidebar_discover' );
		recordGaEvent( 'Clicked Reader Sidebar Discover' );
		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_discover_clicked' );
	};

	handleReaderSidebarSearchClicked = () => {
		recordAction( 'clicked_reader_sidebar_search' );
		recordGaEvent( 'Clicked Reader Sidebar Search' );
		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_search_clicked' );
	};

	handleReaderSidebarLikeActivityClicked = () => {
		recordAction( 'clicked_reader_sidebar_like_activity' );
		recordGaEvent( 'Clicked Reader Sidebar Like Activity' );
		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_like_activity_clicked' );
	};

	renderForRegularUsers() {
		const { path, translate } = this.props;
		return (
			<SidebarMenu>
				<SidebarHeading>{ translate( 'Streams' ) }</SidebarHeading>
				<QueryReaderLists />
				<QueryReaderTeams />

				<SidebarItem
					className={ ReaderSidebarHelper.itemLinkClass( '/read', path, {
						'sidebar-streams__following': true,
					} ) }
					label={ translate( 'Followed Sites' ) }
					onNavigate={ this.handleReaderSidebarFollowedSitesClicked }
					materialIcon="check_circle"
					link="/read"
				/>

				<SidebarItem
					className={ ReaderSidebarHelper.itemLinkClass( '/read/conversations', path, {
						'sidebar-streams__conversations': true,
					} ) }
					label={ translate( 'Conversations' ) }
					onNavigate={ this.handleReaderSidebarConversationsClicked }
					materialIcon="question_answer"
					link="/read/conversations"
				/>

				{ isDiscoverEnabled() && (
					<SidebarItem
						className={ ReaderSidebarHelper.itemLinkClass( '/discover', path, {
							'sidebar-streams__discover': true,
						} ) }
						label={ translate( 'Discover' ) }
						onNavigate={ this.handleReaderSidebarDiscoverClicked }
						icon="my-sites"
						link="/discover"
					/>
				) }

				<SidebarItem
					label={ translate( 'Search' ) }
					onNavigate={ this.handleReaderSidebarSearchClicked }
					materialIcon="search"
					link="/read/search"
					className={ ReaderSidebarHelper.itemLinkClass( '/read/search', path, {
						'sidebar-streams__search': true,
					} ) }
				/>

				<SidebarItem
					label={ translate( 'My Likes' ) }
					onNavigate={ this.handleReaderSidebarLikeActivityClicked }
					materialIcon="star_border"
					link="/activities/likes"
					className={ ReaderSidebarHelper.itemLinkClass( '/activities/likes', path, {
						'sidebar-activity__likes': true,
					} ) }
				/>

				{ ( this.props.subscribedLists?.length > 0 || isEnabled( 'reader/list-management' ) ) && (
					<ReaderSidebarLists
						lists={ this.props.subscribedLists }
						path={ path }
						isOpen={ this.props.isListsOpen }
						onClick={ this.props.toggleListsVisibility }
						currentListOwner={ this.state.currentListOwner }
						currentListSlug={ this.state.currentListSlug }
					/>
				) }

				<ReaderSidebarTags
					tags={ this.props.followedTags }
					path={ path }
					isOpen={ this.props.isTagsOpen }
					onClick={ this.props.toggleTagsVisibility }
					onFollowTag={ this.highlightNewTag }
					currentTag={ this.state.currentTag }
				/>
			</SidebarMenu>
		);
	}

	renderForAutomattic() {
		const { path, translate } = this.props;
		return (
			<SidebarMenu>
				<QueryReaderLists />
				<QueryReaderTeams />
				<QueryReaderOrganizations />

				<SidebarItem
					label={ translate( 'Search' ) }
					onNavigate={ this.handleReaderSidebarSearchClicked }
					materialIcon="search"
					link="/read/search"
					className={ ReaderSidebarHelper.itemLinkClass( '/read/search', path, {
						'sidebar-streams__search': true,
					} ) }
				/>
				{ isDiscoverEnabled() && (
					<SidebarItem
						className={ ReaderSidebarHelper.itemLinkClass( '/discover', path, {
							'sidebar-streams__discover': true,
						} ) }
						label={ translate( 'Discover' ) }
						onNavigate={ this.handleReaderSidebarDiscoverClicked }
						icon="my-sites"
						link="/discover"
					/>
				) }

				<SidebarSeparator />
				<li>
					<ReaderSidebarFollowedSites path={ path } />
				</li>
				<li>
					<ReaderSidebarOrganizations organizations={ this.props.organizations } path={ path } />
				</li>
				<SidebarSeparator />

				<SidebarItem
					className={ ReaderSidebarHelper.itemLinkClass( '/read/conversations', path, {
						'sidebar-streams__conversations': true,
					} ) }
					label={ translate( 'Conversations' ) }
					onNavigate={ this.handleReaderSidebarConversationsClicked }
					materialIcon="question_answer"
					link="/read/conversations"
				/>

				<SidebarItem
					className={ ReaderSidebarHelper.itemLinkClass( '/read/conversations/a8c', path, {
						'sidebar-streams__conversations': true,
					} ) }
					label="A8C Conversations"
					onNavigate={ this.handleReaderSidebarA8cConversationsClicked }
					link="/read/conversations/a8c"
					customIcon={ <A8CConversationsIcon /> }
				/>

				<SidebarItem
					label={ translate( 'My Likes' ) }
					onNavigate={ this.handleReaderSidebarLikeActivityClicked }
					materialIcon="star_border"
					link="/activities/likes"
					className={ ReaderSidebarHelper.itemLinkClass( '/activities/likes', path, {
						'sidebar-activity__likes': true,
					} ) }
				/>

				{ ( this.props.subscribedLists?.length > 0 || isEnabled( 'reader/list-management' ) ) && (
					<ReaderSidebarLists
						lists={ this.props.subscribedLists }
						path={ path }
						isOpen={ this.props.isListsOpen }
						onClick={ this.props.toggleListsVisibility }
						currentListOwner={ this.state.currentListOwner }
						currentListSlug={ this.state.currentListSlug }
					/>
				) }

				<ReaderSidebarTags
					tags={ this.props.followedTags }
					path={ path }
					isOpen={ this.props.isTagsOpen }
					onClick={ this.props.toggleTagsVisibility }
					onFollowTag={ this.highlightNewTag }
					currentTag={ this.state.currentTag }
				/>
			</SidebarMenu>
		);
	}

	render() {
		const { teams } = this.props;
		return (
			<Sidebar onClick={ this.handleClick }>
				<SidebarRegion>
					<ReaderSidebarNudges />

					{ isAutomatticTeamMember( teams ) && this.renderForAutomattic() }
					{ ! isAutomatticTeamMember( teams ) && this.renderForRegularUsers() }
				</SidebarRegion>

				<ReaderSidebarPromo />

				<SidebarFooter />
			</Sidebar>
		);
	}
}

ReaderSidebar.defaultProps = {
	translate: identity,
};

export default connect(
	( state ) => {
		return {
			isListsOpen: isListsOpen( state ),
			isTagsOpen: isTagsOpen( state ),
			subscribedLists: getSubscribedLists( state ),
			teams: getReaderTeams( state ),
			organizations: getReaderOrganizations( state ),
		};
	},
	{
		recordReaderTracksEvent,
		setNextLayoutFocus,
		toggleListsVisibility: toggleReaderSidebarLists,
		toggleTagsVisibility: toggleReaderSidebarTags,
	}
)( localize( ReaderSidebar ) );
