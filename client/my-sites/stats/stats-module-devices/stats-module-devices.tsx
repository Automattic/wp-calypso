import { SimplifiedSegmentedControl, StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import PieChart from 'calypso/components/pie-chart';
import PieChartLegend from 'calypso/components/pie-chart/legend';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { JETPACK_SUPPORT_URL } from '../const';
import useModuleDevicesQuery, {
	QueryStatsDevicesParams,
	StatsDevicesData,
} from '../hooks/use-modeule-devices-query';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from '../stats-module/placeholder';

// import '../stats-module/style.scss';
// import '../stats-list/style.scss';
import './stats-module-devices.scss';

const OPTION_KEYS = {
	SIZE: 'screensize',
	BROWSER: 'browser',
	OS: 'platform',
};

type SelectOptionType = {
	label: string;
	value: string;
};

interface StatsModuleDevicesProps {
	path: string;
	className?: string;
	period?: string;
	postId?: number;
	query: QueryStatsDevicesParams;
	summary?: boolean;
	isLoading?: boolean;
}

const prepareChartData = ( data: Array< StatsDevicesData > | undefined ) => {
	if ( ! data ) {
		return [];
	}

	return data.map( ( device: StatsDevicesData ) => {
		let icon;

		switch ( device.key ) {
			case 'desktop':
				icon =
					'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M20.5 16H19.8V8C19.8 6.9 18.9 6 17.8 6H6.2C5.1 6 4.2 6.9 4.2 8V16H3.5C2.7 16 2 16.7 2 17.5H22C22 16.7 21.3 16 20.5 16ZM5.7 8C5.7 7.7 5.9 7.5 6.2 7.5H17.8C18.1 7.5 18.3 7.7 18.3 8V15.6H5.7V8Z" fill="white"/> </svg>';
				break;
			case 'mobile':
				icon =
					'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M15 4H9C7.9 4 7 4.9 7 6V18C7 19.1 7.9 20 9 20H15C16.1 20 17 19.1 17 18V6C17 4.9 16.1 4 15 4ZM15.5 18C15.5 18.3 15.3 18.5 15 18.5H9C8.7 18.5 8.5 18.3 8.5 18V6C8.5 5.7 8.7 5.5 9 5.5H15C15.3 5.5 15.5 5.7 15.5 6V18ZM11 17.5H13V16H11V17.5Z" fill="white"/> </svg>';
				break;
			case 'tablet':
				icon =
					'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M17 4H7C5.9 4 5 4.9 5 6V18C5 19.1 5.9 20 7 20H17C18.1 20 19 19.1 19 18V6C19 4.9 18.1 4 17 4ZM17.5 18C17.5 18.3 17.3 18.5 17 18.5H7C6.7 18.5 6.5 18.3 6.5 18V6C6.5 5.7 6.7 5.5 7 5.5H17C17.3 5.5 17.5 5.7 17.5 6V18ZM10 17.5H14V16H10V17.5Z" fill="white"/> </svg>';
				break;
			default:
				icon =
					'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M21 12C21 16.9706 16.9706 21 12 21C9.62008 21 7.45591 20.0762 5.8465 18.5677L18.5677 5.8465C20.0762 7.45591 21 9.62008 21 12ZM5.15559 17.8444L17.8444 5.15559C16.2719 3.81158 14.2307 3 12 3C7.02944 3 3 7.02944 3 12C3 14.2307 3.81158 16.2719 5.15559 17.8444ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" fill="white"/> </svg>';
		}

		return {
			id: device.key,
			value: device.value,
			icon,
			name: device.label,
			descrtipion: device.label,
			className: `donut-${ device.key }`,
		};
	} );
};

const StatsModuleDevices: React.FC< StatsModuleDevicesProps > = ( {
	path,
	className,
	// period, // we will need period once the API endpoint is done
	isLoading,
	query,
} ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const translate = useTranslate();

	const optionLabels = {
		[ OPTION_KEYS.SIZE ]: {
			selectLabel: translate( 'Size' ),
			headerLabel: translate( 'Visitors share per screen size' ),
		},
		[ OPTION_KEYS.BROWSER ]: {
			selectLabel: translate( 'Browser' ),
			headerLabel: translate( 'Browser' ),
		},
		[ OPTION_KEYS.OS ]: {
			selectLabel: translate( 'OS' ),
			headerLabel: translate( 'Operating System' ),
		},
	};

	const [ selectedOption, setSelectedOption ] = useState( OPTION_KEYS.BROWSER );

	const { isFetching, data } = useModuleDevicesQuery( siteId, selectedOption, {
		...query,
		days: 7,
	} );

	const showLoader = isLoading || isFetching;

	const changeViewButton = ( selection: SelectOptionType ) => {
		const filter = selection.value;

		// TODO: add analytics events

		setSelectedOption( filter );
	};

	const toggleControlComponent = (
		<SimplifiedSegmentedControl
			options={ Object.entries( optionLabels ).map( ( entry ) => ( {
				value: entry[ 0 ], // optionLabels key
				label: entry[ 1 ].selectLabel, // optionLabels object value
			} ) ) }
			initialSelected={ selectedOption }
			// @ts-expect-error TODO: missing TS type
			onSelect={ changeViewButton }
		/>
	);

	const title = translate( 'Devices', { context: 'Stats: title of module', textOnly: true } );

	// Use dedicated StatsCard for the screen size chart section.
	if ( OPTION_KEYS.SIZE === selectedOption ) {
		const chartData = prepareChartData( data );

		return (
			<StatsCard
				className={ classNames( className, 'stats-module__card', path ) }
				title={ title }
				titleURL=""
				metricLabel=""
				splitHeader
				mainItemLabel={ optionLabels[ selectedOption ]?.headerLabel }
				toggleControl={ toggleControlComponent }
			>
				{ showLoader ? (
					<StatsModulePlaceholder isLoading={ showLoader } />
				) : (
					<div className="stats-card--body__chart">
						<PieChart data={ chartData } donut hasTooltip />
						<PieChartLegend
							data={ chartData }
							onlyPercent
							svgElement={
								<svg
									width="15"
									height="14"
									viewBox="0 0 15 14"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<rect x="0.5" width="14" height="14" rx="3" />
								</svg>
							}
						/>
					</div>
				) }
			</StatsCard>
		);
	}

	return (
		// @ts-expect-error TODO: Refactor StatsListCard with TypeScript.
		<StatsListCard
			className={ classNames( className, 'stats-module__card', path ) }
			moduleType={ path }
			data={ data }
			title={ title }
			emptyMessage={ translate(
				'If you use UTM codes, your {{link}}campaign performance data{{/link}} will show here.',
				{
					comment: '{{link}} links to support documentation.',
					components: {
						link: <a href={ localizeUrl( `${ JETPACK_SUPPORT_URL }#devices-stats` ) } />,
					},
					context: 'Stats: Info box label when the UTM module is empty',
				}
			) }
			metricLabel={ translate( 'Visitors' ) }
			loader={ showLoader && <StatsModulePlaceholder isLoading={ showLoader } /> }
			splitHeader
			useShortNumber
			mainItemLabel={ optionLabels[ selectedOption ]?.headerLabel }
			toggleControl={ toggleControlComponent }
		/>
	);
};

export { StatsModuleDevices as default, StatsModuleDevices, OPTION_KEYS };
