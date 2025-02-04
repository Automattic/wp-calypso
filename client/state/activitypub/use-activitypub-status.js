import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export const useActivityPubStatus = ( blogId, onUpdate = () => {} ) => {
	const path = `/sites/${ blogId }/activitypub/status`;
	const apiNamespace = 'wpcom/v2';
	const queryKey = [ path, apiNamespace ];

	const { data, isInitialLoading, isError } = useQuery( {
		queryKey,
		staleTime: 0, // refetches are important here, lots of stuff in play while doing upgrades, activation, etc
		gcTime: 5 * 60 * 1000, // 5 mins
		queryFn: () => wpcom.req.get( { path, apiNamespace } ),
	} );
	const queryClient = useQueryClient();
	const { mutate, isLoading } = useMutation( {
		mutationFn: ( enabled ) => wpcom.req.post( { path, apiNamespace }, { enabled } ),
		onSuccess: ( responseData ) => {
			queryClient.setQueryData( queryKey, responseData );
			onUpdate( responseData );
		},
	} );

	return {
		isEnabled: !! data?.enabled,
		setEnabled: mutate,
		isLoading: isInitialLoading || isLoading,
		isError,
		data,
	};
};
