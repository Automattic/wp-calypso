import { wpcom } from '../wpcom-fetcher';
import type { JetpackSettings } from './types';

export async function updateJetpackSettings(
	siteId: number,
	settings: Partial< JetpackSettings >
) {
	return wpcom.req.post( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: '/jetpack/v4/settings/',
		body: JSON.stringify( settings ),
		json: true,
	} );
}
