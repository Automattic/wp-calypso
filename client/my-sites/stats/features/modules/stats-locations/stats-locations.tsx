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
import StatsListCard from 'calypso/my-sites/stats/stats-list/stats-list-card';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import statsStrings from 'calypso/my-sites/stats/stats-strings';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { SUPPORT_URL, JETPACK_SUPPORT_URL_TRAFFIC } from '../../../const';
import Geochart from '../../../geochart';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import StatsInfoArea from '../shared/stats-info-area';

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
	const { locations: moduleStrings } = statsStrings();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsCountryViews';
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const supportUrl = isOdysseyStats ? JETPACK_SUPPORT_URL_TRAFFIC : SUPPORT_URL;

	// Use StatsModule to display paywall upsell.
	const shouldGateStatsModule = useShouldGateStats( statType );

	const [ selectedOption, setSelectedOption ] = useState( OPTION_KEYS.COUNTRIES );
	const optionLabels = {
		[ OPTION_KEYS.COUNTRIES ]: {
			selectLabel: translate( 'Countries' ),
			headerLabel: translate( 'Top countries' ),
			analyticsId: 'countries',
		},
		[ OPTION_KEYS.REGIONS ]: {
			selectLabel: translate( 'Regions' ),
			headerLabel: translate( 'Top regions' ),
			analyticsId: 'regions',
		},
		[ OPTION_KEYS.CITIES ]: {
			selectLabel: translate( 'Cities' ),
			headerLabel: translate( 'Top cities' ),
			analyticsId: 'cities',
		},
	};

	const geoMode = GEO_MODES[ selectedOption ];

	const {
		data = [],
		isLoading: isRequestingData,
		isError,
	} = useLocationViewsQuery< StatsLocationViewsData >( siteId, geoMode, query );

	const changeViewButton = ( selection: SelectOptionType ) => {
		const filter = selection.value;

		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_locations_module_menu_clicked`, {
			button: optionLabels[ filter ]?.analyticsId ?? filter,
		} );

		setSelectedOption( filter );
	};

	const toggleControlComponent = (
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

	return (
		<>
			{ ! shouldGateStatsModule && siteId && statType && (
				<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
			) }
			{ isRequestingData && (
				<StatsCardSkeleton
					isLoading={ isRequestingData }
					title={ moduleStrings.title }
					type={ 3 }
					withHero
				/>
			) }
			{ ( ( ! isRequestingData && ! isError && data ) || shouldGateStatsModule ) && (
				// show data or an overlay
				<>
					{ /* @ts-expect-error TODO: Refactor StatsListCard with TypeScript. */ }
					<StatsListCard
						title={ moduleStrings.title }
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
						data={ data }
						emptyMessage={ emptyMessage }
						metricLabel={ translate( 'Visitors' ) }
						loader={ isRequestingData && <StatsModulePlaceholder isLoading={ isRequestingData } /> }
						splitHeader
						heroElement={ <Geochart data={ data } geoMode={ geoMode } skipQuery /> }
						mainItemLabel={ optionLabels[ selectedOption ]?.headerLabel }
						toggleControl={ toggleControlComponent }
						showMore={
							summaryUrl
								? {
										url: summaryUrl,
										label:
											Array.isArray( data ) && data.length >= 10
												? translate( 'View all', {
														context: 'Stats: Button link to show more detailed stats information',
												  } )
												: translate( 'View details', {
														context: 'Stats: Button label to see the detailed content of a panel',
												  } ),
								  }
								: undefined
						}
					/>
				</>
			) }
			{ ! isRequestingData &&
				Array.isArray( data ) &&
				! data?.length &&
				! shouldGateStatsModule && (
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
