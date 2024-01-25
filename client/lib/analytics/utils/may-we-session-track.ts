import { isRegionInStsZone } from '@automattic/calypso-analytics';
import cookie from 'cookie';

export const mayWeSessionTrack = (): boolean => {
	const cookies = cookie.parse( document.cookie );

	if ( isRegionInStsZone( cookies.country_code, cookies.region ) ) {
		return false;
	}

	return ! isRegionInStsZone( cookies.country_code, cookies.region );
};
