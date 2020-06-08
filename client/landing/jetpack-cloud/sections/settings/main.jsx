/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { localize, useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getSelectedSiteId } from 'state/ui/selectors';
import ServerCredentialsForm from 'components/jetpack/server-credentials-form';
import { Card } from '@automattic/components';
import FoldableCard from 'components/foldable-card';
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

const ConnectionStatus = ( { isConnected } ) => {
	const translate = useTranslate();
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
	const isInitialized = rewind.state !== 'uninitialized';
	const isConnected = rewind.state === 'active';

	const [ formOpen, setFormOpen ] = useState( false );
	useEffect( () => {
		setFormOpen( ! isConnected );
	}, [ isConnected ] );

	return (
		<Main className="settings">
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			<QueryRewindState siteId={ siteId } />
			<PageViewTracker path="/settings/:site" title="Settings" />

			<div className="settings__title">
				<h2>{ translate( 'Server connection details' ) }</h2>
			</div>

			{ ! isInitialized && <div className="settings__status-uninitialized" /> }
			{ isInitialized && <ConnectionStatus isConnected={ isConnected } /> }

			{ ! isInitialized && <div className="settings__form-uninitialized" /> }
			{ isInitialized && (
				<FoldableCard
					header={
						formOpen
							? translate( 'Hide connection details' )
							: translate( 'Show connection details' )
					}
					expanded={ formOpen }
					onClick={ () => setFormOpen( ! formOpen ) }
					className="settings__form-card"
				>
					<ServerCredentialsForm
						role="main"
						siteId={ siteId }
						labels={ {
							save: translate( 'Save credentials' ),
						} }
						showCancelButton={ false }
					/>
				</FoldableCard>
			) }
		</Main>
	);
};

export default localize( SettingsPage );
