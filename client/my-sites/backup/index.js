import page from '@automattic/calypso-router';
import { notFound, makeLayout, render as clientRender } from 'calypso/controller';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import wrapInSiteOffsetProvider from 'calypso/lib/wrap-in-site-offset';
import {
	showJetpackIsDisconnected,
	showNotAuthorizedForNonAdmins,
	showUpsellIfNoBackup,
	showUnavailableForVaultPressSites,
	showUnavailableForMultisites,
	backups,
	backupDownload,
	backupRestore,
	backupClone,
	backupContents,
	backupGranularRestore,
} from 'calypso/my-sites/backup/controller';
import { wpcomJetpackBackupAtomicTransfer } from 'calypso/my-sites/backup/wpcom-atomic-transfer';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import isJetpackSectionEnabledForSite from 'calypso/state/selectors/is-jetpack-section-enabled-for-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	backupDownloadPath,
	backupRestorePath,
	backupClonePath,
	backupMainPath,
	backupContentsPath,
	backupGranularRestorePath,
} from './paths';
import WPCOMUpsellPage from './wpcom-upsell';

const notFoundIfNotEnabled = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const showJetpackSection = isJetpackSectionEnabledForSite( state, siteId );

	// Only show 404 if not in Jetpack Cloud AND Jetpack section is not enabled
	// Allow WordPress.com sites to access backup features (they'll see upsell)
	if ( ! isJetpackCloud() && ! showJetpackSection ) {
		return notFound( context, next );
	}

	next();
};

export default function () {
	/* handles /backups, see `backupMainPath` */
	page( backupMainPath(), siteSelection, sites, makeLayout, clientRender );

	/* handles /backup/:site/download/:rewindId, see `backupDownloadPath` */
	page(
		backupDownloadPath( ':site', ':rewindId' ),
		siteSelection,
		navigation,
		backupDownload,
		wrapInSiteOffsetProvider,
		wpcomJetpackBackupAtomicTransfer( WPCOMUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	/* handles /backup/:site/restore/:rewindId, see `backupRestorePath` */
	page(
		backupRestorePath( ':site', ':rewindId' ),
		siteSelection,
		navigation,
		backupRestore,
		wrapInSiteOffsetProvider,
		wpcomJetpackBackupAtomicTransfer( WPCOMUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	/* handles /backup/:site/clone, see `backupClonePath` */
	page(
		backupClonePath( ':site' ),
		siteSelection,
		navigation,
		backupClone,
		wrapInSiteOffsetProvider,
		wpcomJetpackBackupAtomicTransfer( WPCOMUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	/* handles /backup/:site, see `backupMainPath` */
	page(
		backupMainPath( ':site' ),
		siteSelection,
		navigation,
		backups,
		wrapInSiteOffsetProvider,
		showUpsellIfNoBackup,
		wpcomJetpackBackupAtomicTransfer( WPCOMUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	/* handles /backup/:site/contents/:rewindId, see `backupContentsPath` */
	page(
		backupContentsPath( ':site', ':rewindId' ),
		siteSelection,
		navigation,
		backupContents,
		wrapInSiteOffsetProvider,
		wpcomJetpackBackupAtomicTransfer( WPCOMUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	/* handles /backup/:site/granular-restore/:rewindId, see `backupGranularRestorePath` */
	page(
		backupGranularRestorePath( ':site', ':rewindId' ),
		siteSelection,
		navigation,
		backupGranularRestore,
		wrapInSiteOffsetProvider,
		wpcomJetpackBackupAtomicTransfer( WPCOMUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);
}
