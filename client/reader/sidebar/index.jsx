import { isEnabled } from '@automattic/calypso-config';
import { hasTranslation } from '@wordpress/i18n';
import closest from 'component-closest';
import { localize } from 'i18n-calypso';
import { defer, startsWith } from 'lodash';
import page from 'page';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryReaderLists from 'calypso/components/data/query-reader-lists';
import QueryReaderOrganizations from 'calypso/components/data/query-reader-organizations';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import Sidebar from 'calypso/layout/sidebar';
import SidebarFooter from 'calypso/layout/sidebar/footer';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarRegion from 'calypso/layout/sidebar/region';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import ReaderA8cConversationsIcon from 'calypso/reader/components/icons/a8c-conversations-icon';
import ReaderConversationsIcon from 'calypso/reader/components/icons/conversations-icon';
import ReaderDiscoverIcon from 'calypso/reader/components/icons/discover-icon';
import ReaderFollowingIcon from 'calypso/reader/components/icons/following-icon';
import ReaderLikesIcon from 'calypso/reader/components/icons/likes-icon';
import ReaderNotificationsIcon from 'calypso/reader/components/icons/notifications-icon';
import ReaderSearchIcon from 'calypso/reader/components/icons/search-icon';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { getTagStreamUrl } from 'calypso/reader/route';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getSubscribedLists } from 'calypso/state/reader/lists/selectors';
import { getReaderOrganizations } from 'calypso/state/reader/organizations/selectors';
import {
	toggleReaderSidebarLists,
	toggleReaderSidebarTags,
} from 'calypso/state/reader-ui/sidebar/actions';
import { isListsOpen, isTagsOpen } from 'calypso/state/reader-ui/sidebar/selectors';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import ReaderSidebarHelper from './helper';
import ReaderSidebarPromo from './promo';
import ReaderSidebarLists from './reader-sidebar-lists';
import ReaderSidebarNudges from './reader-sidebar-nudges';
import ReaderSidebarOrganizations from './reader-sidebar-organizations';
import ReaderSidebarTags from './reader-sidebar-tags';
import 'calypso/my-sites/sidebar/style.scss'; // Copy styles from the My Sites sidebar.
import './style.scss';

export class ReaderSidebar extends Component {
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

	handleReaderSidebarNotificationsClicked = () => {
		recordAction( 'clicked_reader_sidebar_notifications' );
		recordGaEvent( 'Clicked Reader Sidebar Notifications' );
		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_notifications_clicked' );
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

	renderSidebar() {
		const { path, translate, teams, locale } = this.props;
		const recentLabelTranslationReady = hasTranslation( 'Recent' ) || locale.startsWith( 'en' );
		return (
			<SidebarMenu>
				<QueryReaderLists />
				<QueryReaderTeams />
				<QueryReaderOrganizations />

				<SidebarSeparator />

				<SidebarItem
					label={ translate( 'Search' ) }
					onNavigate={ this.handleReaderSidebarSearchClicked }
					customIcon={ <ReaderSearchIcon /> }
					link="/read/search"
					className={ ReaderSidebarHelper.itemLinkClass( '/read/search', path, {
						'sidebar-streams__search': true,
					} ) }
				/>

				<SidebarSeparator />

				<SidebarItem
					className={ ReaderSidebarHelper.itemLinkClass( '/read', path, {
						'sidebar-streams__following': true,
					} ) }
					label={ recentLabelTranslationReady ? translate( 'Recent' ) : translate( 'Following' ) }
					onNavigate={ this.handleReaderSidebarFollowedSitesClicked }
					customIcon={ <ReaderFollowingIcon /> }
					link="/read"
				/>

				<SidebarItem
					className={ ReaderSidebarHelper.itemLinkClass( '/discover', path, {
						'sidebar-streams__discover': true,
					} ) }
					label={ translate( 'Discover' ) }
					onNavigate={ this.handleReaderSidebarDiscoverClicked }
					customIcon={ <ReaderDiscoverIcon /> }
					link="/discover"
				/>

				<SidebarItem
					label={ translate( 'Likes' ) }
					onNavigate={ this.handleReaderSidebarLikeActivityClicked }
					customIcon={ <ReaderLikesIcon /> }
					link="/activities/likes"
					className={ ReaderSidebarHelper.itemLinkClass( '/activities/likes', path, {
						'sidebar-activity__likes': true,
					} ) }
				/>

				<SidebarItem
					className={ ReaderSidebarHelper.itemLinkClass( '/read/conversations', path, {
						'sidebar-streams__conversations': true,
					} ) }
					label={ translate( 'Conversations' ) }
					onNavigate={ this.handleReaderSidebarConversationsClicked }
					customIcon={ <ReaderConversationsIcon /> }
					link="/read/conversations"
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

				<SidebarSeparator />

				<li>
					<ReaderSidebarOrganizations organizations={ this.props.organizations } path={ path } />
				</li>

				{ isAutomatticTeamMember( teams ) && (
					<SidebarItem
						className={ ReaderSidebarHelper.itemLinkClass( '/read/conversations/a8c', path, {
							'sidebar-streams__conversations': true,
						} ) }
						label="A8C Conversations"
						onNavigate={ this.handleReaderSidebarA8cConversationsClicked }
						link="/read/conversations/a8c"
						customIcon={ <ReaderA8cConversationsIcon /> }
					/>
				) }

				<SidebarItem
					className={ ReaderSidebarHelper.itemLinkClass( '/read/notifications', path, {
						'sidebar-streams__notifications': true,
					} ) }
					label={ translate( 'Notifications' ) }
					onNavigate={ this.handleReaderSidebarNotificationsClicked }
					customIcon={ <ReaderNotificationsIcon /> }
					link="/read/notifications"
				/>
			</SidebarMenu>
		);
	}

	render() {
		return (
			<Sidebar onClick={ this.handleClick }>
				<SidebarRegion>
					<ReaderSidebarNudges />
					{ this.renderSidebar() }
				</SidebarRegion>

				<ReaderSidebarPromo />

				<SidebarFooter />
			</Sidebar>
		);
	}
}

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
