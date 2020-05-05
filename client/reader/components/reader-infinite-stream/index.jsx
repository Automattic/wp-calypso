/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	CellMeasurer,
	CellMeasurerCache,
	InfiniteLoader,
	List,
	WindowScroller,
} from '@automattic/react-virtualized';

import { debounce, noop, get, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksRailcarRender } from 'reader/stats';

/**
 * Style dependencies
 */
import './style.scss';

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
	};

	static defaultProps = {
		windowScrollerRef: noop,
		minHeight: 70,
		hasNextPage: () => false,
	};

	heightCache = new CellMeasurerCache( {
		fixedWidth: true,
		minHeight: this.props.minHeight,
	} );

	recordedRender = new Set(); // used to ensure we only fire render event once per item

	recordTraintrackForRowRender = ( { index, railcar, eventName } ) => {
		recordTracksRailcarRender( eventName, railcar, { ui_position: index } );
	};

	rowRenderer = ( rowRendererProps ) => {
		const railcar = get( this.props.items[ rowRendererProps.index ], 'railcar', undefined );
		if ( railcar && ! this.recordedRender.has( rowRendererProps.index ) ) {
			this.recordedRender.add( rowRendererProps.index );
			this.recordTraintrackForRowRender(
				pickBy( {
					index: rowRendererProps.index,
					railcar,
				} )
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
					<ComponentToMeasure { ...props } onShouldMeasure={ measure } />
				</div>
			) }
		</CellMeasurer>
	);

	handleListMounted = ( registerChild ) => ( list ) => {
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

	componentDidMount() {
		window.addEventListener( 'resize', this.handleResize );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.handleResize );
	}

	render() {
		const { hasNextPage, width } = this.props;
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
								items={ this.props.items } // passthrough-prop unused by the component except to signal a rerender
							/>
						) }
					</WindowScroller>
				) }
			</InfiniteLoader>
		);
	}
}

export default ReaderInfiniteStream;
