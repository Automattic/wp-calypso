import { Gridicon } from '@automattic/components';
import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
import { Icon, seen, video } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

export type VideoStatType = 'views' | 'impressions' | 'watch_time';

// `null` renders a loading placeholder.
export type VideoMetricValues = Record< VideoStatType, number | null >;

function formatValue( statType: VideoStatType, value: number | null ) {
	if ( value === null ) {
		return '-';
	}

	switch ( statType ) {
		case 'watch_time':
			if ( value === 0 || value >= 1 ) {
				return formatNumber( value, { decimals: 1 } );
			}
			return `< ${ formatNumber( 1, { decimals: 1 } ) }`;
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
	];

	return (
		<ul className="stats-video-metric-tabs">
			{ tabs.map( ( tab ) => (
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
							{ formatValue( tab.key, values[ tab.key ] ) }
						</span>
					</button>
				</li>
			) ) }
		</ul>
	);
}
