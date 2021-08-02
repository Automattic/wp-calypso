import { useCallback } from 'react';
import { useMutation, useQueryClient, UseMutationResult } from 'react-query';
import wp from 'calypso/lib/wp';
import { fetchHomeLayout, getCacheKey } from './use-home-layout-query';
import { useHomeLayoutQueryParams } from './use-home-layout-query-params';

type ReminderDuration = '1d' | '1w' | null;

interface Variables {
	reminder: ReminderDuration;
}

interface Result extends UseMutationResult< void, unknown, Variables > {
	skipCurrentView: ( reminder: ReminderDuration ) => void;
	skipCard: ( card, reminder: ReminderDuration ) => void;
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
					card,
					...( reminder && { reminder } ),
				}
			);
		},
		{
			onMutate( { card } ) {
				const cachedData: Record< string, unknown > | undefined = queryClient.getQueryData(
					getCacheKey( siteId )
				);
				const optimisticUpdate = {
					...cachedData,
					primary: cachedData.primary.filter( ( c ) => c !== card ),
				};

				queryClient.setQueryData( getCacheKey( siteId ), optimisticUpdate );
			},
			onError(/* err, _data, cachedData */) {
				// We can revert the change if there's an error here, but do
				// we actually want to?
				// queryClient.setQueryData( getCacheKey( siteId ), cachedData );
			},
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
