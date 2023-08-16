import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export const useActivityPubStatus = ( blogId, onUpdate = () => {} ) => {
	const path = `/sites/${ blogId }/activitypub/status`;
	const queryKey = [ path ];

	const { data, isInitialLoading, isError } = useQuery( {
		queryKey,
		queryFn: () => wpcom.req.get( { path, apiNamespace: 'wpcom/v2' } ),
	} );
	const queryClient = useQueryClient();
	const { mutate, isLoading } = useMutation( {
		mutationFn: ( enabled ) => wpcom.req.post( { path, apiNamespace: 'wpcom/v2' }, { enabled } ),
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
