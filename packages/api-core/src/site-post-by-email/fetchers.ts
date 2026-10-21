import { fetchJetpackSettings } from '../site-jetpack-settings/fetchers';
import { wpcom } from '../wpcom-fetcher';
import {
	getSettingsFromJetpackResponse,
	isSimpleWpcomSite,
	normalizeWpcomPostByEmailStatus,
} from './utils';
import type { SitePostByEmailSettings, SitePostByEmailStatus } from './types';
import type { Site } from '../site/types';

export async function fetchSitePostByEmailSettings(
	site: Pick< Site, 'ID' | 'jetpack' | 'is_wpcom_atomic' >
): Promise< SitePostByEmailSettings > {
	if ( ! isSimpleWpcomSite( site ) ) {
		return getSettingsFromJetpackResponse( await fetchJetpackSettings( site.ID ) );
	}

	const status = await wpcom.req.get( {
		path: `/sites/${ site.ID }/post-by-email`,
		apiNamespace: 'wpcom/v2',
	} );

	return normalizeWpcomPostByEmailStatus( status as SitePostByEmailStatus );
}
