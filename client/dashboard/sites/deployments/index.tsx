import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { siteRoute } from '../../app/router/sites';
import PageLayout from '../../components/page-layout';
import { RouterPageHeader } from '../../components/router-page-header';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { getDeploymentsCalloutProps } from './deployments-callout';

function SiteDeployments() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	if ( ! site ) {
		return;
	}

	return (
		<HostingFeatureGatedWithCallout
			site={ site }
			feature={ HostingFeatures.DEPLOYMENT }
			overlay={ <PageLayout header={ <RouterPageHeader /> } /> }
			{ ...getDeploymentsCalloutProps() }
		>
			<Outlet />
		</HostingFeatureGatedWithCallout>
	);
}

export default SiteDeployments;
