/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

class PluginsUpsellComponent extends Component {
	render() {
		return (
			<div role="main" className="main is-wide-layout feature-upsell__main">
				WordPress Plugins are now available on the Business plan.
			</div>
		);
	}
}

const mapStateToProps = () => {};

export default connect( mapStateToProps )( localize( PluginsUpsellComponent ) );
