import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';

export default function useShouldRenderHelpCenterButton( {
	enabledGeos,
}: {
	enabledGeos?: string[];
} ) {
	const { data: geoData } = useGeoLocationQuery();

	if ( ! geoData?.country_short || ! enabledGeos?.includes( geoData.country_short ) ) {
		return false;
	}

	return true;
}
