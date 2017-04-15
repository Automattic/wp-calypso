/**
 * External dependencies
 */
import React from 'react';
import { times } from 'lodash';
import createCallbackMemoizer from 'react-virtualized/utils/createCallbackMemoizer';

export default class FlexboxGrid extends React.PureComponent {

	constructor() {
		super();

		this._onGridRenderedMemoizer = createCallbackMemoizer();
	}

	render() {
		return (
			<div className={ 'flexbox-grid' } style={ this.gridStyle() }>
				<div className={ 'flexbox-grid__content' } style={ this.contentStyle() }>
					{ this.renderVisibleCells() }
				</div>
			</div>
		);
	}

	renderVisibleCells() {
		const start = this.firstVisibleIndex();
		const end = this.lastVisibleIndex();

		this.invokeOnGridRenderedHelper( {
			columnOverscanStartIndex: 0,
			columnOverscanStopIndex: this.props.columnCount,
			columnStartIndex: 0,
			columnStopIndex: this.props.columnCount,
			rowOverscanStartIndex: start / this.props.columnCount,
			rowOverscanStopIndex: end / this.props.columnCount,
			rowStartIndex: start / this.props.columnCount,
			rowStopIndex: end / this.props.columnCount
		} );

		return times( end - start, idx => this.props.cellRenderer( {
			index: start + idx,
			key: idx,
			style: { flex: `1 0 ${ this.props.minColumnWidth }px` }
		} ) );
	}

	invokeOnGridRenderedHelper( renderedIndices ) {
		this._onGridRenderedMemoizer( {
			callback: this.onSectionRendered,
			indices: renderedIndices
		} );
	}

	onSectionRendered = ( { columnStartIndex, columnStopIndex, rowStartIndex, rowStopIndex } ) => {
		const startIndex = rowStartIndex * this.props.columnCount + columnStartIndex;
		const stopIndex = rowStopIndex * this.props.columnCount + columnStopIndex;

		this.props.onCellsRendered( {
			startIndex,
			stopIndex
		} );
	}

	gridStyle() {
		if ( this.props.width === undefined ) {
			return {};
		}

		return {
			height: this.props.rowCount * this.props.rowHeight
		};
	}

	contentStyle() {
		if ( this.props.width === undefined ) {
			return {};
		}

		return {
			position: 'absolute',
			top: `${ this.offsetTop() }px`,
			left: 0
		};
	}

	firstVisibleIndex() {
		if ( this.props.width === undefined ) {
			return 0;
		}

		let rowIdx = 0;
		while ( rowIdx * this.props.rowHeight <= this.props.scrollTop ) {
			++rowIdx;
		}

		return Math.max( rowIdx - this.props.overscanRowCount - 1, 0 ) * this.props.columnCount;
	}

	lastVisibleIndex() {
		if ( this.props.width === undefined ) {
			return 1000;
		}

		let rowIdx = 0;
		while ( rowIdx * this.props.rowHeight < this.props.scrollTop + window.innerHeight ) {
			++rowIdx;
		}

		return Math.min( rowIdx + this.props.overscanRowCount, this.props.rowCount ) * this.props.columnCount;
	}

	offsetTop() {
		if ( this.props.width === undefined ) {
			return 0;
		}

		return this.firstVisibleIndex() / this.props.columnCount * this.props.rowHeight;
	}
}
