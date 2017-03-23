/**
 * External dependencies
 */
import React from 'react';
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

export const ReaderSidebar = React.createClass( {

	mixins: [
		observe( 'userSettings' ),
	],

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

	render() {
		return (
			<Sidebar onClick={ this.handleClick }>
				<SidebarRegion>
				<SidebarMenu>
					<SidebarHeading>{ this.props.translate( 'Streams' ) }</SidebarHeading>
					<ul>
						<li className={ ReaderSidebarHelper.itemLinkClass( '/', this.props.path, { 'sidebar-streams__following': true } ) }>
							<a href="/">
								<Gridicon icon="checkmark-circle" size={ 24 } />
								<span className="menu-link-text">{ this.props.translate( 'Followed Sites' ) }</span>
							</a>
							<a href="/following/edit" className="sidebar__button">{ this.props.translate( 'Manage' ) }</a>
						</li>

						<ReaderSidebarTeams teams={ this.props.teams } path={ this.props.path } />

						{
							isDiscoverEnabled()
							? (
									<li className={ ReaderSidebarHelper.itemLinkClass( '/discover', this.props.path, { 'sidebar-streams__discover': true } ) }>
										<a href="/discover">
											<Gridicon icon="my-sites" />
											<span className="menu-link-text">{ this.props.translate( 'Discover' ) }</span>
										</a>
									</li>
								) : null
						}

						{ config.isEnabled( 'reader/search' ) &&
							(
								<li className={ ReaderSidebarHelper.itemLinkClass( '/read/search', this.props.path, { 'sidebar-streams__search': true } ) }>
									<a href="/read/search">
										<Gridicon icon="search" size={ 24 } />
										<span className="menu-link-text">{ this.props.translate( 'Search' ) }</span>
									</a>
								</li>
							)
						}

						<li className={ ReaderSidebarHelper.itemLinkClass( '/activities/likes', this.props.path, { 'sidebar-activity__likes': true } ) }>
							<a href="/activities/likes">
								<Gridicon icon="star" size={ 24 } />
								<span className="menu-link-text">{ this.props.translate( 'My Likes' ) }</span>
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
				: null
				}
				<ReaderSidebarTags
					tags={ this.props.followedTags }
					path={ this.props.path }
					isOpen={ this.props.isTagsOpen }
					onClick={ this.props.toggleTagsVisibility }
					onFollowTag={ this.highlightNewTag }
					currentTag={ this.state.currentTag } />
			</SidebarRegion>

			{ this.props.shouldRenderAppPromo &&
				<div className="sidebar__app-promo">
					<AppPromo location="reader" locale={ userUtils.getLocaleSlug() } />
				</div>
			}

				<SidebarFooter />
			</Sidebar>
		);
	}
} );

ReaderSidebar.defaultProps = {
	translate: identity
};

export const shouldRenderAppPromo = ( options = { } ) => {
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
		isUserDesktopAppUser = haveUserSettingsLoaded || userSettings.getSetting( 'is_desktop_app_user' ),
		isUserOnChromeOs = /\bCrOS\b/.test( navigator.userAgent )
	} = options;

	return every( [
		! isDesktopPromoDisabled,
		isUserLocaleEnglish,
		! isViewportMobile,
		! isUserOnChromeOs,
		isDesktopPromoConfiguredToRun,
		! isUserDesktopAppUser
	] );
};

export default connect(
	( state ) => {
		return {
			isListsOpen: state.ui.reader.sidebar.isListsOpen,
			isTagsOpen: state.ui.reader.sidebar.isTagsOpen,
			subscribedLists: getSubscribedLists( state ),
			shouldRenderAppPromo: shouldRenderAppPromo(),
			teams: getReaderTeams( state ),
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			toggleListsVisibility: toggleReaderSidebarLists,
			toggleTagsVisibility: toggleReaderSidebarTags,
			setNextLayoutFocus,
		}, dispatch );
	}
)( localize( ReaderSidebar ) );
