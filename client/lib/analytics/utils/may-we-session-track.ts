import { isRegionInStsZone } from '@automattic/calypso-analytics';
import cookie from 'cookie';

const mayWeSessionTrack = (): boolean => {
	const cookies = cookie.parse( document.cookie );

	return ! isRegionInStsZone( cookies.country_code, cookies.region );
};

export default mayWeSessionTrack;
