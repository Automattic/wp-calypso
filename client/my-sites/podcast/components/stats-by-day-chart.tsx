import { formatNumber } from '@automattic/number-formatters';
import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Chart from 'calypso/components/chart';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import { formatPodcastDate } from './stats-summary-tiles';
import type { PodcastStatsPeriod, PodcastStatsRange } from '../hooks/use-show-stats-query';

type StatsByDayChartProps = {
	byDay?: Record< string, number >;
	range?: PodcastStatsRange;
	period: PodcastStatsPeriod;
	isLoading?: boolean;
};

type ChartDatum = {
	label: string;
	value: number;
	tooltipData: Array< {
		label: string;
		value: string;
	} >;
};

const formatAxisDate = ( date: string ) =>
	new Intl.DateTimeFormat( undefined, {
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	} ).format( new Date( `${ date }T00:00:00Z` ) );

export default function StatsByDayChart( {
	byDay = {},
	range,
	period,
	isLoading = false,
}: StatsByDayChartProps ) {
	const translate = useTranslate();
	const chartData: ChartDatum[] = Object.entries( byDay )
		.sort( ( [ a ], [ b ] ) => a.localeCompare( b ) )
		.map( ( [ date, plays ] ) => ( {
			label: formatAxisDate( date ),
			value: plays,
			tooltipData: [
				{
					label: formatPodcastDate( date ),
					value: formatNumber( plays ),
				},
			],
		} ) );

	const rangeLabel =
		period === 'all' && range
			? ( translate( 'Daily plays, last %(days)d days', {
					args: { days: chartData.length || 365 },
			  } ) as string )
			: undefined;

	let chartContent;
	if ( isLoading ) {
		chartContent = <StatsModulePlaceholder className="is-chart" isLoading />;
	} else if ( chartData.length === 0 ) {
		chartContent = (
			<Text variant="muted">{ translate( 'No daily play data in this period.' ) }</Text>
		);
	} else {
		chartContent = (
			<div className="podcast-stats-chart__chart">
				<Chart data={ chartData } minBarWidth={ 18 } />
			</div>
		);
	}

	return (
		<Card className="podcast-stats__section-card podcast-stats-chart">
			<CardBody>
				<VStack spacing={ 4 }>
					<div>
						<h3 className="podcast-stats__section-title">{ translate( 'Plays by day' ) }</h3>
						{ rangeLabel && <Text variant="muted">{ rangeLabel }</Text> }
					</div>
					{ chartContent }
				</VStack>
			</CardBody>
		</Card>
	);
}
