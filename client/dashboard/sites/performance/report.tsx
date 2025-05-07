import { useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { PerformanceProfilerDashboardContent } from 'calypso/performance-profiler/components/dashboard-content';
import { sitePerformanceRoute } from '../../app/router';
import { usePerformanceData } from '../hooks/use-performance-data';
import type { Site } from '../../data/types';

import './style.scss';

export default function Report( { site }: { site: Site } ) {
	const { filter } = useSearch( { from: sitePerformanceRoute.fullPath } );
	const [ recommendationsFilter, setRecommendationsFilter ] = useState( filter );
	const { performanceData, isLoading, hash } = usePerformanceData( site.ID, site.URL );

	const handleRecommendationsFilterChange = ( filter?: string ) => {
		setRecommendationsFilter( filter );
		const url = new URL( window.location.href );

		if ( filter ) {
			url.searchParams.set( 'filter', filter );
		} else {
			url.searchParams.delete( 'filter' );
		}

		window.history.replaceState( {}, '', url.toString() );
	};

	const report =
		typeof performanceData?.pagespeed.desktop === 'object'
			? performanceData?.pagespeed.desktop
			: undefined;

	if ( isLoading ) {
		return 'loading...';
	}

	if ( ! report ) {
		return 'no report';
	}

	return (
		<div className="site-performance-report">
			<PerformanceProfilerDashboardContent
				performanceReport={ report }
				url={ site.URL }
				hash={ hash || '' }
				overallScoreIsTab
				filter={ recommendationsFilter }
				displayNewsletterBanner={ false }
				displayMigrationBanner={ false }
				onRecommendationsFilterChange={ handleRecommendationsFilterChange }
			/>
		</div>
	);
}
