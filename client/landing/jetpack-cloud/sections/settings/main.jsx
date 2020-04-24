/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getSelectedSiteId } from 'state/ui/selectors';
import RewindCredentialsForm from 'components/rewind-credentials-form';
import { Card } from '@automattic/components';
import getRewindState from 'state/selectors/get-rewind-state';
import QueryRewindState from 'components/data/query-rewind-state';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';

/**
 * Style dependencies
 */
import './style.scss';

class SettingsPage extends Component {
	render() {
		const { rewind, siteId, translate } = this.props;

		const isConnected = 'active' === rewind.state;

		return (
			<Main className="settings">
				<DocumentHead title={ translate( 'Settings' ) } />
				<SidebarNavigation />
				<QueryRewindState siteId={ siteId } />
				<PageViewTracker path="/settings/:site" title="Settings" />
				<div className="settings__page-title">{ translate( 'Server connection details' ) }</div>
				{ isConnected && (
					<Card compact={ true } className="settings__connected">
						<Gridicon icon="checkmark-circle" />
						<div className="settings__details">
							<div className="settings__details-head">
								{ translate( 'Server status: Connected' ) }
							</div>
							<div>{ translate( 'One-click restores are enabled.' ) }</div>
						</div>
					</Card>
				) }
				{ ! isConnected && (
					<Card compact={ true } className="settings__disconnected">
						<Gridicon icon="cross-circle" />
						<div className="settings__details">
							<div className="settings__details-head">
								{ translate( 'Server status: Not connected' ) }
							</div>
							<div>
								{ translate(
									'Enter your server credentials to enable one-click restores for Backups. Find your server credentials.'
								) }
							</div>
						</div>
					</Card>
				) }
				<RewindCredentialsForm
					{ ...{
						allowCancel: false,
						role: 'main',
						siteId,
						showNotices: false,
					} }
				/>
			</Main>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const rewind = getRewindState( state, siteId );

	return {
		siteId,
		rewind,
	};
} )( localize( SettingsPage ) );
