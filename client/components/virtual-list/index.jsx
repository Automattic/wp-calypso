/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import VirtualScroll from 'react-virtualized/VirtualScroll';
import {
	debounce,
	noop,
	range,
} from 'lodash';

export class VirtualList extends Component {
	static propTypes = {
		items: PropTypes.array,
		lastPage: PropTypes.number,
		loading: PropTypes.bool,
		getRowHeight: PropTypes.func,
		renderRow: PropTypes.func,
		renderQuery: PropTypes.func,
		perPage: PropTypes.number,
		loadOffset: PropTypes.number,
		query: PropTypes.object,
		defaultRowHeight: PropTypes.number,
		height: PropTypes.number,
	};

	static defaultProps = {
		items: [],
		lastPage: 0,
		loading: false,
		getRowHeight: noop,
		renderRow: noop,
		perPage: 100,
		loadOffset: 10,
		height: 300,
		query: {}
	};

	state = {};

	componentWillMount() {
		this.rowHeights = {};
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
		const rowsPerPage = query.number || perPage;
		const page = Math.ceil( index / rowsPerPage );

		return Math.max( Math.min( page, lastPage || Infinity ), 1 );
	}

	setRequestedPages = ( { startIndex, stopIndex } ) => {
		const { loadOffset, onRequestPages } = this.props;
		const pagesToRequest = range(
			this.getPageForIndex( startIndex - loadOffset ),
			this.getPageForIndex( stopIndex + loadOffset ) + 1
		);

		if ( ! pagesToRequest.length ) {
			return;
		}

		onRequestPages( pagesToRequest );
	}

	hasNoSearchResults() {
		return ! this.props.loading &&
			( this.props.items && ! this.props.items.length ) &&
			( this.props.query.search && !! this.props.query.search.length );
	}

	hasNoRows() {
		return ! this.props.loading && ( this.props.items && ! this.props.items.length );
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
		if ( this.hasNoRows() ) {
			return (
				<div key="no-results" className="virtual-list__list-row is-empty">
					No Results Found
				</div>
			);
		}
	}

	setRowRef = ( index, rowRef ) => {
		if ( ! rowRef ) {
			return;
		}

		// By falling back to the row height constant, we avoid an unnecessary
		// forced update if all of the rows match our guessed height
		const height = this.rowHeights[ index ] || this.this.props.defaultRowHeight;
		const nextHeight = rowRef.clientHeight;
		this.rowHeights[ index ] = nextHeight;

		// If height changes, wait until the end of the current call stack and
		// fire a single forced update to recompute the row heights
		if ( height !== nextHeight ) {
			this.queueRecomputeRowHeights();
		}
	};

	renderRow = props => {
		const element = this.props.renderRow( props );
		const setRowRef = ( ...args ) => this.setRowRef( props.index, ...args );

		return React.cloneElement( element, { ref: setRowRef } );
	};

	render() {
		const rowCount = this.getRowCount();
		const { className, loading, height, defaultRowHeight, getRowHeight } = this.props;
		const classes = classNames( 'virtual-list', className, {
			'is-loading': loading
		} );

		return (
			<div ref={ this.setSelectorRef } className={ classes }>
				<VirtualScroll
					ref={ this.setVirtualScrollRef }
					width={ this.getResultsWidth() }
					height={ height }
					onRowsRendered={ this.setRequestedPages }
					rowCount={ rowCount }
					estimatedRowSize={ defaultRowHeight }
					rowHeight={ getRowHeight }
					rowRenderer={ this.renderRow }
					noRowsRenderer={ this.renderNoResults }
					className={ className } />
			</div>
		);
	}
}

export default localize( VirtualList );
