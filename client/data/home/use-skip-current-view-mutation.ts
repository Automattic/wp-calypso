/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useMutation, useQueryClient, UseMutationResult } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import { useHomeLayoutQueryParams } from './use-home-layout-query-params';
import { fetchHomeLayout, getCacheKey } from './use-home-layout-query';

type ReminderDuration = '1d' | '1w' | null;

interface Variables {
	reminder: ReminderDuration;
}

interface Result extends UseMutationResult< void, unknown, Variables > {
	skipCurrentView: ( reminder: ReminderDuration ) => void;
}

function useSkipCurrentViewMutation( siteId: number ): Result {
	const queryClient = useQueryClient();
	const query = useHomeLayoutQueryParams();

	const mutation = useMutation< void, unknown, Variables >(
		async ( { reminder } ) => {
			const data = await queryClient.fetchQuery(
				getCacheKey( siteId ),
				() => fetchHomeLayout( siteId, query ),
				{ staleTime: Infinity }
			);

			return await wp.req.post(
				{
					path: `/sites/${ siteId }/home/layout/skip`,
					apiNamespace: 'wpcom/v2',
				},
				{ dev: query.dev },
				{
					view: ( data as any ).view_name,
					...( reminder && { reminder } ),
				}
			);
		},
		{
			onSuccess( data ) {
				queryClient.setQueryData( getCacheKey( siteId ), data );
			},
		}
	);

	const { mutate } = mutation;

	const skipCurrentView = useCallback( ( reminder: ReminderDuration ) => mutate( { reminder } ), [
		mutate,
	] );

	return { skipCurrentView, ...mutation };
}

export default useSkipCurrentViewMutation;
