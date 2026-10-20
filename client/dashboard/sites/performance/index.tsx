import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { siteRoute } from '../../app/router/sites';
import EmptyState from '../../components/empty-state';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { TextBlur } from '../../components/text-blur';
import { useSiteLaunchPublishCopy } from '../../utils/site-launch-publish-copy';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { SitesNoticeArbiter } from '../notice-arbiter';
import { SiteLaunchButton } from '../site-launch-button';
import { getPerformanceCalloutProps } from './performance-callout';

export function SitePerformanceContent( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const isUnpublished = site.is_coming_soon || site.is_private;
	const { isLoading: isPublishCopyLoading, usePublishCopy } = useSiteLaunchPublishCopy( {
		launchStatus: site.launch_status,
		canManageOptions: site.capabilities?.manage_options,
		isA4ADevSite: site.is_a4a_dev_site,
		isEntryPointShown: isUnpublished,
	} );

	return (
		<HostingFeatureGatedWithCallout site={ site } fullPage { ...getPerformanceCalloutProps() }>
			{ isUnpublished ? (
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
					notices={ <SitesNoticeArbiter /> }
				>
					<EmptyState.Wrapper>
						<EmptyState.Header>
							<EmptyState.Title>
								<TextBlur isBlurred={ isPublishCopyLoading }>
									{ usePublishCopy
										? __( 'Publish your site to start measuring performance' )
										: __( 'Launch your site to start measuring performance' ) }
								</TextBlur>
							</EmptyState.Title>
							<EmptyState.Description>
								{ __( 'Performance statistics are only available for public sites.' ) }
							</EmptyState.Description>
						</EmptyState.Header>
						<SiteLaunchButton site={ site } tracksContext="site_performance" />
					</EmptyState.Wrapper>
				</PageLayout>
			) : (
				<Outlet />
			) }
			<PerformanceTrackerStop />
		</HostingFeatureGatedWithCallout>
	);
}

function SitePerformance() {
	const { siteSlug } = siteRoute.useParams();
	return <SitePerformanceContent siteSlug={ siteSlug } />;
}

export default SitePerformance;
