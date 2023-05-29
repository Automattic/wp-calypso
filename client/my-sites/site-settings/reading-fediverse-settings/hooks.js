import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export const useActivityPubStatus = ( blogId ) => {
	const queryKey = [ 'activitypub/status', blogId ];
	const reqArgs = {
		path: `/sites/${ blogId }/activitypub/status`,
		apiNamespace: 'wpcom/v2',
	};

	const { data, isInitialLoading, isError } = useQuery( {
		queryKey,
		queryFn: () => wpcom.req.get( reqArgs ),
	} );
	const queryClient = useQueryClient();
	const { mutate, isLoading } = useMutation( {
		mutationFn: ( enabled ) => wpcom.req.post( { body: { enabled }, ...reqArgs } ),
		onSuccess: ( responseData ) => queryClient.setQueryData( queryKey, responseData ),
	} );

	return {
		isEnabled: !! data?.enabled,
		setEnabled: mutate,
		isLoading: isInitialLoading || isLoading,
		isError,
	};
};
