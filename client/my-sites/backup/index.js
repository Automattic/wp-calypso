/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	backupDownload,
	backupRestore,
	backups,
	showJetpackIsDisconnected,
	showNotAuthorizedForNonAdmins,
	showUpsellIfNoBackup,
	showUnavailableForVaultPressSites,
	showUnavailableForMultisites,
} from 'calypso/my-sites/backup/controller';
import { backupMainPath, backupRestorePath, backupDownloadPath } from './paths';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isEnabled } from 'calypso/config';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { notFound, makeLayout, render as clientRender } from 'calypso/controller';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import isJetpackSectionEnabledForSite from 'calypso/state/selectors/is-jetpack-section-enabled-for-site';
import wpcomUpsellController from 'calypso/lib/jetpack/wpcom-upsell-controller';
import WPCOMUpsellPage from 'calypso/my-sites/backup/wpcom-upsell';
import wrapInSiteOffsetProvider from 'calypso/lib/wrap-in-site-offset';

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
		wpcomUpsellController( WPCOMUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	if ( isEnabled( 'jetpack/backups-restore' ) ) {
		/* handles /backup/:site/restore/:rewindId, see `backupRestorePath` */
		page(
			backupRestorePath( ':site', ':rewindId' ),
			siteSelection,
			navigation,
			backupRestore,
			wrapInSiteOffsetProvider,
			wpcomUpsellController( WPCOMUpsellPage ),
			showUnavailableForVaultPressSites,
			showJetpackIsDisconnected,
			showUnavailableForMultisites,
			showNotAuthorizedForNonAdmins,
			notFoundIfNotEnabled,
			makeLayout,
			clientRender
		);
	}

	/* handles /backup/:site, see `backupMainPath` */
	page(
		backupMainPath( ':site' ),
		siteSelection,
		navigation,
		backups,
		wrapInSiteOffsetProvider,
		showUpsellIfNoBackup,
		wpcomUpsellController( WPCOMUpsellPage ),
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
