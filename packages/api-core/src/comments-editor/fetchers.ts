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

/**
 * The preview of an embed in the comment editor, asked for as the signed-in reader.
 */
export const fetchCommentEmbedPreview = ( url: string ): Promise< unknown > =>
	wpcom.req.get( { path: '/read/embed', apiNamespace: 'wpcom/v2' }, { url } );
