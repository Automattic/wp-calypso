/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';

class PluginsUpsellComponent extends Component {
	render() {
		return (
			<div role="main" className="main is-wide-layout feature-upsell__main">
				<PageViewTracker path={ '/feature/plugins/:site' } title="PluginsUpsell" />
				<DocumentHead title={ 'Plugins' } />

				<header className="feature-upsell__header">
					<h1 className="feature-upsell__header-title">
						WordPress Plugins are now available on the Business plan.
					</h1>
					<p className="feature-upsell__header-subtitle">
						Upgrading to the Business plan unlocks access to more than 50,000 WordPress Plugins and
						197 premium Themes, making it our most powerful plan ever.
					</p>
				</header>
			</div>
		);
	}
}

const mapStateToProps = () => {};

export default connect( mapStateToProps )( localize( PluginsUpsellComponent ) );
