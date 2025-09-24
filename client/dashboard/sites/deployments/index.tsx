import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { siteRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
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
			overlay={ <PageLayout header={ <PageHeader title={ __( 'Deployments' ) } /> } /> }
			{ ...getDeploymentsCalloutProps() }
		>
			<Outlet />
		</HostingFeatureGatedWithCallout>
	);
}

export default SiteDeployments;
