import page from '@automattic/calypso-router';
import { Page } from '@wordpress/admin-ui';
import {
	Button,
	SelectControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Tabs } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState, type MouseEvent } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import QueryTerms from 'calypso/components/data/query-terms';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackFooter from 'calypso/components/jetpack/jetpack-footer';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main from 'calypso/components/main';
import { DataViewsEmptyStateLayout } from 'calypso/dashboard/components/dataviews';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import useAccessGate from '../hooks/use-access-gate';
import useEpisodeDetailStatsQuery from '../hooks/use-episode-detail-stats-query';
import useEpisodeTitleQuery from '../hooks/use-episode-title-query';
import { getPodcastStatsMockQueryString } from '../hooks/use-show-stats-query';
import StatsByApp from './stats-by-app';
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

const getPeriodHeading = (
	value: PodcastStatsPeriod,
	translate: ReturnType< typeof useTranslate >
) => {
	if ( value === '7d' ) {
		return translate( 'Last 7 Days' ) as string;
	}
	if ( value === '30d' ) {
		return translate( 'Last 30 Days' ) as string;
	}
	if ( value === '90d' ) {
		return translate( 'Last 90 Days' ) as string;
	}
	return translate( 'All Time' ) as string;
};

export default function EpisodeStats( { postId }: EpisodeStatsProps ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const accessGate = useAccessGate();
	const [ period, setPeriod ] = useState< PodcastStatsPeriod >( '30d' );
	const pathSuffix = siteSlug ? '/' + siteSlug : '';
	const mockQueryString = getPodcastStatsMockQueryString();

	const periodOptions = useMemo(
		() =>
			PERIOD_OPTIONS.map( ( value ) => ( {
				value,
				label: getPeriodLabel( value, translate ),
			} ) ),
		[ translate ]
	);

	const { data: stats, isLoading, isError } = useEpisodeDetailStatsQuery( siteId, postId, period );
	const { data: episodeTitle } = useEpisodeTitleQuery( siteId, postId );
	const episodeHeading =
		episodeTitle || ( translate( 'Episode ID %(postId)d', { args: { postId } } ) as string );

	const tabs = [
		{
			name: 'episodes' as const,
			title: translate( 'Episodes' ) as string,
			path: '/podcasting/episodes' + pathSuffix + mockQueryString,
		},
		{
			name: 'distribution' as const,
			title: translate( 'Distribution' ) as string,
			path: '/podcasting/distribution' + pathSuffix + mockQueryString,
		},
		{
			name: 'settings' as const,
			title: translate( 'Settings' ) as string,
			path: '/podcasting/settings' + pathSuffix + mockQueryString,
		},
		{
			name: 'stats' as const,
			title: translate( 'Stats' ) as string,
			path: '/podcasting/stats' + pathSuffix + mockQueryString,
		},
	];

	const handleTabSelect = ( tabId: string ) => {
		const target = tabs.find( ( tab ) => tab.name === tabId );
		if ( target ) {
			page( target.path );
		}
	};

	const statsHref = '/podcasting/stats' + pathSuffix + mockQueryString;
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
		page( statsHref );
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
						<Button
							variant="tertiary"
							href={ statsHref }
							onClick={ handleBackClick }
							className="podcast-stats__back-link"
						>
							{ translate( 'Back to stats' ) }
						</Button>
						<h2 className="podcast__section-heading podcast-stats__period-heading podcast-stats__episode-heading">
							{ episodeHeading }
						</h2>
						<p className="podcast__section-description">
							{ getPeriodHeading( period, translate ) }
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
						title={ translate( 'No downloads yet.' ) as string }
						description={
							translate( 'Share this episode to start collecting downloads.' ) as string
						}
					/>
				) }

				{ ! isError && ! isEmpty && (
					<>
						<StatsByDayChart
							byDay={ stats?.by_day }
							range={ stats?.range }
							period={ period }
							isLoading={ isLoading }
						>
							<StatsSummaryTiles
								totalPlays={ stats?.total_plays }
								byApp={ stats?.by_app }
								byCountry={ stats?.by_country }
								topDay={ stats?.top_day }
								isLoading={ isLoading }
								variant="episode"
								layout="chart"
							/>
						</StatsByDayChart>
						<div className="podcast-stats__module-grid">
							<StatsByApp rows={ stats?.by_app } isLoading={ isLoading } />
							<StatsByCountry rows={ stats?.by_country } isLoading={ isLoading } />
						</div>
					</>
				) }
			</VStack>
		);
	}

	return (
		<Main fullWidthLayout className="podcast">
			{ siteId && <QuerySiteSettings siteId={ siteId } /> }
			{ siteId && <QueryTerms siteId={ siteId } taxonomy="category" /> }
			<DocumentHead title={ translate( 'Episode stats' ) } />
			<Page
				hasPadding
				showSidebarToggle={ false }
				title={ <JetpackTitle title={ translate( 'Podcast' ) } /> }
				subTitle={ translate(
					'Publish a podcast and reach your fans, anywhere they listen. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="podcasting" showIcon={ false } />,
						},
					}
				) }
			>
				<Tabs.Root value="stats" onValueChange={ handleTabSelect }>
					<div className="podcast__tabs-bar">
						<Tabs.List className="podcast__tabs">
							{ tabs.map( ( tab ) => (
								<Tabs.Tab key={ tab.name } value={ tab.name }>
									{ tab.title }
								</Tabs.Tab>
							) ) }
						</Tabs.List>
					</div>
					<div className="podcast__tab-content">{ pageContent }</div>
				</Tabs.Root>
			</Page>
			<JetpackFooter />
		</Main>
	);
}
