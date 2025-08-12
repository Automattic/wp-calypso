import { useTranslate } from 'i18n-calypso';
import {
	STATS_FEATURE_LOCATION_REGION_VIEWS,
	STATS_FEATURE_LOCATION_COUNTRY_VIEWS,
	STATS_FEATURE_LOCATION_CITY_VIEWS,
} from '../../../constants';
import { OPTION_KEYS } from './types';

export default function useOptionLabels() {
	const translate = useTranslate();
	return {
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
}
