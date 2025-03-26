import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type TransferWithSoftwareStatusResponse = {
	blog_id: number;
	atomic_transfer_id: number;
	plugins: { [ key: string ]: boolean };
	themes: { [ key: string ]: boolean };
	transfer_with_software_status: string;
	atomic_transfer_status: string;
};

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
			transfer_with_software_status: data.transfer_with_software_status,
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
