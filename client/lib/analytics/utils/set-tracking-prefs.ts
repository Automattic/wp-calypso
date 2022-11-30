import cookie from 'cookie';
import { getTrackingPrefs } from '.';
import type { TrackingPrefs } from './get-tracking-prefs';

const v2CookieName = 'sensitive_pixel_options';

export const setTrackingPrefs = ( newPrefs: Partial< TrackingPrefs > ): TrackingPrefs => {
	const { ok, buckets } = getTrackingPrefs();

	const newOptions = {
		ok: typeof newPrefs.ok === 'boolean' ? newPrefs.ok : ok,
		buckets: {
			...buckets,
			...newPrefs.buckets,
		},
	};

	document.cookie = cookie.serialize( v2CookieName, JSON.stringify( newOptions ), {
		path: '/',
		maxAge: 15778800 /* six months */,
	} );

	return newOptions;
};
