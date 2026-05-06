import { HorizontalBarList, HorizontalBarListItem, StatsCard } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import { formatPodcastAppName, formatPodcastPct } from './stats-summary-tiles';
import type { PodcastStatsAppRow } from '../hooks/use-show-stats-query';

type StatsByAppProps = {
	rows?: PodcastStatsAppRow[];
	isLoading?: boolean;
};

export default function StatsByApp( { rows = [], isLoading = false }: StatsByAppProps ) {
	const translate = useTranslate();
	const data = rows.map( ( row ) => ( {
		id: row.app,
		label: formatPodcastAppName( row.app ),
		value: row.plays,
		pct: row.pct,
	} ) );
	const maxValue = data.length ? Math.max( ...data.map( ( item ) => item.value ) ) : 0;

	const title = translate( 'By app' ) as string;
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
			isEmpty={ rows.length === 0 }
			emptyMessage={ translate( 'No app data in this period.' ) }
		>
			<HorizontalBarList>
				{ data.map( ( item ) => (
					<HorizontalBarListItem
						key={ item.id }
						data={ item }
						maxValue={ maxValue }
						formatValue={ ( value, listItemData ) => {
							const pct = ( listItemData as { pct?: number } )?.pct;
							return translate( '%(downloads)s · %(pct)s', {
								args: {
									downloads: formatNumber( value ),
									pct: formatPodcastPct( pct ?? 0 ),
								},
							} ) as string;
						} }
					/>
				) ) }
			</HorizontalBarList>
		</StatsCard>
	);
}
