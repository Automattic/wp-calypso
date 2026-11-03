import { wpcom } from '../wpcom-fetcher';
import type { CommentsEditorSettings } from './types';

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
