import page from '@automattic/calypso-router';
import { HorizontalBarList, HorizontalBarListItem, StatsCard } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import { getPodcastStatsMockQueryString } from '../hooks/use-show-stats-query';
import type { PodcastStatsTopEpisode } from '../hooks/use-show-stats-query';

type StatsTopEpisodesProps = {
	episodes?: PodcastStatsTopEpisode[];
	siteSlug: string | null | undefined;
	isLoading?: boolean;
};

export default function StatsTopEpisodes( {
	episodes = [],
	siteSlug,
	isLoading = false,
}: StatsTopEpisodesProps ) {
	const translate = useTranslate();
	const mockQuery = getPodcastStatsMockQueryString();

	const data = episodes.map( ( episode ) => ( {
		id: String( episode.post_id ),
		label: episode.title || ( translate( '(Untitled)' ) as string ),
		value: episode.plays,
		page: `/settings/podcast/stats/episode/${ episode.post_id }${
			siteSlug ? '/' + siteSlug : ''
		}${ mockQuery }`,
	} ) );

	const maxValue = data.length ? Math.max( ...data.map( ( item ) => item.value ) ) : 0;

	const title = translate( 'Top episodes' ) as string;
	const metricLabel = translate( 'Downloads' ) as string;

	if ( isLoading ) {
		return (
			<StatsCard
				className="podcast-stats__section-card"
				title={ title }
				metricLabel={ metricLabel }
			>
				<StatsModulePlaceholder isLoading />
			</StatsCard>
		);
	}

	return (
		<StatsCard
			className="podcast-stats__section-card"
			title={ title }
			metricLabel={ metricLabel }
			isEmpty={ episodes.length === 0 }
			emptyMessage={ translate( 'No episode downloads in this period.' ) }
		>
			<HorizontalBarList>
				{ data.map( ( item ) => (
					<HorizontalBarListItem
						key={ item.id }
						data={ item }
						maxValue={ maxValue }
						onClick={ ( event, listItemData ) => {
							const target = ( listItemData as { page?: string } )?.page;
							if ( ! target ) {
								return;
							}
							page( target );
						} }
						formatValue={ ( value ) => formatNumber( value ) }
					/>
				) ) }
			</HorizontalBarList>
		</StatsCard>
	);
}
