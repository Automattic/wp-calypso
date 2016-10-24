/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import getScrollbarSize from 'dom-helpers/util/scrollbarSize';
import VirtualScroll from 'react-virtualized/VirtualScroll';
import AutoSizer from 'react-virtualized/AutoSizer';
import {
	debounce,
	memoize,
	get,
	map,
	reduce,
	filter,
	range,
	difference,
	isEqual,
	includes
} from 'lodash';

/**
 * Internal dependencies
 */
import NoResults from './no-results';
import analytics from 'lib/analytics';
import Search from './search';
import { decodeEntities } from 'lib/formatting';
import {
	getSitePostsForQueryIgnoringPage,
	isRequestingSitePostsForQueryIgnoringPage,
	getSitePostsFoundForQuery,
	getSitePostsLastPageForQuery
} from 'state/posts/selectors';
import { getPostTypes } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';
import QueryPosts from 'components/data/query-posts';

/**
 * Constants
 */
const SEARCH_DEBOUNCE_TIME_MS = 500;
const ITEM_HEIGHT = 25;
const DEFAULT_POSTS_PER_PAGE = 20;
const LOAD_OFFSET = 10;

const PostSelectorPosts = React.createClass( {
	displayName: 'PostSelectorPosts',

	propTypes: {
		siteId: PropTypes.number.isRequired,
		query: PropTypes.object,
		posts: PropTypes.array,
		lastPage: PropTypes.number,
		loading: PropTypes.bool,
		emptyMessage: PropTypes.string,
		createLink: PropTypes.string,
		selected: PropTypes.number,
		onSearch: PropTypes.func,
		onChange: PropTypes.func,
		multiple: PropTypes.bool,
		showTypeLabels: PropTypes.bool
	},

	getInitialState() {
		return {
			searchTerm: '',
			requestedPages: [ 1 ]
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
			onChange: () => {}
		};
	},

	componentWillMount() {
		this.itemHeights = {};
		this.hasPerformedSearch = false;

		this.postIds = map( this.props.posts, 'ID' );
		this.getPostChildren = memoize( this.getPostChildren );
		this.queueRecomputeRowHeights = debounce( this.recomputeRowHeights );
		this.debouncedSearch = debounce( () => {
			this.props.onSearch( this.state.searchTerm );
		}, SEARCH_DEBOUNCE_TIME_MS );
	},

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props.query, nextProps.query ) ||
				this.props.siteId !== nextProps.siteId ) {
			this.setState( {
				requestedPages: [ 1 ]
			} );
		}

		if ( this.props.posts !== nextProps.posts ) {
			this.getPostChildren.cache.clear();
			this.postIds = map( nextProps.posts, 'ID' );
		}
	},

	componentDidUpdate( prevProps ) {
		const forceUpdate = (
			prevProps.selected !== this.props.selected ||
			prevProps.loading && ! this.props.loading
		);

		if ( forceUpdate ) {
			this.virtualScroll.forceUpdate();
		}

		if ( this.props.posts !== prevProps.posts ) {
			this.recomputeRowHeights();
		}
	},

	recomputeRowHeights: function() {
		if ( ! this.virtualScroll ) {
			return;
		}

		this.virtualScroll.recomputeRowHeights();

		// Compact mode passes the height of the scrollable region as a derived
		// number, and will not be updated unless our component re-renders
		if ( this.isCompact() ) {
			this.forceUpdate();
		}
	},

	setVirtualScrollRef( virtualScroll ) {
		// Ref callback can be called with null reference, which is desirable
		// since we'll want to know elsewhere if we can call recompute height
		this.virtualScroll = virtualScroll;
	},

	setItemRef( item, itemRef ) {
		if ( ! itemRef || ! item ) {
			return;
		}

		// By falling back to the item height constant, we avoid an unnecessary
		// forced update if all of the items match our guessed height
		const height = this.itemHeights[ item.global_ID ] || ITEM_HEIGHT;

		const nextHeight = itemRef.clientHeight;
		this.itemHeights[ item.global_ID ] = nextHeight;

		// If height changes, wait until the end of the current call stack and
		// fire a single forced update to recompute the row heights
		if ( height !== nextHeight ) {
			this.queueRecomputeRowHeights();
		}
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
		if ( this.props.posts ) {
			return this.props.posts[ index ];
		}
	},

	isCompact() {
		if ( ! this.props.posts || this.state.searchTerm || this.hasNoPosts() ) {
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

	isLastPage() {
		const { lastPage, loading } = this.props;
		const { requestedPages } = this.state;
		return includes( requestedPages, lastPage ) && ! loading;
	},

	getPostChildren( postId ) {
		const { posts } = this.props;
		return filter( posts, ( { parent } ) => parent && parent.ID === postId );
	},

	getItemHeight( item, _recurse = false ) {
		if ( ! item ) {
			return ITEM_HEIGHT;
		}

		if ( item.parent && ! _recurse && includes( this.postIds, item.parent.ID ) ) {
			return 0;
		}

		if ( this.itemHeights[ item.global_ID ] ) {
			return this.itemHeights[ item.global_ID ];
		}

		return reduce( this.getPostChildren( item.ID ), ( memo, nestedItem ) => {
			return memo + this.getItemHeight( nestedItem, true );
		}, ITEM_HEIGHT );
	},

	getRowHeight( { index } ) {
		return this.getItemHeight( this.getItem( index ) );
	},

	getCompactContainerHeight() {
		return range( 0, this.getRowCount() ).reduce( ( memo, index ) => {
			return memo + this.getRowHeight( { index } );
		}, 0 );
	},

	getPageForIndex( index ) {
		const { query, lastPage } = this.props;
		const perPage = query.number || DEFAULT_POSTS_PER_PAGE;
		const page = Math.ceil( index / perPage );

		return Math.max( Math.min( page, lastPage || Infinity ), 1 );
	},

	getRowCount() {
		let count = 0;

		if ( this.props.posts ) {
			count += this.props.posts.length;
		}

		if ( ! this.isLastPage() ) {
			count += 1;
		}

		return count;
	},

	setRequestedPages( { startIndex, stopIndex } ) {
		const { requestedPages } = this.state;
		const pagesToRequest = difference( range(
			this.getPageForIndex( startIndex - LOAD_OFFSET ),
			this.getPageForIndex( stopIndex + LOAD_OFFSET ) + 1
		), requestedPages );

		if ( ! pagesToRequest.length ) {
			return;
		}

		this.setState( {
			requestedPages: requestedPages.concat( pagesToRequest )
		} );
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

	renderItem( item, _recurse = false ) {
		if ( item.parent && ! _recurse && includes( this.postIds, item.parent.ID ) ) {
			return;
		}

		const onChange = ( ...args ) => this.props.onChange( item, ...args );
		const setItemRef = ( ...args ) => this.setItemRef( item, ...args );
		const children = this.getPostChildren( item.ID );

		return (
			<div
				key={ item.global_ID }
				ref={ setItemRef }
				className="post-selector__list-item">
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
				{ children.length > 0 && (
					<div className="post-selector__nested-list">
						{ children.map( ( child ) => this.renderItem( child, true ) ) }
					</div>
				) }
			</div>
		);
	},

	renderEmptyContent() {
		let message;
		if ( this.hasNoSearchResults() ) {
			message = (
				<NoResults
					createLink={ this.props.createLink }
					noResultsMessage={ this.props.noResultsMessage } />
			);
		} else if ( this.hasNoPosts() ) {
			message = this.props.emptyMessage;
		}

		if ( ! message ) {
			return;
		}

		return (
			<div key="no-results" className="post-selector__list-item is-empty">
				{ message }
			</div>
		);
	},

	renderRow( { index } ) {
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
		const { className, siteId, query } = this.props;
		const { requestedPages, searchTerm } = this.state;
		const isCompact = this.isCompact();
		const isTypeLabelsVisible = this.isTypeLabelsVisible();
		const showSearch = searchTerm.length > 0 || ! isCompact;
		const classes = classNames( 'post-selector', className, {
			'is-compact': isCompact,
			'is-type-labels-visible': isTypeLabelsVisible
		} );

		return (
			<div className={ classes }>
				{ requestedPages.map( ( page ) => (
					<QueryPosts
						key={ `page-${ page }` }
						siteId={ siteId }
						query={ { ...query, page } } />
				) ) }
				{ isTypeLabelsVisible && siteId && (
					<QueryPostTypes siteId={ siteId } />
				) }
				{ showSearch && (
					<Search
						searchTerm={ searchTerm }
						onSearch={ this.onSearch } />
				) }
				<div className="post-selector__results">
					<AutoSizer
						key={ JSON.stringify( query ) }
						disableHeight={ isCompact }>
						{ ( { height, width } ) => (
							<VirtualScroll
								ref={ this.setVirtualScrollRef }
								width={ width }
								height={ isCompact ? this.getCompactContainerHeight() : height }
								onRowsRendered={ this.setRequestedPages }
								noRowsRenderer={ this.renderEmptyContent }
								rowCount={ this.getRowCount() }
								estimatedRowSize={ ITEM_HEIGHT }
								rowHeight={ this.getRowHeight }
								rowRenderer={ this.renderRow } />
						) }
					</AutoSizer>
				</div>
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const { siteId, query } = ownProps;
	return {
		posts: getSitePostsForQueryIgnoringPage( state, siteId, query ),
		found: getSitePostsFoundForQuery( state, siteId, query ),
		lastPage: getSitePostsLastPageForQuery( state, siteId, query ),
		loading: isRequestingSitePostsForQueryIgnoringPage( state, siteId, query ),
		postTypes: getPostTypes( state, siteId )
	};
} )( PostSelectorPosts );
