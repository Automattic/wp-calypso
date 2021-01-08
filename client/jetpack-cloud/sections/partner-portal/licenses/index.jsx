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

class LicensesPage extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Main className="licenses__main">
				<DocumentHead title={ translate( 'Licenses' ) } />

				<PageViewTracker path="/partner-portal/licenses" title="Partner Portal Licenses" />

				<div className="licenses__title">
					<h2>{ translate( 'Licenses' ) }</h2>
				</div>
			</Main>
		);
	}
}

export default localize( LicensesPage );
