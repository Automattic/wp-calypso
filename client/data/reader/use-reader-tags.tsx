import { readTagQuery, readTagsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { sortBy } from 'lodash';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { normalizeTags, type NormalizedReaderTag } from 'calypso/reader/lib/tag-utils';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';

/**
 * Returns the current user's followed tags, normalized to the Calypso shape and
 * sorted by slug. Returns `null` while the query is still loading so consumers
 * can distinguish "no data yet" from "empty list".
 */
export function useFollowedReaderTags(): NormalizedReaderTag[] | null {
	const locale = useSelector( getCurrentUserLocale );
	const { data, isSuccess } = useQuery( readTagsQuery( locale ) );

	return useMemo( () => {
		if ( ! isSuccess || ! data ) {
			return null;
		}
		const tags = normalizeTags( data ).map( ( tag ) => ( { ...tag, isFollowing: true } ) );
		return sortBy( tags, 'slug' );
	}, [ data, isSuccess ] );
}

/**
 * Returns a single reader tag by slug. Returns `null` while loading. On a 404
 * returns an `error: true` placeholder so callers can render a "tag not found"
 * state, mirroring the legacy Redux behavior.
 */
export function useReaderTagBySlug( slug: string | null | undefined ): NormalizedReaderTag | null {
	const locale = useSelector( getCurrentUserLocale );
	const { data, isError, error } = useQuery( readTagQuery( slug ?? '', locale ) );

	return useMemo( () => {
		if ( data ) {
			const [ tag ] = normalizeTags( data );
			return tag ?? null;
		}
		if ( isError && slug ) {
			const status = ( error as { status?: number } | undefined )?.status;
			if ( status === 404 ) {
				return {
					id: slug,
					slug,
					title: '',
					displayName: '',
					url: `/tag/${ slug }`,
					error: true,
				};
			}
		}
		return null;
	}, [ data, isError, error, slug ] );
}
