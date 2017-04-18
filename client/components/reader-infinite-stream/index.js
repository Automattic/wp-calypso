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

	// eslint-disable-next-line no-unused-vars
	postRowRenderer = ( { index, key, style, parent } ) => {
		// todo: implement
		return null;
	};

	// TODO: why doesn't this work?
	siteRowRenderer = ( { index, key, style, parent } ) => {
		const { followSource, showLastUpdatedDate, items } = this.props;
		const site = items[ index ];

		const feedUrl = get( site, 'feed_URL' );
		const feedId = +get( site, 'feed_ID' );
		const siteId = +get( site, 'blog_ID' );

		const props = { url: feedUrl, feedId, siteId, followSource, showLastUpdatedDate };
		return this.measuredRowRenderer(
			{ ComponentToMeasure: ConnectedSubscriptionListItem, props, key, index, style, parent }
		);
	};

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

	measuredRowRenderer = ( { ComponentToMeasure, props, key, index, style } ) => (
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
	// TODO: does a util function exist that return waitFor( thingToExistInStateTree )? that would be perfect.
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
		const rowRenderer = this.props.itemType === 'site'
			? this.oldSiteRowRenderer
			: this.postRowRenderer;

		// todo implement an actual HasNextPage or take one in as a prop
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
