/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Item from './item';
import siteStatsStickyTabStore from 'lib/site-stats-sticky-tab/store';

export default React.createClass( {
	displayName: 'MasterbarStatsItem',

	propTypes: {
		children: PropTypes.node
	},

	getInitialState: function() {
		return {
			url: siteStatsStickyTabStore.getUrl()
		};
	},

	componentDidMount: function() {
		siteStatsStickyTabStore.on( 'change', this.handleStatsStickyTabChange );
	},

	componentWillUnmount: function() {
		siteStatsStickyTabStore.off( 'change', this.handleStatsStickyTabChange );
	},

	handleStatsStickyTabChange: function() {
		var url = siteStatsStickyTabStore.getUrl();

		if ( url !== this.state.url ) {
			this.setState( {
				url: url
			} );
		}
	},

	render: function() {
		return (
			<Item { ...this.props } url={ this.state.url }>
				{ this.props.children }
			</Item>
		);
	}
} );
