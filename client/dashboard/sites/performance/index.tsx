import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { siteRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { hasHostingFeature } from '../../utils/site-features';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { getPerformanceCalloutProps } from './performance-callout';
import { PerformanceFooter } from './performance-footer';
import { PerformancePageLoadTimelineCard } from './performance-page-load-timeline-card';
import { PerformancePageSelector } from './performance-page-selector';
import { PerformanceRecommendationsCard } from './performance-recommendations-card';
import { PerformanceScoreSection } from './performance-score-section';
import { PerformanceSubtitle } from './performance-subtitle';
import { usePerformanceData } from './use-performance-data';

function SitePerformanceBody( { device, data }: { device: string; data: PerformanceData } ) {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const deviceData = data.performanceData.pagespeed[ device ];

	return (
		<VStack alignment="stretch" spacing={ isSmallViewport ? 5 : 10 }>
			<PerformanceSubtitle timestamp={ deviceData.timestamp } />
			<PerformanceScoreSection scores={ deviceData } />
			<PerformancePageLoadTimelineCard screenshots={ deviceData.screenshots } />
			<PerformanceRecommendationsCard audits={ deviceData.audits } />
			<PerformanceFooter />
		</VStack>
	);
}

function SitePerformance() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );
	const [ device, setDevice ] = useState( 'mobile' );
	const hasPerformanceFeature = hasHostingFeature( site, HostingFeatures.PERFORMANCE );
	const data = usePerformanceData( site.ID, site.URL );

	if ( ! site ) {
		return;
	}

	const handleDeviceChange = ( value: string | number | undefined ) => {
		if ( ! value ) {
			return;
		}

		setDevice( value.toString() );
	};

	const actions = (
		<>
			<PerformancePageSelector />
			<ToggleGroupControl
				value={ device }
				isBlock
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				onChange={ handleDeviceChange }
				label={ __( 'Device' ) }
				hideLabelFromVision
			>
				<ToggleGroupControlOption value="mobile" label={ __( 'Mobile' ) } />
				<ToggleGroupControlOption value="desktop" label={ __( 'Desktop' ) } />
			</ToggleGroupControl>
		</>
	);

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Performance' ) }
					actions={ hasPerformanceFeature ? actions : undefined }
				/>
			}
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.PERFORMANCE }
				asOverlay
				{ ...getPerformanceCalloutProps() }
			>
				<SitePerformanceBody device={ device } data={ data } />
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}

export default SitePerformance;
