import config from '@automattic/calypso-config';
import { StatsCard } from '@automattic/components';
import clsx from 'clsx';
import StatsCardSkeleton from '../features/modules/shared/stats-card-skeleton';
import { default as usePlanUsageQuery } from '../hooks/use-plan-usage-query';
import useStatsPurchases from '../hooks/use-stats-purchases';
import StatsModulePlaceholder from '../stats-module/placeholder';
import statsStrings from '../stats-strings';
import StatsModuleDevices from './stats-module-devices';
import StatsModuleUpgradeOverlay from './stats-module-upgrade-overlay';
import type { StatsAdvancedModuleWrapperProps } from '../features/modules/types';

const DEVICES_CLASS_NAME = 'stats-module-devices';

const StatsModuleDevicesWrapper: React.FC< StatsAdvancedModuleWrapperProps > = ( {
	siteId,
	period,
	postId,
	query,
	className,
} ) => {
	const isNewEmptyStateEnabled = config.isEnabled( 'stats/empty-module-traffic' );
	const { devices: devicesStrings } = statsStrings();

	// Check if blog is internal.
	const { isPending: isFetchingUsage, data: usageData } = usePlanUsageQuery( siteId );
	const { isLoading: isLoadingFeatureCheck, supportCommercialUse } = useStatsPurchases( siteId );

	const isSiteInternal = ! isFetchingUsage && usageData?.is_internal;
	const isFetching = isFetchingUsage || isLoadingFeatureCheck; // This is not fetching Devices data.
	const isAdvancedFeatureEnabled = isSiteInternal || supportCommercialUse;

	// Hide the module if the specific post is the Home page.
	if ( postId === 0 ) {
		return null;
	}

	return (
		<>
			{ isFetching && isNewEmptyStateEnabled && (
				<StatsCardSkeleton
					isLoading={ isFetching }
					className={ className }
					title={ devicesStrings?.title }
					type={ 1 }
				/>
			) }
			{ isFetching && ! isNewEmptyStateEnabled && (
				<StatsCard
					title={ devicesStrings.title }
					className={ clsx( className, DEVICES_CLASS_NAME, 'stats-module__card', 'devices' ) }
					isNew
				>
					<StatsModulePlaceholder isLoading />
				</StatsCard>
			) }
			{ ! isFetching && ! isAdvancedFeatureEnabled && (
				<StatsModuleUpgradeOverlay className={ className } siteId={ siteId } />
			) }
			{ ! isFetching && isAdvancedFeatureEnabled && (
				<StatsModuleDevices
					path="devices"
					className={ clsx( className, DEVICES_CLASS_NAME ) }
					period={ period }
					query={ query }
					isLoading={ isFetching }
					postId={ postId }
				/>
			) }
		</>
	);
};

export default StatsModuleDevicesWrapper;
