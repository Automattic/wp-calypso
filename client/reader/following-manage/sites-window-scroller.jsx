/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import ConnectedSubscriptionListItem from './connected-subscription-list-item';

/**
 * Internal Dependencies
 */

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

	render() {
		const { sites, width } = this.props;

		return (
			<div className="following-manage__sites-window-scroller">
				{ sites.map( site => {
					return (
						<div key={ site.URL } style={ { width } }>
							<ConnectedSubscriptionListItem url={ site.URL } feedId={ +site.feed_ID } siteId={ +site.blog_ID } />
						</div>
					);
				} ) }
			</div>
		);
	}
}

export default SitesWindowScroller;
