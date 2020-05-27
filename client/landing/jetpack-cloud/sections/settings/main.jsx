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
import getSiteScanState from 'state/selectors/get-site-scan-state';
import QueryJetpackScan from 'components/data/query-jetpack-scan';
import QueryRewindState from 'components/data/query-rewind-state';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import ExternalLink from 'components/external-link';

/**
 * Style dependencies
 */
import './style.scss';
import connectedIcon from 'assets/images/jetpack/connected.svg';
import disconnectedIcon from 'assets/images/jetpack/disconnected.svg';

const connectedProps = ( translate, connectedMessage ) => ( {
	iconPath: connectedIcon,
	className: 'settings__connected',
	title: translate( 'Server status: Connected' ),
	content: connectedMessage,
} );

const disconnectedProps = ( translate, disconnectedMessage ) => ( {
	iconPath: disconnectedIcon,
	className: 'settings__disconnected',
	title: translate( 'Server status: Not connected' ),
	content: translate( '%s {{a}}Need help? Find your server credentials{{/a}}', {
		args: [ disconnectedMessage ],
		components: {
			a: (
				<ExternalLink
					className="settings__link-external"
					icon
					href="https://jetpack.com/support/adding-credentials-to-jetpack/"
				/>
			),
		},
	} ),
} );

const getCardProps = ( isConnected, message, translate ) => {
	if ( isConnected ) {
		return connectedProps( translate, message );
	}
	return disconnectedProps( translate, message );
};

const ConnectionStatus = ( { cardProps } ) => {
	// const translate = useTranslate();
	// const cardProps = isConnected ? connectedProps( translate ) : disconnectedProps( translate );

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

	const NO_PRODUCT = 0;
	const HAS_BACKUP = 1;
	const HAS_SCAN = 2;
	const HAVE_BOTH = 3;

	const DISCONNECTED = 0;
	const CONNECTED = 1;

	const messages = {
		[ DISCONNECTED ]: {
			[ NO_PRODUCT ]: '',
			[ HAS_BACKUP ]: translate(
				'Enter your server credentials to enable one-click restores for [Real-time/Daily] Backups.'
			),
			[ HAS_SCAN ]: translate(
				'Enter your server credentials to enable Jetpack to auto fix threats.'
			),
			[ HAVE_BOTH ]: translate(
				'Enter your server credentials to enable one-click restores for backups & to auto-fix threats.'
			),
		},
		[ CONNECTED ]: {
			[ NO_PRODUCT ]: '',
			[ HAS_BACKUP ]: translate( 'One-click restores are enabled.' ),
			[ HAS_SCAN ]: translate( 'Auto-fix threats are enabled.' ),
			[ HAVE_BOTH ]: translate( 'One-click restores & auto-fix threats are enabled.' ),
		},
	};

	const scanState = useSelector( ( state ) => getSiteScanState( state, siteId ) );
	const backupState = useSelector( ( state ) => getRewindState( state, siteId ) );

	const isInitialized = backupState.state !== 'uninitialized';
	const isConnected = backupState.state === 'active';

	const hasBackup = backupState?.state !== 'unavailable';
	const hasScan = scanState?.state !== 'unavailable';

	const productCode = hasBackup | ( hasScan << 1 );

	const message = messages[ ( +isConnected ).toString() ][ productCode.toString() ];

	const cardProps = getCardProps( isConnected, message, translate );

	const [ formOpen, setFormOpen ] = useState( false );
	useEffect( () => {
		setFormOpen( ! isConnected );
	}, [ isConnected ] );

	return (
		<Main className="settings">
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			<QueryRewindState siteId={ siteId } />
			<QueryJetpackScan siteId={ siteId } />
			<PageViewTracker path="/settings/:site" title="Settings" />

			<div className="settings__title">
				<h2>{ translate( 'Server connection details' ) }</h2>
			</div>

			{ ! isInitialized && <div className="settings__status-uninitialized" /> }
			{ isInitialized && <ConnectionStatus cardProps={ cardProps } /> }

			{ ! isInitialized && <div className="settings__form-uninitialized" /> }
			{ isInitialized && (
				<FoldableCard
					clickableHeader
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
