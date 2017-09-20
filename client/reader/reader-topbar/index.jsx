/** @format */
/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { noop, values, trim } from 'lodash';
import page from 'page';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';
import NavItem from 'components/section-nav/item';
import SearchInput from 'components/search';
import { recordTrack, recordAction } from 'reader/stats';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import { getReaderFollowedTags, getReaderTeams } from 'state/selectors';
import { getSubscribedLists } from 'state/reader/lists/selectors';
import { isAutomatticTeamMember } from 'reader/lib/teams';
import QueryReaderFollowedTags from 'components/data/query-reader-followed-tags';
import QueryReaderLists from 'components/data/query-reader-lists';
import QueryReaderTeams from 'components/data/query-reader-teams';
import withDimensions from 'lib/with-dimensions';
import SegmentedControl from 'components/segmented-control';
import { addQueryArgs } from 'lib/url';
import ControlItem from 'components/segmented-control/item';

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

const updateQueryArg = params =>
	page.replace( addQueryArgs( params, '/read/search' + window.location.search ) );

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
	handleSearch = newValue => {
		const trimmedValue = trim( newValue ).substring( 0, 1024 );
		if (
			( trimmedValue !== '' && trimmedValue.length > 1 && trimmedValue !== this.props.query ) ||
			newValue === ''
		) {
			recordTrack( 'calypso_reader_search_from_topbar', {
				query: newValue,
			} );
			updateQueryArg( { q: newValue } );
			window.scrollTo( 0, 0 );
		}
	};

	useRelevanceSort = () => {
		const sort = 'relevance';
		recordAction( 'search_page_clicked_relevance_sort' );
		recordTrack( 'calypso_reader_clicked_search_sort', {
			query: this.props.query,
			sort,
		} );
		updateQueryArg( { sort } );
	};

	useDateSort = () => {
		const sort = 'date';
		recordAction( 'search_page_clicked_date_sort' );
		recordTrack( 'calypso_reader_clicked_search_sort', {
			query: this.props.query,
			sort,
		} );
		updateQueryArg( { sort } );
	};

	render() {
		const { translate, followedTags, followedLists, isTeamMember, width, query } = this.props;
		const sortOrder = this.props.postsStore && this.props.postsStore.sortOrder;
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

		const TEXT_RELEVANCE_SORT = translate( 'Relevance', {
			comment: 'A sort order, showing the most relevant posts first.',
		} );

		const TEXT_DATE_SORT = translate( 'Date', {
			comment: 'A sort order, showing the most recent posts first.',
		} );

		return (
			<div className="reader-topbar">
				<QueryReaderLists />
				<QueryReaderTeams />
				{ ! this.props.followedTags && <QueryReaderFollowedTags /> }
				<div className="reader-topbar__search">
					{ this.props.showSearch &&
						<SearchInput
							onSearch={ this.handleSearch }
							delaySearch={ true }
							delayTimeout={ 500 }
							placeholder={ 'Search...' }
							pinned={ ! wideDisplay }
							onSearchOpen={ this.handleSearchOpen }
							onSearchClose={ this.handleSearchClosed }
							initialValue={ query || '' }
							value={ query || '' }
						>
							{ query &&
								this.state.searchOpen &&
								<SegmentedControl compact className="search-stream__sort-picker">
									<ControlItem selected={ sortOrder !== 'date' } onClick={ this.useRelevanceSort }>
										{ TEXT_RELEVANCE_SORT }
									</ControlItem>
									<ControlItem selected={ sortOrder === 'date' } onClick={ this.useDateSort }>
										{ TEXT_DATE_SORT }
									</ControlItem>
								</SegmentedControl> }
						</SearchInput> }
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
							selectedComponent={
								<span className="reader-topbar__tags-header">
									<span>
										{ translate( 'Tags' ) }{' '}
									</span>
									<span>
										<Gridicon icon="add-outline" size={ 18 } />
									</span>
								</span>
							}
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
