import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { TransferStates } from 'calypso/state/automated-transfer/constants';
import { getSiteTransferStatusQueryKey } from './query';

interface InitiateAtomicTransferResponse {
	status: TransferStates;
	atomic_transfer_id: string;
}

const startTransfer = ( siteId: number ): Promise< InitiateAtomicTransferResponse > =>
	wpcom.req.post( {
		path: `/sites/${ siteId }/atomic/transfers`,
		apiNamespace: 'wpcom/v2',
		body: {
			context: 'unknown',
			transfer_intent: 'migrate',
		},
	} );

type Options = Pick< UseMutationOptions, 'retry' >;
/**
 *  Mutation hook to initiate a site transfer
 */
export const useSiteTransferMutation = ( siteId?: number, options?: Options ) => {
	const query = useQueryClient();

	const mutation = () =>
		siteId ? startTransfer( siteId ) : Promise.reject( new Error( 'siteId is required' ) );

	const refreshSiteStatus = ( data: InitiateAtomicTransferResponse ) => {
		query.setQueryData( getSiteTransferStatusQueryKey( siteId! ), data );
		query.refetchQueries( { queryKey: getSiteTransferStatusQueryKey( siteId! ), exact: true } );
	};

	return useMutation( {
		mutationKey: [ 'sites', siteId, 'atomic', 'transfers' ],
		mutationFn: mutation,
		onSuccess: refreshSiteStatus,
		retry: options?.retry ?? 10,
		onSettled: ( data, error ) => {
			recordTracksEvent( 'calypso_site_transfer_started', {
				site_id: siteId,
				status: !! error || 'success',
				atomic_transfer_id: data?.atomic_transfer_id,
			} );
		},
	} );
};
