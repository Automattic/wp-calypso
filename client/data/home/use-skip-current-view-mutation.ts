import { useCallback } from 'react';
import { useMutation, useQueryClient, UseMutationResult } from 'react-query';
import wp from 'calypso/lib/wp';
import { fetchHomeLayout, getCacheKey } from './use-home-layout-query';
import { useHomeLayoutQueryParams } from './use-home-layout-query-params';

type ReminderDuration = '1d' | '1w' | null;

interface Variables {
	reminder: ReminderDuration;
	card?: string;
}

interface Result extends UseMutationResult< void, unknown, Variables > {
	skipCurrentView: ( reminder: ReminderDuration ) => void;
	skipCard: ( card: string, reminder: ReminderDuration ) => void;
}

function useSkipCurrentViewMutation( siteId: number ): Result {
	const queryClient = useQueryClient();
	const query = useHomeLayoutQueryParams();

	const mutation = useMutation< void, unknown, Variables >(
		async ( { reminder, card } ) => {
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
				{ query },
				{
					view: ( data as any ).view_name,
					// temporarily prevent single card views from returning themself after skipping
					card: ( data as any ).view_name === 'VIEW_POST_LAUNCH' ? card : undefined,
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

	const skipCard = useCallback(
		( card, reminder: ReminderDuration ) => mutate( { reminder, card } ),
		[ mutate ]
	);

	return { skipCurrentView, skipCard, ...mutation };
}

export default useSkipCurrentViewMutation;
