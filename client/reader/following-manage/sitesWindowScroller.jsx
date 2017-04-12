/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { List, WindowScroller } from 'react-virtualized';
import ConnectedSubscriptionListItem from './connected-subscription-list-item';

/**
 * Internal Dependencies
 */

class SitesWindowScroller extends Component {
	static propTypes = {
		sites: PropTypes.array.isRequired,
	}

	sitesRowRenderer = ( { index, key, style } ) => {
		const site = this.props.sites[ index ];
		return (
			<div key={ key } style={ style }>
					<ConnectedSubscriptionListItem
						url={ site.URL }
						feedId={ +site.feed_ID }
						siteId={ +site.blog_ID }
					/>
			</div>
		);
	};

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
							rowHeight={ 83 } // TODO: figure out what should really go here...
							rowRenderer={ this.sitesRowRenderer }
							scrollTop={ scrollTop }
							width={ width }
						/>
					)}
				</WindowScroller>
			</div>
		);
	}
}

export default SitesWindowScroller;
