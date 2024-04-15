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
import useModuleDevicesQuery, { QueryStatsDevicesParams } from '../hooks/use-modeule-devices-query';
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

	const { isPending, data } = useModuleDevicesQuery( siteId, selectedOption, {
		...query,
		days: 7,
	} );

	const showLoader = isLoading || isPending;

	const changeViewButton = ( selection: SelectOptionType ) => {
		const filter = selection.value;

		// TODO: add analytics events

		setSelectedOption( filter );
	};

	// TODO: Format real data from the API.
	const chartData = [
		{
			id: 'desktop',
			icon: '<svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M18.5 10H17.8V2C17.8 0.9 16.9 0 15.8 0H4.2C3.1 0 2.2 0.9 2.2 2V10H1.5C0.7 10 0 10.7 0 11.5H20C20 10.7 19.3 10 18.5 10ZM3.7 2C3.7 1.7 3.9 1.5 4.2 1.5H15.8C16.1 1.5 16.3 1.7 16.3 2V9.6H3.7V2Z" fill="white"/> </svg>',
			value: 58,
			name: 'Desktop',
			descrtipion: 'Desktop',
			className: 'donut-desktop',
		},
		{
			id: 'mobile',
			icon: '<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M8 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H8C9.1 16 10 15.1 10 14V2C10 0.9 9.1 0 8 0ZM8.5 14C8.5 14.3 8.3 14.5 8 14.5H2C1.7 14.5 1.5 14.3 1.5 14V2C1.5 1.7 1.7 1.5 2 1.5H8C8.3 1.5 8.5 1.7 8.5 2V14ZM4 13.5H6V12H4V13.5Z" fill="white"/> </svg>',
			value: 31,
			name: 'Mobile',
			descrtipion: 'Mobile',
			className: 'donut-mobile',
		},
		{
			id: 'tablet',
			icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M17 4H7C5.9 4 5 4.9 5 6V18C5 19.1 5.9 20 7 20H17C18.1 20 19 19.1 19 18V6C19 4.9 18.1 4 17 4ZM17.5 18C17.5 18.3 17.3 18.5 17 18.5H7C6.7 18.5 6.5 18.3 6.5 18V6C6.5 5.7 6.7 5.5 7 5.5H17C17.3 5.5 17.5 5.7 17.5 6V18ZM10 17.5H14V16H10V17.5Z" fill="white"/> </svg>',
			value: 8,
			name: 'Tablet',
			descrtipion: 'Tablet',
			className: 'donut-table',
		},
		{
			id: 'not-set',
			icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M19 10C19 14.9706 14.9706 19 10 19C7.62008 19 5.45591 18.0762 3.8465 16.5677L16.5677 3.8465C18.0762 5.45591 19 7.62008 19 10ZM3.15559 15.8444L15.8444 3.15559C14.2719 1.81158 12.2307 1 10 1C5.02944 1 1 5.02944 1 10C1 12.2307 1.81158 14.2719 3.15559 15.8444ZM20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10Z" fill="white"/> </svg>',
			value: 3,
			name: 'Not set',
			descrtipion: 'Not set',
			className: 'donut-others',
		},
	];

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
