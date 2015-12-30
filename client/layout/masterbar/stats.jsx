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
	displayName: 'MasterbarStats',

	propTypes: {
		children: PropTypes.node
	},

	getInitialState() {
		return {
			url: siteStatsStickyTabStore.getUrl()
		};
	},

	componentDidMount() {
		siteStatsStickyTabStore.on( 'change', this.handleStatsStickyTabChange );
	},

	componentWillUnmount() {
		siteStatsStickyTabStore.off( 'change', this.handleStatsStickyTabChange );
	},

	handleStatsStickyTabChange() {
		var url = siteStatsStickyTabStore.getUrl();

		if ( url !== this.state.url ) {
			this.setState( {
				url: url
			} );
		}
	},

	render() {
		return (
			<Item { ...this.props } url={ this.state.url }>
				{ this.props.children }
			</Item>
		);
	}
} );
