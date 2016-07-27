/**
 * External dependencies
 */
import React from 'react';
import closest from 'component-closest';
import page from 'page';
import url from 'url';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { defer, startsWith } from 'lodash';

/**
 * Internal Dependencies
 */
import layoutFocus from 'lib/layout-focus';
import ReaderTagsSubscriptionStore from 'lib/reader-tags/subscriptions';
import ReaderListsSubscriptionsStore from 'lib/reader-lists/subscriptions';
import ReaderListsStore from 'lib/reader-lists/lists';
import ReaderTeams from 'lib/reader-teams';
import Sidebar from 'layout/sidebar';
import SidebarActions from 'lib/reader-sidebar/actions';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';
import Gridicon from 'components/gridicon';
import { isDiscoverEnabled } from 'reader/discover/helper';
import ReaderSidebarTags from './reader-sidebar-tags';
import ReaderSidebarLists from './reader-sidebar-lists';
import ReaderSidebarTeams from './reader-sidebar-teams';
import ReaderSidebarHelper from './helper';
import { toggleReaderSidebarLists, toggleReaderSidebarTags } from 'state/ui/reader/sidebar/actions';
import { getSubscribedLists } from 'state/reader/lists/selectors';
import QueryReaderLists from 'components/data/query-reader-lists';
import observe from 'lib/mixins/data-observe';
import config from 'config';
import userSettings from 'lib/user-settings';
import AppPromo from 'components/app-promo';

const ReaderSidebar = React.createClass( {

	mixins: [
		observe( 'userSettings' ),
	],

	componentDidMount() {
		ReaderTagsSubscriptionStore.on( 'change', this.updateState );
		ReaderTagsSubscriptionStore.on( 'add', this.highlightNewTag );
		ReaderListsStore.on( 'change', this.updateState );
		ReaderListsSubscriptionsStore.on( 'change', this.updateState );
		ReaderListsSubscriptionsStore.on( 'create', this.highlightNewList );
		ReaderTeams.on( 'change', this.updateState );

		// If we're browsing a tag or list, open the sidebar menu
		this.openExpandableMenuForCurrentTagOrList();
	},

	componentWillUnmount() {
		ReaderTagsSubscriptionStore.off( 'change', this.updateState );
		ReaderTagsSubscriptionStore.off( 'add', this.highlightNewTag );
		ReaderListsStore.off( 'change', this.updateState );
		ReaderListsSubscriptionsStore.off( 'change', this.updateState );
		ReaderListsSubscriptionsStore.off( 'create', this.highlightNewList );
		ReaderTeams.off( 'change', this.updateState );
	},

	getInitialState() {
		return this.getStateFromStores();
	},

	getStateFromStores() {
		const tags = ReaderTagsSubscriptionStore.get();
		const teams = ReaderTeams.get();

		if ( ! ( tags && teams ) ) {
			SidebarActions.fetch();
		}

		return {
			tags,
			teams
		};
	},

	updateState() {
		this.setState( this.getStateFromStores() );
	},

	handleClick( event ) {
		if ( ! event.isDefaultPrevented() && closest( event.target, 'a,span', true ) ) {
			layoutFocus.setNext( 'content' );
			window.scrollTo( 0, 0 );
		}
	},

	highlightNewList( list ) {
		list = ReaderListsStore.get( list.owner, list.slug );
		window.location.href = url.resolve( 'https://wordpress.com', list.URL + '/edit' );
	},

	highlightNewTag( tag ) {
		defer( function() {
			page( '/tag/' + tag.slug );
			window.scrollTo( 0, 0 );
		} );
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

	renderAppPromo() {
		// if promo not configured return
		if ( ! config.isEnabled( 'desktop-promo' ) ) {
			return;
		}

		// if user settings not loaded, return so we dont show
		// before we can check if user is already a desktop user
		if ( userSettings.getSetting( 'is_desktop_app_user' ) === null ) {
			return;
		}

		// if already using desktop app, dont show promo
		if ( userSettings.getSetting( 'is_desktop_app_user' ) ) {
			return;
		}

		// made it through the gauntlet, show the promo!
		return (
			<AppPromo location="reader" />
		);
	},

	render() {
		return (
			<Sidebar onClick={ this.handleClick }>
				<SidebarRegion>
				<SidebarMenu>
					<SidebarHeading>{ this.translate( 'Streams' ) }</SidebarHeading>
					<ul>
						<li className={ ReaderSidebarHelper.itemLinkClass( '/', this.props.path, { 'sidebar-streams__following': true } ) }>
							<a href="/">
								<Gridicon icon="checkmark-circle" size={ 24 } />
								<span className="menu-link-text">{ this.translate( 'Followed Sites' ) }</span>
							</a>
							<a href="/following/edit" className="sidebar__button">{ this.translate( 'Manage' ) }</a>
						</li>

						<ReaderSidebarTeams teams={ this.state.teams } path={ this.props.path } />

						{
							// Post Recommendations - Used by the Data team to test recommendation algorithms
							config.isEnabled( 'reader/recommendations/posts' ) &&
							(
								<li className={ ReaderSidebarHelper.itemLinkClass( '/recommendations/posts', this.props.path, { 'sidebar-streams__post-recommendations': true } ) }>
									<a href="/recommendations/posts">
										<Gridicon icon="star" size={ 24 } />
										<span className="menu-link-text">{ this.translate( 'Recommended Posts (Alpha)' ) }</span>
									</a>
								</li>
							)
						}

						{
							// Post Recommendations Cold Start - Used by the Data team to test cold start algorithms
							config.isEnabled( 'reader/recommendations/posts' ) &&
							(
								<li className={ ReaderSidebarHelper.itemLinkClass( '/recommendations/cold', this.props.path, { 'sidebar-streams__post-recommendations': true } ) }>
									<a href="/recommendations/cold">
										<Gridicon icon="star" size={ 24 } />
										<span className="menu-link-text">{ this.translate( 'Coldstart (Alpha)' ) }</span>
									</a>
								</li>
							)
						}

						{
							isDiscoverEnabled()
							? (
									<li className={ ReaderSidebarHelper.itemLinkClass( '/discover', this.props.path, { 'sidebar-streams__discover': true } ) }>
										<a href="/discover">
											<Gridicon icon="my-sites" />
											<span className="menu-link-text">{ this.translate( 'Discover' ) }</span>
										</a>
									</li>
								) : null
						}

						{ config.isEnabled( 'reader/search' ) &&
							(
								<li className={ ReaderSidebarHelper.itemLinkClass( '/read/search', this.props.path, { 'sidebar-streams__search': true } ) }>
									<a href="/read/search">
										<Gridicon icon="search" size={ 24 } />
										<span className="menu-link-text">{ this.translate( 'Search' ) }</span>
									</a>
								</li>
							)
						}

						<li className={ ReaderSidebarHelper.itemLinkClass( '/recommendations', this.props.path, { 'sidebar-streams__recommendations': true } ) }>
							<a href="/recommendations">
								<Gridicon icon="thumbs-up" size={ 24 } />
								<span className="menu-link-text">{ this.translate( 'Recommendations' ) }</span>
							</a>
						</li>

						<li className={ ReaderSidebarHelper.itemLinkClass( '/activities/likes', this.props.path, { 'sidebar-activity__likes': true } ) }>
							<a href="/activities/likes">
								<Gridicon icon="star" size={ 24 } />
								<span className="menu-link-text">{ this.translate( 'My Likes' ) }</span>
							</a>
						</li>
					</ul>
				</SidebarMenu>

				<QueryReaderLists />
				<ReaderSidebarLists
					lists={ this.props.subscribedLists }
					path={ this.props.path }
					isOpen={ this.props.isListsOpen }
					onClick={ this.props.toggleListsVisibility }
					currentListOwner={ this.state.currentListOwner }
					currentListSlug={ this.state.currentListSlug } />

				<ReaderSidebarTags
					tags={ this.state.tags }
					path={ this.props.path }
					isOpen={ this.props.isTagsOpen }
					onClick={ this.props.toggleTagsVisibility }
					onTagExists={ this.highlightNewTag }
					currentTag={ this.state.currentTag } />

				</SidebarRegion>

				{ this.renderAppPromo() }

				<SidebarFooter />
			</Sidebar>
		);
	}
} );

export default connect(
	( state ) => {
		return {
			isListsOpen: state.ui.reader.sidebar.isListsOpen,
			isTagsOpen: state.ui.reader.sidebar.isTagsOpen,
			subscribedLists: getSubscribedLists( state )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			toggleListsVisibility: toggleReaderSidebarLists,
			toggleTagsVisibility: toggleReaderSidebarTags
		}, dispatch );
	}
)( ReaderSidebar );
