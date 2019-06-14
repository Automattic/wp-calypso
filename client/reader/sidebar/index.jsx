/** @format */
/**
 * External dependencies
 */
import closest from 'component-closest';
import Gridicon from 'gridicons';
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
import ReaderSidebarTeams from './reader-sidebar-teams';
import QueryReaderLists from 'components/data/query-reader-lists';
import QueryReaderTeams from 'components/data/query-reader-teams';
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';
import { isDiscoverEnabled } from 'reader/discover/helper';
import { isAutomatticTeamMember } from 'reader/lib/teams';
import { getTagStreamUrl } from 'reader/route';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import { getSubscribedLists } from 'state/reader/lists/selectors';
import getReaderTeams from 'state/selectors/get-reader-teams';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { toggleReaderSidebarLists, toggleReaderSidebarTags } from 'state/ui/reader/sidebar/actions';
import ReaderSidebarPromo from './promo';

/**
 * Style dependencies
 */
import './style.scss';

export class ReaderSidebar extends React.Component {
	state = {};

	componentDidMount() {
		// If we're browsing a tag or list, open the sidebar menu
		this.openExpandableMenuForCurrentTagOrList();
	}

	handleClick = event => {
		if ( ! event.isDefaultPrevented() && closest( event.target, 'a,span' ) ) {
			this.props.setNextLayoutFocus( 'content' );
			window.scrollTo( 0, 0 );
		}
	};

	highlightNewTag( tagSlug ) {
		const tagStreamUrl = getTagStreamUrl( tagSlug );
		if ( tagStreamUrl !== page.current ) {
			defer( function() {
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

	handleReaderSidebarFollowedSitesClicked() {
		recordAction( 'clicked_reader_sidebar_followed_sites' );
		recordGaEvent( 'Clicked Reader Sidebar Followed Sites' );
		recordTrack( 'calypso_reader_sidebar_followed_sites_clicked' );
	}

	handleReaderSidebarConversationsClicked() {
		recordAction( 'clicked_reader_sidebar_conversations' );
		recordGaEvent( 'Clicked Reader Sidebar Conversations' );
		recordTrack( 'calypso_reader_sidebar_conversations_clicked' );
	}

	handleReaderSidebarA8cConversationsClicked() {
		recordAction( 'clicked_reader_sidebar_a8c_conversations' );
		recordGaEvent( 'Clicked Reader Sidebar A8C Conversations' );
		recordTrack( 'calypso_reader_sidebar_automattic_conversations_clicked' );
	}

	handleReaderSidebarDiscoverClicked() {
		recordAction( 'clicked_reader_sidebar_discover' );
		recordGaEvent( 'Clicked Reader Sidebar Discover' );
		recordTrack( 'calypso_reader_sidebar_discover_clicked' );
	}

	handleReaderSidebarSearchClicked() {
		recordAction( 'clicked_reader_sidebar_search' );
		recordGaEvent( 'Clicked Reader Sidebar Search' );
		recordTrack( 'calypso_reader_sidebar_search_clicked' );
	}

	handleReaderSidebarLikeActivityClicked() {
		recordAction( 'clicked_reader_sidebar_like_activity' );
		recordGaEvent( 'Clicked Reader Sidebar Like Activity' );
		recordTrack( 'calypso_reader_sidebar_like_activity_clicked' );
	}

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
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
									<svg
										className="material-icon mi_check_circle"
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
									>
										<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
									</svg>
									<span className="menu-link-text">
										{ this.props.translate( 'Followed Sites' ) }
									</span>
								</a>
							</li>
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
									<svg
										className="material-icon mi_chat"
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
									>
										<path d="M4 4h16v12H5.17L4 17.17V4m0-2c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H4zm2 10h8v2H6v-2zm0-3h12v2H6V9zm0-3h12v2H6V6z" />
									</svg>
									<span className="menu-link-text">
										{ this.props.translate( 'Conversations' ) }
									</span>
								</a>
							</li>
							<ReaderSidebarTeams teams={ this.props.teams } path={ this.props.path } />
							{ isAutomatticTeamMember( this.props.teams ) && (
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

							<li
								className={ ReaderSidebarHelper.itemLinkClass( '/read/search', this.props.path, {
									'sidebar-streams__search': true,
								} ) }
							>
								<a href="/read/search" onClick={ this.handleReaderSidebarSearchClicked }>
									<svg
										className="material-icon mi_search"
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
									>
										<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
									</svg>
									<span className="menu-link-text">{ this.props.translate( 'Search' ) }</span>
								</a>
							</li>

							<li
								className={ ReaderSidebarHelper.itemLinkClass(
									'/activities/likes',
									this.props.path,
									{ 'sidebar-activity__likes': true }
								) }
							>
								<a href="/activities/likes" onClick={ this.handleReaderSidebarLikeActivityClicked }>
									<svg
										className="material-icon mi_star_border"
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
									>
										<path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
									</svg>
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

				<ReaderSidebarPromo />

				<SidebarFooter />
			</Sidebar>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

ReaderSidebar.defaultProps = {
	translate: identity,
};

export default connect(
	state => {
		return {
			isListsOpen: state.ui.reader.sidebar.isListsOpen,
			isTagsOpen: state.ui.reader.sidebar.isTagsOpen,
			subscribedLists: getSubscribedLists( state ),
			teams: getReaderTeams( state ),
		};
	},
	{
		toggleListsVisibility: toggleReaderSidebarLists,
		toggleTagsVisibility: toggleReaderSidebarTags,
		setNextLayoutFocus,
	}
)( localize( ReaderSidebar ) );
