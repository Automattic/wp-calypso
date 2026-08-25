import { ComponentSwapper } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { Icon, seen, video, chartBar, scheduled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import CountCard from '../components/highlight-cards/count-card';
import MobileHighlightCardListing from '../components/highlight-cards/mobile-highlight-cards';
import { formatHoursWatched } from '../utils/format-hours-watched';
import type { PerformanceTotals } from './aggregate';
import type { JSX } from 'react';

import '../components/highlight-cards/style.scss';
import './style.scss';

const PLACEHOLDER = '-';

export default function VideosPerformanceCards( {
	totals,
	isLoading,
}: {
	totals: PerformanceTotals;
	isLoading: boolean;
} ) {
	const translate = useTranslate();

	// Icons are raw @wordpress/icons elements so both the desktop CountCard and
	// the mobile listing (which wraps them in <Icon>) can render them. A metric
	// carries either a numeric `count` (shortened, with a hover tooltip) or a
	// `preformattedValue` string for the percentage and the "< 1.0" hours floor.
	const metrics: Array< {
		key: string;
		icon: JSX.Element;
		heading: string;
		count: number | null;
		preformattedValue?: string;
	} > = [
		{
			key: 'views',
			icon: seen,
			heading: translate( 'Views', { textOnly: true } ),
			count: isLoading ? null : totals.views,
			preformattedValue: isLoading ? PLACEHOLDER : undefined,
		},
		{
			key: 'impressions',
			icon: video,
			heading: translate( 'Impressions', { textOnly: true } ),
			count: isLoading ? null : totals.impressions,
			preformattedValue: isLoading ? PLACEHOLDER : undefined,
		},
		{
			key: 'watch_time',
			icon: scheduled,
			heading: translate( 'Hours watched', { textOnly: true } ),
			count: null,
			preformattedValue: isLoading ? PLACEHOLDER : formatHoursWatched( totals.watch_time ),
		},
		{
			key: 'retention_rate',
			icon: chartBar,
			heading: translate( 'Retention rate', { textOnly: true } ),
			count: null,
			preformattedValue:
				isLoading || totals.retention_rate === null
					? PLACEHOLDER
					: `${ formatNumber( totals.retention_rate, { decimals: 0 } ) }%`,
		},
	];

	const standard = (
		<div className="highlight-cards-list">
			{ metrics.map( ( metric ) => (
				<CountCard
					key={ metric.key }
					icon={ <Icon icon={ metric.icon } /> }
					heading={ metric.heading }
					label={ metric.heading.toLocaleLowerCase() }
					value={ metric.preformattedValue ?? metric.count }
					showValueTooltip={ metric.count !== null }
				/>
			) ) }
		</div>
	);

	const mobile = (
		<MobileHighlightCardListing
			highlights={ metrics.map( ( metric ) => ( {
				heading: metric.heading,
				count: metric.count,
				icon: metric.icon,
				preformattedValue: metric.preformattedValue,
			} ) ) }
		/>
	);

	return (
		<div className="stats-videos-performance">
			<ComponentSwapper
				breakpoint="<660px"
				breakpointActiveComponent={ mobile }
				breakpointInactiveComponent={ standard }
			/>
		</div>
	);
}
