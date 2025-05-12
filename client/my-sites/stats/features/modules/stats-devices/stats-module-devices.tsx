import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { SimplifiedSegmentedControl, StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { mobile } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import PieChart from 'calypso/components/pie-chart';
import PieChartLegend from 'calypso/components/pie-chart/legend';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { JETPACK_SUPPORT_URL_TRAFFIC, DEVICES_SUPPORT_URL } from '../../../const';
import useModuleDevicesQuery, { StatsDevicesData } from '../../../hooks/use-modeule-devices-query';
import { QueryStatsParams } from '../../../hooks/utils';
import StatsListCard from '../../../stats-list/stats-list-card';
import StatsModulePlaceholder from '../../../stats-module/placeholder';
import statsStrings from '../../../stats-strings';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import type { StatsPeriodType } from '../types';

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

interface StatsDevicesChartData {
	id: string;
	value: number;
	icon: string;
	name: string;
	descrtipion?: string;
	className?: string;
}

interface StatsModuleDevicesProps {
	path: string;
	className?: string;
	period?: StatsPeriodType;
	postId?: number;
	query: QueryStatsParams;
	summary?: boolean;
	isLoading?: boolean;
}

const prepareChartData = (
	data: Array< StatsDevicesData > | undefined
): Array< StatsDevicesChartData > => {
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
	isLoading,
	query,
} ) => {
	const { devices: devicesStrings } = statsStrings();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const optionLabels = {
		[ OPTION_KEYS.SIZE ]: {
			selectLabel: translate( 'Size' ),
			headerLabel: translate( 'Visitors share per screen size' ),
			analyticsId: 'screensize',
		},
		[ OPTION_KEYS.BROWSER ]: {
			selectLabel: translate( 'Browser' ),
			headerLabel: translate( 'Browser' ),
			analyticsId: 'browser',
		},
		[ OPTION_KEYS.OS ]: {
			selectLabel: translate( 'OS' ),
			headerLabel: translate( 'Operating System' ),
			analyticsId: 'os',
		},
	};

	const [ selectedOption, setSelectedOption ] = useState( OPTION_KEYS.SIZE );
	const { isFetching, data } = useModuleDevicesQuery( siteId, selectedOption, query );
	const showLoader = isLoading || isFetching;

	const changeViewButton = ( selection: SelectOptionType ) => {
		const filter = selection.value;

		// publish an event
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_devices_module_menu_clicked`, {
			button: optionLabels[ filter ]?.analyticsId ?? filter,
		} );

		setSelectedOption( filter );
	};

	const toggleControlComponent = (
		<SimplifiedSegmentedControl
			className="stats-module-devices__tabs"
			options={ Object.entries( optionLabels ).map( ( entry ) => ( {
				value: entry[ 0 ], // optionLabels key
				label: entry[ 1 ].selectLabel, // optionLabels object value
			} ) ) }
			initialSelected={ selectedOption }
			onSelect={ changeViewButton }
		/>
	);

	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const supportUrl = isSiteJetpackNotAtomic
		? localizeUrl( `${ JETPACK_SUPPORT_URL_TRAFFIC }#devices-stats` )
		: localizeUrl( DEVICES_SUPPORT_URL );

	const titleNodes = (
		<StatsInfoArea>
			{ translate(
				'The {{link}}devices and browsers{{/link}} your visitors use to access your website.',
				{
					comment: '{{link}} links to support documentation.',
					components: {
						link: <a target="_blank" rel="noreferrer" href={ supportUrl } />,
					},
					context: 'Stats: Info popover content when the Devices module has data.',
				}
			) }
		</StatsInfoArea>
	);

	const chartData = OPTION_KEYS.SIZE === selectedOption ? prepareChartData( data ) : null;

	return (
		<>
			{ showLoader && (
				<StatsCardSkeleton
					isLoading={ isFetching }
					className={ className }
					title={ devicesStrings.title }
					type={ 3 }
				/>
			) }
			{ ! showLoader &&
				! data?.length && ( // no data and new empty state enabled
					<StatsCard
						className={ className }
						title={ devicesStrings.title }
						titleNodes={ <StatsInfoArea /> }
						isEmpty
						emptyMessage={
							<EmptyModuleCard
								icon={ mobile }
								description={ translate(
									'The {{link}}devices and browsers{{/link}} your visitors use to access your site will display here.',
									{
										comment: '{{link}} links to support documentation.',
										components: {
											link: <a target="_blank" rel="noreferrer" href={ supportUrl } />,
										},
										context: 'Stats: Info box label when the Devices module is empty',
									}
								) }
							/>
						}
					/>
				) }
			{ ! showLoader && !! data?.length && (
				<>
					{
						// Use dedicated StatsCard for the screen size chart section.
						OPTION_KEYS.SIZE === selectedOption ? (
							<StatsCard
								className={ clsx( className, 'stats-module__card', path ) }
								title={ devicesStrings.title }
								titleNodes={ titleNodes }
								titleURL=""
								metricLabel=""
								splitHeader
								mainItemLabel={ optionLabels[ selectedOption ]?.headerLabel }
								toggleControl={ toggleControlComponent }
								isEmpty={ ! showLoader && ( ! chartData || ! chartData.length ) }
								emptyMessage={ devicesStrings.empty }
							>
								<div className="stats-card--body__chart">
									<PieChart data={ chartData } startAngle={ 0 } svgSize={ 224 } donut hasTooltip />
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
						) : (
							// @ts-expect-error TODO: Refactor StatsListCard with TypeScript.
							<StatsListCard
								className={ clsx( className, 'stats-module__card', path ) }
								moduleType={ path }
								data={ data }
								title={ devicesStrings.title }
								titleNodes={ titleNodes }
								emptyMessage={ devicesStrings.empty }
								metricLabel={ translate( 'Visitors' ) }
								loader={ showLoader && <StatsModulePlaceholder isLoading={ showLoader } /> }
								splitHeader
								useShortNumber
								mainItemLabel={ optionLabels[ selectedOption ]?.headerLabel }
								toggleControl={ toggleControlComponent }
							/>
						)
					}
				</>
			) }
		</>
	);
};

export { StatsModuleDevices as default, StatsModuleDevices, OPTION_KEYS };
