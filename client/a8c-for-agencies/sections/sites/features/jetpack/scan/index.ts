import page from '@automattic/calypso-router';
import { Context, type Callback } from '@automattic/calypso-router';
import { sitesContext } from 'calypso/a8c-for-agencies/sections/sites/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { JETPACK_SCAN_ID } from '../../features';
import {
	showJetpackIsDisconnected,
	showNotAuthorizedForNonAdmins,
	showUpsellIfNoScan,
	showUpsellIfNoScanHistory,
	showUnavailableForVaultPressSites,
	showUnavailableForMultisites,
	scan,
	scanHistory,
} from './controller';

/* Todo: This middleware has some issues with the current context.
const notFoundIfNotEnabled = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const showJetpackSection = isJetpackSectionEnabledForSite( state, siteId );
	const isWPCOMSite = getIsSiteWPCOM( state, siteId );

	if ( isWPCOMSite || ( ! isJetpackCloud() && ! showJetpackSection ) ) {
		return notFound( context, next );
	}

	next();
};
*/

const processScanContext: Callback = ( context: Context, next ) => {
	context.params.feature = JETPACK_SCAN_ID;
	next();
};

export default function ( basePath: string ) {
	basePath += `/${ JETPACK_SCAN_ID }`;

	// Scan History
	page(
		`${ basePath }/history/:filter?`,
		processScanContext,
		scanHistory,
		sitesContext,
		//wrapInSiteOffsetProvider,
		showUpsellIfNoScanHistory,
		//wpcomAtomicTransfer( WPCOMScanUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		//notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	// Scan Main Page
	page(
		`${ basePath }/:filter?`,
		processScanContext,
		scan,
		sitesContext,
		//wrapInSiteOffsetProvider,
		showUpsellIfNoScan,
		//wpcomAtomicTransfer( WPCOMScanUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		//notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	// Handle route redirections. Note: We have to keep these route loading order.

	// Manage - Scan History page
	page( '/scan/history/:site/:filter?', ( context, next ) => {
		const { site, filter } = context.params;
		//todo: get the current selected feature family instead of the hardcoded 'overview'
		page.replace(
			`/sites/overview/${ site }/${ JETPACK_SCAN_ID }/history/${ filter ?? '' }`,
			context.state,
			true,
			true
		);
		next();
	} );

	// Manage - Scan Summary page
	page( '/scan/:site/:filter?', ( context, next ) => {
		const { site, filter } = context.params;
		//todo: get the current selected feature family instead of the hardcoded 'overview'
		page.replace( `/sites/overview/${ site }/${ JETPACK_SCAN_ID }/${ filter ?? '' }` );
		next();
	} );
}
