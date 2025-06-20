import config from '@automattic/calypso-config';
import { SimplifiedSegmentedControl, StatsCard } from '@automattic/components';
import { postList } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import InlineSupportLink from 'calypso/components/inline-support-link';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { useShouldGateStats } from '../../../hooks/use-should-gate-stats';
import StatsModule from '../../../stats-module';
import { StatsEmptyActionAI, StatsEmptyActionSocial } from '../shared';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import useOptionLabels, {
	MAIN_STAT_TYPE,
	SUB_STAT_TYPE,
	StatType,
	StatsModulePostsProps,
	validQueryViewType,
} from './use-option-labels';
import type { StatsStateProps } from '../types';

type StatTypeOptionType = {
	value: StatType;
	label: string;
	mainItemLabel: string;
};

const StatsTopPosts: React.FC< StatsModulePostsProps > = ( {
	period,
	query: queryFromProps,
	moduleStrings,
	className,
	summaryUrl,
	summary,
	listItemClassName,
	isRealTime = false,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;

	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const isArchiveBreakdownEnabled: boolean = config.isEnabled( 'stats/archive-breakdown' );
	const supportContext = isSiteJetpackNotAtomic
		? 'stats-top-posts-and-pages-analyze-content-performance-jetpack'
		: 'stats-top-posts-and-pages-analyze-content-performance';

	const optionLabels = useOptionLabels();
	const options: StatTypeOptionType[] = Object.entries( optionLabels ).map( ( [ key, item ] ) => {
		return {
			value: key as StatType,
			label: item.tabLabel,
			mainItemLabel: item.mainItemLabel,
		};
	} );

	const query = {
		...queryFromProps,
		skip_archives: isArchiveBreakdownEnabled ? '1' : '0',
	};

	const mainStatType = MAIN_STAT_TYPE;
	const subStatType = SUB_STAT_TYPE;

	const isRequestingTopPostsData = useSelector( ( state: StatsStateProps ) =>
		isRequestingSiteStatsForQuery( state, siteId, mainStatType, query )
	);
	const isRequestingArchivesData = useSelector( ( state: StatsStateProps ) =>
		isRequestingSiteStatsForQuery( state, siteId, subStatType, query )
	);
	const isRequestingData = isArchiveBreakdownEnabled
		? isRequestingTopPostsData || isRequestingArchivesData
		: isRequestingTopPostsData;

	const [ localStatType, setLocalStatType ] = useState< StatType | null >( null );
	const onStatTypeChange = ( option: StatTypeOptionType ) => setLocalStatType( option.value );

	const statType = localStatType || validQueryViewType( query.viewType ) || mainStatType;

	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ]; // TODO: get post shape and share in an external type file.

	// Use StatsModule to display paywall upsell.
	const shouldGateStatsModule = useShouldGateStats( mainStatType );

	const hasData = !! data?.length;
	// TODO: Is there a way to show the Skeleton loader for real-time data?
	// We don't want it to show every time a rquest is being run for real-time data so it's disabled for now.
	const presentLoadingUI = isRealTime
		? isRequestingData && ! hasData && false
		: isRequestingData && ! shouldGateStatsModule;
	const presentModuleUI = isRealTime
		? hasData && ! presentLoadingUI
		: ( ! isRequestingData && hasData ) || shouldGateStatsModule;
	const presentEmptyUI = isRealTime
		? ! hasData && ! presentLoadingUI
		: ! isRequestingData && ! hasData && ! shouldGateStatsModule;

	// Query both statTypes for the Traffic page module card to avoid loading when switching between controls.
	// Only query one statType at a time to avoid loading plenty of data for the summary mode.
	const shouldQueryMainStatType = ! summary || statType === mainStatType;
	const shouldQuerySubStatType = ! summary || statType === subStatType;

	return (
		<>
			{ ! shouldGateStatsModule && siteId && shouldQueryMainStatType && (
				<QuerySiteStats statType={ mainStatType } siteId={ siteId } query={ query } />
			) }

			{ ! shouldGateStatsModule &&
				siteId &&
				isArchiveBreakdownEnabled &&
				shouldQuerySubStatType && (
					<QuerySiteStats statType={ subStatType } siteId={ siteId } query={ query } />
				) }

			{ presentLoadingUI && (
				<StatsCardSkeleton
					isLoading={ isRequestingData }
					className={ className }
					title={ moduleStrings.title }
					type={ 1 }
				/>
			) }
			{ presentModuleUI && (
				// show data or an overlay
				<StatsModule
					path="posts"
					titleNodes={
						<StatsInfoArea>
							{ translate(
								'{{link}}Posts and pages{{/link}} sorted by most visited. Learn about what content resonates the most.',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: (
											<InlineSupportLink supportContext={ supportContext } showIcon={ false } />
										),
									},
									context:
										'Stats: Link in a popover for the Posts & Pages when the module has data',
								}
							) }
						</StatsInfoArea>
					}
					moduleStrings={ moduleStrings }
					period={ period }
					query={ query }
					statType={ statType }
					showSummaryLink={ !! summary }
					summaryLinkModifier={ ( link: string ) => `${ link }&viewType=${ statType }` }
					className={ className }
					summary={ summary }
					listItemClassName={ listItemClassName }
					skipQuery
					isRealTime={ isRealTime }
					toggleControl={
						isArchiveBreakdownEnabled &&
						! summary && (
							<SimplifiedSegmentedControl
								options={ options }
								initialSelected={ statType }
								onSelect={ onStatTypeChange }
							/>
						)
					}
					mainItemLabel={
						isArchiveBreakdownEnabled &&
						options.find( ( option ) => option.value === statType )?.mainItemLabel
					}
				/>
			) }
			{ presentEmptyUI && (
				// show empty state
				<StatsCard
					className={ className }
					title={ moduleStrings.title }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ postList }
							description={ translate(
								'Your top {{link}}posts and pages{{/link}} will display here to learn what content resonates the most. Start creating and sharing!',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: (
											<InlineSupportLink supportContext={ supportContext } showIcon={ false } />
										),
									},
									context: 'Stats: Info box label when the Posts & Pages module is empty',
								}
							) }
							cards={
								<>
									<StatsEmptyActionAI from="module_top_posts" />
									<StatsEmptyActionSocial from="module_top_posts" />
								</>
							}
						/>
					}
					footerAction={
						summaryUrl
							? {
									url: summaryUrl,
									label: translate( 'View more' ),
							  }
							: undefined
					}
				/>
			) }
		</>
	);
};

export default StatsTopPosts;
