import page from 'page';
import { notFound, makeLayout, render as clientRender } from 'calypso/controller';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import wpcomAtomicTransfer from 'calypso/lib/jetpack/wpcom-atomic-transfer';
import wrapInSiteOffsetProvider from 'calypso/lib/wrap-in-site-offset';
import {
	backupDownload,
	backupRestore,
	backupClone,
	backupContents,
	backupGranularRestore,
	backups,
	showJetpackIsDisconnected,
	showNotAuthorizedForNonAdmins,
	showUpsellIfNoBackup,
	showUnavailableForVaultPressSites,
	showUnavailableForMultisites,
} from 'calypso/my-sites/backup/controller';
import WPCOMUpsellPage from 'calypso/my-sites/backup/wpcom-backup-upsell';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import isJetpackSectionEnabledForSite from 'calypso/state/selectors/is-jetpack-section-enabled-for-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	backupMainPath,
	backupRestorePath,
	backupDownloadPath,
	backupClonePath,
	backupContentsPath,
	backupGranularRestorePath,
} from './paths';

const notFoundIfNotEnabled = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const showJetpackSection = isJetpackSectionEnabledForSite( state, siteId );

	if ( ! isJetpackCloud() && ! showJetpackSection ) {
		return notFound( context, next );
	}

	next();
};

export default function () {
	/* handles /backup/:site/download/:rewindId, see `backupDownloadPath` */
	page(
		backupDownloadPath( ':site', ':rewindId' ),
		siteSelection,
		navigation,
		backupDownload,
		wrapInSiteOffsetProvider,
		wpcomAtomicTransfer( WPCOMUpsellPage ),
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
		wpcomAtomicTransfer( WPCOMUpsellPage ),
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
		wpcomAtomicTransfer( WPCOMUpsellPage ),
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
		wpcomAtomicTransfer( WPCOMUpsellPage ),
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
		wpcomAtomicTransfer( WPCOMUpsellPage ),
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
		wpcomAtomicTransfer( WPCOMUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	/* handles /backups, see `backupMainPath` */
	page( backupMainPath(), siteSelection, sites, makeLayout, clientRender );
}
