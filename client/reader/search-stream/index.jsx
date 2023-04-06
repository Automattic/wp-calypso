import { CompactCard, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { trim, flatMap, some } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import * as React from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import SearchInput from 'calypso/components/search';
import SegmentedControl from 'calypso/components/segmented-control';
import { addQueryArgs, resemblesUrl, withoutHttp, addSchemeIfMissing } from 'calypso/lib/url';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import BlankSuggestions from 'calypso/reader/components/reader-blank-suggestions';
import ReaderMain from 'calypso/reader/components/reader-main';
import FollowButton from 'calypso/reader/follow-button';
import { SEARCH_RESULTS_URL_INPUT } from 'calypso/reader/follow-sources';
import { getSearchPlaceholderText } from 'calypso/reader/search/utils';
import { recordAction } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import {
	SORT_BY_RELEVANCE,
	SORT_BY_LAST_UPDATED,
} from 'calypso/state/reader/feed-searches/actions';
import { getReaderAliasedFollowFeedUrl } from 'calypso/state/reader/follows/selectors';
import { commonExtensions } from 'calypso/state/reader/follows/selectors/get-reader-aliased-follow-feed-url';
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

	state = {
		feed: null,
	};

	setSearchFeed = ( feed ) => {
		this.setState( { feed: feed } );
	};

	getTitle = ( props = this.props ) => props.query || props.translate( 'Search' );

	renderFollowButton = () => {
		const { query, translate, readerAliasedFollowFeedUrl } = this.props;
		let isPotentialFeedUrl = false;
		if ( resemblesUrl( query ) ) {
			const parsedUrl = new URL( query );
			if ( parsedUrl ) {
				isPotentialFeedUrl = some( commonExtensions, ( ext ) =>
					parsedUrl.toString().includes( ext )
				);
			}
		}

		// If not a potential feed then don't show the follow button
		if ( ! isPotentialFeedUrl ) {
			return null;
		}

		let isNewFeed = true;
		let isFollowing = false;
		let followTitle = withoutHttp( query );

		const feed = this.state.feed ?? null;
		if ( feed && feed.name?.length ) {
			isNewFeed = false;
			isFollowing = feed.is_following;
			followTitle = feed.name;
		}

		// If already following this feed then don't show the follow button
		if ( isFollowing ) {
			return null;
		}

		return (
			<div className="search-stream__url-follow">
				<p>
					<Gridicon icon="info" size="16" />
					<strong>
						{ isNewFeed
							? translate( 'Potential new feed found, click follow to add this feed to Reader' )
							: translate( 'Click follow to add this feed to Reader' ) }
					</strong>
				</p>
				<FollowButton
					followLabel={ translate( 'Follow %s', {
						args: followTitle,
						comment: '%s is the name of the site being followed. For example: "Discover"',
					} ) }
					followingLabel={ translate( 'Following %s', {
						args: followTitle,
						comment: '%s is the name of the site being followed. For example: "Discover"',
					} ) }
					siteUrl={ addSchemeIfMissing( readerAliasedFollowFeedUrl, 'http' ) }
					followSource={ SEARCH_RESULTS_URL_INPUT }
					followIcon={ ReaderFollowFeedIcon( { iconSize: 20 } ) }
					followingIcon={ ReaderFollowingFeedIcon( { iconSize: 20 } ) }
				/>
			</div>
		);
	};

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

	useRelevanceSort = () => {
		const sort = 'relevance';
		recordAction( 'search_page_clicked_relevance_sort' );
		this.props.recordReaderTracksEvent( 'calypso_reader_clicked_search_sort', {
			query: this.props.query,
			sort,
		} );
		updateQueryArg( { sort } );
	};

	useDateSort = () => {
		const sort = 'date';
		recordAction( 'search_page_clicked_date_sort' );
		this.props.recordReaderTracksEvent( 'calypso_reader_clicked_search_sort', {
			query: this.props.query,
			sort,
		} );
		updateQueryArg( { sort } );
	};

	handleFixedAreaMounted = ( ref ) => ( this.fixedAreaRef = ref );

	handleSearchTypeSelection = ( searchType ) => updateQueryArg( { show: searchType } );

	render() {
		const { query, translate, searchType, suggestions } = this.props;
		const sortOrder = this.props.sort;
		const wideDisplay = this.props.width > WIDE_DISPLAY_CUTOFF;
		const segmentedControlClass = wideDisplay
			? 'search-stream__sort-picker is-wide'
			: 'search-stream__sort-picker';
		const hidePostsAndSites = this.state.feed && this.state.feed.feed_ID?.length === 0;

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

		/* eslint-disable jsx-a11y/no-autofocus */
		return (
			<div>
				<DocumentHead title={ documentTitle } />
				<div
					className="search-stream__fixed-area"
					style={ { width: this.props.width } }
					ref={ this.handleFixedAreaMounted }
				>
					<CompactCard className="search-stream__input-card">
						<SearchInput
							onSearch={ this.updateQuery }
							onSearchClose={ this.scrollToTop }
							onSearchChange={ () => this.setState( { feed: null } ) }
							autoFocus={ this.props.autoFocusInput }
							delaySearch={ true }
							delayTimeout={ 500 }
							placeholder={ searchPlaceholderText }
							initialValue={ query || '' }
							value={ query || '' }
						/>
					</CompactCard>
					{ this.renderFollowButton() }
					{ query && (
						<SegmentedControl compact className={ segmentedControlClass }>
							<SegmentedControl.Item
								selected={ sortOrder !== 'date' }
								onClick={ this.useRelevanceSort }
							>
								{ TEXT_RELEVANCE_SORT }
							</SegmentedControl.Item>
							<SegmentedControl.Item selected={ sortOrder === 'date' } onClick={ this.useDateSort }>
								{ TEXT_DATE_SORT }
							</SegmentedControl.Item>
						</SegmentedControl>
					) }
					{ ! hidePostsAndSites && query && (
						<SearchStreamHeader
							selected={ searchType }
							onSelection={ this.handleSearchTypeSelection }
							wideDisplay={ wideDisplay }
						/>
					) }
					{ ! query && <BlankSuggestions suggestions={ suggestionList } /> }
				</div>
				{ ! hidePostsAndSites && query && <SpacerDiv domTarget={ this.fixedAreaRef } /> }
				{ ! hidePostsAndSites && query && wideDisplay && (
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
									onReceiveSearchResults={ this.setSearchFeed }
								/>
							</div>
						) }
					</div>
				) }
				{ ! hidePostsAndSites && query && ! wideDisplay && (
					<div className={ singleColumnResultsClasses }>
						{ ( ( searchType === SEARCH_TYPES.POSTS || ! query ) && (
							<PostResults { ...this.props } />
						) ) || (
							<SiteResults
								query={ query }
								sort={ pickSort( sortOrder ) }
								showLastUpdatedDate={ true }
								onReceiveSearchResults={ this.setSearchFeed }
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
const wrapWithMain = ( Component ) => ( props ) =>
	(
		<ReaderMain className="search-stream search-stream__with-sites" wideLayout>
			<Component { ...props } />
		</ReaderMain>
	);
/* eslint-enable */

export default connect(
	( state, ownProps ) => ( {
		readerAliasedFollowFeedUrl:
			ownProps.query && getReaderAliasedFollowFeedUrl( state, ownProps.query ),
	} ),
	{
		recordReaderTracksEvent,
	}
)( localize( SuggestionProvider( wrapWithMain( withDimensions( SearchStream ) ) ) ) );
