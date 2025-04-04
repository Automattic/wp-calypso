import page from '@automattic/calypso-router';
import { CompactCard } from '@automattic/components';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { trim, flatMap } from 'lodash';
import PropTypes from 'prop-types';
import * as React from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import SearchInput from 'calypso/components/search';
import { addQueryArgs } from 'calypso/lib/url';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderBackButton from 'calypso/reader/components/back-button';
import BlankSuggestions from 'calypso/reader/components/reader-blank-suggestions';
import ReaderMain from 'calypso/reader/components/reader-main';
import { READER_SEARCH_POPULAR_SITES } from 'calypso/reader/follow-sources';
import { getSearchPlaceholderText } from 'calypso/reader/search/utils';
import SearchFollowButton from 'calypso/reader/search-stream/search-follow-button';
import { recordAction } from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import {
	SORT_BY_RELEVANCE,
	SORT_BY_LAST_UPDATED,
} from 'calypso/state/reader/feed-searches/actions';
import { getReaderAliasedFollowFeedUrl } from 'calypso/state/reader/follows/selectors';
import { getTransformedStreamItems } from 'calypso/state/reader/streams/selectors';
import ReaderPopularSitesSidebar from '../stream/reader-popular-sites-sidebar';
import PostResults from './post-results';
import SearchStreamHeader, { SEARCH_TYPES } from './search-stream-header';
import SiteResults from './site-results';
import Suggestion from './suggestion';
import SuggestionProvider from './suggestion-provider';
import './style.scss';

const WIDE_DISPLAY_CUTOFF = 660;

const updateQueryArg = ( params ) =>
	page.replace( addQueryArgs( params, window.location.pathname + window.location.search ) );

const pickSort = ( sort ) => ( sort === 'date' ? SORT_BY_LAST_UPDATED : SORT_BY_RELEVANCE );

class SearchStream extends React.Component {
	static propTypes = {
		query: PropTypes.string,
		streamKey: PropTypes.string,
		disableInfiniteScroll: PropTypes.bool,
	};

	static defaultProps = {
		disableInfiniteScroll: false,
	};

	state = {
		feeds: [],
	};

	componentDidUpdate( prevProps ) {
		if ( prevProps.query !== this.props.query ) {
			this.resetSearchFeeds();
		}
	}

	resetSearchFeeds = () => {
		this.setState( { feeds: [] } );
	};

	setSearchFeeds = ( feeds ) => {
		this.setState( { feeds: feeds } );
	};

	getTitle = ( props = this.props ) => props.query || props.translate( 'Search' );

	updateQuery = ( newValue ) => {
		this.scrollToTop();
		// Remove whitespace from newValue and limit to 1024 characters
		const trimmedValue = trim( newValue ).substring( 0, 1024 );
		if (
			( trimmedValue !== '' && trimmedValue.length > 1 && trimmedValue !== this.props.query ) ||
			newValue === ''
		) {
			updateQueryArg( { q: trimmedValue } );
		}
	};

	scrollToTop = () => {
		window.scrollTo( 0, 0 );
	};

	onChangeSortPicker = ( sort ) => {
		if ( typeof sort !== 'string' ) {
			return;
		}

		switch ( sort ) {
			case 'date':
				recordAction( 'search_page_clicked_date_sort' );
				break;
			case 'relevance':
				recordAction( 'search_page_clicked_relevance_sort' );
				break;
		}

		if ( recordReaderTracksEvent ) {
			this.props.recordReaderTracksEvent( 'calypso_reader_clicked_search_sort', {
				query: this.props.query,
				sort,
			} );
		}

		updateQueryArg( { sort } );
	};

	trackTagsPageLinkClick = () => {
		recordAction( 'clicked_reader_search_tags_page_link' );
		this.props.recordReaderTracksEvent( 'calypso_reader_search_tags_page_link_clicked' );
	};

	handleFixedAreaMounted = ( ref ) => ( this.fixedAreaRef = ref );

	handleSearchTypeSelection = ( searchType ) => updateQueryArg( { show: searchType } );

	render() {
		const { query, translate, searchType, suggestions, isLoggedIn } = this.props;
		const sortOrder = this.props.sort;
		const wideDisplay = this.props.width > WIDE_DISPLAY_CUTOFF;
		const toggleGroupControlClasses = wideDisplay
			? 'search-stream__sort-picker is-wide'
			: 'search-stream__sort-picker';
		// Hide posts and sites if the only result has no feed ID. This can happen when searching
		// for a specific site to add a rss to your feed. Originally added in
		// https://github.com/Automattic/wp-calypso/pull/78555.
		const hidePostsAndSites =
			this.state.feeds && this.state.feeds?.length === 1 && ! this.state.feeds[ 0 ].feed_ID;

		let searchPlaceholderText = this.props.searchPlaceholderText;
		if ( ! searchPlaceholderText ) {
			searchPlaceholderText = getSearchPlaceholderText();
		}

		const documentTitle = translate( '%s ‹ Reader', {
			args: this.getTitle(),
			comment: '%s is the section name. For example: "My Likes"',
		} );

		const TEXT_RELEVANCE_SORT = translate( 'Relevance', {
			comment: 'A sort order, showing the most relevant posts first.',
		} );

		const TEXT_DATE_SORT = translate( 'Date', {
			comment: 'A sort order, showing the most recent posts first.',
		} );

		const searchStreamResultsClasses = clsx( 'search-stream__results', 'is-two-columns' );

		const singleColumnResultsClasses = clsx( 'search-stream__single-column-results', {
			'is-post-results': searchType === SEARCH_TYPES.POSTS && query,
		} );
		const suggestionList = flatMap( suggestions, ( suggestion ) => [
			<Suggestion
				suggestion={ suggestion.text }
				source="search"
				sort={ sortOrder === 'date' ? sortOrder : undefined }
				railcar={ suggestion.railcar }
				key={ 'suggestion-' + suggestion.text }
			/>,
			', ',
		] ).slice( 0, -1 );

		const fixedAreaHeight = this.fixedAreaRef && this.fixedAreaRef.clientHeight;

		/* eslint-disable jsx-a11y/no-autofocus */
		return (
			<div>
				<DocumentHead title={ documentTitle } />
				<ReaderBackButton />
				<NavigationHeader
					title={ translate( 'Search' ) }
					subtitle={ translate( 'Search for specific topics, authors, or blogs.' ) }
				/>
				<div className="search-stream__fixed-area" ref={ this.handleFixedAreaMounted }>
					<CompactCard className="search-stream__input-card">
						<SearchInput
							onSearch={ this.updateQuery }
							onSearchClose={ this.scrollToTop }
							onSearchOpen={ this.resetSearchFeeds }
							autoFocus={ this.props.autoFocusInput }
							delaySearch
							delayTimeout={ 500 }
							placeholder={ searchPlaceholderText }
							initialValue={ query || '' }
							value={ query || '' }
						/>
					</CompactCard>
					<SearchFollowButton query={ query } feeds={ this.state.feeds } />
					{ query && (
						<div className={ toggleGroupControlClasses }>
							<ToggleGroupControl
								hideLabelFromVision
								isBlock
								label=""
								value={ sortOrder }
								onChange={ this.onChangeSortPicker }
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							>
								<ToggleGroupControlOption label={ TEXT_RELEVANCE_SORT } value="relevance" />
								<ToggleGroupControlOption label={ TEXT_DATE_SORT } value="date" />
							</ToggleGroupControl>
						</div>
					) }
					{ ! query && (
						<BlankSuggestions
							suggestions={ suggestionList }
							trackTagsPageLinkClick={ this.trackTagsPageLinkClick }
						/>
					) }
					{ ! hidePostsAndSites && (
						<SearchStreamHeader
							selected={ searchType }
							onSelection={ this.handleSearchTypeSelection }
							wideDisplay={ wideDisplay }
							isLoggedIn={ isLoggedIn }
						/>
					) }
				</div>
				{ /* { isLoggedIn && <SpacerDiv domTarget={ this.fixedAreaRef } /> } */ }
				{ ! hidePostsAndSites && wideDisplay && (
					<div className={ searchStreamResultsClasses }>
						<div className="search-stream__post-results">
							<PostResults { ...this.props } fixedHeaderHeight={ fixedAreaHeight } />
						</div>
						<div className="search-stream__site-results">
							{ query && (
								<SiteResults
									query={ query }
									sort={ pickSort( sortOrder ) }
									onReceiveSearchResults={ this.setSearchFeeds }
									disableInfiniteScroll={ this.props.disableInfiniteScroll }
								/>
							) }
							{ ! query && (
								<ReaderPopularSitesSidebar
									items={ this.props.items }
									followSource={ READER_SEARCH_POPULAR_SITES }
								/>
							) }
						</div>
					</div>
				) }
				{ ! hidePostsAndSites && ! wideDisplay && (
					<div className={ singleColumnResultsClasses }>
						{ ( searchType === SEARCH_TYPES.POSTS && (
							<PostResults { ...this.props } fixedHeaderHeight={ fixedAreaHeight } />
						) ) ||
							( query && (
								<SiteResults
									query={ query }
									sort={ pickSort( sortOrder ) }
									onReceiveSearchResults={ this.setSearchFeeds }
									disableInfiniteScroll={ this.props.disableInfiniteScroll }
								/>
							) ) || (
								<ReaderPopularSitesSidebar
									items={ this.props.items }
									followSource={ READER_SEARCH_POPULAR_SITES }
								/>
							) }
					</div>
				) }
			</div>
		);
		/* eslint-enable jsx-a11y/no-autofocus */
	}
}

/* eslint-disable */
// wrapping with Main so that we can use withWidth helper to pass down whole width of Main
const wrapWithMain = ( Component ) => ( props ) => (
	<ReaderMain className="search-stream search-stream__with-sites" wideLayout>
		<Component { ...props } />
	</ReaderMain>
);
/* eslint-enable */

export default connect(
	( state, ownProps ) => ( {
		readerAliasedFollowFeedUrl:
			ownProps.query && getReaderAliasedFollowFeedUrl( state, ownProps.query ),
		isLoggedIn: isUserLoggedIn( state ),
		items: getTransformedStreamItems( state, {
			streamKey: ownProps.streamKey,
			recsStreamKey: ownProps.recsStreamKey,
		} ),
	} ),
	{
		recordReaderTracksEvent,
	}
)( localize( SuggestionProvider( wrapWithMain( withDimensions( SearchStream ) ) ) ) );
