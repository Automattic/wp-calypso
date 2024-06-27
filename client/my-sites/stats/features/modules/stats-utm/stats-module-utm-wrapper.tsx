import { StatsCard } from '@automattic/components';
import clsx from 'clsx';
import React from 'react';
import { default as usePlanUsageQuery } from '../../../hooks/use-plan-usage-query';
import useStatsPurchases from '../../../hooks/use-stats-purchases';
import StatsModulePlaceholder from '../../../stats-module/placeholder';
import statsStrings from '../../../stats-strings';
import { PeriodType } from '../../../stats-subscribers-chart-section';
import StatsModuleUTM from './stats-module-utm';
import StatsModuleUTMOverlay from './stats-module-utm-overlay';
import type { Moment } from 'moment';

type StatsPeriodType = {
	period: PeriodType;
	key: string;
	startOf: Moment;
	endOf: Moment;
};

type StatsModuleUTMWrapperProps = {
	siteId: number;
	period: StatsPeriodType;
	postId?: number;
	query: string;
	summary?: boolean;
	className?: string;
};

const StatsModuleUTMWrapper: React.FC< StatsModuleUTMWrapperProps > = ( {
	siteId,
	period,
	postId,
	query,
	summary,
	className,
} ) => {
	const moduleStrings = statsStrings();

	// Check if blog is internal.
	const { isPending: isFetchingUsage, data: usageData } = usePlanUsageQuery( siteId );
	const { isLoading: isLoadingFeatureCheck, supportCommercialUse } = useStatsPurchases( siteId );

	const isSiteInternal = ! isFetchingUsage && usageData?.is_internal;
	const isFetching = isFetchingUsage || isLoadingFeatureCheck; // Tis is not fetching UTM data.
	const isAdvancedFeatureEnabled = isSiteInternal || supportCommercialUse;

	// Hide the module if the specific post is the Home page.
	if ( postId === 0 ) {
		return null;
	}

	const hideSummaryLink = postId !== undefined || summary === true;

	return (
		<>
			{ isFetching && (
				<StatsCard
					title="UTM"
					className={ clsx( className, 'stats-module-utm', 'stats-module__card', 'utm' ) }
					isNew
				>
					<StatsModulePlaceholder isLoading />
				</StatsCard>
			) }
			{ ! isFetching && ! isAdvancedFeatureEnabled && (
				<StatsModuleUTMOverlay className={ className } siteId={ siteId } />
			) }
			{ ! isFetching && isAdvancedFeatureEnabled && (
				// @ts-expect-error TODO: Refactor StatsModuleUTM with TypeScript.
				<StatsModuleUTM
					path="utm"
					className={ clsx( className, 'stats-module-utm' ) }
					moduleStrings={ moduleStrings.utm }
					period={ period }
					query={ query }
					isLoading={ isFetching ?? true }
					hideSummaryLink={ hideSummaryLink }
					postId={ postId }
					summary={ summary }
				/>
			) }
		</>
	);
};

export { StatsModuleUTMWrapper as default };
