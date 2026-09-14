import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import { useSelector } from 'calypso/state';
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';

/**
 * Whether the visitor should see the India Automattic for Agencies (A4A) card.
 *
 * Uses the logged-in user's country, falling back to IP geolocation when there
 * is no logged-in user.
 */
export const useIsIndiaA4A = (): boolean => {
	const userCountryCode = useSelector( getCurrentUserCountryCode );
	const { data: geoData } = useGeoLocationQuery();

	return ( userCountryCode || geoData?.country_short ) === 'IN';
};
