/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import BackupRewindFlow, { RewindFlowPurpose } from './rewind-flow';
import BackupsPage from './main';
import UpsellSwitch from 'calypso/components/jetpack/upsell-switch';
import BackupUpsell from './backup-upsell';
import WPCOMBackupUpsell from './wpcom-backup-upsell';
import BackupPlaceholder from 'calypso/components/jetpack/backup-placeholder';
import FormattedHeader from 'calypso/components/formatted-header';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isJetpackBackupSlug } from 'calypso/lib/products-values';
import HasVaultPressSwitch from 'calypso/components/jetpack/has-vaultpress-switch';
import IsJetpackDisconnectedSwitch from 'calypso/components/jetpack/is-jetpack-disconnected-switch';

export function showUpsellIfNoBackup( context, next ) {
	const UpsellComponent = isJetpackCloud() ? BackupUpsell : WPCOMBackupUpsell;
	context.primary = (
		<>
			<UpsellSwitch
				UpsellComponent={ UpsellComponent }
				QueryComponent={ QueryRewindState }
				getStateForSite={ getRewindState }
				isRequestingForSite={ ( state, siteId ) =>
					'uninitialized' === getRewindState( state, siteId )?.state
				}
				display={ context.primary }
				productSlugTest={ isJetpackBackupSlug }
			>
				<SidebarNavigation />
				{ ! isJetpackCloud() && (
					<FormattedHeader brandFont headerText="Jetpack Backup" align="left" />
				) }
				<BackupPlaceholder />
			</UpsellSwitch>
		</>
	);
	next();
}

export function showJetpackIsDisconnected( context, next ) {
	const JetpackConnectionFailed = isJetpackCloud() ? (
		<BackupUpsell reason="no_connected_jetpack" />
	) : (
		<WPCOMBackupUpsell reason="no_connected_jetpack" />
	);
	context.primary = (
		<IsJetpackDisconnectedSwitch
			trueComponent={ JetpackConnectionFailed }
			falseComponent={ context.primary }
		/>
	);
	next();
}

export function showUnavailableForVaultPressSites( context, next ) {
	const message = isJetpackCloud() ? (
		<BackupUpsell reason="vp_active_on_site" />
	) : (
		<WPCOMBackupUpsell reason="vp_active_on_site" />
	);

	context.primary = (
		<HasVaultPressSwitch trueComponent={ message } falseComponent={ context.primary } />
	);

	next();
}

export function showUnavailableForMultisites( context, next ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	if ( isJetpackSiteMultiSite( state, siteId ) ) {
		context.primary = isJetpackCloud() ? (
			<BackupUpsell reason="multisite_not_supported" />
		) : (
			<WPCOMBackupUpsell reason="multisite_not_supported" />
		);
	}

	next();
}

/* handles /backup/:site, see `backupMainPath` */
export function backups( context, next ) {
	const { date } = context.query;

	context.primary = <BackupsPage queryDate={ date } />;
	next();
}

/* handles /backup/:site/download/:rewindId, see `backupDownloadPath` */
export function backupDownload( context, next ) {
	context.primary = (
		<BackupRewindFlow rewindId={ context.params.rewindId } purpose={ RewindFlowPurpose.DOWNLOAD } />
	);
	next();
}

/* handles /backup/:site/restore/:rewindId, see `backupRestorePath` */
export function backupRestore( context, next ) {
	context.primary = (
		<BackupRewindFlow rewindId={ context.params.rewindId } purpose={ RewindFlowPurpose.RESTORE } />
	);
	next();
}
