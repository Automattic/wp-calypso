import { addQueryArgs } from '@wordpress/url';
import { domainConnectionSetupRoute } from '../app/router/domains';
import { getCurrentDashboard } from '../app/routing';
import { isDashboardBackport } from './is-dashboard-backport';
import { dashboardLink, redirectToDashboardLink, wpcomLink } from './link';
import type { Domain } from '@automattic/api-core';

export function getDomainConnectionSetupTemplateUrl() {
	const domainConnectionSetupTemplateUrl = domainConnectionSetupRoute.fullPath.replace(
		'$domainName',
		'%s'
	);
	return dashboardLink( domainConnectionSetupTemplateUrl );
}

export function getCreateSiteFromDomainOnlyUrl( domain: Domain ) {
	return addQueryArgs( wpcomLink( '/start/site-selected/' ), {
		siteSlug: domain.site_slug,
		siteId: domain.blog_id,
	} );
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
