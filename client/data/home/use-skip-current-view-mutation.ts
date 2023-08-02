import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { fetchHomeLayout, getCacheKey } from './use-home-layout-query';
import { useHomeLayoutQueryParams } from './use-home-layout-query-params';

export type ReminderDuration = '1d' | '1w' | null;

interface Variables {
	reminder: ReminderDuration;
	card?: string;
}

type Result< TData, TError > = UseMutationResult< TData, TError, Variables > & {
	skipCurrentView: ( reminder: ReminderDuration ) => void;
	skipCard: ( card: string, reminder?: ReminderDuration ) => void;
};

function useSkipCurrentViewMutation< TData, TError >( siteId: number ): Result< TData, TError > {
	const queryClient = useQueryClient();
	const query = useHomeLayoutQueryParams();

	const mutation = useMutation< TData, TError, Variables >( {
		mutationFn: async ( { reminder, card } ) => {
			const data = await queryClient.fetchQuery(
				getCacheKey( siteId ),
				() => fetchHomeLayout( siteId, query ),
				{ staleTime: Infinity }
			);

			const view_name = ( data as any ).view_name;
			const multipleCardViews = [ 'VIEW_POST_LAUNCH', 'VIEW_SITE_SETUP' ];
			const isSingleCardView = multipleCardViews.indexOf( view_name ) === -1;

			return await wp.req.post(
				{
					path: `/sites/${ siteId }/home/layout/skip`,
					apiNamespace: 'wpcom/v2',
				},
				{ query },
				{
					// Single card views are skipped by skipping the "view".
					view: isSingleCardView ? view_name : undefined,
					// Prevents single card views from returning themself after skipping
					card: isSingleCardView ? undefined : card,
					...( reminder && { reminder } ),
				}
			);
		},
		onSuccess( data ) {
			queryClient.setQueryData( getCacheKey( siteId ), data );
		},
	} );

	const { mutate } = mutation;

	const skipCurrentView = useCallback(
		( reminder: ReminderDuration ) => mutate( { reminder } ),
		[ mutate ]
	);

	const skipCard = useCallback(
		( card: string, reminder?: ReminderDuration ) => mutate( { reminder: reminder ?? null, card } ),
		[ mutate ]
	);

	return { skipCurrentView, skipCard, ...mutation };
}

export default useSkipCurrentViewMutation;
