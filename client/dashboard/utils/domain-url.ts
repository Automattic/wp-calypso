import { addQueryArgs } from '@wordpress/url';
import { domainConnectionSetupRoute } from '../app/router/domains';
import { getCurrentDashboard } from '../app/routing';
import { isDashboardBackport } from './is-dashboard-backport';
import { dashboardLink, redirectToDashboardLink, wpcomLink } from './link';
import type { Domain } from '@automattic/api-core';

export function getDomainConnectionSetupTemplateUrl(): string | undefined {
	// fullPath is only materialized once the domains route group is registered
	// in the current dashboard's route tree; dashboards without the domains
	// section (e.g. A4A) have no connection-setup page to link to.
	const fullPath: string | undefined = domainConnectionSetupRoute.fullPath;
	if ( ! fullPath ) {
		return undefined;
	}
	return dashboardLink( fullPath.replace( '$domainName', '%s' ) );
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

	const domainConnectionSetupUrl = getDomainConnectionSetupTemplateUrl();

	return addQueryArgs( wpcomLink( '/setup/domain' ), {
		siteSlug,
		...( domainConnectionSetupUrl && { domainConnectionSetupUrl } ),
		back_to: backUrl,
		redirect_to: backUrl,
		dashboard: getCurrentDashboard(),
	} );
}
