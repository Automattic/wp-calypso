import { Metrics } from '@automattic/api-core';
import { __experimentalVStack as VStack, Card, CardBody } from '@wordpress/components';
import { useState, useRef } from 'react';
import CoreMetrics from './core-metrics';
import PerformanceInsights from './performance-insights';
import ReportFooter from './report-footer';
import ScreenshotTimeline from './screenshot-timeline';
import type { DeviceToggleType } from './types';
import type { SitePerformanceReport } from '@automattic/api-core';

export default function Report( {
	report,
	device,
	hash,
}: {
	report: SitePerformanceReport;
	device: DeviceToggleType;
	hash: string;
} ) {
	const [ recommendationsFilter, setRecommendationsFilter ] =
		useState< Metrics >( 'overall_score' );
	const insightsRef = useRef< HTMLDivElement >( null );
	const { audits, screenshots } = report;

	const handleFilterChange = ( filter: Metrics ) => {
		setRecommendationsFilter( filter );
		insightsRef?.current?.scrollIntoView( {
			behavior: 'smooth',
			block: 'start',
		} );
	};

	return (
		<VStack spacing={ 8 }>
			<CoreMetrics report={ report } onRecommendationsFilterChange={ handleFilterChange } />
			<ScreenshotTimeline screenshots={ screenshots ?? [] } />
			{ audits && (
				<Card ref={ insightsRef }>
					<CardBody>
						<PerformanceInsights
							report={ report }
							device={ device }
							selectedFilter={ recommendationsFilter }
							hash={ hash }
							onFilterChange={ handleFilterChange }
						/>
					</CardBody>
				</Card>
			) }
			<ReportFooter />
		</VStack>
	);
}
