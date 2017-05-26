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
import ConnectedSubscriptionListItem from 'blocks/reader-subscription-list-item/connected';

/*
 * SitesWindowScroller is a component that takes in a list of site/feed objects.
 * It renders a list of the sites/feeds.
 */
class SitesWindowScroller extends Component {
	static propTypes = {
		sites: PropTypes.array.isRequired,
		fetchNextPage: PropTypes.func,
		remoteTotalCount: PropTypes.number.isRequired,
		forceRefresh: PropTypes.any, // forceRefresh can be anything. Whenever we want to force a refresh, it should change
		windowScrollerRef: PropTypes.func,
		showLastUpdatedDate: PropTypes.bool,
		followSource: PropTypes.string,
	};
	defaultProps = { windowScrollerRef: noop, showLastUpdatedDate: true };

	heightCache = new CellMeasurerCache( {
		fixedWidth: true,
		minHeight: 70,
	} );

	siteRowRenderer = ( { index, key, style, parent } ) => {
		const site = this.props.sites[ index ];
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
						className="following-manage__sites-window-scroller-row-wrapper"
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
		return !! this.props.sites[ index ];
	};

	// technically this function should return a promise that only resolves when the data is fetched.
	// initially I had created a promise that would setInterval and see if the startIndex
	// exists in sites, and if so the resolve. It was super hacky, and its muchs simpler to just fake that it instantly
	// returns
	// TODO: does a util function exist that return waitFor( thingToExistInStateTree )? that would be perfect.
	loadMoreRows = ( { startIndex } ) => {
		this.props.fetchNextPage && this.props.fetchNextPage( startIndex );
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
		const { width, remoteTotalCount } = this.props;
		return (
			<div className="following-manage__sites-window-scroller">
				<InfiniteLoader
					isRowLoaded={ this.isRowLoaded }
					loadMoreRows={ this.loadMoreRows }
					rowCount={ remoteTotalCount }
				>
					{ ( { onRowsRendered, registerChild } ) => (
						<WindowScroller ref={ this.props.windowScrollerRef }>
							{ ( { height, scrollTop } ) => (
								<List
									autoHeight
									height={ height }
									rowCount={ remoteTotalCount }
									rowHeight={ this.heightCache.rowHeight }
									rowRenderer={ this.siteRowRenderer }
									onRowsRendered={ onRowsRendered }
									ref={ this.handleListMounted( registerChild ) }
									scrollTop={ scrollTop }
									width={ width }
								/>
							) }
						</WindowScroller>
					) }
				</InfiniteLoader>
			</div>
		);
	}
}

export default SitesWindowScroller;
