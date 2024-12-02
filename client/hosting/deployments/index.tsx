import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectToHostingPromoIfNotAtomic,
} from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { DOTCOM_GITHUB_DEPLOYMENTS } from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import {
	redirectHomeIfIneligible,
	deploymentCreation,
	deploymentManagement,
	deploymentRunLogs,
	deploymentsList,
} from './controller';

export default function () {
	page( '/github-deployments', siteSelection, sites, makeLayout, clientRender );

	if ( isEnabled( 'untangling/hosting-menu' ) ) {
		page( '/github-deployments/:site', ( context: Context ) => {
			page.redirect( `/sites/tools/deployments/${ context.params.site }` );
		} );
		page( '/github-deployments/:site/create', ( context: Context ) => {
			page.redirect( `/sites/tools/deployments/${ context.params.site }/create` );
		} );
		page( '/github-deployments/:site/manage/:deploymentId', ( context: Context ) => {
			page.redirect(
				`/sites/tools/deployments/${ context.params.site }/manage/${ context.params.deploymentId }`
			);
		} );
		page( '/github-deployments/:site/logs/:deploymentId', ( context: Context ) => {
			page.redirect(
				`/sites/tools/deployments/${ context.params.site }/logs/${ context.params.deploymentId }`
			);
		} );
	} else {
		page(
			'/github-deployments/:site',
			siteSelection,
			redirectToHostingPromoIfNotAtomic,
			redirectHomeIfIneligible,
			navigation,
			deploymentsList,
			siteDashboard( DOTCOM_GITHUB_DEPLOYMENTS ),
			makeLayout,
			clientRender
		);

		page(
			'/github-deployments/:site/create',
			siteSelection,
			redirectToHostingPromoIfNotAtomic,
			redirectHomeIfIneligible,
			navigation,
			deploymentCreation,
			siteDashboard( DOTCOM_GITHUB_DEPLOYMENTS ),
			makeLayout,
			clientRender
		);

		page(
			'/github-deployments/:site/manage/:deploymentId',
			siteSelection,
			redirectToHostingPromoIfNotAtomic,
			redirectHomeIfIneligible,
			navigation,
			deploymentManagement,
			siteDashboard( DOTCOM_GITHUB_DEPLOYMENTS ),
			makeLayout,
			clientRender
		);

		page(
			'/github-deployments/:site/logs/:deploymentId',
			siteSelection,
			redirectToHostingPromoIfNotAtomic,
			redirectHomeIfIneligible,
			navigation,
			deploymentRunLogs,
			siteDashboard( DOTCOM_GITHUB_DEPLOYMENTS ),
			makeLayout,
			clientRender
		);
	}
}
