/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import {
	List,
	WindowScroller,
	CellMeasurerCache,
	CellMeasurer,
	InfiniteLoader,
} from 'react-virtualized';
import { debounce, noop, get } from 'lodash';

/**
 * Internal Dependencies
 */
import { recordTracksRailcarRender } from 'reader/stats';

class ReaderInfiniteStream extends Component {
	static propTypes = {
		items: PropTypes.array.isRequired,
		width: PropTypes.number.isRequired,
		rowRenderer: PropTypes.func.isRequired,
		fetchNextPage: PropTypes.func,
		hasNextPage: PropTypes.func,
		windowScrollerRef: PropTypes.func,
		extraRenderItemProps: PropTypes.object,
		minHeight: PropTypes.number,
		renderEventName: PropTypes.string,
		passthroughProp: PropTypes.any, // https://github.com/bvaughn/react-virtualized#pure-components. For use with things like sort etc.
	};

	static defaultProps = {
		windowScrollerRef: noop,
		showLastUpdatedDate: true,
		minHeight: 70,
		hasNextPage: () => false,
	};

	heightCache = new CellMeasurerCache( {
		fixedWidth: true,
		minHeight: this.props.minHeight,
	} );

	recordTraintrackForRowRender = ( { index, railcar, eventName } ) => {
		recordTracksRailcarRender( eventName, railcar, { ui_position: index } );
	};

	rowRenderer = rowRendererProps => {
		const railcar = get( this.props.items[ rowRendererProps.index ], 'railcar' );
		if ( railcar && this.props.renderEventName ) {
			this.recordTraintrackForRowRender(
				{
					index: rowRendererProps.index,
					railcar,
					eventName: this.props.renderEventName,
				},
			);
		}

		return this.props.rowRenderer( {
			items: this.props.items,
			extraRenderItemProps: this.props.extraRenderItemProps,
			rowRendererProps,
			measuredRowRenderer: this.measuredRowRenderer,
		} );
	};

	measuredRowRenderer = ( ComponentToMeasure, props, { key, index, style, parent } ) => (
		<CellMeasurer
			cache={ this.heightCache }
			columnIndex={ 0 }
			key={ key }
			rowIndex={ index }
			parent={ parent }
		>
			{ ( { measure } ) => (
				<div key={ key } style={ style } className="reader-infinite-stream__row-wrapper">
					<ComponentToMeasure { ...props } onLoad={ measure } />
				</div>
			) }
		</CellMeasurer>
	);

	handleListMounted = registerChild => list => {
		this.listRef = list;
		registerChild( list ); // InfiniteLoader also wants a ref
	};

	handleResize = debounce( () => this.clearListCaches(), 50 );

	clearListCaches = () => {
		this.heightCache.clearAll();
		this.listRef && this.listRef.forceUpdateGrid();
	};

	isRowLoaded = ( { index } ) => {
		return !! this.props.items[ index ];
	};

	// technically this function should return a promise that only resolves when the data is fetched.
	// initially I had created a promise that would setInterval and see if the startIndex
	// exists in sites, and if so the resolve. It was super hacky, and its muchs simpler to just fake that it instantly
	// returns
	loadMoreRows = ( { startIndex } ) => {
		this.props.fetchNextPage( startIndex );
		return Promise.resolve();
	};

	componentWillMount() {
		window.addEventListener( 'resize', this.handleResize );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.handleResize );
	}

	render() {
		const { hasNextPage, width, passthroughProp } = this.props;
		const rowCount = hasNextPage( this.props.items.length )
			? this.props.items.length + 10
			: this.props.items.length;

		return (
			<InfiniteLoader
				isRowLoaded={ this.isRowLoaded }
				loadMoreRows={ this.loadMoreRows }
				rowCount={ rowCount }
			>
				{ ( { onRowsRendered, registerChild } ) => (
					<WindowScroller ref={ this.props.windowScrollerRef }>
						{ ( { height, scrollTop } ) => (
							<List
								autoHeight
								height={ height }
								rowCount={ rowCount }
								rowHeight={ this.heightCache.rowHeight }
								rowRenderer={ this.rowRenderer }
								onRowsRendered={ onRowsRendered }
								ref={ this.handleListMounted( registerChild ) }
								scrollTop={ scrollTop }
								width={ width }
								passthroughProp={ passthroughProp }
							/>
						) }
					</WindowScroller>
				) }
			</InfiniteLoader>
		);
	}
}

export default ReaderInfiniteStream;
