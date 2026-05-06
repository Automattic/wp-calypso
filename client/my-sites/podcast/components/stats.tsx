import {
	SelectControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { DataViewsEmptyStateLayout } from 'calypso/dashboard/components/dataviews';
import { useSelector } from 'calypso/state';
import getPodcastingCategoryId from 'calypso/state/selectors/get-podcasting-category-id';
import { getTerms } from 'calypso/state/terms/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import useEpisodesQuery from '../hooks/use-episodes-query';
import useShowStatsQuery, { type PodcastStatsPeriod } from '../hooks/use-show-stats-query';
import StatsByApp from './stats-by-app';
import StatsByCountry from './stats-by-country';
import StatsByDayChart from './stats-by-day-chart';
import StatsSummaryTiles from './stats-summary-tiles';
import StatsTopEpisodes from './stats-top-episodes';

const PERIOD_OPTIONS: PodcastStatsPeriod[] = [ '7d', '30d', '90d', 'all' ];

const getPeriodLabel = (
	value: PodcastStatsPeriod,
	translate: ReturnType< typeof useTranslate >
) => {
	if ( value === '7d' ) {
		return translate( 'Last 7 days' ) as string;
	}
	if ( value === '30d' ) {
		return translate( 'Last 30 days' ) as string;
	}
	if ( value === '90d' ) {
		return translate( 'Last 90 days' ) as string;
	}
	return translate( 'All time' ) as string;
};

export default function Stats() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const [ period, setPeriod ] = useState< PodcastStatsPeriod >( '30d' );

	const resolvedCategoryId = useSelector( ( state ) => {
		if ( ! siteId ) {
			return 0;
		}
		const settingId = getPodcastingCategoryId( state, siteId );
		if ( settingId ) {
			return Number( settingId );
		}
		const terms = getTerms( state, siteId, 'category' );
		const match = Array.isArray( terms )
			? terms.find( ( term ) => term?.name?.toLowerCase?.() === 'podcast' )
			: null;
		return match ? Number( match.ID ) : 0;
	} );

	const periodOptions = useMemo(
		() =>
			PERIOD_OPTIONS.map( ( value ) => ( {
				value,
				label: getPeriodLabel( value, translate ),
			} ) ),
		[ translate ]
	);

	const {
		data: stats,
		isLoading: isStatsLoading,
		isError: isStatsError,
	} = useShowStatsQuery( siteId, period );

	const { data: episodesData, isLoading: isEpisodesLoading } = useEpisodesQuery( {
		siteId,
		categoryId: resolvedCategoryId,
		page: 1,
		perPage: 1,
		orderBy: 'date',
		order: 'desc',
		search: '',
		status: 'publish',
	} );

	const isLoading = isStatsLoading || isEpisodesLoading;
	const isEmpty = ! isStatsLoading && ! isStatsError && stats?.total_plays === 0;

	const periodPicker = (
		<SelectControl
			__nextHasNoMarginBottom
			label={ translate( 'Period' ) }
			value={ period }
			options={ periodOptions }
			onChange={ ( value ) => {
				if ( PERIOD_OPTIONS.includes( value as PodcastStatsPeriod ) ) {
					setPeriod( value as PodcastStatsPeriod );
				}
			} }
		/>
	);

	return (
		<VStack spacing={ 6 } className="podcast-stats">
			<HStack alignment="flex-start" justify="space-between" wrap className="podcast-stats__header">
				<header className="podcast__section-header">
					<h2 className="podcast__section-heading">{ translate( 'Stats' ) }</h2>
					<p className="podcast__section-description">
						{ translate( 'Track plays, top episodes, apps, and listener locations.' ) }
					</p>
				</header>
				<div className="podcast-stats__period-control">{ periodPicker }</div>
			</HStack>

			{ isStatsError && (
				<DataViewsEmptyStateLayout
					isBorderless
					title={ translate( 'Stats unavailable.' ) as string }
					description={
						translate( 'There was a problem loading podcast stats. Please try again.' ) as string
					}
				/>
			) }

			{ ! isStatsError && isEmpty && (
				<DataViewsEmptyStateLayout
					isBorderless
					title={ translate( 'No plays yet.' ) as string }
					description={ translate( 'Share your show to start collecting data.' ) as string }
				/>
			) }

			{ ! isStatsError && ! isEmpty && (
				<>
					<StatsSummaryTiles
						totalPlays={ stats?.total_plays }
						byApp={ stats?.by_app }
						byCountry={ stats?.by_country }
						episodesPublished={ episodesData?.totalItems }
						isLoading={ isLoading }
					/>
					<StatsByDayChart
						byDay={ stats?.by_day }
						range={ stats?.range }
						period={ period }
						isLoading={ isStatsLoading }
					/>
					<StatsTopEpisodes
						episodes={ stats?.top_episodes }
						siteSlug={ siteSlug }
						isLoading={ isStatsLoading }
					/>
					<StatsByApp rows={ stats?.by_app } isLoading={ isStatsLoading } />
					<StatsByCountry rows={ stats?.by_country } isLoading={ isStatsLoading } />
				</>
			) }
		</VStack>
	);
}
