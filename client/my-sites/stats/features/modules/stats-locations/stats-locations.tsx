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
import { trackStatsAnalyticsEvent } from 'calypso/my-sites/stats/utils';
import { useSelector } from 'calypso/state';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';
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
import StatsCardUpdateJetpackVersion from '../../../stats-card-upsell/stats-card-update-jetpack-version';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import StatsInfoArea from '../shared/stats-info-area';
import CountryFilter from './country-filter';
import sampleLocations from './sample-locations';

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
	const title = translate( 'Locations' );

	const { supportsLocationsStats: supportsLocationsStatsFeature } = useSelector( ( state ) =>
		getEnvStatsFeatureSupportChecks( state, siteId )
	);

	// Main location data query
	const {
		data: locationsViewsData = [],
		isLoading: isRequestingData,
		isError,
	} = useLocationViewsQuery< StatsLocationViewsData >( siteId, geoMode, query, countryFilter, {
		enabled: ! shouldGate && supportsLocationsStatsFeature,
	} );

	// The legacy endpoint that only supports countries (not regions or cities)
	// will be used when the new Locations Stats feature is not available.
	const legacyCountriesViewsData = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ];

	const data = supportsLocationsStatsFeature ? locationsViewsData : legacyCountriesViewsData;

	// Only fetch separate countries list if we're not already in country tab
	// This is to avoid fetching the same data twice.
	const { data: countriesList = [] } = useLocationViewsQuery< StatsLocationViewsData >(
		siteId,
		'country',
		query,
		null,
		{
			enabled: ! shouldGate && supportsLocationsStatsFeature && geoMode !== 'country',
		}
	);

	const onCountryChange = ( value: string ) => {
		trackStatsAnalyticsEvent( 'stats_locations_module_country_filter_changed', {
			stat_type: optionLabels[ selectedOption ].feature,
			country: value,
		} );

		setCountryFilter( value );
	};

	const changeViewButton = ( selection: SelectOptionType ) => {
		const filter = selection.value;
		trackStatsAnalyticsEvent( 'stats_locations_module_menu_clicked', {
			stat_type: optionLabels[ filter ].feature,
		} );

		setSelectedOption( filter );
	};

	const onShowMoreClick = () => {
		trackStatsAnalyticsEvent( 'stats_locations_module_show_more_clicked', {
			stat_type: optionLabels[ selectedOption ].feature,
		} );
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

	const divisionsTooltip = (
		<StatsInfoArea>
			{ translate(
				'Countries and their subdivisions are based on {{link}}ISO 3166{{/link}} standards.',
				{
					comment: '{{link}} links to ISO standards.',
					components: {
						link: (
							<a
								target="_blank"
								rel="noreferrer"
								href="https://www.iso.org/maintenance_agencies.html#72482"
							/>
						),
					},
					context: 'Stats: Link in a popover for Regions/Cities module when the module has data',
				}
			) }
		</StatsInfoArea>
	);

	const titleTooltip = (
		<StatsInfoArea>
			{ translate( 'Visitors {{link}}viewing location{{/link}} by countries, regions and cities.', {
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
	);

	const showJetpackUpgradePrompt = geoMode !== 'country' && ! supportsLocationsStatsFeature;

	const showUpsell = shouldGate || showJetpackUpgradePrompt;

	const locationData = showUpsell ? sampleLocations : data;

	const hasLocationData = Array.isArray( locationData ) && locationData.length > 0;

	const heroElement = (
		<>
			<Geochart data={ locationData } geoMode={ geoMode } skipQuery customHeight={ 480 } />
			{ geoMode !== 'country' && ! summaryUrl && (
				<CountryFilter
					countries={ countriesList }
					defaultLabel={ optionLabels[ selectedOption ].countryFilterLabel }
					selectedCountry={ countryFilter }
					onCountryChange={ onCountryChange }
					tooltip={ divisionsTooltip }
				/>
			) }
		</>
	);

	const getModuleOverlay = () => {
		if ( shouldGate ) {
			return (
				<StatsCardUpsell siteId={ siteId } statType={ optionLabels[ selectedOption ].feature } />
			);
		}

		if ( showJetpackUpgradePrompt ) {
			return <StatsCardUpdateJetpackVersion siteId={ siteId } statType="locations" />;
		}

		return null;
	};

	const moduleOverlay = getModuleOverlay();

	return (
		<>
			{ ! shouldGateStatsModule && siteId && statType && (
				<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
			) }
			{ isRequestingData && ! shouldGate && (
				<StatsCardSkeleton
					className="locations-skeleton"
					isLoading={ isRequestingData }
					title={ title }
					type={ 3 }
					withHero
					withSplitHeader
					toggleControl={ toggleControlComponent }
					mainItemLabel={ optionLabels[ selectedOption ]?.headerLabel }
					metricLabel={ translate( 'Views' ) }
					titleNodes={ titleTooltip }
				/>
			) }
			{ ( ( ! isRequestingData && ! isError && hasLocationData ) || shouldGate ) && (
				// show data or an overlay
				<>
					{ /* @ts-expect-error TODO: Refactor StatsListCard with TypeScript. */ }
					<StatsListCard
						title={ title }
						titleNodes={ titleTooltip }
						moduleType="locations"
						data={ locationData }
						emptyMessage={ emptyMessage }
						metricLabel={ translate( 'Views' ) }
						loader={ isRequestingData && <StatsModulePlaceholder isLoading={ isRequestingData } /> }
						splitHeader
						heroElement={ heroElement }
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
						onShowMoreClick={ onShowMoreClick }
						overlay={ moduleOverlay }
					/>
				</>
			) }
			{ ! isRequestingData && ! hasLocationData && ! shouldGate && (
				// show empty state
				<StatsCard
					title={ title }
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
