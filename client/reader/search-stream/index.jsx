/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { initial, flatMap, trim, sampleSize } from 'lodash';
import closest from 'component-closest';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import Stream from 'reader/stream';
import EmptyContent from './empty';
import BlankContent from './blank';
import HeaderBack from 'reader/header-back';
import SearchInput from 'components/search';
import SiteStore from 'lib/reader-site-store';
import FeedStore from 'lib/feed-store';
import { recordTrackForPost } from 'reader/stats';
import i18nUtils from 'lib/i18n-utils';
import { suggestions } from './suggestions';
import SearchCard from 'blocks/reader-search-card';
import Suggestion from './suggestion';
import ReaderPostCard from 'blocks/reader-post-card';
import { RelatedPostCard } from 'blocks/reader-related-card-v2';
import config from 'config';

function RecommendedPosts( { post, site, } ) {
	if ( ! site ) {
		site = { title: post.site_name, };
	}

	return (
		<div className="search-stream__recommendation-list-item">
			<RelatedPostCard key={ post.global_ID } post={ post } site={ site }
				lineClamp={ 3 } />
		</div>
	);
}

const SearchCardAdapter = ( isRecommendations ) => React.createClass( {
	getInitialState() {
		return this.getStateFromStores();
	},

	getStateFromStores( props = this.props ) {
		return {
			site: SiteStore.get( props.post.site_ID ),
			feed: props.post.feed_ID ? FeedStore.get( props.post.feed_ID ) : null
		};
	},

	componentWillReceiveProps( nextProps ) {
		this.setState( this.getStateFromStores( nextProps ) );
	},

	onCardClick( props, event ) {
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			return;
		}
		const rootNode = ReactDom.findDOMNode( this );
		const anchor = closest( event.target, 'a', true, rootNode );

		if ( anchor && anchor.href.search( /\/read\/blogs\/|\/read\/feeds\// ) !== -1 ) {
			return;
		}

		// declarative ignore
		if ( closest( event.target, '.ignore-click, [rel~=external]', true, rootNode ) ) {
			return;
		}

		recordTrackForPost( 'calypso_reader_searchcard_clicked', this.props.post );

		event.preventDefault();
		this.props.handleClick( this.props.post, {} );
	},

	onRefreshCardClick( post ) {
		recordTrackForPost( 'calypso_reader_searchcard_clicked', this.props.post );
		this.props.handleClick( post, {} );
	},

	onCommentClick() {
		this.props.handleClick( this.props.post, { comments: true } );
	},

	render() {
		const isRefreshedStream = config.isEnabled( 'reader/refresh/stream' );
		let CardComponent;

		if ( ! isRefreshedStream ) {
			CardComponent = SearchCard;
		} else if ( isRecommendations ) {
			CardComponent = RecommendedPosts;
		} else {
			CardComponent = ReaderPostCard;
		}

		return <CardComponent
			post={ this.props.post }
			site={ this.props.site }
			feed={ this.props.feed }
			onClick={ isRefreshedStream ? this.onRefreshCardClick : this.onCardClick }
			onCommentClick={ this.onCommentClick }
			showPrimaryFollowButton={ this.props.showPrimaryFollowButtonOnCards }
		/>;
	}
} );

const emptyStore = {
	get() {
		return [];
	},
	isLastPage() {
		return true;
	},
	getUpdateCount() {
		return 0;
	},
	getSelectedIndex() {
		return -1;
	},
	on() {},
	off() {}
};

const SearchStream = React.createClass( {

	propTypes: {
		query: React.PropTypes.string
	},

	getInitialState() {
		const lang = i18nUtils.getLocaleSlug();
		let pickedSuggestions = null;

		if ( suggestions[ lang ] ) {
			pickedSuggestions = sampleSize( suggestions[ lang ], 3 );
		}

		return {
			suggestions: pickedSuggestions,
			title: this.getTitle()
		};
	},

	getDefaultProps() {
		return {
			showBlankContent: true
		};
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.query !== this.props.query ) {
			this.updateState( nextProps );
		}
	},

	updateState( props = this.props ) {
		const newState = {
			title: this.getTitle( props )
		};
		if ( newState.title !== this.state.title ) {
			this.setState( newState );
		}
	},

	getTitle( props = this.props ) {
		return props.query;
	},

	updateQuery( newValue ) {
		const trimmedValue = trim( newValue ).substring( 0, 1024 );
		if ( trimmedValue === '' || trimmedValue.length > 1 && trimmedValue !== this.props.query ) {
			this.props.onQueryChange( newValue );
		}
	},

	cardFactory() {
		const isRecommendations = ! this.props.query;
		return SearchCardAdapter( isRecommendations );
	},

	render() {
		const blankContent = this.props.showBlankContent ? <BlankContent suggestions={ this.state.suggestions } /> : null;
		const emptyContent = this.props.query
			? <EmptyContent query={ this.props.query } />
			: blankContent;

		const store = this.props.store || emptyStore;

		let searchPlaceholderText = this.props.searchPlaceholderText;
		if ( ! searchPlaceholderText ) {
			searchPlaceholderText = this.props.translate( 'Search billions of WordPress.com posts…' );
		}

		const sugList = initial( flatMap( this.state.suggestions, query =>
			[ <Suggestion suggestion={ query } />, ', ' ] ) );

		return (
			<Stream { ...this.props } store={ store }
				listName={ this.props.translate( 'Search' ) }
				emptyContent={ emptyContent }
				showDefaultEmptyContentIfMissing={ this.props.showBlankContent }
				showFollowInHeader={ true }
				cardFactory={ this.cardFactory }
				className="search-stream" >
				{ this.props.showBack && <HeaderBack /> }
				<DocumentHead title={ this.props.translate( '%s ‹ Reader', { args: this.state.title || this.props.translate( 'Search' ) } ) } />
				<CompactCard className="search-stream__input-card">
					<SearchInput
						initialValue={ this.props.query }
						onSearch={ this.updateQuery }
						autoFocus={ ! this.props.query }
						delaySearch={ true }
						delayTimeout={ 500 }
						placeholder={ searchPlaceholderText } />
				</CompactCard>
				{ ! this.props.query && (
					<p className="search-stream__blank-suggestions">
						{ this.props.translate( 'Suggestions: {{suggestions /}}.', { components: { suggestions: sugList } } ) }
					</p>
				) }
			</Stream>
		);
	}
} );

export default localize( SearchStream );
