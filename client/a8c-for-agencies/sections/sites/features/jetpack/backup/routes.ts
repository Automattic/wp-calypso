import page from '@automattic/calypso-router';
import { Context, type Callback } from '@automattic/calypso-router';
import { sitesContext } from 'calypso/a8c-for-agencies/sections/sites/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { JETPACK_BACKUP_ID } from '../../features';
import {
	backupClone,
	backupContents,
	backupDownload,
	backupGranularRestore,
	backupRestore,
	//backups,
	//showUpsellIfNoBackup,
	showJetpackIsDisconnected,
	showNotAuthorizedForNonAdmins,
	showUnavailableForVaultPressSites,
	showUnavailableForMultisites,
	wrapInSiteOffsetProvider,
} from './controller';

/* Todo: This code from Jetpack Cloud is not working properly. Commented.
const notFoundIfNotEnabled = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const showJetpackSection = isJetpackSectionEnabledForSite( state, siteId );

	if ( ! isJetpackCloud() && ! showJetpackSection ) {
		return notFound( context, next );
	}

	next();
};
*/

const processBackupContext: Callback = ( context: Context, next ) => {
	context.params.feature = JETPACK_BACKUP_ID;
	next();
};

export default function ( basePath: string ) {
	basePath += `/${ JETPACK_BACKUP_ID }`;

	/* handles /download/:rewindId */
	page(
		`${ basePath }/download/:rewindId?`,
		processBackupContext,
		backupDownload,
		wrapInSiteOffsetProvider,
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		sitesContext,
		//wpcomAtomicTransfer( WPCOMUpsellPage ),
		//notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	/* handles /restore/:rewindId */
	page(
		`${ basePath }/restore/:rewindId?`,
		processBackupContext,
		backupRestore,
		wrapInSiteOffsetProvider,
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		sitesContext,
		//wpcomAtomicTransfer( WPCOMUpsellPage ),
		//notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	/* handles /clone */
	page(
		`${ basePath }/clone`,
		processBackupContext,
		backupClone,
		wrapInSiteOffsetProvider,
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		sitesContext,
		//wpcomAtomicTransfer( WPCOMUpsellPage ),
		//notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	/* handles / */
	/*page(
		`${ basePath }`,
		processBackupContext,
		backups,
		wrapInSiteOffsetProvider,
		showUpsellIfNoBackup,
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		sitesContext,
		//wpcomAtomicTransfer( WPCOMUpsellPage ),
		//notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);*/

	/* handles /contents/:rewindId, see `backupContentsPath` */
	page(
		`${ basePath }/contents/:rewindId?`,
		processBackupContext,
		backupContents,
		wrapInSiteOffsetProvider,
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		sitesContext,
		//wpcomAtomicTransfer( WPCOMUpsellPage ),
		//notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	/* handles /granular-restore/:rewindId, see `backupGranularRestorePath` */
	page(
		`${ basePath }/granular-restore/:rewindId?`,
		processBackupContext,
		backupGranularRestore,
		wrapInSiteOffsetProvider,
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		sitesContext,
		//wpcomAtomicTransfer( WPCOMUpsellPage ),
		//notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	handleJetpackCloudRedirections();
}

function handleJetpackCloudRedirections() {
	page( '/backup/:site/download/:rewindId?', ( context, next ) => {
		const { site, rewindId } = context.params;
		//todo: get the current selected feature family instead of the hardcoded 'overview'
		page.replace(
			`/sites/overview/${ site }/${ JETPACK_BACKUP_ID }/download/${ rewindId ?? '' }`,
			context.state,
			true,
			true
		);
		next();
	} );

	page( '/backup/:site/contents/:rewindId?', ( context, next ) => {
		const { site, rewindId } = context.params;
		//todo: get the current selected feature family instead of the hardcoded 'overview'
		page.replace(
			`/sites/overview/${ site }/${ JETPACK_BACKUP_ID }/contents/${ rewindId ?? '' }`,
			context.state,
			true,
			true
		);
		next();
	} );

	/* handles /backup/:site/download/:rewindId, see `backupDownloadPath` */
	/* handles /backup/:site/restore/:rewindId, see `backupRestorePath` */
	/* handles /backup/:site/clone, see `backupClonePath` */
	/* handles /backup/:site, see `backupMainPath` */
	/* handles /backup/:site/contents/:rewindId, see `backupContentsPath` */
	/* handles /backup/:site/granular-restore/:rewindId, see `backupGranularRestorePath` */
	/* handles /backups, see `backupMainPath` */
}
