import { useSupportStatus } from '@automattic/help-center/src/data/use-support-status';
import { isDIFMFlow } from '@automattic/onboarding';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';

export default function useShouldRenderHelpCenterButton( {
	flowName,
	enabledGeos,
}: {
	flowName: string;
	enabledGeos?: string[];
} ) {
	const { data: geoData } = useGeoLocationQuery();
	const { data: supportStatus } = useSupportStatus();

	if ( isDIFMFlow( flowName ) ) {
		if ( ! supportStatus?.availability.is_difm_chat_open ) {
			return false;
		}
	}

	if ( ! geoData?.country_short || ! enabledGeos?.includes( geoData.country_short ) ) {
		return false;
	}

	return true;
}
