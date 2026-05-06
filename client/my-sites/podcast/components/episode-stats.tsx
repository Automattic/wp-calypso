import page from '@automattic/calypso-router';
import { Page } from '@wordpress/admin-ui';
import {
	Button,
	SelectControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState, type MouseEvent } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackFooter from 'calypso/components/jetpack/jetpack-footer';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main from 'calypso/components/main';
import { DataViewsEmptyStateLayout } from 'calypso/dashboard/components/dataviews';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import useAccessGate from '../hooks/use-access-gate';
import useEpisodeDetailStatsQuery from '../hooks/use-episode-detail-stats-query';
import StatsByCountry from './stats-by-country';
import StatsByDayChart from './stats-by-day-chart';
import StatsSummaryTiles from './stats-summary-tiles';
import type { PodcastStatsPeriod } from '../hooks/use-show-stats-query';

type EpisodeStatsProps = {
	postId: number;
};

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

export default function EpisodeStats( { postId }: EpisodeStatsProps ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const accessGate = useAccessGate();
	const [ period, setPeriod ] = useState< PodcastStatsPeriod >( '30d' );

	const periodOptions = useMemo(
		() =>
			PERIOD_OPTIONS.map( ( value ) => ( {
				value,
				label: getPeriodLabel( value, translate ),
			} ) ),
		[ translate ]
	);

	const { data: stats, isLoading, isError } = useEpisodeDetailStatsQuery( siteId, postId, period );

	const episodesHref = `/podcasting/episodes${ siteSlug ? '/' + siteSlug : '' }`;
	const handleBackClick = ( event: MouseEvent< HTMLAnchorElement > ) => {
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}
		event.preventDefault();
		page( episodesHref );
	};

	const isEmpty = ! isLoading && ! isError && stats?.total_plays === 0;

	let pageContent;
	if ( accessGate ) {
		pageContent = accessGate;
	} else {
		pageContent = (
			<VStack spacing={ 6 } className="podcast-stats">
				<HStack
					alignment="flex-start"
					justify="space-between"
					wrap
					className="podcast-stats__header"
				>
					<header className="podcast__section-header">
						<Button variant="tertiary" href={ episodesHref } onClick={ handleBackClick }>
							{ translate( 'Back to episodes' ) }
						</Button>
						<h2 className="podcast__section-heading">{ translate( 'Episode stats' ) }</h2>
						<p className="podcast__section-description">
							{ translate( 'Post ID %(postId)d', { args: { postId } } ) }
						</p>
					</header>
					<div className="podcast-stats__period-control">
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
					</div>
				</HStack>

				{ isError && (
					<DataViewsEmptyStateLayout
						isBorderless
						title={ translate( 'Stats unavailable.' ) as string }
						description={
							translate( 'There was a problem loading episode stats. Please try again.' ) as string
						}
					/>
				) }

				{ ! isError && isEmpty && (
					<DataViewsEmptyStateLayout
						isBorderless
						title={ translate( 'No plays yet.' ) as string }
						description={ translate( 'Share this episode to start collecting data.' ) as string }
					/>
				) }

				{ ! isError && ! isEmpty && (
					<>
						<StatsSummaryTiles
							totalPlays={ stats?.total_plays }
							byApp={ stats?.by_app }
							byCountry={ stats?.by_country }
							topDay={ stats?.top_day }
							isLoading={ isLoading }
							variant="episode"
						/>
						<StatsByDayChart
							byDay={ stats?.by_day }
							range={ stats?.range }
							period={ period }
							isLoading={ isLoading }
						/>
						<StatsByCountry rows={ stats?.by_country } isLoading={ isLoading } />
					</>
				) }
			</VStack>
		);
	}

	return (
		<Main fullWidthLayout className="podcast">
			<DocumentHead title={ translate( 'Episode stats' ) } />
			<Page
				hasPadding
				showSidebarToggle={ false }
				title={ <JetpackTitle title={ translate( 'Episode stats' ) } /> }
				subTitle={ translate( 'Review plays and listener locations for this podcast episode.' ) }
			>
				<div className="podcast__tab-content">{ pageContent }</div>
			</Page>
			<JetpackFooter />
		</Main>
	);
}
