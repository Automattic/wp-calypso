/**
 * External dependencies
 */
import React from 'react';
import { times } from 'lodash';

function createOnCellsRenderedMemoizer() {
	let cachedStartIndex = -1;
	let cachedStopIndex = -1;

	return ( callback, { startIndex, stopIndex } ) => {
		if ( startIndex === cachedStartIndex && stopIndex === cachedStopIndex ) {
			return;
		}

		cachedStartIndex = startIndex;
		cachedStopIndex = stopIndex;

		callback( { startIndex, stopIndex } );
	};
}

export default class FlexboxGrid extends React.PureComponent {

	constructor() {
		super();

		this.onCellsRenderedMemoizer = createOnCellsRenderedMemoizer();
	}

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
		const start = this.firstVisibleIndex();
		const end = this.lastVisibleIndex();

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

	invokeOnCellsRendered() {
		this.onCellsRenderedMemoizer(
			this.props.onCellsRendered,
			{
				startIndex: this.firstVisibleIndex(),
				stopIndex: this.lastVisibleIndex()
			}
		);
	}
}
