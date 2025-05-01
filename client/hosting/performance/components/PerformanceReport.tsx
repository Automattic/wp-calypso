import { PerformanceReport as PerformanceReportObject } from 'calypso/data/site-profiler/types';
import { PerformanceProfilerDashboardContent } from 'calypso/performance-profiler/components/dashboard-content';
import { UserProvider } from 'calypso/performance-profiler/context';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { PerformanceReportLoading } from './PerformanceReportLoading';
import { ReportError } from './ReportError';

interface PerformanceReportProps {
	performanceReport?: PerformanceReportObject;
	url: string;
	hash: string;
	isLoading: boolean;
	isError: boolean;
	isRetesting: boolean;
	onRetestClick(): void;
	pageTitle: string;
	filter?: string;
	onFilterChange?( fitler: string ): void;
}

export const PerformanceReport = ( {
	isLoading,
	isRetesting,
	isError,
	onRetestClick,
	performanceReport,
	url,
	hash,
	pageTitle,
	filter,
	onFilterChange,
}: PerformanceReportProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );

	if ( isError ) {
		return <ReportError onRetestClick={ onRetestClick } />;
	}

	if ( isRetesting || isLoading ) {
		return (
			<PerformanceReportLoading
				isSavedReport={ ! isRetesting && !! hash }
				pageTitle={ pageTitle }
			/>
		);
	}

	if ( ! performanceReport ) {
		return null;
	}

	return (
		<UserProvider isUserLoggedIn={ isLoggedIn }>
			<PerformanceProfilerDashboardContent
				performanceReport={ performanceReport }
				url={ url }
				hash={ hash }
				overallScoreIsTab
				filter={ filter }
				displayNewsletterBanner={ false }
				displayMigrationBanner={ false }
				onRecommendationsFilterChange={ onFilterChange }
			/>
		</UserProvider>
	);
};
