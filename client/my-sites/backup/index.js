/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';

import { navigation, siteSelection, sites } from 'my-sites/controller';
import { makeLayout, render as clientRender, renderNotFound } from 'controller';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import wrapInSiteOffsetProvider from 'lib/jetpack/wrap-in-site-offset';
import wpcomUpsellController from 'lib/jetpack/wpcom-upsell-controller';
import { getSelectedSiteId } from 'state/ui/selectors';
import isJetpackSectionEnabledForSite from 'state/selectors/is-jetpack-section-enabled-for-site';
import {
	backupActivity,
	backupDownload,
	backupRestore,
	backups,
	showUpsellIfNoBackup,
} from 'my-sites/backup/controller';
import WPCOMUpsellPage from 'my-sites/backup/wpcom-upsell';

import { backupMainPath, backupActivityPath, backupRestorePath, backupDownloadPath } from './paths';

const renderNotFoundIfNotEnabled = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const showJetpackSection = isJetpackSectionEnabledForSite( state, siteId );

	if ( ! isJetpackCloud() && ! showJetpackSection ) {
		return renderNotFound( context, next );
	}

	next();
};

export default function () {
	/* handles /backup/activity, see `backupActivityPath` */
	page( backupActivityPath(), siteSelection, sites, makeLayout, clientRender );

	/* handles /backup/activity/:site, see `backupActivityPath` */
	page(
		backupActivityPath( ':site' ),
		siteSelection,
		navigation,
		backupActivity,
		wrapInSiteOffsetProvider,
		showUpsellIfNoBackup,
		wpcomUpsellController( WPCOMUpsellPage ),
		renderNotFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	/* handles /backup/:site/download/:rewindId, see `backupDownloadPath` */
	page(
		backupDownloadPath( ':site', ':rewindId' ),
		siteSelection,
		navigation,
		backupDownload,
		wrapInSiteOffsetProvider,
		wpcomUpsellController( WPCOMUpsellPage ),
		renderNotFoundIfNotEnabled,
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
			renderNotFoundIfNotEnabled,
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
		renderNotFoundIfNotEnabled,
		makeLayout,
		clientRender
	);
	/* handles /backups, see `backupMainPath` */
	page( backupMainPath(), siteSelection, sites, makeLayout, clientRender );
}
