/** @format */
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
import ReaderSidebarTeams from './reader-sidebar-teams';
import QueryReaderLists from 'components/data/query-reader-lists';
import QueryReaderTeams from 'components/data/query-reader-teams';
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarItem from 'layout/sidebar/item';
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
			<Sidebar className="sidebar__streamlined-nav-drawer" onClick={ this.handleClick }>
				<SidebarRegion>
					<SidebarMenu>
						<SidebarHeading>{ this.props.translate( 'Streams' ) }</SidebarHeading>
						<ul>
							<SidebarItem
								className={ ReaderSidebarHelper.itemLinkClass( '/', this.props.path, {
									'sidebar-streams__following': true,
								} ) }
								label={ this.props.translate( 'Followed Sites' ) }
								onNavigate={ this.handleReaderSidebarFollowedSitesClicked }
								materialIcon="check_circle"
								link={ '/' }
							/>

							<SidebarItem
								className={ ReaderSidebarHelper.itemLinkClass(
									'/read/conversations',
									this.props.path,
									{
										'sidebar-streams__conversations': true,
									}
								) }
								label={ this.props.translate( 'Conversations' ) }
								onNavigate={ this.handleReaderSidebarConversationsClicked }
								materialIcon="question_answer"
								link={ '/read/conversations' }
							/>

							<ReaderSidebarTeams teams={ this.props.teams } path={ this.props.path } />

							{ isAutomatticTeamMember( this.props.teams ) && (
								<SidebarItem
									className={ ReaderSidebarHelper.itemLinkClass(
										'/read/conversations/a8c',
										this.props.path,
										{
											'sidebar-streams__conversations': true,
										}
									) }
									label="A8C Conversations"
									onNavigate={ this.handleReaderSidebarA8cConversationsClicked }
									link={ '/read/conversations/a8c' }
									icon="automattic-conversations"
								/>
							) }

							{ isDiscoverEnabled() ? (
								<SidebarItem
									className={ ReaderSidebarHelper.itemLinkClass( '/discover', this.props.path, {
										'sidebar-streams__discover': true,
									} ) }
									label={ this.props.translate( 'Discover' ) }
									onNavigate={ this.handleReaderSidebarDiscoverClicked }
									icon="my-sites"
									link={ '/discover' }
								/>
							) : null }

							<SidebarItem
								label={ this.props.translate( 'Search' ) }
								onNavigate={ this.handleReaderSidebarSearchClicked }
								materialIcon="search"
								link={ '/read/search' }
								className={ ReaderSidebarHelper.itemLinkClass( '/read/search', this.props.path, {
									'sidebar-streams__search': true,
								} ) }
							/>

							<SidebarItem
								label={ this.props.translate( 'My likes' ) }
								onNavigate={ this.handleReaderSidebarLikeActivityClicked }
								materialIcon="star_border"
								link={ '/activities/likes' }
								className={ ReaderSidebarHelper.itemLinkClass(
									'/activities/likes',
									this.props.path,
									{ 'sidebar-activity__likes': true }
								) }
							/>
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
