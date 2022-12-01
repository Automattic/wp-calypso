import cookie from 'cookie';
import { getTrackingPrefs, TRACKING_PREFS_COOKIE_V2 } from '.';
import type { TrackingPrefs } from '.';

const COOKIE_MAX_AGE = 15778800; /* six months */

const setTrackingPrefs = ( newPrefs: Partial< TrackingPrefs > ): TrackingPrefs => {
	const { ok, buckets } = getTrackingPrefs();

	const newOptions = {
		ok: typeof newPrefs.ok === 'boolean' ? newPrefs.ok : ok,
		buckets: {
			...buckets,
			...newPrefs.buckets,
		},
	};

	document.cookie = cookie.serialize( TRACKING_PREFS_COOKIE_V2, JSON.stringify( newOptions ), {
		path: '/',
		maxAge: COOKIE_MAX_AGE,
	} );

	return newOptions;
};

export default setTrackingPrefs;
