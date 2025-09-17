import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { siteRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { getPerformanceCalloutProps } from './performance-callout';

function SitePerformance() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );

	if ( ! site ) {
		return;
	}

	return (
		<PageLayout header={ <PageHeader title={ __( 'Performance' ) } /> }>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.PERFORMANCE }
				asOverlay
				{ ...getPerformanceCalloutProps() }
			>
				<></>
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}

export default SitePerformance;
