import cookie from 'cookie';
import type { AdTracker } from '../tracker-buckets';

const getExceptions = (): Partial< Record< AdTracker, boolean > > => {
	const cookies = cookie.parse( document.cookie );
	const region = ( cookies.region || '' ).toLowerCase();
	const countryCode = ( cookies.country_code || '' ).toLowerCase();

	if ( ! region || ! countryCode ) {
		return {};
	}

	return {
		facebook: region === 'california' && countryCode === 'us',
	};
};

export default getExceptions;
