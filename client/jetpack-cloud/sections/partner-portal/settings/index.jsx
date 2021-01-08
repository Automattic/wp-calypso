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

class SettingsPage extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Main className="settings__main">
				<DocumentHead title={ translate( 'Settings' ) } />

				<PageViewTracker path="/partner-portal/settings" title="Partner Portal Settings" />

				<div className="settings__title">
					<h2>{ translate( 'Settings' ) }</h2>
				</div>
			</Main>
		);
	}
}

export default localize( SettingsPage );
