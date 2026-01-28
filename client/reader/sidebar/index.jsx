import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import closest from 'component-closest';
import i18n, { localize, useTranslate } from 'i18n-calypso';
import { defer, startsWith } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryReaderLists from 'calypso/components/data/query-reader-lists';
import QueryReaderOrganizations from 'calypso/components/data/query-reader-organizations';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import { withCurrentRoute } from 'calypso/components/route';
import GlobalSidebar, { GLOBAL_SIDEBAR_EVENTS } from 'calypso/layout/global-sidebar';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import AppTitle from 'calypso/reader/components/app-title';
import ReaderA8cConversationsIcon from 'calypso/reader/components/icons/a8c-conversations-icon';
import ReaderConversationsIcon from 'calypso/reader/components/icons/conversations-icon';
import ReaderDiscoverIcon from 'calypso/reader/components/icons/discover-icon';
import ReaderLikesIcon from 'calypso/reader/components/icons/likes-icon';
import ReaderManageSubscriptionsIcon from 'calypso/reader/components/icons/manage-subscriptions-icon';
import ReaderSearchIcon from 'calypso/reader/components/icons/search-icon';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { getTagStreamUrl } from 'calypso/reader/route';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getSubscribedLists } from 'calypso/state/reader/lists/selectors';
import { getReaderOrganizations } from 'calypso/state/reader/organizations/selectors';
import { isReaderMSDEnabled } from 'calypso/state/reader-ui/selectors';
import {
	toggleReaderSidebarLists,
	toggleReaderSidebarFollowing,
	toggleReaderSidebarTags,
} from 'calypso/state/reader-ui/sidebar/actions';
import {
	isListsOpen,
	isFollowingOpen,
	isTagsOpen,
} from 'calypso/state/reader-ui/sidebar/selectors';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import ReaderSidebarHelper from './helper';
import ReaderSidebarLists from './reader-sidebar-lists';
import ReaderSidebarNudges from './reader-sidebar-nudges';
import ReaderSidebarOrganizations from './reader-sidebar-organizations';
import ReaderSidebarRecent from './reader-sidebar-recent';
import ReaderSidebarTags from './reader-sidebar-tags';
import 'calypso/my-sites/sidebar/style.scss'; // Copy styles from the My Sites sidebar.
import './style.scss';

//TODO: Remove this component once the new reader MSD is enabled for all users
const DeprecatedReaderSidebarHeader = ( { onSearchClicked } ) => {
	const translate = useTranslate();
	return (
		<div className="sidebar-header">
			<div>
				<h3>{ translate( 'Reader' ) }</h3>
				<p>{ translate( 'Keep up with your interests.' ) }</p>
			</div>
			<Button
				className="reader-search-icon"
				variant="tertiary"
				href="/reader/search"
				onClick={ onSearchClicked }
				aria-label={ translate( 'Search' ) }
			>
				<ReaderSearchIcon />
			</Button>
		</div>
	);
};

const TrackingKeys = {
	conversations: {
		action: 'clicked_reader_sidebar_conversations',
		gaEvent: 'Clicked Reader Sidebar Conversations',
		tracksEvent: 'calypso_reader_sidebar_conversations_clicked',
	},
	a8cConversations: {
		action: 'clicked_reader_sidebar_a8c_conversations',
		gaEvent: 'Clicked Reader Sidebar A8C Conversations',
		tracksEvent: 'calypso_reader_sidebar_automattic_conversations_clicked',
	},
	discover: {
		action: 'clicked_reader_sidebar_discover',
		gaEvent: 'Clicked Reader Sidebar Discover',
		tracksEvent: 'calypso_reader_sidebar_discover_clicked',
	},
	search: {
		action: 'clicked_reader_sidebar_search',
		gaEvent: 'Clicked Reader Sidebar Search',
		tracksEvent: 'calypso_reader_sidebar_search_clicked',
	},
	likeActivity: {
		action: 'clicked_reader_sidebar_like_activity',
		gaEvent: 'Clicked Reader Sidebar Like Activity',
		tracksEvent: 'calypso_reader_sidebar_like_activity_clicked',
	},
	manageSubscriptions: {
		action: 'clicked_reader_sidebar_manage_subscriptions',
		gaEvent: 'Clicked Reader Sidebar Manage Subscriptions',
		tracksEvent: 'calypso_reader_sidebar_manage_subscriptions_clicked',
	},
};

export class ReaderSidebar extends Component {
	state = {};

	componentDidMount() {
		// If we're browsing a tag or list, open the sidebar menu
		this.openExpandableMenuForCurrentTagOrList();
	}

	handleClick = ( event ) => {
		if ( ! event.isDefaultPrevented() && closest( event.target, 'a,span' ) ) {
			this.props.setNextLayoutFocus( 'content' );
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

		if ( startsWith( this.props.path, '/reader/list/' ) ) {
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

	handleGlobalSidebarMenuItemClick = ( path ) => {
		this.props.recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.MENU_ITEM_CLICK, {
			section: 'read',
			path,
		} );
	};

	handleSidebarMenuClick = ( key ) => ( event, path ) => {
		const handler = TrackingKeys[ key ];
		if ( handler ) {
			recordAction( handler.action );
			recordGaEvent( handler.gaEvent );
			this.props.recordReaderTracksEvent( handler.tracksEvent );
			this.handleGlobalSidebarMenuItemClick( path );
		}
	};

	renderSidebarMenu() {
		const { path, translate, teams } = this.props;

		return (
			<div className="sidebar-menu-container">
				{ ! this.props.isMSDEnabled && (
					<DeprecatedReaderSidebarHeader
						onSearchClicked={ this.handleSidebarMenuClick( TrackingKeys.search ) }
					/>
				) }
				{ this.props.isMSDEnabled && <AppTitle /> }
				<SidebarMenu>
					<QueryReaderLists />
					<QueryReaderTeams />
					<QueryReaderOrganizations />

					<li className="sidebar-streams__following">
						<ReaderSidebarRecent
							onClick={ this.props.toggleFollowingVisibility }
							isOpen={ this.props.isFollowingOpen }
							path={ path }
						/>
					</li>

					<SidebarItem
						className={ clsx( 'sidebar-streams__search', {
							selected: path.startsWith( '/reader/search' ),
						} ) }
						label={ translate( 'Search' ) }
						onNavigate={ this.handleSidebarMenuClick( TrackingKeys.search ) }
						customIcon={ <ReaderSearchIcon /> }
						link="/reader/search"
					/>
					<SidebarItem
						className={ clsx( 'sidebar-streams__discover', {
							selected: path.startsWith( '/discover' ),
						} ) }
						label={ translate( 'Discover' ) }
						onNavigate={ this.handleSidebarMenuClick( TrackingKeys.discover ) }
						customIcon={ <ReaderDiscoverIcon viewBox="0 0 24 24" /> }
						link="/discover"
					/>

					<SidebarItem
						label={ translate( 'Likes' ) }
						onNavigate={ this.handleSidebarMenuClick( TrackingKeys.likeActivity ) }
						customIcon={ <ReaderLikesIcon viewBox="0 0 24 24" /> }
						link="/activities/likes"
						className={ ReaderSidebarHelper.itemLinkClass( '/activities/likes', path, {
							'sidebar-activity__likes': true,
						} ) }
					/>

					<SidebarItem
						className={ ReaderSidebarHelper.itemLinkClass( '/reader/conversations', path, {
							'sidebar-streams__conversations': true,
						} ) }
						label={ translate( 'Conversations' ) }
						onNavigate={ this.handleSidebarMenuClick( TrackingKeys.conversations ) }
						customIcon={ <ReaderConversationsIcon iconSize={ 24 } viewBox="0 0 24 24" /> }
						link="/reader/conversations"
					/>

					<ReaderSidebarLists
						lists={ this.props.subscribedLists }
						path={ path }
						isOpen={ this.props.isListsOpen }
						onClick={ this.props.toggleListsVisibility }
						currentListOwner={ this.state.currentListOwner }
						currentListSlug={ this.state.currentListSlug }
					/>

					<ReaderSidebarTags
						tags={ this.props.followedTags }
						path={ path }
						isOpen={ this.props.isTagsOpen }
						onClick={ this.props.toggleTagsVisibility }
						onFollowTag={ this.highlightNewTag }
						currentTag={ this.state.currentTag }
					/>

					{ this.props.organizations && (
						<>
							<SidebarSeparator />
							<ReaderSidebarOrganizations
								organizations={ this.props.organizations }
								path={ path }
							/>
						</>
					) }

					{ isAutomatticTeamMember( teams ) && (
						<SidebarItem
							className={ ReaderSidebarHelper.itemLinkClass( '/reader/conversations/a8c', path, {
								'sidebar-streams__conversations': true,
							} ) }
							label="A8C Conversations"
							onNavigate={ this.handleSidebarMenuClick( TrackingKeys.a8cConversations ) }
							link="/reader/conversations/a8c"
							customIcon={ <ReaderA8cConversationsIcon size={ 24 } viewBox="-2 -2 24 24" /> }
						/>
					) }

					<SidebarSeparator />

					<SidebarItem
						className={ ReaderSidebarHelper.itemLinkClass( '/reader/subscriptions', path, {
							'sidebar-streams__manage-subscriptions': true,
						} ) }
						label={ translate( 'Manage Subscriptions' ) }
						onNavigate={ this.handleSidebarMenuClick( TrackingKeys.manageSubscriptions ) }
						customIcon={ <ReaderManageSubscriptionsIcon size={ 24 } viewBox="0 0 24 24" /> }
						link="/reader/subscriptions"
					/>
					{ /*
					Keep a separator at the end to avoid having the last item covered by browser breadcrumbs,
					url links when hovering other items, etc. Otherwise when a user scrolls to the end of the
					sidebar, their cursor is generally on other menu items causing the urls to popup in the
					bottom right and obscure view the last menu item.
				*/ }
					<SidebarSeparator />
				</SidebarMenu>
			</div>
		);
	}

	render() {
		return (
			<GlobalSidebar
				path={ this.props.path }
				onClick={ this.handleClick }
				siteTitle={ i18n.translate( 'Reader' ) }
			>
				<ReaderSidebarNudges />
				{ this.renderSidebarMenu() }
			</GlobalSidebar>
		);
	}
}

export default withCurrentRoute(
	connect(
		( state ) => {
			return {
				isListsOpen: isListsOpen( state ),
				isFollowingOpen: isFollowingOpen( state ),
				isTagsOpen: isTagsOpen( state ),
				subscribedLists: getSubscribedLists( state ),
				teams: getReaderTeams( state ),
				organizations: getReaderOrganizations( state ),
				isMSDEnabled: isReaderMSDEnabled( state ),
			};
		},
		{
			recordReaderTracksEvent,
			recordTracksEvent,
			setNextLayoutFocus,
			toggleListsVisibility: toggleReaderSidebarLists,
			toggleFollowingVisibility: toggleReaderSidebarFollowing,
			toggleTagsVisibility: toggleReaderSidebarTags,
		}
	)( localize( ReaderSidebar ) )
);
