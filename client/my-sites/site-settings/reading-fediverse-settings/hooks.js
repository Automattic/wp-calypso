import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const queryKey = ( blogId ) => [ 'activitypub/status', blogId ];
const queryPath = ( blogId ) => `/sites/${ blogId }/activitypub/status`;

export const useActivityPubStatusMutation = ( blogId ) => {
	const queryClient = useQueryClient();
	const { mutate, isLoading } = useMutation( {
		mutationFn: ( enabled ) => {
			return wpcom.req.post( {
				path: queryPath( blogId ),
				body: { enabled },
				apiNamespace: 'wpcom/v2',
			} );
		},
		onSuccess: ( { enabled } ) => queryClient.setQueryData( queryKey( blogId ), { enabled } ),
	} );
	return {
		setEnabled: mutate,
		isMutating: isLoading,
	};
};

export const useActivityPubStatus = ( blogId ) => {
	const { data, isInitialLoading, isError } = useQuery( {
		queryKey: [ 'activitypub/status', blogId ],
		queryFn: () => {
			return wpcom.req.get( {
				path: queryPath( blogId ),
				apiNamespace: 'wpcom/v2',
			} );
		},
	} );

	return {
		isEnabled: !! data?.enabled,
		isLoading: isInitialLoading,
		isError,
	};
};
