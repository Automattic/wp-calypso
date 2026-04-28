import { fetchReadTag, fetchReadTags } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readTagsQuery = ( locale: string | null = null ) =>
	queryOptions( {
		queryKey: [ 'read', 'tags', 'followed', locale ],
		queryFn: () => fetchReadTags( locale ),
		staleTime: 1000 * 60 * 5,
	} );

export const readTagQuery = ( slug: string, locale: string | null = null ) =>
	queryOptions( {
		queryKey: [ 'read', 'tags', slug, locale ],
		queryFn: () => fetchReadTag( slug, locale ),
		enabled: !! slug,
		staleTime: 1000 * 60 * 5,
	} );
