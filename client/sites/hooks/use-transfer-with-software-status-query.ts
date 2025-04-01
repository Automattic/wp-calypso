import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type TransferWithSoftwareStatusResponse = {
	blog_id: number;
	atomic_transfer_id: number;
	atomic_transfer_status: string;
};

const getTransferWithSoftwareStatus: (
	siteId?: number,
	atomicTransferId?: number
) => Promise< TransferWithSoftwareStatusResponse > = async ( siteId, atomicTransferId ) => {
	if ( ! siteId || ! atomicTransferId ) {
		return {
			blog_id: 0,
			atomic_transfer_id: 0,
			atomic_transfer_status: 'pending',
		};
	}
	return wpcom.req.get(
		`/sites/${ siteId }/atomic/transfer-with-software/${ atomicTransferId }?http_envelope=1`,
		{
			apiNamespace: 'wpcom/v2',
		}
	);
};

export const useTransferWithSoftwareStatus = (
	siteId?: number,
	atomicTransferId?: number,
	options?: {
		retry?: UseQueryOptions[ 'retry' ];
	}
) => {
	return useQuery( {
		queryKey: [ 'software-transfer-status', siteId, atomicTransferId ],
		queryFn: () => getTransferWithSoftwareStatus( siteId, atomicTransferId ),
		select: ( data: TransferWithSoftwareStatusResponse ) => ( {
			atomic_transfer_status: data.atomic_transfer_status,
		} ),
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchInterval: ( { state } ) => {
			if ( state.data?.atomic_transfer_status === 'completed' ) {
				return false;
			}
			return 5000;
		},
		retry: options?.retry ?? false,
		enabled: !! siteId && !! atomicTransferId, // Only run when both values exist.
	} );
};
