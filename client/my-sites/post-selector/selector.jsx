/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import getScrollbarSize from 'dom-helpers/util/scrollbarSize';
import { InfiniteLoader, VirtualScroll } from 'react-virtualized';

/**
 * Internal dependencies
 */
import NoResults from './no-results';
import analytics from 'lib/analytics';
import Search from './search';
import { decodeEntities } from 'lib/formatting';
import {
	getSitePostsForQueryIgnoringPage,
	getSitePostsHierarchyForQueryIgnoringPage,
	isRequestingSitePostsForQuery,
	getSitePostsFoundForQuery,
	isSitePostsLastPageForQuery
} from 'state/posts/selectors';
import { getPostTypes } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';
import QueryPosts from 'components/data/query-posts';

/**
 * Constants
 */
const SEARCH_DEBOUNCE_TIME_MS = 500;
const ITEM_HEIGHT = 25;

const PostSelectorPosts = React.createClass( {
	displayName: 'PostSelectorPosts',

	propTypes: {
		siteId: PropTypes.number.isRequired,
		query: PropTypes.object,
		posts: PropTypes.array,
		postsHierarchy: PropTypes.array,
		page: PropTypes.number,
		lastPage: PropTypes.bool,
		loading: PropTypes.bool,
		emptyMessage: PropTypes.string,
		createLink: PropTypes.string,
		selected: PropTypes.number,
		onSearch: PropTypes.func,
		onChange: PropTypes.func,
		onNextPage: PropTypes.func,
		multiple: PropTypes.bool,
		showTypeLabel: PropTypes.bool
	},

	getInitialState() {
		return {
			searchTerm: ''
		};
	},

	getDefaultProps() {
		return {
			analyticsPrefix: 'Post Selector',
			searchThreshold: 8,
			loading: true,
			emptyMessage: '',
			posts: [],
			onSearch: () => {},
			onChange: () => {},
			onNextPage: () => {}
		};
	},

	componentWillMount() {
		this.hasPerformedSearch = false;

		this.debouncedSearch = debounce( () => {
			this.props.onSearch( this.state.searchTerm );
		}, SEARCH_DEBOUNCE_TIME_MS );
	},

	componentDidUpdate( prevProps ) {
		const forceUpdate = (
			prevProps.selected !== this.props.selected ||
			prevProps.loading && ! this.props.loading
		);

		if ( forceUpdate ) {
			this.refs.loader._registeredChild.forceUpdate();
		}
	},

	setSelectorRef( selectorRef ) {
		if ( ! selectorRef ) {
			return;
		}

		this.setState( { selectorRef } );
	},

	hasNoSearchResults() {
		return ! this.props.loading &&
			( this.props.posts && ! this.props.posts.length ) &&
			this.state.searchTerm;
	},

	hasNoPosts() {
		return ! this.props.loading && ( this.props.posts && ! this.props.posts.length );
	},

	getItem( index ) {
		if ( this.props.postsHierarchy ) {
			return this.props.postsHierarchy[ index ];
		}
	},

	isCompact() {
		if ( ! this.props.posts || this.state.searchTerm ) {
			return false;
		}

		return this.props.posts.length < this.props.searchThreshold;
	},

	isTypeLabelsVisible() {
		if ( 'boolean' === typeof this.props.showTypeLabels ) {
			return this.props.showTypeLabels;
		}

		return 'any' === this.props.query.type;
	},

	isRowLoaded( { index } ) {
		return this.props.lastPage || !! this.getItem( index );
	},

	getItemHeight( item ) {
		let height = ITEM_HEIGHT;

		if ( item && item.items ) {
			height += item.items.reduce( ( memo, nestedItem ) => {
				return memo + this.getItemHeight( nestedItem );
			}, 0 );
		}

		return height;
	},

	getRowHeight( { index } ) {
		return this.getItemHeight( this.getItem( index ) );
	},

	getResultsWidth() {
		const { selectorRef } = this.state;
		if ( selectorRef ) {
			return selectorRef.clientWidth;
		}

		return 0;
	},

	getRowCount() {
		let count = 0;

		if ( this.props.postsHierarchy ) {
			count += this.props.postsHierarchy.length;
		}

		if ( ! this.props.lastPage ) {
			count += 1;
		}

		return count;
	},

	maybeFetchNextPage() {
		if ( this.props.loading || ! this.props.posts ) {
			return;
		}

		this.props.onNextPage();
	},

	onSearch( event ) {
		const searchTerm = event.target.value;
		if ( this.state.searchTerm && ! searchTerm ) {
			this.props.onSearch( '' );
		}

		if ( searchTerm === this.state.searchTerm ) {
			return;
		}

		if ( ! this.hasPerformedSearch ) {
			this.hasPerformedSearch = true;
			analytics.ga.recordEvent( this.props.analyticsPrefix, 'Performed Post Search' );
		}

		this.setState( { searchTerm } );
		this.debouncedSearch();
	},

	renderItem( item ) {
		const onChange = () => this.props.onChange( item, ...arguments );

		return (
			<div key={ item.global_ID } className="post-selector__list-item">
				<label>
					<input
						name="posts"
						type={ this.props.multiple ? 'checkbox' : 'radio' }
						value={ item.ID }
						onChange={ onChange }
						checked={ this.props.selected === item.ID }
						className="post-selector__input" />
					<span className="post-selector__label">
						{ decodeEntities( item.title || this.translate( 'Untitled' ) ) }
						{ this.isTypeLabelsVisible() && (
							<span
								className="post-selector__label-type"
								style={ {
									paddingRight: this.isCompact() ? 0 : getScrollbarSize()
								} }>
								{ decodeEntities(
									get( this.props.postTypes, [
										item.type,
										'labels',
										'singular_name'
									], '' )
								) }
							</span>
						) }
					</span>
				</label>
				{ item.items && (
					<div className="post-selector__nested-list">
						{ item.items.map( this.renderItem ) }
					</div>
				) }
			</div>
		);
	},

	renderRow( { index } ) {
		if ( this.hasNoSearchResults() || this.hasNoPosts() ) {
			return (
				<div key="no-results" className="post-selector__list-item is-empty">
					{ ( this.hasNoSearchResults() || ! this.props.emptyMessage ) && (
						<NoResults
							createLink={ this.props.createLink }
							noResultsMessage={ this.props.noResultsMessage } />
					) }
					{ this.hasNoPosts() && this.props.emptyMessage }
				</div>
			);
		}

		const item = this.getItem( index );
		if ( item ) {
			return this.renderItem( item );
		}

		return (
			<div key="placeholder" className="post-selector__list-item is-placeholder">
				<label>
					<input
						type={ this.props.multiple ? 'checkbox' : 'radio' }
						disabled
						className="post-selector__input" />
					<span className="post-selector__label">
						{ this.translate( 'Loading…' ) }
					</span>
				</label>
			</div>
		);
	},

	render() {
		const rowCount = this.getRowCount();
		const isCompact = this.isCompact();
		const isTypeLabelsVisible = this.isTypeLabelsVisible();
		const showSearch = this.state.searchTerm.length > 0 || ! isCompact;
		const classes = classNames( 'post-selector', this.props.className, {
			'is-loading': this.props.loading,
			'is-compact': isCompact,
			'is-type-labels-visible': isTypeLabelsVisible
		} );

		return (
			<div ref={ this.setSelectorRef } className={ classes }>
				<QueryPosts
					siteId={ this.props.siteId }
					query={ this.props.query } />
				{ isTypeLabelsVisible && (
					<QueryPostTypes siteId={ this.props.siteId } />
				) }
				{ showSearch && (
					<Search
						searchTerm={ this.state.searchTerm }
						onSearch={ this.onSearch } />
				) }
				<InfiniteLoader
					ref="loader"
					isRowLoaded={ this.isRowLoaded }
					loadMoreRows={ this.maybeFetchNextPage }
					rowCount={ rowCount }>
					{ ( { onRowsRendered, registerChild } ) => (
						<VirtualScroll
							ref={ registerChild }
							width={ this.getResultsWidth() }
							height={ isCompact ? rowCount * ITEM_HEIGHT : 300 }
							onRowsRendered={ onRowsRendered }
							rowCount={ rowCount }
							estimatedRowSize={ ITEM_HEIGHT }
							rowHeight={ this.getRowHeight }
							rowRenderer={ this.renderRow }
							className="post-selector__results" />
					) }
				</InfiniteLoader>
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const { siteId, query } = ownProps;
	return {
		posts: getSitePostsForQueryIgnoringPage( state, siteId, query ),
		postsHierarchy: getSitePostsHierarchyForQueryIgnoringPage( state, siteId, query ),
		found: getSitePostsFoundForQuery( state, siteId, query ),
		lastPage: isSitePostsLastPageForQuery( state, siteId, query ),
		loading: isRequestingSitePostsForQuery( state, siteId, query ),
		postTypes: getPostTypes( state, siteId )
	};
} )( PostSelectorPosts );
