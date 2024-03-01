import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import useUTMMetricTopPostsQuery from '../hooks/use-utm-metric-top-posts-query';
import useUTMMetricsQuery from '../hooks/use-utm-metrics-query';
import StatsModuleDataQuery from '../stats-module/stats-module-data-query';
import statsStrings from '../stats-strings';
import UTMDropdown from './stats-module-utm-dropdown';

const OPTION_KEYS = {
	SOURCE_MEDIUM: 'source_medium',
	CAMPAIGN_SOURCE_MEDIUM: 'campaign_source_medium',
	SOURCE: 'source',
	MEDIUM: 'medium',
	CAMPAIGN: 'campaign',
};

const StatsModuleUTM = ( { siteId, period, postId, query, summary } ) => {
	const moduleStrings = statsStrings();
	const translate = useTranslate();
	const [ displayOption, setDisplayOption ] = useState( OPTION_KEYS.SOURCE_MEDIUM );

	// Fetch UTM metrics with switched UTM parameters.
	const { isFetching: isFetchingMetricsAndTopPosts, metrics } = useUTMMetricsQuery(
		siteId,
		'utm_source,utm_medium'
	);
	// Fetch top posts for all UTM metric items.
	const { topPosts } = useUTMMetricTopPostsQuery( siteId, 'utm_source,utm_medium', metrics );

	// Combine metrics with top posts.
	const data = metrics.map( ( metric ) => {
		const paramValues = metric.paramValues;
		const children = topPosts[ paramValues ] || [];

		return {
			...metric,
			children,
		};
	} );

	const hideSummaryLink = postId !== undefined || summary === true;

	const optionLabels = {
		[ OPTION_KEYS.SOURCE_MEDIUM ]: {
			selectLabel: translate( 'Source / Medium' ),
			headerLabel: translate( 'Posts by Source / Medium' ),
			isGrouped: true, // display in a group on top of the dropdown
			// data query action
		},
		[ OPTION_KEYS.CAMPAIGN_SOURCE_MEDIUM ]: {
			selectLabel: translate( 'Campaign / Source / Medium' ),
			headerLabel: translate( 'Posts by Campaign / Source / Medium' ),
			isGrouped: true,
			// data query action
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

	const onDisplaySelect = ( optionKey ) => {
		setDisplayOption( optionKey );
	};

	return (
		<StatsModuleDataQuery
			data={ data }
			path="utm"
			className="stats-module-utm"
			moduleStrings={ moduleStrings.utm }
			period={ period }
			query={ query }
			isLoading={ isFetchingMetricsAndTopPosts ?? true }
			hideSummaryLink={ hideSummaryLink }
			selectedOption={ optionLabels[ displayOption ] }
			toggleControl={
				<UTMDropdown
					buttonLabel={ optionLabels[ displayOption ].selectLabel }
					onSelect={ onDisplaySelect }
					selectOptions={ optionLabels }
					selected={ displayOption }
				/>
			}
		/>
	);
};

export { StatsModuleUTM as default, StatsModuleUTM, OPTION_KEYS };
