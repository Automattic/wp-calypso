import { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { SiteId } from 'calypso/types';

interface UseDeleteStagingSiteOptions {
	siteId: SiteId;
	stagingSiteId: SiteId;
	onSuccess?: () => void;
	onError?: () => void;
}

export const useDeleteStagingSite = ( options: UseDeleteStagingSiteOptions ) => {
	const { siteId, stagingSiteId, onSuccess, onError } = options;
	const dispatch = useDispatch();
	const [ isDelayedLoading, setIsDelayedLoading ] = useState( false );

	const mutation = useMutation(
		() => {
			return wpcom.req.post( {
				method: 'DELETE',
				path: `/sites/${ siteId }/staging-site/${ stagingSiteId }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		{
			onSuccess: async () => {
				// Wait for the staging site async job to start
				setTimeout( () => {
					dispatch( fetchAutomatedTransferStatus( stagingSiteId ) );
					setIsDelayedLoading( false );
					onSuccess?.();
				}, 5000 );
			},
			onError: () => {
				setIsDelayedLoading( false );
				onError?.();
			},
		}
	);
	const { mutate, isLoading } = mutation;

	useEffect( () => {
		if ( isLoading ) {
			setIsDelayedLoading( true );
		}
	}, [ isLoading ] );

	return { deleteStagingSite: mutate, isLoading: isDelayedLoading };
};
