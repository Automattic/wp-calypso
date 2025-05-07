import { useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { PerformanceReport } from 'calypso/hosting/performance/components/PerformanceReport';
import { sitePerformanceRoute } from '../../app/router';
import { usePerformanceData } from '../hooks/use-performance-data';
import type { Site } from '../../data/types';

import './style.scss';

export default function Report( { site }: { site: Site } ) {
	const { filter } = useSearch( { from: sitePerformanceRoute.fullPath } );
	const [ recommendationsFilter, setRecommendationsFilter ] = useState( filter );
	const { performanceData, isLoading } = usePerformanceData( site.ID, site.URL );

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

	return (
		<div className="site-performance-report">
			<PerformanceReport
				isLoading={ isLoading }
				isRetesting={ false }
				isError={ false }
				performanceReport={ report }
				pageTitle="Temporary title"
				onRetestClick={ () => {} }
				onFilterChange={ handleRecommendationsFilterChange }
				filter={ recommendationsFilter }
			/>
		</div>
	);
}
