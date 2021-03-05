/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { AutoSizer, List } from '@automattic/react-virtualized';
import { debounce, noop, range } from 'lodash';

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
		scrollTop: PropTypes.number,
	};

	static defaultProps = {
		items: [],
		lastPage: 0,
		loading: false,
		getRowHeight: noop,
		renderRow: noop,
		perPage: 100,
		loadOffset: 10,
		query: {},
	};

	state = {};

	UNSAFE_componentWillMount() {
		this.rowHeights = {};
		this.list = null;

		this.queueRecomputeRowHeights = debounce( this.recomputeRowHeights );
	}

	componentDidUpdate( prevProps ) {
		const forceUpdate =
			( prevProps.loading && ! this.props.loading ) || ( ! prevProps.items && this.props.items );

		if ( forceUpdate ) {
			this.list.forceUpdateGrid();
		}

		if ( this.props.items !== prevProps.items ) {
			this.recomputeRowHeights();
		}
	}

	recomputeRowHeights() {
		if ( ! this.list ) {
			return;
		}

		this.list.recomputeRowHeights();
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
	};

	hasNoSearchResults() {
		return (
			! this.props.loading &&
			this.props.items &&
			! this.props.items.length &&
			this.props.query.search &&
			!! this.props.query.search.length
		);
	}

	hasNoRows() {
		return ! this.props.loading && this.props.items && ! this.props.items.length;
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

	setListRef = ( ref ) => {
		this.list = ref;
	};

	renderNoResults = () => {
		if ( this.hasNoRows() ) {
			return (
				<div key="no-results" className="virtual-list__list-row is-empty">
					No Results Found
				</div>
			);
		}
	};

	setRowRef = ( index, rowRef ) => {
		if ( ! rowRef ) {
			return;
		}

		// By falling back to the row height constant, we avoid an unnecessary
		// forced update if all of the rows match our guessed height
		const height = this.rowHeights[ index ] || this.props.defaultRowHeight;
		const nextHeight = rowRef.clientHeight;
		this.rowHeights[ index ] = nextHeight;

		// If height changes, wait until the end of the current call stack and
		// fire a single forced update to recompute the row heights
		if ( height !== nextHeight ) {
			this.queueRecomputeRowHeights();
		}
	};

	renderRow = ( props ) => {
		const element = this.props.renderRow( props );
		if ( ! element ) {
			return element;
		}
		const setRowRef = ( ...args ) => this.setRowRef( props.index, ...args );
		return React.cloneElement( element, { ref: setRowRef } );
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
		const { className, loading, defaultRowHeight, getRowHeight, height, scrollTop } = this.props;
		const classes = classNames( 'virtual-list', className, {
			'is-loading': loading,
		} );

		return (
			<AutoSizer disableHeight>
				{ ( { width } ) => (
					<div className={ classes }>
						<List
							ref={ this.setListRef }
							onRowsRendered={ this.setRequestedPages }
							rowCount={ rowCount }
							estimatedRowSize={ defaultRowHeight }
							rowHeight={ getRowHeight }
							rowRenderer={ this.cellRendererWrapper }
							noRowsRenderer={ this.renderNoResults }
							className={ className }
							width={ width }
							height={ height }
							scrollTop={ scrollTop }
							autoHeight
						/>
					</div>
				) }
			</AutoSizer>
		);
	}
}

export default localize( VirtualList );
