import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { siteRoute } from '../../app/router/sites';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { getDeploymentsCalloutProps } from './deployments-callout';

function SiteDeployments() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	if ( ! site ) {
		return;
	}

	return (
		<HostingFeatureGatedWithCallout site={ site } fullPage { ...getDeploymentsCalloutProps() }>
			<Outlet />
		</HostingFeatureGatedWithCallout>
	);
}

export default SiteDeployments;
