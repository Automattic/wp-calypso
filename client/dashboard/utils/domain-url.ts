import { addQueryArgs } from '@wordpress/url';
import { domainConnectionSetupRoute } from '../app/router/domains';
import { isDashboardBackport } from './is-dashboard-backport';
import { dashboardLink, getCurrentDashboard, redirectToDashboardLink, wpcomLink } from './link';

export function getDomainConnectionSetupTemplateUrl() {
	const domainConnectionSetupTemplateUrl = domainConnectionSetupRoute.fullPath.replace(
		'$domainName',
		'%s'
	);
	return dashboardLink( domainConnectionSetupTemplateUrl );
}

export function getAddSiteDomainUrl( siteSlug: string ) {
	const backUrl = redirectToDashboardLink( { supportBackport: true } );

	if ( isDashboardBackport() ) {
		return addQueryArgs( `/domains/add/${ siteSlug }`, { redirect_to: backUrl } );
	}

	return addQueryArgs( wpcomLink( '/setup/domain' ), {
		siteSlug,
		domainConnectionSetupUrl: getDomainConnectionSetupTemplateUrl(),
		back_to: backUrl,
		redirect_to: backUrl,
		dashboard: getCurrentDashboard(),
	} );
}
