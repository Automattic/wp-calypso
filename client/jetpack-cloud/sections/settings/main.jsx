import { Card, FoldableCard, ExternalLink } from '@automattic/components';
import { localize, useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import connectedIcon from 'calypso/assets/images/jetpack/connected.svg';
import disconnectedIcon from 'calypso/assets/images/jetpack/disconnected.svg';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackScan from 'calypso/components/data/query-jetpack-scan';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import QuerySiteCredentials from 'calypso/components/data/query-site-credentials';
import ServerCredentialsForm from 'calypso/components/jetpack/server-credentials-form';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import getSiteCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

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
	content: disconnectedMessage,
} );

const getCardProps = ( isConnected, message, translate ) => {
	if ( isConnected ) {
		return connectedProps( translate, message );
	}
	return disconnectedProps( translate, message );
};

const ConnectionStatus = ( { cardProps } ) => (
	<Card compact className={ cardProps.className }>
		<img className="settings__icon" src={ cardProps.iconPath } alt="" />
		<div className="settings__details">
			<div className="settings__details-head"> { cardProps.title } </div>
			<div>{ cardProps.content }</div>
		</div>
	</Card>
);

const getStatusMessage = ( isConnected, hasBackup, hasScan, translate ) => {
	const HAS_BACKUP = 1;
	const HAS_SCAN = 2;
	const HAVE_BOTH = 3;

	const helpLink = {
		components: {
			a: (
				<ExternalLink
					className="settings__link-external"
					icon
					href="https://jetpack.com/support/adding-credentials-to-jetpack/"
				/>
			),
		},
	};

	const disconnectedMessages = {
		[ HAS_BACKUP ]: translate(
			'Enter your server credentials to enable one-click restores for backups. {{a}}Need help? Find your server credentials{{/a}}',
			helpLink
		),
		[ HAS_SCAN ]: translate(
			'Enter your server credentials to enable Jetpack to auto-fix threats. {{a}}Need help? Find your server credentials{{/a}}',
			helpLink
		),
		[ HAVE_BOTH ]: translate(
			'Enter your server credentials to enable one-click restores for backups and to auto-fix threats. {{a}}Need help? Find your server credentials{{/a}}',
			helpLink
		),
	};

	const connectedMessages = {
		[ HAS_BACKUP ]: translate( 'One-click restores are enabled.' ),
		[ HAS_SCAN ]: translate( 'Auto-fix threats are enabled.' ),
		[ HAVE_BOTH ]: translate( 'One-click restores and auto-fix threats are enabled.' ),
	};

	const messages = isConnected ? connectedMessages : disconnectedMessages;

	if ( hasBackup && hasScan ) {
		return messages[ HAVE_BOTH ];
	} else if ( hasBackup ) {
		return messages[ HAS_BACKUP ];
	} else if ( hasScan ) {
		return messages[ HAS_SCAN ];
	}

	return '';
};

const SettingsPage = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );

	const scanState = useSelector( ( state ) => getSiteScanState( state, siteId ) );
	const backupState = useSelector( ( state ) => getRewindState( state, siteId ) );
	const credentials = useSelector( ( state ) => getSiteCredentials( state, siteId, 'main' ) );

	const isInitialized =
		backupState.state !== 'uninitialized' || scanState?.state !== 'provisioning';
	const isConnected = credentials && Object.keys( credentials ).length > 0;

	const hasBackup = backupState?.state !== 'unavailable';
	const hasScan = scanState?.state !== 'unavailable';

	const message = getStatusMessage( isConnected, hasBackup, hasScan, translate );

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
			<QuerySiteCredentials siteId={ siteId } />
			<PageViewTracker path="/settings/:site" title="Settings" />

			<div className="settings__title">
				<h2>{ translate( 'Server connection details' ) }</h2>
			</div>

			{ ! isInitialized && <div className="settings__status-uninitialized" /> }
			{ isInitialized && <ConnectionStatus cardProps={ cardProps } /> }

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
					clickableHeader
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
