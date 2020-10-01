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
	showUpsellIfNoBackup,
	showUnavailableForMultisites,
} from 'my-sites/backup/controller';
import { backupMainPath, backupRestorePath, backupDownloadPath } from './paths';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isEnabled } from 'config';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { notFound, makeLayout, render as clientRender } from 'controller';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import isJetpackSectionEnabledForSite from 'state/selectors/is-jetpack-section-enabled-for-site';
import wpcomUpsellController from 'lib/jetpack/wpcom-upsell-controller';
import WPCOMUpsellPage from 'my-sites/backup/wpcom-upsell';
import wrapInSiteOffsetProvider from 'lib/wrap-in-site-offset';

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
		showUnavailableForMultisites,
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
			showUnavailableForMultisites,
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
		showUnavailableForMultisites,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);
	/* handles /backups, see `backupMainPath` */
	page( backupMainPath(), siteSelection, sites, makeLayout, clientRender );
}
