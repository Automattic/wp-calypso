import cookie from 'cookie';
import { default as getTrackingPrefs, TRACKING_PREFS_COOKIE_V2 } from './get-tracking-prefs';
import type { TrackingPrefs } from './get-tracking-prefs';

type TrackingPrefsData = Partial<
	Omit< TrackingPrefs, 'buckets' > & { buckets: Partial< TrackingPrefs[ 'buckets' ] > }
>;

const COOKIE_MAX_AGE = 60 * 60 * 24 * ( 365.25 / 2 ); /* six months; 365.25 -> avg days in year */

const setTrackingPrefs = ( newPrefs: TrackingPrefsData ): TrackingPrefs => {
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
