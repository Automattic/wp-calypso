/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

/**
 * Style dependencies
 */
import './style.scss';

class AnalyticsPage extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Main className="analytics__main">
				<DocumentHead title={ translate( 'Analytics' ) } />

				<PageViewTracker path="/partner-portal/analytics" title="Partner Portal Analytics" />

				<div className="analytics__title">
					<h2>{ translate( 'Analytics' ) }</h2>
				</div>
			</Main>
		);
	}
}

export default localize( AnalyticsPage );
