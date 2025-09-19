import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { siteRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import MonitoringCard from '../monitoring-card';
import MonitoringPerformanceCard from '../monitoring-performance-card';
import MonitoringRequestMethodsCard from '../monitoring-request-methods-card';
import { getMonitoringCalloutProps } from './monitoring-callout';
import type { Site } from '@automattic/api-core';

const hoursMap: Record< string, number > = {
	'6-hours': 6,
	'24-hours': 24,
	'3-days': 72,
	'7-days': 168,
};

const getDateRange = ( range: string, locale: string ) => {
	const now = new Date();

	const hours = hoursMap[ range ] || 24;
	const start = new Date( now.getTime() - hours * 60 * 60 * 1000 );

	const formatDate = ( date: Date ) => {
		return date.toLocaleDateString( locale, {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		} );
	};

	return `${ formatDate( start ) }–${ formatDate( now ) }`;
};

/* eslint-disable @typescript-eslint/no-unused-vars */
function SiteMonitoringBody( {
	site,
	timeRange,
	locale,
}: {
	site: Site;
	timeRange: string;
	locale: string;
} ) {
	const isSmallViewport = useViewportMatch( 'medium', '<' );

	return (
		<VStack alignment="stretch" spacing={ isSmallViewport ? 5 : 10 }>
			<Text variant="muted">{ getDateRange( timeRange, locale ) }</Text>

			<MonitoringPerformanceCard site={ site } timeRange={ hoursMap[ timeRange ] } />

			<HStack wrap alignment="stretch" spacing={ isSmallViewport ? 4 : 8 }>
				<MonitoringRequestMethodsCard site={ site } timeRange={ hoursMap[ timeRange ] } />

				<MonitoringCard
					title={ __( 'Response types' ) }
					description={ __( 'Percentage of dynamic versus static responses.' ) }
					onDownloadClick={ () => {} }
					onAnchorClick={ () => {} }
					className="dashboard-monitoring-card--row-layout"
				>
					[Response types graph]
				</MonitoringCard>
			</HStack>

			<MonitoringCard
				title={ __( 'Successful HTTP responses' ) }
				description={ __( 'Requests per minute completed without errors by the server.' ) }
				onDownloadClick={ () => {} }
				onAnchorClick={ () => {} }
			>
				[Successful HTTP responses graph]
			</MonitoringCard>

			<MonitoringCard
				title={ __( 'Unsuccessful HTTP responses' ) }
				description={ __(
					'Requests per minute that encountered errors or issues during processing.'
				) }
				onDownloadClick={ () => {} }
				onAnchorClick={ () => {} }
			>
				[Unsuccessful HTTP responses graph]
			</MonitoringCard>
		</VStack>
	);
}

function SiteMonitoring() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );
	const locale = useLocale();

	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const [ timeRange, setTimeRange ] = useState( '24-hours' );

	if ( ! site ) {
		return;
	}

	const handleTimeRangeChange = ( value: string | number | undefined ) => {
		if ( ! value ) {
			return;
		}

		setTimeRange( value.toString() );
	};

	return (
		<PageLayout
			header={
				<HStack
					justify="space-between"
					alignment="stretch"
					wrap
					spacing={ isSmallViewport ? 5 : 10 }
				>
					<PageHeader title={ __( 'Monitoring' ) } />
					<div>
						<ToggleGroupControl
							value={ timeRange }
							isBlock
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							onChange={ handleTimeRangeChange }
							label={ __( 'Time period' ) }
							hideLabelFromVision
						>
							<ToggleGroupControlOption value="6-hours" label={ __( '6 hours' ) } />
							<ToggleGroupControlOption value="24-hours" label={ __( '24 hours' ) } />
							<ToggleGroupControlOption value="3-days" label={ __( '3 days' ) } />
							<ToggleGroupControlOption value="7-days" label={ __( '7 days' ) } />
						</ToggleGroupControl>
					</div>
				</HStack>
			}
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.MONITOR }
				asOverlay
				{ ...getMonitoringCalloutProps() }
			>
				<SiteMonitoringBody timeRange={ timeRange } site={ site } locale={ locale } />
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}

export default SiteMonitoring;
