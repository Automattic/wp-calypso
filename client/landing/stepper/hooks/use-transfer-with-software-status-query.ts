import { useQuery, UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type TransferWithSoftwareStatus = {
	blog_id: number;
	atomic_transfer_id: number;
	atomic_transfer_status: string;
	plugins: Record< string, boolean >;
	themes: Record< string, boolean >;
	transfer_with_software_status: string;
};

export function useTransferWithSoftwareStatus(
	siteId: number,
	atomicTransferId: number,
	queryOptions: Omit< UseQueryOptions< any, Error, TransferWithSoftwareStatus >, 'queryKey' > = {}
): UseQueryResult< TransferWithSoftwareStatus > {
	return useQuery< any, Error, TransferWithSoftwareStatus >( {
		queryKey: [ 'transferWithSoftwareStatus', siteId, atomicTransferId ],
		queryFn: async () => {
			const response = await wpcom.req.get(
				`/sites/${ siteId }/atomic/transfer-with-software/${ atomicTransferId }`,
				{ apiNamespace: 'wpcom/v2' }
			);
			return response;
		},
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchInterval: 5000, // Poll every 5 seconds
		enabled: !! siteId && !! atomicTransferId, // Only run when both values exist
		...queryOptions,
		meta: {
			...queryOptions.meta,
		},
	} );
}
