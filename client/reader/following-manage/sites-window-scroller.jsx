/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { List, WindowScroller, CellMeasurerCache, CellMeasurer, InfiniteLoader } from 'react-virtualized';
import { debounce } from 'lodash';

/**
 * Internal Dependencies
 */
import ConnectedSubscriptionListItem from './connected-subscription-list-item';

/**
 * SitesWindowScroller is a component that takes in a list of site/feed objects.
 * It renders a list of the sites/feeds.
 *
 * @returns {object} SitesWindowScroller React Component
 */
class SitesWindowScroller extends Component {
	static propTypes = {
		sites: PropTypes.array.isRequired,
		fetchNextPage: PropTypes.func,
		remoteTotalCount: PropTypes.number.isRequired,
		forceRefresh: PropTypes.bool,
	};

	heightCache = new CellMeasurerCache( {
		fixedWidth: true,
		minHeight: 70,
	} );

	siteRowRenderer = ( { index, key, style, parent } ) => {
		const site = this.props.sites[ index ];
		if ( ! site ) {
			return null;
		}

		return (
			<CellMeasurer
				cache={ this.heightCache }
				columnIndex={ 0 }
				key={ key }
				rowIndex={ index }
				parent={ parent }
			>
				{ ( { measure } ) => (
					<div key={ key } style={ style } className="following-manage__sites-window-scroller-row-wrapper" >
							<ConnectedSubscriptionListItem
								url={ site.feed_URL }
								feedId={ +site.feed_ID }
								siteId={ +site.blog_ID }
								onLoad={ measure }
							/>
					</div>
				) }
			</CellMeasurer>
		);
	};

	handleListMounted = registerChild => list => {
		this.listRef = list;
		registerChild( list ); // InfiniteLoader also wants a ref
	}

	handleResize = debounce( () => this.clearListCaches(), 50 );

	clearListCaches = () => {
		this.heightCache.clearAll();
		this.listRef && this.listRef.forceUpdateGrid();
	}

	isRowLoaded = ( { index } ) => {
		return !! this.props.sites[ index ];
	}

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
					<WindowScroller>
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
						)}
					</WindowScroller>
				) }
				</InfiniteLoader>
			</div>
		);
	}
}

export default SitesWindowScroller;
