/**
 * External dependencies
 */
import React from 'react';
import { times } from 'lodash';

export default class FlexboxGrid extends React.PureComponent {

	componentDidMount() {
		this.invokeOnCellsRendered();
	}

	componentDidUpdate() {
		this.invokeOnCellsRendered();
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
		const start = this.firstOverscanIndex();
		const end = this.lastOverscanIndex();

		return times( end - start, idx => this.props.cellRenderer( {
			index: start + idx,
			key: idx,
			style: { flex: `1 0 ${ this.props.minColumnWidth }px` }
		} ) );
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
		while ( rowIdx * this.props.rowHeight < this.props.scrollTop ) {
			++rowIdx;
		}

		return rowIdx * this.props.columnCount;
	}

	firstOverscanIndex() {
		return Math.max(
			this.firstVisibleIndex() - this.props.overscanRowCount * this.props.columnCount,
			0
		);
	}

	lastVisibleIndex() {
		if ( this.props.width === undefined ) {
			return this.props.rowCount * this.props.columnCount;
		}

		let rowIdx = 0;
		while ( rowIdx * this.props.rowHeight < this.props.scrollTop + window.innerHeight ) {
			++rowIdx;
		}

		return Math.min( rowIdx, this.props.rowCount ) * this.props.columnCount;
	}

	lastOverscanIndex() {
		return Math.min(
			this.lastVisibleIndex() + this.props.overscanRowCount * this.props.columnCount,
			this.props.rowCount * this.props.columnCount
		);
	}

	offsetTop() {
		if ( this.props.width === undefined ) {
			return 0;
		}

		return this.firstOverscanIndex() / this.props.columnCount * this.props.rowHeight;
	}

	invokeOnCellsRendered() {
		if ( this.props.width === undefined ) {
			return;
		}

		this.props.onCellsRendered( {
			startIndex: this.firstVisibleIndex(),
			stopIndex: this.lastVisibleIndex() - 1
		} );
	}
}
