import { HostingFeatures } from '@automattic/api-core';
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
		return null;
	}

	return (
		<div style={ { position: 'relative' } }>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.DEPLOYMENT }
				asOverlay
				{ ...getDeploymentsCalloutProps() }
			>
				<Outlet />
			</HostingFeatureGatedWithCallout>
		</div>
	);
}

export default SiteDeployments;
