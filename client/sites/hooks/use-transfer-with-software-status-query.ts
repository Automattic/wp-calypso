import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface TransferWithSoftwareStatusResponse {
	software_transfer_status: string;
	atomic_transfer_status: string;
	[ key: string ]: unknown; // Allow any additional fields in the response
}

const getTransferWithSoftwareStatus = async (
	siteId: number,
	atomicTransferId: number
): Promise< TransferWithSoftwareStatusResponse > => {
	return wpcom.req.get(
		`/sites/${ siteId }/atomic/transfer-with-software/${ atomicTransferId }?http_envelope=1`,
		{
			apiNamespace: 'wpcom/v2',
		}
	);
};

export const useTransferWithSoftwareStatus = (
	siteId: number,
	atomicTransferId: number,
	options?: {
		retry?: UseQueryOptions[ 'retry' ];
	}
) => {
	return useQuery( {
		queryKey: [ 'software-transfer-status', siteId, atomicTransferId ],
		queryFn: () => getTransferWithSoftwareStatus( siteId, atomicTransferId ),
		select: ( data: TransferWithSoftwareStatusResponse ) => ( {
			software_transfer_status: data.software_transfer_status,
			atomic_transfer_status: data.atomic_transfer_status,
		} ),
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retryDelay: 5000, // Poll every 5 seconds
		retry: options?.retry ?? false,
		enabled: !! siteId && !! atomicTransferId, // Only run when both values exist.
	} );
};
