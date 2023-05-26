import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export const useActivityPubStatus = ( blogId ) => {
	const key = [ 'activitypub/status', blogId ];
	const path = `/sites/${ blogId }/activitypub/status`;

	const { data, isInitialLoading, isError } = useQuery( {
		queryKey: key,
		queryFn: () => {
			return wpcom.req.get( {
				path,
				apiNamespace: 'wpcom/v2',
			} );
		},
	} );
	const queryClient = useQueryClient();
	const { mutate, isLoading } = useMutation( {
		mutationFn: ( enabled ) => {
			return wpcom.req.post( {
				path,
				body: { enabled },
				apiNamespace: 'wpcom/v2',
			} );
		},
		onSuccess: ( { enabled } ) => queryClient.setQueryData( key, { enabled } ),
	} );

	return {
		isEnabled: !! data?.enabled,
		setEnabled: mutate,
		isLoading: isInitialLoading || isLoading,
		isError,
	};
};
