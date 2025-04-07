import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type TransferWithSoftwareStatusResponse = {
	blog_id: number;
	transfer_id: number;
	transfer_status: string;
};

const getTransferWithSoftwareStatus: (
	siteId?: number,
	transferId?: number
) => Promise< TransferWithSoftwareStatusResponse > = async ( siteId, transferId ) => {
	if ( ! siteId || ! transferId ) {
		return {
			blog_id: 0,
			transfer_id: 0,
			transfer_status: 'pending',
		};
	}
	return wpcom.req.get(
		`/sites/${ siteId }/atomic/transfer-with-software/${ transferId }?http_envelope=1`,
		{
			apiNamespace: 'wpcom/v2',
		}
	);
};

export const useTransferWithSoftwareStatus = (
	siteId?: number,
	transferId?: number,
	options?: {
		retry?: UseQueryOptions[ 'retry' ];
	}
) => {
	return useQuery( {
		queryKey: [ 'software-transfer-status', siteId, transferId ],
		queryFn: () => getTransferWithSoftwareStatus( siteId, transferId ),
		select: ( data: TransferWithSoftwareStatusResponse ) => ( {
			transfer_status: data.transfer_status,
		} ),
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchInterval: ( { state } ) => {
			if ( state.data?.transfer_status === 'completed' ) {
				return false;
			}
			return 5000;
		},
		retry: options?.retry ?? false,
		enabled: !! siteId && !! transferId, // Only run when both values exist.
	} );
};
