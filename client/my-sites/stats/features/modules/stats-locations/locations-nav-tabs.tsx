import page from '@automattic/calypso-router';
import { TabPanel } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { getPathWithUpdatedQueryString } from 'calypso/my-sites/stats/utils';
import {
	STATS_FEATURE_LOCATION_REGION_VIEWS,
	STATS_FEATURE_LOCATION_COUNTRY_VIEWS,
	STATS_FEATURE_LOCATION_CITY_VIEWS,
} from '../../../constants';
import { StatsQueryType } from '../types';
import { UrlGeoMode, OPTION_KEYS } from './types';

function LocationsNavTabs( { query }: { query: StatsQueryType & { geoMode?: UrlGeoMode } } ) {
	const translate = useTranslate();
	const tabPanelTabs = useMemo( () => {
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
		return Object.entries( optionLabels ).map( ( [ key, item ] ) => {
			return {
				name: key,
				title: item.selectLabel,
				className: `stats-navigation__${ key }`,
				path: getPathWithUpdatedQueryString( {
					geoMode: key,
				} ),
			};
		} );
	}, [] );

	const selectedTab = query.geoMode || OPTION_KEYS.COUNTRIES;

	return (
		<TabPanel
			className="stats-navigation__tabs"
			tabs={ tabPanelTabs }
			initialTabName={ selectedTab }
			onSelect={ ( tabName ) => {
				// TODO add analytics tracking here.
				const tab = tabPanelTabs.find( ( tab ) => tab.name === tabName );
				if ( tab?.path ) {
					page( tab.path );
				}
			} }
		>
			{ () => null /* Placeholder div since content is rendered elsewhere */ }
		</TabPanel>
	);
}

export default LocationsNavTabs;
