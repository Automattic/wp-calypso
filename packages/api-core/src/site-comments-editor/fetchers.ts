import { wpcom } from '../wpcom-fetcher';
import type { SiteCommentsEditorSettings } from './types';

/**
 * The settings the Reader needs to run the Jetpack Comments block editor for a site.
 * A site without block comments answers 404.
 */
export const fetchSiteCommentsEditorSettings = (
	siteId: number
): Promise< SiteCommentsEditorSettings > =>
	wpcom.req.get(
		{
			path: `/sites/${ encodeURIComponent( siteId ) }/comments/editor`,
			apiNamespace: 'wpcom/v2',
		},
		{ _locale: 'user' }
	);
