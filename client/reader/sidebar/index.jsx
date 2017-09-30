/** @format */
/**
 * External dependencies
 */
import closest from 'component-closest';
import createReactClass from 'create-react-class';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { defer, startsWith, identity, every } from 'lodash';
import page from 'page';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from 'store';

/**
 * Internal dependencies
 */
import ReaderSidebarHelper from './helper';
import ReaderSidebarLists from './reader-sidebar-lists';
import ReaderSidebarTags from './reader-sidebar-tags';
import ReaderSidebarTeams from './reader-sidebar-teams';
import AppPromo from 'blocks/app-promo';
import QueryReaderLists from 'components/data/query-reader-lists';
import QueryReaderTeams from 'components/data/query-reader-teams';
import config from 'config';
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';
import observe from 'lib/mixins/data-observe';
import ReaderListsStore from 'lib/reader-lists/lists';
import userSettings from 'lib/user-settings';
import userUtils from 'lib/user/utils';
import viewport from 'lib/viewport';
import { isDiscoverEnabled } from 'reader/discover/helper';
import { isAutomatticTeamMember } from 'reader/lib/teams';
import { getTagStreamUrl } from 'reader/route';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import { getSubscribedLists } from 'state/reader/lists/selectors';
import { getReaderTeams } from 'state/selectors';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { toggleReaderSidebarLists, toggleReaderSidebarTags } from 'state/ui/reader/sidebar/actions';
import url from 'url';

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
						<SidebarHeading>{ this.props.translate( 'Streams' ) }</SidebarHeading>
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
							{ config.isEnabled( 'reader/conversations' ) && (
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
								</li>
							) }
							<ReaderSidebarTeams teams={ this.props.teams } path={ this.props.path } />
							{ config.isEnabled( 'reader/conversations' ) &&
							isAutomatticTeamMember( this.props.teams ) && (
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
											<path d="M12.2 7.1c.5.3.6 1 .3 1.4L10 12.4c-.3.5-1 .7-1.4.3-.6-.3-.8-1-.4-1.5l2.5-3.9c.3-.4 1-.5 1.5-.2zM17.3 21.2h2.8c1 0 1.9-.8 1.9-1.9v-4.7c0-1-.8-1.9-1.9-1.9h-7.6c-1 .1-1.7.9-1.7 1.9v4.7c0 1 .8 1.8 1.7 1.9h2V24l2.8-2.8z" />
											<path d="M8.8 15.2c-2.7-.7-4.1-2.9-4.1-5.2 0-5.8 5.8-5.7 5.8-5.7 5.8 0 5.8 5.7 5.8 5.7 0 .3 0 .6-.1.8H19v-.7C19 1.6 10.4 2 10.4 2c-8.6 0-8.5 8.1-8.5 8.1 0 3.5 2.7 6.8 6.9 7.5v-2.4z" />
										</svg>
										<span className="menu-link-text">A8C Conversations</span>
									</a>
								</li>
							) }

							{ isDiscoverEnabled() ? (
								<li
									className={ ReaderSidebarHelper.itemLinkClass( '/discover', this.props.path, {
										'sidebar-streams__discover': true,
									} ) }
								>
									<a href="/discover" onClick={ this.handleReaderSidebarDiscoverClicked }>
										<Gridicon icon="my-sites" />
										<span className="menu-link-text">{ this.props.translate( 'Discover' ) }</span>
									</a>
								</li>
							) : null }

							{ config.isEnabled( 'reader/search' ) && (
								<li
									className={ ReaderSidebarHelper.itemLinkClass( '/read/search', this.props.path, {
										'sidebar-streams__search': true,
									} ) }
								>
									<a href="/read/search" onClick={ this.handleReaderSidebarSearchClicked }>
										<Gridicon icon="search" size={ 24 } />
										<span className="menu-link-text">{ this.props.translate( 'Search' ) }</span>
									</a>
								</li>
							) }

							<li
								className={ ReaderSidebarHelper.itemLinkClass(
									'/activities/likes',
									this.props.path,
									{ 'sidebar-activity__likes': true }
								) }
							>
								<a href="/activities/likes" onClick={ this.handleReaderSidebarLikeActivityClicked }>
									<Gridicon icon="star" size={ 24 } />
									<span className="menu-link-text">{ this.props.translate( 'My Likes' ) }</span>
								</a>
							</li>
						</ul>
					</SidebarMenu>

					<QueryReaderLists />
					<QueryReaderTeams />
					{ this.props.subscribedLists && this.props.subscribedLists.length ? (
						<ReaderSidebarLists
							lists={ this.props.subscribedLists }
							path={ this.props.path }
							isOpen={ this.props.isListsOpen }
							onClick={ this.props.toggleListsVisibility }
							currentListOwner={ this.state.currentListOwner }
							currentListSlug={ this.state.currentListSlug }
						/>
					) : null }
					<ReaderSidebarTags
						tags={ this.props.followedTags }
						path={ this.props.path }
						isOpen={ this.props.isTagsOpen }
						onClick={ this.props.toggleTagsVisibility }
						onFollowTag={ this.highlightNewTag }
						currentTag={ this.state.currentTag }
					/>
				</SidebarRegion>

				{ this.props.shouldRenderAppPromo && (
					<div className="sidebar__app-promo">
						<AppPromo location="reader" locale={ userUtils.getLocaleSlug() } />
					</div>
				) }

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
