/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { localize, useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getSelectedSiteId } from 'state/ui/selectors';
import ServerCredentialsForm from 'landing/jetpack-cloud/components/server-credentials-form';
import { Button, Card } from '@automattic/components';
import getRewindState from 'state/selectors/get-rewind-state';
import QueryRewindState from 'components/data/query-rewind-state';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import ExternalLink from 'components/external-link';
import userUtilities from 'lib/user/utils';

/**
 * Style dependencies
 */
import './style.scss';
import connectedIcon from './images/server-connected.svg';
import disconnectedIcon from './images/server-disconnected.svg';

const connectedProps = ( translate ) => ( {
	iconPath: connectedIcon,
	className: 'settings_connected',
	title: translate( 'Server status: Connected' ),
	content: translate( 'One-click restores are enabled.' ),
} );

const disconnectedProps = ( translate ) => ( {
	iconPath: disconnectedIcon,
	className: 'settings_disconnected',
	title: translate( 'Server status: Not connected' ),
	content: translate(
		'Enter your server credentials to enable one-click restores for Backups. {{a}}Need help? Find your server credentials{{/a}}',
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
	),
} );

const ConnectionStatus = ( { rewindState } ) => {
	const translate = useTranslate();

	if ( rewindState === 'uninitialized' ) {
		return <div className="settings__is-uninitialized" />;
	}

	const isConnected = 'active' === rewindState;
	const cardProps = isConnected ? connectedProps( translate ) : disconnectedProps( translate );

	return (
		<Card compact={ true } className={ cardProps.className }>
			<img className="settings__icon" src={ cardProps.iconPath } alt="" />
			<div className="settings__details">
				<div className="settings__details-head"> { cardProps.title } </div>
				<div>{ cardProps.content }</div>
			</div>
		</Card>
	);
};

const SettingsPage = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const rewind = useSelector( ( state ) => getRewindState( state, siteId ) );

	// Clears everything user related on the client site by
	// calling user.clear() which calls store.clearAll();
	// @todo: track event (what type?)
	const logOut = () => userUtilities.logout();

	return (
		<Main className="settings">
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			<QueryRewindState siteId={ siteId } />
			<PageViewTracker path="/settings/:site" title="Settings" />

			<Button primary scary onClick={ logOut }>
				Log out
			</Button>

			<div className="settings__title">
				<h2>{ translate( 'Server connection details' ) }</h2>
			</div>

			<ConnectionStatus rewindState={ rewind.state } />

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
};

export default localize( SettingsPage );
