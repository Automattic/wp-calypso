/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { List, WindowScroller, CellMeasurerCache, CellMeasurer, InfiniteLoader } from 'react-virtualized';
import { debounce, defer } from 'lodash';

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
	};

	heightCache = new CellMeasurerCache( {
		fixedWidth: true,
		minHeight: 50,
	} );

	siteRowRenderer = ( { index, key, style, parent } ) => {
		const site = this.props.sites[ index ];

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
								url={ site.URL }
								feedId={ +site.feed_ID }
								siteId={ +site.blog_ID }
								onLoad={ measure }
							/>
					</div>
				) }
			</CellMeasurer>
		);
	};

	handleListMounted = list => {
		this.listRef = list;
	}

	handleResize = debounce( () => {
		this.heightCache.clearAll();
		defer( () => this.listRef && this.listRef.recomputeRowHeights( 0 ) );
	}, 50, { trailing: true } );

	isRowLoaded = ( { index } ) => {
		return !! this.props.sites[ index ];
	}

	loadMoreRows = () => this.props.fetchNextPage && this.props.fetchNextPage();

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
								ref={ registerChild }
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
