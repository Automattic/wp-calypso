/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import VirtualScroll from 'react-virtualized/VirtualScroll';
import {
	debounce,
	difference,
	noop,
	range,
} from 'lodash';

export class VirtualList extends Component {
	static propTypes = {
		items: PropTypes.array,
		lastPage: PropTypes.number,
		loading: PropTypes.boolean,
		getItemHeight: PropTypes.func,
		renderItem: PropTypes.func,
		renderQuery: PropTypes.func,
		perPage: PropTypes.number,
		loadOffset: PropTypes.number,
		query: PropTypes.object,
		defaultItemHeight: PropTypes.number,
		height: PropTypes.number,
	};

	static defaultProps = {
		items: [],
		lastPage: 0,
		loading: false,
		getItemHeight: noop,
		renderItem: noop,
		perPage: 100,
		loadOffset: 10,
		height: 300,
	};

	constructor( props ) {
		super( props );
		this.state = {
			requestedPages: [ 1 ]
		};
	}

	componentWillMount() {
		this.itemHeights = {};
		this.virtualScroll = null;

		this.queueRecomputeRowHeights = debounce( this.recomputeRowHeights );
	}

	componentDidUpdate( prevProps ) {
		const forceUpdate = (
			prevProps.loading && ! this.props.loading ||
			( ! prevProps.items && this.props.items )
		);

		if ( forceUpdate ) {
			this.virtualScroll.forceUpdate();
		}

		if ( this.props.items !== prevProps.items ) {
			this.recomputeRowHeights();
		}
	}

	recomputeRowHeights() {
		if ( ! this.virtualScroll ) {
			return;
		}

		this.virtualScroll.recomputeRowHeights();
		this.virtualScroll.forceUpdate();
	}

	setSelectorRef = selectorRef => {
		if ( ! selectorRef ) {
			return;
		}

		this.setState( { selectorRef } );
	}

	getPageForIndex( index ) {
		const { query, lastPage, perPage } = this.props;
		const itemsPerPage = query.number || perPage;
		const page = Math.ceil( index / itemsPerPage );

		return Math.max( Math.min( page, lastPage || Infinity ), 1 );
	}

	setRequestedPages = ( { startIndex, stopIndex } ) => {
		const { requestedPages } = this.state;
		const { loadOffset } = this.props;
		const pagesToRequest = difference( range(
			this.getPageForIndex( startIndex - loadOffset ),
			this.getPageForIndex( stopIndex + loadOffset ) + 1
		), requestedPages );

		if ( ! pagesToRequest.length ) {
			return;
		}

		this.setState( {
			requestedPages: requestedPages.concat( pagesToRequest )
		} );
	}

	hasNoSearchResults() {
		return ! this.props.loading &&
			( this.props.items && ! this.props.items.length ) &&
			( this.props.query.search && !! this.props.query.search.length );
	}

	hasNoItems() {
		return ! this.props.loading && ( this.props.items && ! this.props.items.length );
	}

	getItem( index ) {
		if ( this.props.items ) {
			return this.props.items[ index ];
		}
	}

	isRowLoaded( { index } ) {
		return this.props.lastPage || !! this.getItem( index );
	}

	getResultsWidth() {
		const { selectorRef } = this.state;
		if ( selectorRef ) {
			return selectorRef.clientWidth;
		}

		return 0;
	}

	getRowCount() {
		let count = 0;

		if ( this.props.items ) {
			count += this.props.items.length;
		}

		if ( this.props.loading || ! this.props.items ) {
			count += 1;
		}

		return count;
	}

	setVirtualScrollRef = ref => {
		this.virtualScroll = ref;
	}

	renderNoResults = () => {
		if ( this.hasNoItems() ) {
			return (
				<div key="no-results" className="virtual-list__list-item is-empty">
					No Results Found
				</div>
			);
		}
	}

	render() {
		const rowCount = this.getRowCount();
		const { className, loading, renderQuery, height, defaultItemHeight, getRowHeight } = this.props;
		const classes = classNames( 'virtual-list', className, {
			'is-loading': loading
		} );

		return (
			<div ref={ this.setSelectorRef } className={ classes }>
				{ this.state.requestedPages.map( ( page ) => (
					renderQuery( page )
				) ) }
				<VirtualScroll
					ref={ this.setVirtualScrollRef }
					width={ this.getResultsWidth() }
					height={ height }
					onRowsRendered={ this.setRequestedPages }
					rowCount={ rowCount }
					estimatedRowSize={ defaultItemHeight }
					rowHeight={ getRowHeight }
					rowRenderer={ this.props.renderRow }
					noRowsRenderer={ this.renderNoResults }
					className={ className } />
			</div>
		);
	}
}

export default localize( VirtualList );
