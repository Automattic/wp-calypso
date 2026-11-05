import { fetchCommentsEditorSettings } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

const ONE_HOUR_MS = 60 * 60 * 1000;

export const commentsEditorQuery = () =>
	queryOptions( {
		queryKey: [ 'comments', 'editor' ],
		queryFn: fetchCommentsEditorSettings,
		staleTime: ONE_HOUR_MS,
	} );
