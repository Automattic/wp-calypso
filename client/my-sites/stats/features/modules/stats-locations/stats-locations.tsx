import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { SimplifiedSegmentedControl, StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { mapMarker } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import useLocationViewsQuery, {
	StatsLocationViewsData,
} from 'calypso/my-sites/stats/hooks/use-location-views-query';
import { useShouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import { QueryStatsParams } from 'calypso/my-sites/stats/hooks/utils';
import StatsCardUpsell from 'calypso/my-sites/stats/stats-card-upsell';
import StatsListCard from 'calypso/my-sites/stats/stats-list/stats-list-card';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { SUPPORT_URL, JETPACK_SUPPORT_URL_TRAFFIC } from '../../../const';
import {
	STAT_TYPE_COUNTRY_VIEWS,
	STATS_FEATURE_LOCATION_REGION_VIEWS,
	STATS_FEATURE_LOCATION_COUNTRY_VIEWS,
	STATS_FEATURE_LOCATION_CITY_VIEWS,
} from '../../../constants';
import Geochart from '../../../geochart';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import StatsInfoArea from '../shared/stats-info-area';
import CountryFilter from './country-filter';

import './style.scss';

const OPTION_KEYS = {
	COUNTRIES: 'countries',
	REGIONS: 'regions',
	CITIES: 'cities',
};

type GeoMode = 'country' | 'region' | 'city';

const GEO_MODES: Record< string, GeoMode > = {
	[ OPTION_KEYS.COUNTRIES ]: 'country',
	[ OPTION_KEYS.REGIONS ]: 'region',
	[ OPTION_KEYS.CITIES ]: 'city',
};

type SelectOptionType = {
	label: string;
	value: string;
};

interface StatsModuleLocationsProps {
	query: QueryStatsParams;
	summaryUrl?: string;
}

const StatsLocations: React.FC< StatsModuleLocationsProps > = ( { query, summaryUrl } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = STAT_TYPE_COUNTRY_VIEWS;
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const supportUrl = isOdysseyStats ? JETPACK_SUPPORT_URL_TRAFFIC : SUPPORT_URL;

	const [ selectedOption, setSelectedOption ] = useState( OPTION_KEYS.COUNTRIES );

	const [ countryFilter, setCountryFilter ] = useState< string | null >( null );

	const onCountryChange = ( value: string ) => {
		setCountryFilter( value );
	};

	const optionLabels = {
		[ OPTION_KEYS.COUNTRIES ]: {
			selectLabel: translate( 'Countries' ),
			headerLabel: translate( 'Top countries' ),
			analyticsId: 'countries',
			feature: STATS_FEATURE_LOCATION_COUNTRY_VIEWS,
			countryFilterLabel: translate( 'All countries' ),
		},
		[ OPTION_KEYS.REGIONS ]: {
			selectLabel: translate( 'Regions' ),
			headerLabel: translate( 'Top regions' ),
			analyticsId: 'regions',
			feature: STATS_FEATURE_LOCATION_REGION_VIEWS,
			countryFilterLabel: translate( 'All regions' ),
		},
		[ OPTION_KEYS.CITIES ]: {
			selectLabel: translate( 'Cities' ),
			headerLabel: translate( 'Top cities' ),
			analyticsId: 'cities',
			feature: STATS_FEATURE_LOCATION_CITY_VIEWS,
			countryFilterLabel: translate( 'All cities' ),
		},
	};

	// Use StatsModule to display paywall upsell.
	const shouldGateStatsModule = useShouldGateStats( statType );
	const shouldGateTab = useShouldGateStats( optionLabels[ selectedOption ].feature );
	const shouldGate = shouldGateStatsModule || shouldGateTab;
	const geoMode = GEO_MODES[ selectedOption ];
	const title = optionLabels[ selectedOption ]?.selectLabel;

	// Main location data query
	const {
		data = [],
		isLoading: isRequestingData,
		isError,
	} = useLocationViewsQuery< StatsLocationViewsData >( siteId, geoMode, query, countryFilter, {
		enabled: ! shouldGate,
	} );

	// Only fetch separate countries list if we're not already in country tab
	// This is to avoid fetching the same data twice.
	const { data: countriesList = [] } = useLocationViewsQuery< StatsLocationViewsData >(
		siteId,
		'country',
		query,
		null,
		{
			enabled: ! shouldGate && geoMode !== 'country',
		}
	);

	const changeViewButton = ( selection: SelectOptionType ) => {
		const filter = selection.value;

		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_locations_module_menu_clicked`, {
			button: optionLabels[ filter ]?.analyticsId ?? filter,
		} );

		setSelectedOption( filter );
	};

	const toggleControlComponent = (
		<>
			<SimplifiedSegmentedControl
				className="stats-module-locations__tabs"
				options={ Object.entries( optionLabels ).map( ( entry ) => ( {
					value: entry[ 0 ], // optionLabels key
					label: entry[ 1 ].selectLabel, // optionLabels object value
				} ) ) }
				initialSelected={ selectedOption }
				// @ts-expect-error TODO: missing TS type
				onSelect={ changeViewButton }
			/>
			{ geoMode !== 'country' && ! summaryUrl && (
				<CountryFilter
					countries={ countriesList }
					defaultLabel={ optionLabels[ selectedOption ].countryFilterLabel }
					selectedCountry={ countryFilter }
					onCountryChange={ onCountryChange }
				/>
			) }
		</>
	);

	const emptyMessage = (
		<EmptyModuleCard
			icon={ mapMarker }
			description={ translate(
				'Stats on visitors and their {{link}}viewing location{{/link}} will appear here to learn from where you are getting visits.',
				{
					comment: '{{link}} links to support documentation.',
					components: {
						link: (
							<a
								target="_blank"
								rel="noreferrer"
								href={ localizeUrl( `${ supportUrl }#countries` ) }
							/>
						),
					},
					context: 'Stats: Info box label when the Countries module is empty',
				}
			) }
		/>
	);

	const fakeData = [
		{ label: 'United States', countryCode: 'US', value: 2000, region: '021' },
		{ label: 'India', countryCode: 'IN', value: 1500, region: '034' },
		{ label: 'United Kingdom', countryCode: 'GB', value: 1200, region: '154' },
		{ label: 'Canada', countryCode: 'CA', value: 1000, region: '021' },
		{ label: 'Germany', countryCode: 'DE', value: 900, region: '155' },
		{ label: 'Indonesia', countryCode: 'ID', value: 800, region: '035' },
		{ label: 'Japan', countryCode: 'JP', value: 700, region: '030' },
		{ label: 'France', countryCode: 'FR', value: 600, region: '155' },
		{ label: 'Netherlands', countryCode: 'NL', value: 500, region: '155' },
		{ label: 'Spain', countryCode: 'ES', value: 400, region: '039' },
	];
	const hasLocationData = Array.isArray( data ) && data.length > 0;

	const locationData = shouldGate ? fakeData : data;

	return (
		<>
			{ ! shouldGateStatsModule && siteId && statType && (
				<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
			) }
			{ isRequestingData && ! shouldGate && (
				<StatsCardSkeleton isLoading={ isRequestingData } title={ title } type={ 3 } withHero />
			) }
			{ ( ( ! isRequestingData && ! isError && hasLocationData ) || shouldGate ) && (
				// show data or an overlay
				<>
					{ /* @ts-expect-error TODO: Refactor StatsListCard with TypeScript. */ }
					<StatsListCard
						title={ title }
						titleNodes={
							<StatsInfoArea>
								{ translate( 'Stats on visitors and their {{link}}viewing location{{/link}}.', {
									comment: '{{link}} links to support documentation.',
									components: {
										link: (
											<a
												target="_blank"
												rel="noreferrer"
												href={ localizeUrl( `${ supportUrl }#countries` ) }
											/>
										),
									},
									context: 'Stats: Link in a popover for Countries module when the module has data',
								} ) }
							</StatsInfoArea>
						}
						moduleType="countryviews"
						data={ locationData }
						emptyMessage={ emptyMessage }
						metricLabel={ translate( 'Views' ) }
						loader={ isRequestingData && <StatsModulePlaceholder isLoading={ isRequestingData } /> }
						splitHeader
						heroElement={
							<Geochart data={ locationData } geoMode={ geoMode } skipQuery customHeight={ 480 } />
						}
						mainItemLabel={ optionLabels[ selectedOption ]?.headerLabel }
						toggleControl={ toggleControlComponent }
						showMore={
							summaryUrl
								? {
										url: summaryUrl,
										label:
											Array.isArray( locationData ) && locationData.length >= 10
												? translate( 'View all', {
														context: 'Stats: Button link to show more detailed stats information',
												  } )
												: translate( 'View details', {
														context: 'Stats: Button label to see the detailed content of a panel',
												  } ),
								  }
								: undefined
						}
						overlay={
							shouldGate && (
								<StatsCardUpsell
									siteId={ siteId }
									statType={ optionLabels[ selectedOption ].feature }
								/>
							)
						}
					/>
				</>
			) }
			{ ! isRequestingData && ! hasLocationData && ! shouldGate && (
				// show empty state
				<StatsCard
					title={ translate( 'Locations' ) }
					isEmpty
					emptyMessage={ emptyMessage }
					footerAction={
						summaryUrl
							? {
									url: summaryUrl,
									label: translate( 'View more' ),
							  }
							: undefined
					}
				/>
			) }
		</>
	);
};

export default StatsLocations;
