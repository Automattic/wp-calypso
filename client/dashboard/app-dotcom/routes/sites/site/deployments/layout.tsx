import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, useParams } from '@tanstack/react-router';
import { getDeploymentsCalloutProps } from '../../../../../sites/deployments/components/deployments-callout';
import HostingFeatureGatedWithCallout from '../../../../../sites/hosting-features/components/hosting-feature-gated-with-callout';

function SiteDeployments() {
	const { siteSlug } = useParams( { strict: false } ) as { siteSlug: string };
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
