import { readTagQuery, readTagsQuery, type ReaderTag } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';

/**
 * Returns the current user's followed tags. Returns `null` while the query is
 * still loading so consumers can distinguish "no data yet" from "empty list".
 */
export function useFollowedReaderTags(): ReaderTag[] | null {
	const locale = useSelector( getCurrentUserLocale );
	const { data, isSuccess } = useQuery( readTagsQuery( locale ) );

	return isSuccess ? data : null;
}

/**
 * Returns a single reader tag by slug along with `isNotFound`, which is true
 * when the API responds 404 for the slug.
 */
export function useReaderTagBySlug( slug: string | null | undefined ): {
	tag: ReaderTag | null;
	isNotFound: boolean;
} {
	const locale = useSelector( getCurrentUserLocale );
	const { data, isError, error } = useQuery( readTagQuery( slug ?? '', locale ) );

	const isNotFound =
		!! slug && isError && ( error as { status?: number } | undefined )?.status === 404;

	return { tag: data ?? null, isNotFound };
}
