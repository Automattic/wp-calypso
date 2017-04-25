/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { List, WindowScroller, CellMeasurerCache, CellMeasurer } from 'react-virtualized';
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

	componentWillMount() {
		window.addEventListener( 'resize', this.handleResize );
	}
	componentWillUnmount() {
		window.removeEventListener( 'resize', this.handleResize );
	}

	render() {
		const { sites, width } = this.props;

		return (
			<div className="following-manage__sites-window-scroller">
				<WindowScroller>
					{ ( { height, scrollTop } ) => (
						<List
							autoHeight
							height={ height }
							rowCount={ sites.length }
							rowHeight={ this.heightCache.rowHeight }
							rowRenderer={ this.siteRowRenderer }
							scrollTop={ scrollTop }
							width={ width }
							ref={ this.handleListMounted }
						/>
					)}
				</WindowScroller>
			</div>
		);
	}
}

export default SitesWindowScroller;
