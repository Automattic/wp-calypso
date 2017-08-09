/** @format */
/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { noop, values, trim } from 'lodash';
import page from 'page';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';
import NavItem from 'components/section-nav/item';
import SearchInput from 'components/search';
import { recordTrack } from 'reader/stats';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import { getReaderFollowedTags, getReaderTeams } from 'state/selectors';
import { getSubscribedLists } from 'state/reader/lists/selectors';
import { isAutomatticTeamMember } from 'reader/lib/teams';
import QueryReaderFollowedTags from 'components/data/query-reader-followed-tags';
import QueryReaderLists from 'components/data/query-reader-lists';
import QueryReaderTeams from 'components/data/query-reader-teams';
import withDimensions from 'lib/with-dimensions';

export const NAV_TYPES = {
	FOLLOWED: 'Followed',
	AUTOMATTIC: 'Automattic',
	MANAGE: 'Manage',
	DISCOVER: 'Discover',
	RECOMMENDATIONS: 'Recommendations',
	LIKED: 'Liked',
	SEARCH: 'Search',
};

const WIDE_DISPLAY_CUTOFF = 660;

const handleSearch = query => {
	recordTrack( 'calypso_reader_search_from_topbar', {
		query,
	} );

	if ( trim( query ) !== '' ) {
		page( '/read/search?q=' + encodeURIComponent( query ) + '&focus=1' );
	}
};

class ReaderTopbar extends Component {
	static propTypes = {
		translate: PropTypes.func,
		wideDisplay: PropTypes.bool,
		selected: PropTypes.oneOf( values( NAV_TYPES ) ),
		showSearch: PropTypes.bool,
	};
	static defaultProps = {
		onSelection: noop,
		selected: NAV_TYPES.FOLLOWED,
		showSearch: true,
	};
	state = { searchOpen: false };

	handleFollowedSelected = () => page( '/read' );
	handleAutomatticSelected = () => page( '/read/a8c' );
	handleManageSelected = () => page( '/following/manage' );
	handleDiscoverSelected = () => page( '/discover' );
	handleRecommendationsSelected = () => page( '/read/search' );
	handleLikedSelected = () => page( '/activities/likes' );
	handleSearchOpen = () => this.setState( { searchOpen: true } );
	handleSearchClosed = () => this.setState( { searchOpen: false } );

	render() {
		const { translate, followedTags, followedLists, isTeamMember, width } = this.props;
		const wideDisplay = width > WIDE_DISPLAY_CUTOFF;
		// at small widths when search is active then hide all other nav items
		const onlyShowSearch = ! wideDisplay && this.state.searchOpen;

		let selected;
		const url = window.location.pathname;
		if ( url.indexOf( '/following/manage' ) >= 0 ) {
			selected = NAV_TYPES.MANAGE;
		} else if (
			url.indexOf( '/read/search' ) >= 0 &&
			( window.location.search === '' || window.location.search === '?q=' )
		) {
			selected = NAV_TYPES.RECOMMENDATIONS;
		} else if ( url.indexOf( '/read/search' ) >= 0 ) {
			selected = NAV_TYPES.SEARCH;
		} else if ( url.indexOf( '/activities/likes' ) >= 0 ) {
			selected = NAV_TYPES.LIKED;
		} else if ( url.indexOf( '/discover' ) >= 0 ) {
			selected = NAV_TYPES.DISCOVER;
		} else if ( url.indexOf( '/read/a8c' ) >= 0 ) {
			selected = NAV_TYPES.AUTOMATTIC;
		} else if ( url === '/' ) {
			selected = NAV_TYPES.FOLLOWED;
		}

		return (
			<div className="reader-topbar">
				<QueryReaderLists />
				<QueryReaderTeams />
				{ ! this.props.followedTags && <QueryReaderFollowedTags /> }
				<div className="reader-topbar__search">
					{ this.props.showSearch &&
						<SearchInput
							onSearch={ handleSearch }
							delaySearch={ true }
							delayTimeout={ 500 }
							placeholder={ 'Search...' }
							pinned={ ! wideDisplay }
							onSearchOpen={ this.handleSearchOpen }
							onSearchClose={ this.handleSearchClosed }
						/> }
				</div>
				{ ! onlyShowSearch &&
					<div className="reader-topbar__navigation">
						<div className="reader-topbar__section-nav">
							<SectionNav selectedText={ selected }>
								<NavTabs>
									<NavItem
										key={ 'followed-nav' }
										selected={ selected === NAV_TYPES.FOLLOWED }
										onClick={ this.handleFollowedSelected }
									>
										{ translate( 'Followed' ) }
									</NavItem>
									{ isTeamMember &&
										<NavItem
											key={ 'automattic-nav' }
											selected={ selected === NAV_TYPES.AUTOMATTIC }
											onClick={ this.handleAutomatticSelected }
										>
											{ translate( 'Automattic' ) }
										</NavItem> }
									<NavItem
										key={ 'manage-nav' }
										selected={ selected === NAV_TYPES.MANAGE }
										onClick={ this.handleManageSelected }
									>
										{ translate( 'Manage' ) }
									</NavItem>
									<NavItem
										key={ 'discover-nav' }
										selected={ selected === NAV_TYPES.DISCOVER }
										onClick={ this.handleDiscoverSelected }
									>
										{ translate( 'Discover' ) }
									</NavItem>
									<NavItem
										key={ 'recommendations-nav' }
										selected={ selected === NAV_TYPES.RECOMMENDATIONS }
										onClick={ this.handleRecommendationsSelected }
									>
										{ translate( 'Recommendations' ) }
									</NavItem>
									<NavItem
										key={ 'liked-nav' }
										selected={ selected === NAV_TYPES.LIKED }
										onClick={ this.handleLikedSelected }
									>
										{ translate( 'Liked' ) }
									</NavItem>
								</NavTabs>
							</SectionNav>
						</div>
						<SelectDropdown
							selectedText={ translate( 'Tags' ) }
							className="reader-topbar__tags-dropdown"
						>
							{ followedTags &&
								followedTags.map( tag =>
									<DropdownItem
										path={ tag.url }
										selected={ window.location.pathname === tag.url }
										key={ tag.url }
									>
										{ tag.title }
									</DropdownItem>
								) }
						</SelectDropdown>
						{ followedLists &&
							followedLists.length > 0 &&
							<SelectDropdown
								selectedText={ translate( 'Lists' ) }
								className="reader-topbar__lists-dropdown"
							>
								{ followedLists &&
									followedLists.map( list =>
										<DropdownItem
											path={ `/read/list/${ list.owner }/${ list.slug }` }
											selected={ window.location.pathname === list.url }
											key={ list.slug }
										>
											{ list.title }
										</DropdownItem>
									) }
							</SelectDropdown> }
					</div> }
			</div>
		);
	}
}

export default connect( state => ( {
	followedTags: getReaderFollowedTags( state ),
	followedLists: getSubscribedLists( state ),
	isTeamMember: isAutomatticTeamMember( getReaderTeams( state ) ),
} ) )( localize( withDimensions( ReaderTopbar ) ) );
