/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import List from 'react-virtualized/List';
import {
	debounce,
	difference,
	includes,
	isEqual,
	filter,
	map,
	memoize,
	range,
	reduce,
} from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'client/lib/analytics';
import NoResults from './no-results';
import Search from './search';
import { decodeEntities } from 'client/lib/formatting';
import QueryTerms from 'client/components/data/query-terms';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import {
	isRequestingTermsForQueryIgnoringPage,
	getTermsLastPageForQuery,
	getTermsForQueryIgnoringPage,
} from 'client/state/terms/selectors';

/**
 * Constants
 */
const SEARCH_DEBOUNCE_TIME_MS = 500;
const DEFAULT_TERMS_PER_PAGE = 100;
const LOAD_OFFSET = 10;
const ITEM_HEIGHT = 25;

class TermTreeSelectorList extends Component {
	static propTypes = {
		hideTermAndChildren: PropTypes.number,
		terms: PropTypes.array,
		taxonomy: PropTypes.string,
		multiple: PropTypes.bool,
		selected: PropTypes.array,
		search: PropTypes.string,
		siteId: PropTypes.number,
		translate: PropTypes.func,
		defaultTermId: PropTypes.number,
		lastPage: PropTypes.number,
		onSearch: PropTypes.func,
		onChange: PropTypes.func,
		isError: PropTypes.bool,
		height: PropTypes.number,
	};

	static defaultProps = {
		analyticsPrefix: 'Category Selector',
		searchThreshold: 8,
		loading: true,
		terms: Object.freeze( [] ),
		onSearch: () => {},
		onChange: () => {},
		onNextPage: () => {},
		height: 300,
	};

	// initialState is also used to reset state when a the taxonomy prop changes
	static initialState = {
		searchTerm: '',
		requestedPages: Object.freeze( [ 1 ] ),
	};

	state = this.constructor.initialState;

	componentWillMount() {
		this.itemHeights = {};
		this.hasPerformedSearch = false;
		this.list = null;

		this.termIds = map( this.props.terms, 'ID' );
		this.getTermChildren = memoize( this.getTermChildren );
		this.queueRecomputeRowHeights = debounce( this.recomputeRowHeights );
		this.debouncedSearch = debounce( () => {
			this.props.onSearch( this.state.searchTerm );
		}, SEARCH_DEBOUNCE_TIME_MS );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.taxonomy !== this.props.taxonomy ) {
			this.setState( this.constructor.initialState );
		}

		if ( this.props.terms !== nextProps.terms ) {
			this.getTermChildren.cache.clear();
			this.termIds = map( nextProps.terms, 'ID' );
		}
	}

	componentDidUpdate( prevProps ) {
		const forceUpdate =
			! isEqual( prevProps.selected, this.props.selected ) ||
			( prevProps.loading && ! this.props.loading ) ||
			( ! prevProps.terms && this.props.terms );

		if ( forceUpdate ) {
			this.list.forceUpdateGrid();
		}

		if ( this.props.terms !== prevProps.terms ) {
			this.recomputeRowHeights();
		}
	}

	recomputeRowHeights = () => {
		if ( ! this.list ) {
			return;
		}

		this.list.recomputeRowHeights();

		// Small mode passes the height of the scrollable region as a derived
		// number, and will not be updated unless our component re-renders
		if ( this.isSmall() ) {
			this.forceUpdate();
		}
	};

	setSelectorRef = selectorRef => {
		if ( ! selectorRef ) {
			return;
		}

		this.setState( { selectorRef } );
	};

	getPageForIndex = index => {
		const { query, lastPage } = this.props;
		const perPage = query.number || DEFAULT_TERMS_PER_PAGE;
		const page = Math.ceil( index / perPage );

		return Math.max( Math.min( page, lastPage || Infinity ), 1 );
	};

	setRequestedPages = ( { startIndex, stopIndex } ) => {
		const { requestedPages } = this.state;
		const pagesToRequest = difference(
			range(
				this.getPageForIndex( startIndex - LOAD_OFFSET ),
				this.getPageForIndex( stopIndex + LOAD_OFFSET ) + 1
			),
			requestedPages
		);

		if ( ! pagesToRequest.length ) {
			return;
		}

		this.setState( {
			requestedPages: requestedPages.concat( pagesToRequest ),
		} );
	};

	setItemRef = ( item, itemRef ) => {
		if ( ! itemRef || ! item ) {
			return;
		}

		// By falling back to the item height constant, we avoid an unnecessary
		// forced update if all of the items match our guessed height
		const height = this.itemHeights[ item.ID ] || ITEM_HEIGHT;

		const nextHeight = itemRef.clientHeight;
		this.itemHeights[ item.ID ] = nextHeight;

		// If height changes, wait until the end of the current call stack and
		// fire a single forced update to recompute the row heights
		if ( height !== nextHeight ) {
			this.queueRecomputeRowHeights();
		}
	};

	hasNoSearchResults = () => {
		return (
			! this.props.loading &&
			( this.props.terms && ! this.props.terms.length ) &&
			!! this.state.searchTerm.length
		);
	};

	hasNoTerms = () => {
		return ! this.props.loading && ( this.props.terms && ! this.props.terms.length );
	};

	getItem = index => {
		if ( this.props.terms ) {
			return this.props.terms[ index ];
		}
	};

	isSmall = () => {
		if ( ! this.props.terms || this.state.searchTerm ) {
			return false;
		}

		return this.props.terms.length < this.props.searchThreshold;
	};

	isRowLoaded = ( { index } ) => {
		return this.props.lastPage || !! this.getItem( index );
	};

	getTermChildren = termId => {
		const { terms } = this.props;
		return filter( terms, ( { parent } ) => parent === termId );
	};

	getItemHeight = ( item, _recurse = false ) => {
		if ( ! item ) {
			return ITEM_HEIGHT;
		}

		// if item has a parent, and parent is in payload, height is already part of parent
		if ( item.parent && ! _recurse && includes( this.termIds, item.parent ) ) {
			return 0;
		}

		// If this subtree is excluded, do not render
		if ( item.ID === this.props.hideTermAndChildren ) {
			return 0;
		}

		if ( this.itemHeights[ item.ID ] ) {
			return this.itemHeights[ item.ID ];
		}

		return reduce(
			this.getTermChildren( item.ID ),
			( memo, childItem ) => {
				return memo + this.getItemHeight( childItem, true );
			},
			ITEM_HEIGHT
		);
	};

	getRowHeight = ( { index } ) => {
		return this.getItemHeight( this.getItem( index ) );
	};

	getCompactContainerHeight = () => {
		return range( 0, this.getRowCount() ).reduce( ( memo, index ) => {
			return memo + this.getRowHeight( { index } );
		}, 0 );
	};

	getResultsWidth = () => {
		const { selectorRef } = this.state;
		if ( selectorRef ) {
			return selectorRef.clientWidth;
		}

		return 0;
	};

	getRowCount = () => {
		let count = 0;

		if ( this.props.terms ) {
			count += this.props.terms.length;
		}

		if ( this.props.loading || ! this.props.terms ) {
			count += 1;
		}

		return count;
	};

	onSearch = event => {
		const searchTerm = event.target.value;
		if ( this.state.searchTerm && ! searchTerm ) {
			this.props.onSearch( '' );
		}

		if ( searchTerm === this.state.searchTerm ) {
			return;
		}

		if ( ! this.hasPerformedSearch ) {
			this.hasPerformedSearch = true;
			analytics.ga.recordEvent( this.props.analyticsPrefix, 'Performed Term Search' );
		}

		this.setState( { searchTerm } );
		this.debouncedSearch();
	};

	setListRef = ref => {
		this.list = ref;
	};

	renderItem = ( item, _recurse = false ) => {
		// if item has a parent and it is in current props.terms, do not render
		if ( item.parent && ! _recurse && includes( this.termIds, item.parent ) ) {
			return;
		}

		// If this subtree is excluded, do not render
		if ( item.ID === this.props.hideTermAndChildren ) {
			return;
		}

		const onChange = ( ...args ) => this.props.onChange( item, ...args );
		const setItemRef = ( ...args ) => this.setItemRef( item, ...args );
		const children = this.getTermChildren( item.ID );

		const { multiple, defaultTermId, translate, selected } = this.props;
		const itemId = item.ID;
		const name = decodeEntities( item.name ) || translate( 'Untitled' );
		const checked = includes( selected, itemId );
		const inputType = multiple ? 'checkbox' : 'radio';
		const disabled =
			multiple && checked && defaultTermId && 1 === selected.length && defaultTermId === itemId;

		const input = (
			<input
				type={ inputType }
				value={ itemId }
				onChange={ onChange }
				disabled={ disabled }
				checked={ checked }
			/>
		);

		return (
			<div key={ itemId } ref={ setItemRef } className="term-tree-selector__list-item">
				<label>
					{ input }
					<span className="term-tree-selector__label">{ name }</span>
				</label>
				{ children.length > 0 && (
					<div className="term-tree-selector__nested-list">
						{ children.map( child => this.renderItem( child, true ) ) }
					</div>
				) }
			</div>
		);
	};

	renderNoResults = () => {
		if ( this.hasNoSearchResults() || this.hasNoTerms() ) {
			return (
				<div key="no-results" className="term-tree-selector__list-item is-empty">
					{ ( this.hasNoSearchResults() || ! this.props.emptyMessage ) && (
						<NoResults createLink={ this.props.createLink } />
					) }
					{ this.hasNoTerms() && this.props.emptyMessage }
				</div>
			);
		}
	};

	renderRow = ( { index } ) => {
		const item = this.getItem( index );
		if ( item ) {
			return this.renderItem( item );
		}

		return (
			<div key="placeholder" className="term-tree-selector__list-item is-placeholder">
				<label>
					<input
						type={ this.props.multiple ? 'checkbox' : 'radio' }
						disabled
						className="term-tree-selector__input"
					/>
					<span className="term-tree-selector__label">{ this.props.translate( 'Loading…' ) }</span>
				</label>
			</div>
		);
	};

	cellRendererWrapper = ( { key, style, ...rest } ) => {
		return (
			<div key={ key } style={ style }>
				{ this.renderRow( rest ) }
			</div>
		);
	};

	render() {
		const rowCount = this.getRowCount();
		const isSmall = this.isSmall();
		const searchLength = this.state.searchTerm.length;
		const showSearch =
			( searchLength > 0 || ! isSmall ) &&
			( this.props.terms || ( ! this.props.terms && searchLength > 0 ) );
		const { className, isError, loading, siteId, taxonomy, query, height } = this.props;
		const classes = classNames( 'term-tree-selector', className, {
			'is-loading': loading,
			'is-small': isSmall,
			'is-error': isError,
			'is-compact': this.props.compact,
		} );

		return (
			<div ref={ this.setSelectorRef } className={ classes }>
				{ this.state.requestedPages.map( page => (
					<QueryTerms
						key={ `query-${ page }` }
						siteId={ siteId }
						taxonomy={ taxonomy }
						query={ { ...query, page } }
					/>
				) ) }
				{ showSearch && <Search searchTerm={ this.state.searchTerm } onSearch={ this.onSearch } /> }
				<List
					ref={ this.setListRef }
					width={ this.getResultsWidth() }
					height={ isSmall ? this.getCompactContainerHeight() : height }
					onRowsRendered={ this.setRequestedPages }
					rowCount={ rowCount }
					estimatedRowSize={ ITEM_HEIGHT }
					rowHeight={ this.getRowHeight }
					rowRenderer={ this.cellRendererWrapper }
					noRowsRenderer={ this.renderNoResults }
					className="term-tree-selector__results"
				/>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const { taxonomy, query } = ownProps;

	return {
		loading: isRequestingTermsForQueryIgnoringPage( state, siteId, taxonomy, query ),
		terms: getTermsForQueryIgnoringPage( state, siteId, taxonomy, query ),
		lastPage: getTermsLastPageForQuery( state, siteId, taxonomy, query ),
		siteId,
		query,
	};
} )( localize( TermTreeSelectorList ) );
