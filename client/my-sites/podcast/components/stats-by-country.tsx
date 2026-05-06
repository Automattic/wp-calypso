import { HorizontalBarList, HorizontalBarListItem, StatsCard } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import StatsListCountryFlag from 'calypso/my-sites/stats/stats-list/stats-list-country-flag';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import { formatPodcastCountryName, formatPodcastPct } from './stats-summary-tiles';
import type { PodcastStatsCountryRow } from '../hooks/use-show-stats-query';

type StatsByCountryProps = {
	rows?: PodcastStatsCountryRow[];
	isLoading?: boolean;
};

export default function StatsByCountry( { rows = [], isLoading = false }: StatsByCountryProps ) {
	const translate = useTranslate();
	const unknownCountry = translate( 'Unknown' ) as string;
	const data = rows.map( ( row ) => ( {
		id: row.country || 'unknown',
		label: formatPodcastCountryName( row.country, unknownCountry ),
		value: row.plays,
		pct: row.pct,
		countryCode: row.country,
	} ) );
	const maxValue = data.length ? Math.max( ...data.map( ( item ) => item.value ) ) : 0;

	const title = translate( 'By country' ) as string;
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
			emptyMessage={ translate( 'No country data in this period.' ) }
		>
			<HorizontalBarList>
				{ data.map( ( item ) => (
					<HorizontalBarListItem
						key={ item.id }
						data={ item }
						maxValue={ maxValue }
						leftSideItem={
							item.countryCode ? (
								<StatsListCountryFlag countryCode={ item.countryCode } />
							) : undefined
						}
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
