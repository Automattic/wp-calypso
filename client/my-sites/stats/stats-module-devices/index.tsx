import { StatsCard } from '@automattic/components';
import clsx from 'clsx';
import { default as usePlanUsageQuery } from '../hooks/use-plan-usage-query';
import useStatsPurchases from '../hooks/use-stats-purchases';
import StatsModulePlaceholder from '../stats-module/placeholder';
import statsStrings from '../stats-strings';
import StatsModuleDevices from './stats-module-devices';
import StatsModuleUpgradeOverlay from './stats-module-upgrade-overlay';

const DEVICES_CLASS_NAME = 'stats-module-devices';

interface StatsModuleDevicesWrapperProps {
	siteId: number;
	period: string;
	postId?: number;
	query: object;
	summary?: boolean;
	className?: string;
}

const StatsModuleDevicesWrapper: React.FC< StatsModuleDevicesWrapperProps > = ( {
	siteId,
	period,
	postId,
	query,
	className,
} ) => {
	const { devices: devicesStrings } = statsStrings();

	// Check if blog is internal.
	const { isPending: isFetchingUsage, data: usageData } = usePlanUsageQuery( siteId );
	const { isLoading: isLoadingFeatureCheck, supportCommercialUse } = useStatsPurchases( siteId );

	const isSiteInternal = ! isFetchingUsage && usageData?.is_internal;
	const isFetching = isFetchingUsage || isLoadingFeatureCheck;
	const isAdvancedFeatureEnabled = isSiteInternal || supportCommercialUse;

	// Hide the module if the specific post is the Home page.
	if ( postId === 0 ) {
		return null;
	}

	return (
		<>
			{ isFetching && (
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
