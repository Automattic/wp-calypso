import { wpcom } from '../wpcom-fetcher';
import type { CommentsEditorSettings, SiteCommentsBlocks } from './types';

/**
 * The settings the Reader needs to run the Jetpack Comments block editor.
 */
export const fetchCommentsEditorSettings = (): Promise< CommentsEditorSettings > =>
	wpcom.req.get(
		{
			path: '/comments/editor',
			apiNamespace: 'wpcom/v2',
		},
		{ _locale: 'user' }
	);

/**
 * Whether a site's comments take blocks. The editor settings are the same for every site, so they can't say.
 */
export const fetchSiteCommentsBlocks = ( siteId: number ): Promise< SiteCommentsBlocks > =>
	wpcom.req.get( {
		path: `/sites/${ encodeURIComponent( siteId ) }/comments/blocks`,
		apiNamespace: 'wpcom/v2',
	} );
