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
import ServerCredentialsForm from 'landing/jetpack-cloud/components/server-credentials-form';
import { Card } from '@automattic/components';
import getRewindState from 'state/selectors/get-rewind-state';
import QueryRewindState from 'components/data/query-rewind-state';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import ExternalLink from 'components/external-link';

/**
 * Style dependencies
 */
import './style.scss';
import connectedIcon from './images/server-connected.svg';
import disconnectedIcon from './images/server-disconnected.svg';

class SettingsPage extends Component {
	renderServerConnectionStatus() {
		const { translate, rewind } = this.props;

		const isConnected = 'active' === rewind.state;

		const iconPath = isConnected ? connectedIcon : disconnectedIcon;
		const myClassName = isConnected ? 'settings__connected' : 'settings__disconnected';
		const title = isConnected
			? translate( 'Server status: Connected' )
			: translate( 'Server status: Not connected' );
		const content = isConnected
			? translate( 'One-click restores are enabled.' )
			: translate(
					'Enter your server credentials to enable one-click restores for Backups. {{a}}Find your server credentials{{/a}}',
					{
						components: {
							a: (
								<ExternalLink
									className="settings__link-external"
									icon
									href="https://jetpack.com/support/adding-credentials-to-jetpack/"
								/>
							),
						},
					}
			  );

		return (
			<Card compact={ true } className={ myClassName }>
				<img className="settings__icon" src={ iconPath } alt="" />
				<div className="settings__details">
					<div className="settings__details-head"> { title } </div>
					<div>{ content }</div>
				</div>
			</Card>
		);
	}

	render() {
		const { rewind, siteId, translate } = this.props;

		const isInitialized = ! ( 'uninitialized' === rewind.state );

		return (
			<Main className="settings">
				<DocumentHead title={ translate( 'Settings' ) } />
				<SidebarNavigation />
				<QueryRewindState siteId={ siteId } />
				<PageViewTracker path="/settings/:site" title="Settings" />
				<div className="settings__title">
					<h2>{ translate( 'Server connection details' ) }</h2>
				</div>

				{ isInitialized && this.renderServerConnectionStatus() }

				{ ! isInitialized && <div className="settings__is-uninitialized" /> }

				<ServerCredentialsForm
					role="main"
					siteId={ siteId }
					labels={ {
						save: translate( 'Save credentials' ),
					} }
					showCancelButton={ false }
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
