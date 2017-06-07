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
	AutoSizer,
} from 'react-virtualized';
import { debounce, noop, get } from 'lodash';

/**
 * Internal Dependencies
 */
import ConnectedSubscriptionListItem from 'blocks/reader-subscription-list-item/connected';

// this component is being cleaned up in: https://github.com/Automattic/wp-calypso/pull/14577
class ReaderInfiniteStream extends Component {
	static propTypes = {
		items: PropTypes.array.isRequired,
		fetchNextPage: PropTypes.func,
		forceRefresh: PropTypes.any, // forceRefresh can be anything. Whenever we want to force a refresh, it should change
		windowScrollerRef: PropTypes.func,
		showLastUpdatedDate: PropTypes.bool,
		followSource: PropTypes.string,
		itemType: PropTypes.oneOf( [ 'site', 'post' ] ),
	};

	static defaultProps = {
		windowScrollerRef: noop,
		showLastUpdatedDate: true,
		itemType: 'site',
	};

	heightCache = new CellMeasurerCache( {
		fixedWidth: true,
		minHeight: 70,
	} );

	oldSiteRowRenderer = ( { index, key, style, parent } ) => {
		const site = this.props.items[ index ];
		const feedUrl = get( site, 'feed_URL' );
		const feedId = +get( site, 'feed_ID' );
		const siteId = +get( site, 'blog_ID' );

		return (
			<CellMeasurer
				cache={ this.heightCache }
				columnIndex={ 0 }
				key={ key }
				rowIndex={ index }
				parent={ parent }
			>
				{ ( { measure } ) => (
					<div
						key={ key }
						style={ style }
						className="reader-infinite-stream__row-wrapper"
					>
						<ConnectedSubscriptionListItem
							url={ feedUrl }
							feedId={ feedId }
							siteId={ siteId }
							onLoad={ measure }
							followSource={ this.props.followSource }
							showLastUpdatedDate={ this.props.showLastUpdatedDate }
						/>
					</div>
				) }
			</CellMeasurer>
		);
	};

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

	loadMoreRows = ( { startIndex } ) => {
		this.props.fetchNextPage( startIndex );
		return Promise.resolve();
	};

	componentDidUpdate() {
		if ( this.props.forceRefresh ) {
			this.clearListCaches();
		}
	}

	componentWillMount() {
		window.addEventListener( 'resize', this.handleResize );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.handleResize );
	}

	render() {
		const rowRenderer = this.oldSiteRowRenderer;
		const rowCount = this.props.items.length < 150
			? this.props.items.length + 1
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
							<AutoSizer disableHeight>
								{ ( { width } ) => (
									<List
										autoHeight
										height={ height }
										rowCount={ rowCount }
										rowHeight={ this.heightCache.rowHeight }
										rowRenderer={ rowRenderer }
										onRowsRendered={ onRowsRendered }
										ref={ this.handleListMounted( registerChild ) }
										scrollTop={ scrollTop }
										width={ this.props.width || width }
										deferredMeasurementCache={ this.heightCache }
									/>
								) }
							</AutoSizer>
						) }
					</WindowScroller>
				) }
			</InfiniteLoader>
		);
	}
}

export default ReaderInfiniteStream;
