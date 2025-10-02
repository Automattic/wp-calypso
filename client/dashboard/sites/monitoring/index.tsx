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
import MonitoringHttpResponsesCard from '../monitoring-http-responses-card';
import {
	useSuccessHttpCodeSeries,
	useErrorHttpCodeSeries,
} from '../monitoring-http-responses-card/http-codes';
import MonitoringPerformanceCard from '../monitoring-performance-card';
import MonitoringRequestMethodsCard from '../monitoring-request-methods-card';
import MonitoringResponseTypesCard from '../monitoring-response-types-card';
import { getMonitoringCalloutProps } from './monitoring-callout';
import type { HTTPCodeSerie } from '../monitoring-http-responses-card/http-codes';
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
	const successHttpCodeSeries: HTTPCodeSerie[] = useSuccessHttpCodeSeries();
	const errorHttpCodeSeries: HTTPCodeSerie[] = useErrorHttpCodeSeries();

	return (
		<VStack alignment="stretch" spacing={ isSmallViewport ? 5 : 10 }>
			<MonitoringPerformanceCard site={ site } timeRange={ hoursMap[ timeRange ] } />

			<HStack wrap alignment="stretch" spacing={ isSmallViewport ? 4 : 8 }>
				<MonitoringRequestMethodsCard site={ site } timeRange={ hoursMap[ timeRange ] } />
				<MonitoringResponseTypesCard site={ site } timeRange={ hoursMap[ timeRange ] } />
			</HStack>

			<MonitoringHttpResponsesCard
				site={ site }
				timeRange={ hoursMap[ timeRange ] }
				httpCodeSeries={ successHttpCodeSeries }
				cardLabel={ __( 'Successful HTTP responses' ) }
				cardDescription={ __( 'Requests per minute completed without errors by the server.' ) }
			/>

			<MonitoringHttpResponsesCard
				site={ site }
				timeRange={ hoursMap[ timeRange ] }
				httpCodeSeries={ errorHttpCodeSeries }
				cardLabel={ __( 'Unsuccessful HTTP responses' ) }
				cardDescription={ __(
					'Requests per minute that encountered errors or issues during processing.'
				) }
			/>
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
		<HostingFeatureGatedWithCallout
			site={ site }
			feature={ HostingFeatures.MONITOR }
			overlay={ <PageLayout header={ <PageHeader title={ __( 'Monitoring' ) } /> } /> }
			{ ...getMonitoringCalloutProps() }
		>
			<PageLayout
				header={
					<HStack
						justify="space-between"
						alignment="stretch"
						wrap
						spacing={ isSmallViewport ? 5 : 10 }
					>
						<VStack spacing={ 2 }>
							<PageHeader />
							<Text variant="muted">{ getDateRange( timeRange, locale ) }</Text>
						</VStack>

						<div>
							<ToggleGroupControl
								value={ timeRange }
								isBlock
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								onChange={ handleTimeRangeChange }
								label={ __( 'Time period' ) }
								hideLabelFromVision
								style={ { textWrap: 'nowrap' } }
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
				<SiteMonitoringBody timeRange={ timeRange } site={ site } locale={ locale } />
			</PageLayout>
		</HostingFeatureGatedWithCallout>
	);
}

export default SiteMonitoring;
