import { Gridicon } from '@automattic/components';
import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
import { Icon, seen, video, dashboard } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

export type VideoStatType = 'views' | 'impressions' | 'watch_time' | 'retention_rate';

// `null` renders a loading placeholder; `undefined` omits the card entirely
// (used for retention when the video duration is unavailable).
export interface VideoMetricValues {
	views: number | null;
	impressions: number | null;
	watch_time: number | null;
	retention_rate?: number | null;
}

function formatValue( statType: VideoStatType, value: number | null ) {
	if ( value === null ) {
		return '-';
	}

	switch ( statType ) {
		case 'watch_time':
			return value > 1
				? formatNumber( value, { decimals: 1 } )
				: `< ${ formatNumber( 1, { decimals: 1 } ) }`;
		case 'retention_rate':
			return `${ formatNumber( value, { decimals: 1 } ) }%`;
		default:
			return formatNumberCompact( value );
	}
}

export default function VideoMetricTabs( {
	values,
	selected,
	onSelect,
}: {
	values: VideoMetricValues;
	selected: VideoStatType;
	onSelect: ( statType: VideoStatType ) => void;
} ) {
	const translate = useTranslate();

	const tabs: Array< { key: VideoStatType; label: string; icon: React.ReactNode } > = [
		{
			key: 'views',
			label: translate( 'Views', { textOnly: true } ),
			icon: <Icon icon={ seen } />,
		},
		{
			key: 'impressions',
			label: translate( 'Impressions', { textOnly: true } ),
			icon: <Icon icon={ video } />,
		},
		{
			key: 'watch_time',
			label: translate( 'Hours watched', { textOnly: true } ),
			icon: <Gridicon icon="time" size={ 24 } />,
		},
		{
			key: 'retention_rate',
			label: translate( 'Retention rate', { textOnly: true } ),
			icon: <Icon icon={ dashboard } />,
		},
	];

	const availableTabs = tabs.filter( ( tab ) => values[ tab.key ] !== undefined );

	return (
		<ul className="stats-video-metric-tabs">
			{ availableTabs.map( ( tab ) => (
				<li key={ tab.key } className="stats-video-metric-tabs__item">
					<button
						type="button"
						className={ clsx( 'stats-video-metric-tabs__tab', {
							'is-selected': selected === tab.key,
						} ) }
						aria-pressed={ selected === tab.key }
						onClick={ () => onSelect( tab.key ) }
					>
						<span className="stats-video-metric-tabs__header">
							{ tab.icon }
							{ tab.label }
						</span>
						<span className="stats-video-metric-tabs__value">
							{ formatValue( tab.key, values[ tab.key ] ?? null ) }
						</span>
					</button>
				</li>
			) ) }
		</ul>
	);
}
