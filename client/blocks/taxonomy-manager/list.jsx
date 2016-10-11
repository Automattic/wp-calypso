/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import VirtualScroll from 'react-virtualized/VirtualScroll';
import {
	debounce,
	difference,
	includes,
	filter,
	map,
	memoize,
	range,
	reduce,
} from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import { decodeEntities } from 'lib/formatting';
import QueryTerms from 'components/data/query-terms';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingTermsForQueryIgnoringPage,
	getTermsLastPageForQuery,
	getTermsForQueryIgnoringPage,
} from 'state/terms/selectors';

/**
 * Constants
 */
const DEFAULT_TERMS_PER_PAGE = 100;
const LOAD_OFFSET = 10;
const ITEM_HEIGHT = 55;

const TaxonomyManagerList = React.createClass( {

	propTypes: {
		terms: PropTypes.array,
		taxonomy: PropTypes.string,
		search: PropTypes.string,
		siteId: PropTypes.number,
		translate: PropTypes.func,
		lastPage: PropTypes.number,
	},

	getInitialState() {
		return {
			requestedPages: [ 1 ]
		};
	},

	getDefaultProps() {
		return {
			analyticsPrefix: 'Category Selector',
			searchThreshold: 8,
			loading: true,
			terms: [],
			onNextPage: () => {}
		};
	},

	componentWillMount() {
		this.itemHeights = {};
		this.hasPerformedSearch = false;
		this.virtualScroll = null;

		this.termIds = map( this.props.terms, 'ID' );
		this.getTermChildren = memoize( this.getTermChildren );
		this.queueRecomputeRowHeights = debounce( this.recomputeRowHeights );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.taxonomy !== this.props.taxonomy ) {
			this.setState( this.getInitialState() );
		}

		if ( this.props.terms !== nextProps.terms ) {
			this.getTermChildren.cache.clear();
			this.termIds = map( nextProps.terms, 'ID' );
		}
	},

	componentDidUpdate( prevProps ) {
		const forceUpdate = (
			prevProps.loading && ! this.props.loading ||
			( ! prevProps.terms && this.props.terms )
		);

		if ( forceUpdate ) {
			this.virtualScroll.forceUpdate();
		}

		if ( this.props.terms !== prevProps.terms ) {
			this.recomputeRowHeights();
		}
	},

	recomputeRowHeights: function() {
		if ( ! this.virtualScroll ) {
			return;
		}

		this.virtualScroll.recomputeRowHeights();
		this.virtualScroll.forceUpdate();
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
			( this.props.query.search && !! this.props.query.search.length );
	},

	hasNoTerms() {
		return ! this.props.loading && ( this.props.terms && ! this.props.terms.length );
	},

	getItem( index ) {
		if ( this.props.terms ) {
			return this.props.terms[ index ];
		}
	},

	isRowLoaded( { index } ) {
		return this.props.lastPage || !! this.getItem( index );
	},

	getTermChildren( termId ) {
		const { terms } = this.props;
		return filter( terms, ( { parent } ) => parent === termId );
	},

	getItemHeight( item, _recurse = false ) {
		if ( ! item ) {
			return ITEM_HEIGHT;
		}

		// if item has a parent, and parent is in payload, height is already part of parent
		if ( item.parent && ! _recurse && includes( this.termIds, item.parent ) ) {
			return 0;
		}

		if ( this.itemHeights[ item.ID ] ) {
			return this.itemHeights[ item.ID ];
		}

		return reduce( this.getTermChildren( item.ID ), ( memo, childItem ) => {
			return memo + this.getItemHeight( childItem, true );
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

	getResultsWidth() {
		const { selectorRef } = this.state;
		if ( selectorRef ) {
			return selectorRef.clientWidth;
		}

		return 0;
	},

	getRowCount() {
		let count = 0;

		if ( this.props.terms ) {
			count += this.props.terms.length;
		}

		if ( this.props.loading || ! this.props.terms ) {
			count += 1;
		}

		return count;
	},

	setVirtualScrollRef( ref ) {
		this.virtualScroll = ref;
	},

	renderItem( item, _recurse = false ) {
		// if item has a parent and it is in current props.terms, do not render
		if ( item.parent && ! _recurse && includes( this.termIds, item.parent ) ) {
			return;
		}

		const setItemRef = ( ...args ) => this.setItemRef( item, ...args );
		const children = this.getTermChildren( item.ID );

		const { translate } = this.props;
		const itemId = item.ID;
		const name = decodeEntities( item.name ) || translate( 'Untitled' );

		return (
			<div key={ 'term-wrapper-' + itemId } className="taxonomy-manager__list-item">
				<CompactCard
					key={ itemId }
					ref={ setItemRef }>
						<span className="taxonomy-manager__label">{ name }</span>
				</CompactCard>
				{ children.length > 0 && (
					<div className="taxonomy-manager__nested-list">
						{ children.map( ( child ) => this.renderItem( child, true ) ) }
					</div>
				) }
			</div>
		);
	},

	renderNoResults() {
		if ( this.hasNoTerms() ) {
			return (
				<div key="no-results" className="taxonomy-manager__list-item is-empty">
					No Results Found
				</div>
			);
		}
	},

	renderRow( { index } ) {
		const item = this.getItem( index );
		if ( item ) {
			return this.renderItem( item );
		}

		return (
			<CompactCard className="taxonomy-manager__list-item is-placeholder">
				<span className="taxonomy-manager__label">
					{ this.props.translate( 'Loading…' ) }
				</span>
			</CompactCard>
		);
	},

	render() {
		const rowCount = this.getRowCount();
		const { className, loading, siteId, taxonomy, query } = this.props;
		const classes = classNames( 'taxonomy-manager', className, {
			'is-loading': loading
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
				<VirtualScroll
					ref={ this.setVirtualScrollRef }
					width={ this.getResultsWidth() }
					height={ 300 }
					onRowsRendered={ this.setRequestedPages }
					rowCount={ rowCount }
					estimatedRowSize={ ITEM_HEIGHT }
					rowHeight={ this.getRowHeight }
					rowRenderer={ this.renderRow }
					noRowsRenderer={ this.renderNoResults }
					className="taxonomy-manager__results" />
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
		lastPage: getTermsLastPageForQuery( state, siteId, taxonomy, query ),
		siteId,
		query
	};
} )( localize( TaxonomyManagerList ) );
