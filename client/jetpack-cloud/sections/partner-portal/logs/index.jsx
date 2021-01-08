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

class LogsPage extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Main className="logs__main">
				<DocumentHead title={ translate( 'Logs' ) } />

				<PageViewTracker path="/partner-portal/logs" title="Partner Portal Logs" />

				<div className="logs__title">
					<h2>{ translate( 'Logs' ) }</h2>
				</div>
			</Main>
		);
	}
}

export default localize( LogsPage );
