/** @format */
/**
 * External dependencies
 */
import React from 'react';
import createReactClass from 'create-react-class';
import closest from 'component-closest';
import page from 'page';
import url from 'url';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { defer, startsWith, identity, every } from 'lodash';
import store from 'store';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import ReaderListsStore from 'lib/reader-lists/lists';
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';
import { isDiscoverEnabled } from 'reader/discover/helper';
import ReaderSidebarTags from './reader-sidebar-tags';
import ReaderSidebarLists from './reader-sidebar-lists';
import ReaderSidebarTeams from './reader-sidebar-teams';
import ReaderSidebarHelper from './helper';
import { toggleReaderSidebarLists, toggleReaderSidebarTags } from 'state/ui/reader/sidebar/actions';
import { getSubscribedLists } from 'state/reader/lists/selectors';
import { getReaderTeams } from 'state/selectors';
import QueryReaderLists from 'components/data/query-reader-lists';
import QueryReaderTeams from 'components/data/query-reader-teams';
import observe from 'lib/mixins/data-observe';
import config from 'config';
import userSettings from 'lib/user-settings';
import AppPromo from 'blocks/app-promo';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import userUtils from 'lib/user/utils';
import viewport from 'lib/viewport';
import { localize } from 'i18n-calypso';
import { getTagStreamUrl } from 'reader/route';
import { isAutomatticTeamMember } from 'reader/lib/teams';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

export const ReaderSidebar = createReactClass( {
	displayName: 'ReaderSidebar',
	mixins: [ observe( 'userSettings' ) ],

	getInitialState() {
		return {};
	},

	componentDidMount() {
		// If we're browsing a tag or list, open the sidebar menu
		this.openExpandableMenuForCurrentTagOrList();
	},

	handleClick( event ) {
		if ( ! event.isDefaultPrevented() && closest( event.target, 'a,span', true ) ) {
			this.props.setNextLayoutFocus( 'content' );
			window.scrollTo( 0, 0 );
		}
	},

	highlightNewList( list ) {
		list = ReaderListsStore.get( list.owner, list.slug );
		window.location.href = url.resolve( 'https://wordpress.com', list.URL + '/edit' );
	},

	highlightNewTag( tagSlug ) {
		const tagStreamUrl = getTagStreamUrl( tagSlug );
		if ( tagStreamUrl !== page.current ) {
			defer( function() {
				page( tagStreamUrl );
				window.scrollTo( 0, 0 );
			} );
		}
	},

	openExpandableMenuForCurrentTagOrList() {
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
	},

	handleReaderSidebarFollowedSitesClicked() {
		recordAction( 'clicked_reader_sidebar_followed_sites' );
		recordGaEvent( 'Clicked Reader Sidebar Followed Sites' );
		recordTrack( 'calypso_reader_sidebar_followed_sites_clicked' );
	},

	handleReaderSidebarFollowManageClicked() {
		recordAction( 'clicked_reader_sidebar_follow_manage' );
		recordGaEvent( 'Clicked Reader Sidebar Follow Manage' );
		recordTrack( 'calypso_reader_sidebar_follow_manage_clicked' );
	},

	handleReaderSidebarConversationsClicked() {
		recordAction( 'clicked_reader_sidebar_conversations' );
		recordGaEvent( 'Clicked Reader Sidebar Conversations' );
		recordTrack( 'calypso_reader_sidebar_conversations_clicked' );
	},

	handleReaderSidebarA8cConversationsClicked() {
		recordAction( 'clicked_reader_sidebar_a8c_conversations' );
		recordGaEvent( 'Clicked Reader Sidebar A8C Conversations' );
		recordTrack( 'calypso_reader_sidebar_a8c_conversations_clicked' );
	},

	handleReaderSidebarDiscoverClicked() {
		recordAction( 'clicked_reader_sidebar_discover' );
		recordGaEvent( 'Clicked Reader Sidebar Discover' );
		recordTrack( 'calypso_reader_sidebar_discover_clicked' );
	},

	handleReaderSidebarSearchClicked() {
		recordAction( 'clicked_reader_sidebar_search' );
		recordGaEvent( 'Clicked Reader Sidebar Search' );
		recordTrack( 'calypso_reader_sidebar_search_clicked' );
	},

	handleReaderSidebarLikeActivityClicked() {
		recordAction( 'clicked_reader_sidebar_like_activity' );
		recordGaEvent( 'Clicked Reader Sidebar Like Activity' );
		recordTrack( 'calypso_reader_sidebar_like_activity_clicked' );
	},

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace,max-len */
		return (
			<Sidebar onClick={ this.handleClick }>
				<SidebarRegion>
					<SidebarMenu>
						<SidebarHeading>
							{ this.props.translate( 'Streams' ) }
						</SidebarHeading>
						<ul>
							<li
								className={ ReaderSidebarHelper.itemLinkClass( '/', this.props.path, {
									'sidebar-streams__following': true,
								} ) }
							>
								<a href="/" onClick={ this.handleReaderSidebarFollowedSitesClicked }>
									<Gridicon icon="checkmark-circle" size={ 24 } />
									<span className="menu-link-text">
										{ this.props.translate( 'Followed Sites' ) }
									</span>
								</a>
								<a
									href="/following/manage"
									onClick={ this.handleReaderSidebarFollowManageClicked }
									className="sidebar__button"
								>
									{ this.props.translate( 'Manage' ) }
								</a>
							</li>
							{ config.isEnabled( 'reader/conversations' ) &&
								<li
									className={ ReaderSidebarHelper.itemLinkClass(
										'/read/conversations',
										this.props.path,
										{
											'sidebar-streams__conversations': true,
										}
									) }
								>
									<a
										href="/read/conversations"
										onClick={ this.handleReaderSidebarConversationsClicked }
									>
										<Gridicon icon="chat" size={ 24 } />
										<span className="menu-link-text">
											{ this.props.translate( 'Conversations' ) }
										</span>
									</a>
								</li> }
							<ReaderSidebarTeams teams={ this.props.teams } path={ this.props.path } />
							{ config.isEnabled( 'reader/conversations' ) &&
								isAutomatticTeamMember( this.props.teams ) &&
								<li
									className={ ReaderSidebarHelper.itemLinkClass(
										'/read/conversations/a8c',
										this.props.path,
										{
											'sidebar-streams__conversations': true,
										}
									) }
								>
									<a
										href="/read/conversations/a8c"
										onClick={ this.handleReaderSidebarA8cConversationsClicked }
									>
										<svg
											className={ 'gridicon gridicon-automattic-conversations' }
											width="24"
											height="24"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
										>
											<path d="M12.2 8c.5.3.6 1 .3 1.4L10 13.3c-.3.5-1 .7-1.4.3-.6-.3-.8-1-.4-1.5l2.5-3.9c.4-.4 1-.5 1.5-.2zM12.7 13h7c1 0 1.8.8 1.8 1.8v4.3c0 1.1-.5 2.2-1.5 2.9l-2.9 2v-3.1h-4.4c-1 0-1.8-.8-1.8-1.8v-4.4c.1-.9.9-1.7 1.8-1.7z" />
											<path d="M16.3 11.3c0 .2 0 .5-.1.7H19v-1c0-4-3.4-7.6-8.5-7.6S2 7.1 2 11v.4c0 3.8 3.1 7.4 8 7.6v-2.3c-3.4-.2-5.2-2.7-5.2-5.4V11c0-2.8 2-5.3 5.8-5.3s5.8 2.5 5.8 5.3v.3z" />
										</svg>
										<span className="menu-link-text">A8C Conversations</span>
									</a>
								</li> }

							{ isDiscoverEnabled()
								? <li
										className={ ReaderSidebarHelper.itemLinkClass( '/discover', this.props.path, {
											'sidebar-streams__discover': true,
										} ) }
									>
										<a href="/discover" onClick={ this.handleReaderSidebarDiscoverClicked }>
											<Gridicon icon="my-sites" />
											<span className="menu-link-text">
												{ this.props.translate( 'Discover' ) }
											</span>
										</a>
									</li>
								: null }

							{ config.isEnabled( 'reader/search' ) &&
								<li
									className={ ReaderSidebarHelper.itemLinkClass( '/read/search', this.props.path, {
										'sidebar-streams__search': true,
									} ) }
								>
									<a href="/read/search" onClick={ this.handleReaderSidebarSearchClicked }>
										<Gridicon icon="search" size={ 24 } />
										<span className="menu-link-text">
											{ this.props.translate( 'Search' ) }
										</span>
									</a>
								</li> }

							<li
								className={ ReaderSidebarHelper.itemLinkClass(
									'/activities/likes',
									this.props.path,
									{ 'sidebar-activity__likes': true }
								) }
							>
								<a href="/activities/likes" onClick={ this.handleReaderSidebarLikeActivityClicked }>
									<Gridicon icon="star" size={ 24 } />
									<span className="menu-link-text">
										{ this.props.translate( 'My Likes' ) }
									</span>
								</a>
							</li>
						</ul>
					</SidebarMenu>

					<QueryReaderLists />
					<QueryReaderTeams />
					{ this.props.subscribedLists && this.props.subscribedLists.length
						? <ReaderSidebarLists
								lists={ this.props.subscribedLists }
								path={ this.props.path }
								isOpen={ this.props.isListsOpen }
								onClick={ this.props.toggleListsVisibility }
								currentListOwner={ this.state.currentListOwner }
								currentListSlug={ this.state.currentListSlug }
							/>
						: null }
					<ReaderSidebarTags
						tags={ this.props.followedTags }
						path={ this.props.path }
						isOpen={ this.props.isTagsOpen }
						onClick={ this.props.toggleTagsVisibility }
						onFollowTag={ this.highlightNewTag }
						currentTag={ this.state.currentTag }
					/>
				</SidebarRegion>

				{ this.props.shouldRenderAppPromo &&
					<div className="sidebar__app-promo">
						<AppPromo location="reader" locale={ userUtils.getLocaleSlug() } />
					</div> }

				<SidebarFooter />
			</Sidebar>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace,max-len */
	},
} );

ReaderSidebar.defaultProps = {
	translate: identity,
};

export const shouldRenderAppPromo = ( options = {} ) => {
	// Until the user settings have loaded we'll indicate the user is is a
	// desktop app user because until the user settings have loaded
	// userSettings.getSetting( 'is_desktop_app_user' ) will return false which
	// makes the app think the user isn't a desktop app user for a few seconds
	// resulting in the AppPromo potentially flashing in then out as soon as
	// the user settings does properly indicate that the user is one.
	const haveUserSettingsLoaded = userSettings.getSetting( ' is_desktop_app_user' ) === null;
	const {
		isDesktopPromoDisabled = store.get( 'desktop_promo_disabled' ),
		isViewportMobile = viewport.isMobile(),
		isUserLocaleEnglish = 'en' === userUtils.getLocaleSlug(),
		isDesktopPromoConfiguredToRun = config.isEnabled( 'desktop-promo' ),
		isUserDesktopAppUser = haveUserSettingsLoaded ||
			userSettings.getSetting( 'is_desktop_app_user' ),
		isUserOnChromeOs = /\bCrOS\b/.test( navigator.userAgent ),
	} = options;

	return every( [
		! isDesktopPromoDisabled,
		isUserLocaleEnglish,
		! isViewportMobile,
		! isUserOnChromeOs,
		isDesktopPromoConfiguredToRun,
		! isUserDesktopAppUser,
	] );
};

export default connect(
	state => {
		return {
			isListsOpen: state.ui.reader.sidebar.isListsOpen,
			isTagsOpen: state.ui.reader.sidebar.isTagsOpen,
			subscribedLists: getSubscribedLists( state ),
			shouldRenderAppPromo: shouldRenderAppPromo(),
			teams: getReaderTeams( state ),
		};
	},
	dispatch => {
		return bindActionCreators(
			{
				toggleListsVisibility: toggleReaderSidebarLists,
				toggleTagsVisibility: toggleReaderSidebarTags,
				setNextLayoutFocus,
			},
			dispatch
		);
	}
)( localize( ReaderSidebar ) );
