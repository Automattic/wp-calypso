/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { trim, initial, flatMap } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import BlankSuggestions from 'reader/components/reader-blank-suggestions';
import SegmentedControl from 'components/segmented-control';
import { CompactCard } from '@automattic/components';
import DocumentHead from 'components/data/document-head';
import SearchInput from 'components/search';
import { recordAction, recordTrack } from 'reader/stats';
import SiteResults from './site-results';
import PostResults from './post-results';
import ReaderMain from 'reader/components/reader-main';
import { addQueryArgs, resemblesUrl, withoutHttp, addSchemeIfMissing } from 'lib/url';
import SearchStreamHeader, { SEARCH_TYPES } from './search-stream-header';
import { SORT_BY_RELEVANCE, SORT_BY_LAST_UPDATED } from 'state/reader/feed-searches/actions';
import withDimensions from 'lib/with-dimensions';
import SuggestionProvider from './suggestion-provider';
import Suggestion from './suggestion';
import { getReaderAliasedFollowFeedUrl } from 'state/reader/follows/selectors';
import { SEARCH_RESULTS_URL_INPUT } from 'reader/follow-sources';
import FollowButton from 'reader/follow-button';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import { getSearchPlaceholderText } from 'reader/search/utils';

/**
 * Style dependencies
 */
import './style.scss';

const WIDE_DISPLAY_CUTOFF = 660;

const updateQueryArg = ( params ) =>
	page.replace( addQueryArgs( params, window.location.pathname + window.location.search ) );

const pickSort = ( sort ) => ( sort === 'date' ? SORT_BY_LAST_UPDATED : SORT_BY_RELEVANCE) ;

const SpacerDiv = withDimensions( ( { width, height } ) => (
	<div
		style={ {
			width: `${ width }px`,
			height: `${ height }px`,
		} }
	/>
) );

class SearchStream extends React.Component {
	static propTypes = {
		query: PropTypes.string,
		streamKey: PropTypes.string,
	};

	getTitle = ( props = this.props ) => props.query || props.translate( 'Search' );

	state = {
		selected: SEARCH_TYPES.POSTS,
	};

	updateQuery = ( newValue ) => {
		this.scrollToTop();
		const trimmedValue = trim( newValue ).substring( 0, 1024 );
		if (
			( trimmedValue !== '' && trimmedValue.length > 1 && trimmedValue !== this.props.query ) ||
			newValue === ''
		) {
			updateQueryArg( { q: newValue } );
		}
	};

	scrollToTop = () => {
		window.scrollTo( 0, 0 );
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

	handleFixedAreaMounted = ( ref ) => ( this.fixedAreaRef = ref );

	handleSearchTypeSelection = ( searchType ) => updateQueryArg( { show: searchType } );

	render() {
		const { query, translate, searchType, suggestions, readerAliasedFollowFeedUrl } = this.props;
		const sortOrder = this.props.sort;
		const wideDisplay = this.props.width > WIDE_DISPLAY_CUTOFF;
		const showFollowByUrl = resemblesUrl( query );
		const queryWithoutProtocol = withoutHttp( query );

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

		const searchStreamResultsClasses = classnames( 'search-stream__results', {
			'is-two-columns': !! query,
		} );

		const singleColumnResultsClasses = classnames( 'search-stream__single-column-results', {
			'is-post-results': searchType === SEARCH_TYPES.POSTS && query,
		} );
		const suggestionList = initial(
			flatMap( suggestions, ( suggestion ) => [
				<Suggestion
					suggestion={ suggestion.text }
					source="search"
					sort={ sortOrder === 'date' ? sortOrder : undefined }
					railcar={ suggestion.railcar }
				/>,
				', ',
			] )
		);

		/* eslint-disable jsx-a11y/no-autofocus */
		return (
			<div>
				<DocumentHead title={ documentTitle } />
				<div
					className="search-stream__fixed-area"
					style={ { width: this.props.width } }
					ref={ this.handleFixedAreaMounted }
				>
					<MobileBackToSidebar>
						<h1>{ translate( 'Streams' ) }</h1>
					</MobileBackToSidebar>
					<CompactCard className="search-stream__input-card">
						<SearchInput
							onSearch={ this.updateQuery }
							onSearchClose={ this.scrollToTop }
							autoFocus={ this.props.autoFocusInput }
							delaySearch={ true }
							delayTimeout={ 500 }
							placeholder={ searchPlaceholderText }
							initialValue={ query || '' }
							value={ query || '' }
						/>
						{ query && (
							<SegmentedControl compact className="search-stream__sort-picker">
								<SegmentedControl.Item
									selected={ sortOrder !== 'date' }
									onClick={ this.useRelevanceSort }
								>
									{ TEXT_RELEVANCE_SORT }
								</SegmentedControl.Item>
								<SegmentedControl.Item
									selected={ sortOrder === 'date' }
									onClick={ this.useDateSort }
								>
									{ TEXT_DATE_SORT }
								</SegmentedControl.Item>
							</SegmentedControl>
						) }
					</CompactCard>
					{ showFollowByUrl && (
						<div className="search-stream__url-follow">
							<FollowButton
								followLabel={ translate( 'Follow %s', {
									args: queryWithoutProtocol,
									comment: '%s is the name of the site being followed. For example: "Discover"',
								} ) }
								followingLabel={ translate( 'Following %s', {
									args: queryWithoutProtocol,
									comment: '%s is the name of the site being followed. For example: "Discover"',
								} ) }
								siteUrl={ addSchemeIfMissing( readerAliasedFollowFeedUrl, 'http' ) }
								followSource={ SEARCH_RESULTS_URL_INPUT }
							/>
						</div>
					) }
					{ query && (
						<SearchStreamHeader
							selected={ searchType }
							onSelection={ this.handleSearchTypeSelection }
							wideDisplay={ wideDisplay }
						/>
					) }
					{ ! query && <BlankSuggestions suggestions={ suggestionList } /> }
				</div>
				<SpacerDiv domTarget={ this.fixedAreaRef } />
				{ wideDisplay && (
					<div className={ searchStreamResultsClasses }>
						<div className="search-stream__post-results">
							<PostResults { ...this.props } />
						</div>
						{ query && (
							<div className="search-stream__site-results">
								<SiteResults
									query={ query }
									sort={ pickSort( sortOrder ) }
									showLastUpdatedDate={ false }
								/>
							</div>
						) }
					</div>
				) }
				{ ! wideDisplay && (
					<div className={ singleColumnResultsClasses }>
						{ ( ( searchType === SEARCH_TYPES.POSTS || ! query ) && (
							<PostResults { ...this.props } />
						) ) || (
							<SiteResults
								query={ query }
								sort={ pickSort( sortOrder ) }
								showLastUpdatedDate={ true }
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

export default connect( ( state, ownProps ) => ( {
	readerAliasedFollowFeedUrl:
		ownProps.query && getReaderAliasedFollowFeedUrl( state, ownProps.query ),
} ) )( localize( SuggestionProvider( wrapWithMain( withDimensions( SearchStream ) ) ) ) );
