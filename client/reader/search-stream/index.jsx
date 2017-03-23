/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { initial, flatMap, trim, debounce } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import config from 'config';
import ControlItem from 'components/segmented-control/item';
import SegmentedControl from 'components/segmented-control';
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import Stream from 'reader/stream';
import EmptyContent from './empty';
import HeaderBack from 'reader/header-back';
import SearchInput from 'components/search';
import SiteStore from 'lib/reader-site-store';
import FeedStore from 'lib/feed-store';
import { recordTrackForPost, recordAction, recordTrack } from 'reader/stats';
import SuggestionProvider from './suggestion-provider';
import Suggestion from './suggestion';
import ReaderPostCard from 'blocks/reader-post-card';
import { RelatedPostCard } from 'blocks/reader-related-card-v2';
import {
	EMPTY_SEARCH_RECOMMENDATIONS,
	SEARCH_RESULTS,
} from 'reader/follow-button/follow-sources';

function RecommendedPosts( { post, site } ) {
	function handlePostClick() {
		recordTrackForPost( 'calypso_reader_recommended_post_clicked', post, {
			recommendation_source: 'empty-search',
		} );
		recordAction( 'search_page_rec_post_click' );
	}

	function handleSiteClick() {
		recordTrackForPost( 'calypso_reader_recommended_site_clicked', post, {
			recommendation_source: 'empty-search',
		} );
		recordAction( 'search_page_rec_site_click' );
	}

	if ( ! site ) {
		site = { title: post.site_name, };
	}

	return (
		<div className="search-stream__recommendation-list-item" key={ post.global_ID }>
			<RelatedPostCard post={ post } site={ site }
				onSiteClick={ handleSiteClick }
				onPostClick={ handlePostClick }
				followSource={ EMPTY_SEARCH_RECOMMENDATIONS } />
		</div>
	);
}

const SearchCardAdapter = ( isRecommendations ) => class extends Component {
	state = this.getStateFromStores();

	getStateFromStores( props = this.props ) {
		return {
			site: SiteStore.get( props.post.site_ID ),
			feed: props.post.feed_ID ? FeedStore.get( props.post.feed_ID ) : null
		};
	}

	componentWillReceiveProps( nextProps ) {
		this.setState( this.getStateFromStores( nextProps ) );
	}

	onCardClick = ( post ) => {
		recordTrackForPost( 'calypso_reader_searchcard_clicked', post );
		this.props.handleClick();
	}

	onCommentClick = () => {
		this.props.handleClick( { comments: true } );
	}

	render() {
		let CardComponent;

		if ( isRecommendations ) {
			CardComponent = RecommendedPosts;
		} else {
			CardComponent = ReaderPostCard;
		}

		return <CardComponent
			post={ this.props.post }
			site={ this.props.site }
			feed={ this.props.feed }
			onClick={ this.onCardClick }
			followSource={ SEARCH_RESULTS }
			onCommentClick={ this.onCommentClick }
			showPrimaryFollowButton={ this.props.showPrimaryFollowButtonOnCards }
			postKey={ this.props.postKey }
		/>;
	}
};

class SearchStream extends Component {

	static propTypes = {
		query: React.PropTypes.string,
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.query !== this.props.query ) {
			this.updateState( nextProps );
		}
	}

	updateState = ( props = this.props ) => {
		const newState = {
			title: this.getTitle( props )
		};
		if ( newState.title !== this.state.title ) {
			this.setState( newState );
		}
	}

	getTitle = ( props = this.props ) => {
		return props.query;
	}

	state = {
		title: this.getTitle()
	}

	updateQuery = ( newValue ) => {
		this.scrollToTop();
		const trimmedValue = trim( newValue ).substring( 0, 1024 );
		if ( ( trimmedValue !== '' &&
				trimmedValue.length > 1 &&
				trimmedValue !== this.props.query
			) ||
			newValue === ''
		) {
			this.props.onQueryChange( newValue );
		}
	}

	scrollToTop = () => {
		window.scrollTo( 0, 0 );
	}

	cardFactory = () => {
		const isRecommendations = ! this.props.query;
		return SearchCardAdapter( isRecommendations );
	}

	handleStreamMounted = ( ref ) => {
		this.streamRef = ref;
	}

	handleSearchBoxMounted = ( ref ) => {
		this.searchBoxRef = ref;
	}

	resizeSearchBox = () => {
		if ( this.searchBoxRef && this.streamRef ) {
			const width = this.streamRef.getClientRects()[ 0 ].width;
			if ( width > 0 ) {
				this.searchBoxRef.style.width = `${ width }px`;
			}
		}
	}

	componentDidMount() {
		this.resizeListener = window.addEventListener(
			'resize',
			debounce( this.resizeSearchBox, 50 )
		);
		this.resizeSearchBox();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeListener );
	}

	placeholderFactory = ( { key, ...rest } ) => {
		if ( ! this.props.query ) {
			return (
				<div className="search-stream__recommendation-list-item" key={ key }>
					<RelatedPostCard { ...rest } />
				</div>
			);
		}
		return null;
	}

	useRelevanceSort = () => {
		recordAction( 'search_page_clicked_relevance_sort' );
		recordTrack( 'calypso_reader_clicked_search_sort', {
			query: this.props.query,
			sort: 'relevance',
		} );
		this.props.onSortChange( 'relevance' );
	}

	useDateSort = () => {
		recordAction( 'search_page_clicked_date_sort' );
		recordTrack( 'calypso_reader_clicked_search_sort', {
			query: this.props.query,
			sort: 'date',
		} );
		this.props.onSortChange( 'date' );
	}

	render() {
		const { query, suggestions } = this.props;
		const emptyContent = <EmptyContent query={ query } />;
		const sortOrder = this.props.postsStore && this.props.postsStore.sortOrder;

		let searchPlaceholderText = this.props.searchPlaceholderText;
		if ( ! searchPlaceholderText ) {
			searchPlaceholderText = this.props.translate(
				'Search billions of WordPress.com posts…'
			);
		}

		const suggestionList = initial( flatMap( suggestions, suggestionKeyword =>
			[
				<Suggestion
					suggestion={ suggestionKeyword }
					source="search"
					sort={ sortOrder === 'date' ? sortOrder : undefined }
				/>,
				', '
			] ) );

		const documentTitle = this.props.translate(
			'%s ‹ Reader', { args: this.state.title || this.props.translate( 'Search' ) }
		);

		const TEXT_RELEVANCE_SORT = this.props.translate( 'Relevance', {
			comment: 'A sort order, showing the most relevant posts first.'
		} );

		const TEXT_DATE_SORT = this.props.translate( 'Date', {
			comment: 'A sort order, showing the most recent posts first.'
		} );

		return (
			<Stream { ...this.props }
				listName={ this.props.translate( 'Search' ) }
				emptyContent={ emptyContent }
				showFollowInHeader={ true }
				cardFactory={ this.cardFactory }
				placeholderFactory={ this.placeholderFactory }
				className="search-stream"
				shouldCombineCards={ true }
			>
				{ this.props.showBack && <HeaderBack /> }
				<DocumentHead title={ documentTitle } />
				<div ref={ this.handleStreamMounted } />
				<div className="search-stream__fixed-area" ref={ this.handleSearchBoxMounted }>
					<CompactCard className="search-stream__input-card">
						<SearchInput
							onSearch={ this.updateQuery }
							onSearchClose={ this.scrollToTop }
							autoFocus={ this.props.autoFocusInput }
							delaySearch={ true }
							delayTimeout={ 500 }
							placeholder={ searchPlaceholderText }
							initialValue={ query }
							value={ query }>
						</SearchInput>
						{ query && config.isEnabled( 'reader/search/sort-by-date' ) &&
							<SegmentedControl compact
								className="search-stream__sort-picker">
								<ControlItem
									selected={ sortOrder !== 'date' }
									onClick={ this.useRelevanceSort }>
									{ TEXT_RELEVANCE_SORT }
								</ControlItem>
								<ControlItem
									selected={ sortOrder === 'date' }
									onClick={ this.useDateSort }>
									{ TEXT_DATE_SORT }
								</ControlItem>
							</SegmentedControl>
						}
					</CompactCard>
					<p className="search-stream__blank-suggestions">
						{ suggestions &&
							this.props.translate(
								'Suggestions: {{suggestions /}}.', {
									components: {
										suggestions: suggestionList
									}
								} )
						}&nbsp;
					</p>

					<hr className="search-stream__fixed-area-separator" />
				</div>
			</Stream>
		);
	}
}

export default SuggestionProvider( localize( SearchStream ) );
