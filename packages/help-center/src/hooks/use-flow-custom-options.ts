import { DIFM_FLOW, DIFM_FLOW_STORE } from '@automattic/onboarding';
/* eslint-disable no-restricted-imports */
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import { useSupportStatus } from '../data/use-support-status';

// We want to give the Help Center custom options based on the flow in which the user is in
export function useFlowCustomOptions( flowName: string ) {
	const { data: supportStatus } = useSupportStatus();
	const { data: geoData } = useGeoLocationQuery();

	if ( flowName === DIFM_FLOW || flowName === DIFM_FLOW_STORE ) {
		return {
			hideBackButton: true,
			hasPremiumSupport:
				supportStatus?.availability.is_difm_chat_open && geoData?.country_short === 'US',
		};
	}

	return null;
}
