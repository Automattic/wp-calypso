/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import range from 'lodash/range';
import getScrollbarSize from 'dom-helpers/util/scrollbarSize';
import VirtualScroll from 'react-virtualized/VirtualScroll';
import InfiniteLoader from 'react-virtualized/InfiniteLoader';

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
		this.itemHeights = {};
		this.hasPerformedSearch = false;

		this.queueRecomputeRowHeights = debounce( this.recomputeRowHeights );
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

	recomputeRowHeights: function() {
		if ( ! this.refs.loader ) {
			return;
		}

		this.refs.loader._registeredChild.recomputeRowHeights();
		this.refs.loader._registeredChild.forceUpdate();

		// Compact mode passes the height of the scrollable region as a derived
		// number, and will not be updated unless our component re-renders
		if ( this.isCompact() ) {
			this.forceUpdate();
		}
	},

	setSelectorRef( selectorRef ) {
		if ( ! selectorRef ) {
			return;
		}

		this.setState( { selectorRef } );
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
		if ( this.props.postsHierarchy ) {
			return this.props.postsHierarchy[ index ];
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

	isRowLoaded( { index } ) {
		return this.props.lastPage || !! this.getItem( index );
	},

	getItemHeight( item ) {
		if ( item && this.itemHeights[ item.global_ID ] ) {
			return this.itemHeights[ item.global_ID ];
		}

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

	getCompactContainerHeight() {
		return range( 0, this.getRowCount() ).reduce( ( memo, index ) => {
			return memo + this.getRowHeight( { index } );
		}, 0 );
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
		const onChange = ( ...args ) => this.props.onChange( item, ...args );
		const setItemRef = ( ...args ) => this.setItemRef( item, ...args );

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
				{ item.items && (
					<div className="post-selector__nested-list">
						{ item.items.map( this.renderItem ) }
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
							height={ isCompact ? this.getCompactContainerHeight() : 300 }
							onRowsRendered={ onRowsRendered }
							noRowsRenderer={ this.renderEmptyContent }
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
