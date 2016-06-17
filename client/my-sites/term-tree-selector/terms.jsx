/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import unescapeString from 'lodash/unescape';
import includes from 'lodash/includes';
import { localize } from 'i18n-calypso';
import debounce from 'lodash/debounce';
import range from 'lodash/range';
import VirtualScroll from 'react-virtualized/VirtualScroll';
import difference from 'lodash/difference';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import NoResults from './no-results';
import Search from './search';
import QueryTerms from 'components/data/query-terms';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingTermsForQueryIgnoringPage,
	getTermsLastPageForQuery,
	getTermsForQueryIgnoringPage,
	getTermsHierarchyForQueryIgnoringPage
} from 'state/terms/selectors';

/**
 * Constants
 */
const SEARCH_DEBOUNCE_TIME_MS = 500;
const DEFAULT_TERMS_PER_PAGE = 100;
const LOAD_OFFSET = 10;
const ITEM_HEIGHT = 25;

const TermTreeSelectorList = React.createClass( {

	propTypes: {
		terms: PropTypes.array,
		termsHierarchy: PropTypes.array,
		taxonomy: PropTypes.string,
		multiple: PropTypes.bool,
		selected: PropTypes.array,
		search: PropTypes.string,
		siteId: PropTypes.number,
		translate: PropTypes.func,
		defaultTermId: PropTypes.number,
		lastPage: PropTypes.number,
		onSearch: PropTypes.func,
		onChange: PropTypes.func
	},

	getInitialState() {
		return {
			searchTerm: '',
			requestedPages: [ 1 ]
		};
	},

	getDefaultProps() {
		return {
			analyticsPrefix: 'Category Selector',
			searchThreshold: 8,
			loading: true,
			terms: [],
			onSearch: () => {},
			onChange: () => {},
			onNextPage: () => {}
		};
	},

	componentWillMount() {
		this.itemHeights = {};
		this.hasPerformedSearch = false;
		this.virtualScroll = null;

		this.queueRecomputeRowHeights = debounce( this.recomputeRowHeights );
		this.debouncedSearch = debounce( () => {
			this.props.onSearch( this.state.searchTerm );
		}, SEARCH_DEBOUNCE_TIME_MS );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.taxonomy !== this.props.taxonomy ) {
			this.setState( {
				searchTerm: '',
				requestedPages: [ 1 ]
			} );
		}
	},

	componentDidUpdate( prevProps ) {
		const forceUpdate = (
			prevProps.selected !== this.props.selected ||
			prevProps.loading && ! this.props.loading ||
			( ! prevProps.terms && this.props.terms )
		);

		if ( forceUpdate ) {
			this.virtualScroll.forceUpdate();
		}
	},

	recomputeRowHeights: function() {
		if ( ! this.virtualScroll ) {
			return;
		}

		this.virtualScroll.recomputeRowHeights();
		this.virtualScroll.forceUpdate();

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

	getPageForIndex( index ) {
		const { query, lastPage } = this.props;
		const perPage = query.number || DEFAULT_TERMS_PER_PAGE;
		const page = Math.ceil( index / perPage );

		return Math.max( Math.min( page, lastPage || Infinity ), 1 );
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

	setItemRef( item, itemRef ) {
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
	},

	hasNoSearchResults() {
		return ! this.props.loading &&
			( this.props.terms && ! this.props.terms.length ) &&
			!! this.state.searchTerm.length;
	},

	hasNoTerms() {
		return ! this.props.loading && ( this.props.terms && ! this.props.terms.length );
	},

	getItem( index ) {
		if ( this.props.termsHierarchy ) {
			return this.props.termsHierarchy[ index ];
		}
	},

	isCompact() {
		if ( ! this.props.terms || this.state.searchTerm ) {
			return false;
		}

		return this.props.terms.length < this.props.searchThreshold;
	},

	isRowLoaded( { index } ) {
		return this.props.lastPage || !! this.getItem( index );
	},

	getItemHeight( item ) {
		if ( item && this.itemHeights[ item.ID ] ) {
			return this.itemHeights[ item.ID ];
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

		if ( this.props.termsHierarchy ) {
			count += this.props.termsHierarchy.length;
		}

		return count;
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
			analytics.ga.recordEvent( this.props.analyticsPrefix, 'Performed Term Search' );
		}

		this.setState( { searchTerm } );
		this.debouncedSearch();
	},

	getSelectedIds( selected ) {
		const selectedObjects = selected || this.props.selected;
		return selectedObjects.map( function( item ) {
			if ( ! item.ID ) {
				return item;
			}

			return item.ID;
		} );
	},

	setVirtualScrollRef( ref ) {
		this.virtualScroll = ref;
	},

	renderItem( item ) {
		const onChange = ( ...args ) => this.props.onChange( item, ...args );
		const setItemRef = ( ...args ) => this.setItemRef( item, ...args );

		const { multiple, defaultTermId, translate } = this.props;
		const selectedIds = this.getSelectedIds();
		const itemId = item.ID;
		const name = unescapeString( item.name ) || translate( 'Untitled' );
		const checked = includes( selectedIds, itemId );
		const inputType = multiple ? 'checkbox' : 'radio';
		const disabled = (
			multiple &&
			checked &&
			defaultTermId &&
			1 === selectedIds.length &&
			defaultTermId === itemId
		);

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
			<div
				key={ itemId }
				ref={ setItemRef }
				className="term-tree-selector__list-item">
				<label>
					{ input }
					<span className="term-tree-selector__label">{ name }</span>
				</label>
				{ item.items && (
					<div className="term-tree-selector__nested-list">
						{ item.items.map( this.renderItem ) }
					</div>
				) }
			</div>
		);
	},

	renderNoResults() {
		if ( this.hasNoSearchResults() || this.hasNoTerms() ) {
			return (
				<div key="no-results" className="term-tree-selector__list-item is-empty">
					{ ( this.hasNoSearchResults() || ! this.props.emptyMessage ) && (
						<NoResults
							createLink={ this.props.createLink } />
					) }
					{ this.hasNoTerms() && this.props.emptyMessage }
				</div>
			);
		}

		return (
			<div key="placeholder" className="term-tree-selector__list-item is-placeholder">
				<label>
					<input
						type={ this.props.multiple ? 'checkbox' : 'radio' }
						disabled
						className="term-tree-selector__input" />
					<span className="term-tree-selector__label">
						{ this.props.translate( 'Loading…' ) }
					</span>
				</label>
			</div>
		);
	},

	renderRow( { index } ) {
		const item = this.getItem( index );
		if ( item ) {
			return this.renderItem( item );
		}
	},

	render() {
		const rowCount = this.getRowCount();
		const isCompact = this.isCompact();
		const showSearch = this.state.searchTerm.length > 0 || ! isCompact;
		const { className, loading, siteId, taxonomy, query } = this.props;
		const classes = classNames( 'term-tree-selector', className, {
			'is-loading': loading,
			'is-compact': isCompact
		} );

		return (
			<div ref={ this.setSelectorRef } className={ classes }>
				{ this.state.requestedPages.map( ( page ) => (
					<QueryTerms
						key={ `query-${ page }` }
						siteId={ siteId }
						taxonomy={ taxonomy }
						query={ { ...query, page } } />
				) ) }
				{ showSearch && (
					<Search
						searchTerm={ this.state.searchTerm }
						onSearch={ this.onSearch } />
				) }
				<VirtualScroll
					ref={ this.setVirtualScrollRef }
					width={ this.getResultsWidth() }
					height={ isCompact ? this.getCompactContainerHeight() : 300 }
					onRowsRendered={ this.setRequestedPages }
					rowCount={ rowCount }
					estimatedRowSize={ ITEM_HEIGHT }
					rowHeight={ this.getRowHeight }
					rowRenderer={ this.renderRow }
					noRowsRenderer={ this.renderNoResults }
					className="term-tree-selector__results" />
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const { taxonomy, query } = ownProps;

	return {
		loading: isRequestingTermsForQueryIgnoringPage( state, siteId, taxonomy, query ),
		terms: getTermsForQueryIgnoringPage( state, siteId, taxonomy, query ),
		termsHierarchy: getTermsHierarchyForQueryIgnoringPage( state, siteId, taxonomy, query ),
		lastPage: getTermsLastPageForQuery( state, siteId, taxonomy, query ),
		siteId,
		query
	};
} )( localize( TermTreeSelectorList ) );

