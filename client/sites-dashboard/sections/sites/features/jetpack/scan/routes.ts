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
	wrapInSiteOffsetProvider,
} from './controller';

/* Todo: This code from Jetpack Cloud is not working properly. Commented.
const notFoundIfNotEnabled: Callback = ( context: Context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const showJetpackSection = isJetpackSectionEnabledForSite( state, siteId );
	const isWPCOMSite = getIsSiteWPCOM( state, siteId );

	if ( isWPCOMSite || ( ! isJetpackCloud() && ! showJetpackSection ) ) {
		context.featurePreview = 'Not Connected';
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
		wrapInSiteOffsetProvider,
		showUpsellIfNoScanHistory,
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		sitesContext,
		//wpcomAtomicTransfer( WPCOMScanUpsellPage ),
		//notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	// Scan Main Page
	page(
		`${ basePath }/:filter?`,
		processScanContext,
		scan,
		wrapInSiteOffsetProvider,
		showUpsellIfNoScan,
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		sitesContext,
		//notFoundIfNotEnabled,
		//wpcomAtomicTransfer( WPCOMScanUpsellPage ),
		//
		makeLayout,
		clientRender
	);

	handleJetpackCloudRedirections();
}

function handleJetpackCloudRedirections() {
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
