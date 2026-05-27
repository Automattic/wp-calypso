import { useQuery } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';

const COMMENTS_API_DISABLED_ERROR_MESSAGE = 'API calls to this blog have been disabled.';

const commentsApiDisabledQueryKey = ( siteId: number ) =>
	[ 'site', 'comments', 'api-disabled', siteId ] as const;

const getErrorStatus = ( error: unknown ) =>
	( error as { status?: number; statusCode?: number; response?: { status?: number } } )?.status ??
	( error as { statusCode?: number; response?: { status?: number } } )?.statusCode ??
	( error as { response?: { status?: number } } )?.response?.status;

const getErrorMessage = ( error: unknown ) =>
	( error as { message?: string; body?: { message?: string } } )?.message ??
	( error as { body?: { message?: string } } )?.body?.message;

const getErrorName = ( error: unknown ) =>
	( error as { name?: string; body?: { name?: string; error?: string } } )?.name ??
	( error as { body?: { name?: string; error?: string } } )?.body?.name ??
	( error as { body?: { name?: string; error?: string } } )?.body?.error;

export const setCommentsApiDisabled = ( queryClient: QueryClient, siteId: number ) =>
	queryClient.setQueryData( commentsApiDisabledQueryKey( siteId ), true );

export const isCommentsApiDisabledError = ( error: unknown ) =>
	getErrorStatus( error ) === 403 &&
	getErrorName( error ) === 'UnauthorizedError' &&
	getErrorMessage( error )?.startsWith( COMMENTS_API_DISABLED_ERROR_MESSAGE );

/**
 * Reads whether the comments API is known to be disabled for a site.
 *
 * This does not fetch by itself. It subscribes to the in-memory React Query
 * cache populated when a comments request returns the known API-disabled 403.
 */
export const useCommentsApiDisabled = ( siteId?: number ) => {
	const { data = false } = useQuery( {
		queryKey: commentsApiDisabledQueryKey( siteId ?? 0 ),
		queryFn: () => false,
		enabled: false,
		initialData: false,
		staleTime: Infinity,
		meta: { persist: false },
	} );

	return Boolean( siteId && data );
};
