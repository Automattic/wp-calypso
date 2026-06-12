import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { siteRoute } from '../../app/router/sites';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { SiteLaunchButton } from '../site-launch-button';
import { getPerformanceCalloutProps } from './performance-callout';

function SitePerformance() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	return (
		<HostingFeatureGatedWithCallout site={ site } fullPage { ...getPerformanceCalloutProps() }>
			{ site.is_coming_soon || site.is_private ? (
				<PageLayout
					size="small"
					header={
						<PageHeader
							description={ createInterpolateElement(
								__( 'Optimize your site for lightning-fast performance. <learnMoreLink />' ),
								{
									learnMoreLink: <InlineSupportLink supportContext="site-performance" />,
								}
							) }
						/>
					}
					notices={
						<Notice
							title={ __( 'Launch your site to start measuring performance' ) }
							actions={ <SiteLaunchButton site={ site } tracksContext="site_performance" /> }
						>
							{ __( 'Performance statistics are only available for public sites.' ) }
						</Notice>
					}
				/>
			) : (
				<Outlet />
			) }
			<PerformanceTrackerStop />
		</HostingFeatureGatedWithCallout>
	);
}

export default SitePerformance;
