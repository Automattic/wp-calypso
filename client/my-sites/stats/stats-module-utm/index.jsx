import { StatsCard } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { default as usePlanUsageQuery } from '../hooks/use-plan-usage-query';
import useStatsPurchases from '../hooks/use-stats-purchases';
import useUTMMetricTopPostsQuery from '../hooks/use-utm-metric-top-posts-query';
import useUTMMetricsQuery from '../hooks/use-utm-metrics-query';
import StatsCardUpsellJetpack from '../stats-card-upsell/stats-card-upsell-jetpack';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsModuleDataQuery from '../stats-module/stats-module-data-query';
import statsStrings from '../stats-strings';
import UTMDropdown from './stats-module-utm-dropdown';
import UTMExportButton from './utm-export-button';

const OPTION_KEYS = {
	SOURCE_MEDIUM: 'utm_source,utm_medium',
	CAMPAIGN_SOURCE_MEDIUM: 'utm_campaign,utm_source,utm_medium',
	SOURCE: 'utm_source',
	MEDIUM: 'utm_medium',
	CAMPAIGN: 'utm_campaign',
};

const StatsModuleUTM = ( { siteId, period, postId, query, summary, className } ) => {
	const moduleStrings = statsStrings();
	const translate = useTranslate();
	const [ selectedOption, setSelectedOption ] = useState( OPTION_KEYS.SOURCE_MEDIUM );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	// Check if blog is internal.
	const { isFetching: isFetchingUsage, data: usageData } = usePlanUsageQuery( siteId );
	const { isLoading: isLoadingFeatureCheck, supportCommercialUse } = useStatsPurchases( siteId );
	// Fetch UTM metrics with switched UTM parameters.
	const { isFetching: isFetchingUTM, metrics } = useUTMMetricsQuery(
		siteId,
		selectedOption,
		query,
		postId
	);
	// Fetch top posts for all UTM metric items.
	const { topPosts } = useUTMMetricTopPostsQuery( siteId, selectedOption, metrics );

	// TODO: Remove the "|| true" once internal sites are working.
	// const isSiteInternal = ! isFetchingUsage && usageData?.is_internal;
	const isSiteInternal = ( ! isFetchingUsage && usageData?.is_internal ) || true;
	const isFetching = isFetchingUsage || isLoadingFeatureCheck || isFetchingUTM;
	const isAdvancedFeatureEnabled = isSiteInternal || supportCommercialUse;

	// TODO: trigger useUTMMetricsQuery manually once isAdvancedFeatureEnabled === true

	// Combine metrics with top posts.
	const data = metrics.map( ( metric ) => {
		const paramValues = metric.paramValues;
		const children = topPosts[ paramValues ] || [];

		if ( ! children.length ) {
			return metric;
		}

		return {
			...metric,
			children,
		};
	} );

	// Hide the module if the specific post is the Home page.
	if ( postId === 0 ) {
		return null;
	}

	const hideSummaryLink = postId !== undefined || summary === true;

	const optionLabels = {
		[ OPTION_KEYS.SOURCE_MEDIUM ]: {
			selectLabel: translate( 'Source / Medium' ),
			headerLabel: translate( 'Posts by Source / Medium' ),
			isGrouped: true, // display in a group on top of the dropdown
		},
		[ OPTION_KEYS.CAMPAIGN_SOURCE_MEDIUM ]: {
			selectLabel: translate( 'Campaign / Source / Medium' ),
			headerLabel: translate( 'Posts by Campaign / Source / Medium' ),
			isGrouped: true,
		},
		[ OPTION_KEYS.SOURCE ]: {
			selectLabel: translate( 'Source' ),
			headerLabel: translate( 'Posts by Source' ),
		},
		[ OPTION_KEYS.MEDIUM ]: {
			selectLabel: translate( 'Medium' ),
			headerLabel: translate( 'Posts by Medium' ),
		},
		[ OPTION_KEYS.CAMPAIGN ]: {
			selectLabel: translate( 'Campaign' ),
			headerLabel: translate( 'Posts by Campaign' ),
		},
	};

	// Force disable the overlay for now.
	const showUpgradeOverlay = false;
	const showFooterWithDownloads = summary === true;

	return (
		<>
			{ isFetching && (
				<StatsCard
					title="UTM"
					className={ classNames( className, 'stats-module-utm', 'stats-module__card', 'utm' ) }
					isNew
				>
					<StatsModulePlaceholder isLoading />
				</StatsCard>
			) }
			{ showUpgradeOverlay && ! isFetching && ! isAdvancedFeatureEnabled && (
				// TODO: update the ghost card to only show the module name
				<StatsCard
					title="UTM"
					className={ classNames( className, 'stats-module-utm', 'stats-module__card', 'utm' ) }
					isNew
				>
					<StatsCardUpsellJetpack className="stats-module__upsell" siteSlug={ siteSlug } />
				</StatsCard>
			) }
			{ ! isFetching && isAdvancedFeatureEnabled && (
				<>
					<StatsModuleDataQuery
						data={ data }
						path="utm"
						className={ classNames( className, 'stats-module-utm' ) }
						moduleStrings={ moduleStrings.utm }
						period={ period }
						query={ query }
						isLoading={ isFetching ?? true }
						hideSummaryLink={ hideSummaryLink }
						selectedOption={ optionLabels[ selectedOption ] }
						toggleControl={
							<UTMDropdown
								buttonLabel={ optionLabels[ selectedOption ].selectLabel }
								onSelect={ setSelectedOption }
								selectOptions={ optionLabels }
								selected={ selectedOption }
							/>
						}
					/>
					{ showFooterWithDownloads && (
						<div className="stats-module__footer-actions stats-module__footer-actions--summary">
							<UTMExportButton data={ data } />
						</div>
					) }
				</>
			) }
		</>
	);
};

export { StatsModuleUTM as default, StatsModuleUTM, OPTION_KEYS };
