import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { transferStates, type TransferStates } from 'calypso/state/automated-transfer/constants';

// The endpoint returns HTTP status 200 with a JSON body with status 404 when the transfer was not initiated.
const TransferNotFoundStatus = 404 as const;
type TransferState = TransferStates | typeof TransferNotFoundStatus;

type TransferStatusResponse = {
	status: TransferState;
	code?: string;
};

const fetchStatus = ( siteId: number ): Promise< TransferStatusResponse > => {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/atomic/transfers/latest`,
		apiNamespace: 'wpcom/v2',
	} );
};

const endStates: TransferState[] = [
	transferStates.NONE,
	transferStates.COMPLETE,
	transferStates.COMPLETED,
	transferStates.FAILURE,
	transferStates.ERROR,
	transferStates.REVERTED,
	TransferNotFoundStatus,
];

const isTransferring = ( status: TransferState ) => {
	return ! endStates.includes( status );
};

export function getSiteTransferStatusQueryKey( siteId: number ) {
	return [ 'sites', siteId, 'atomic', 'transfers', 'latest' ];
}

// const shouldContinuePooling = ( status: TransferStates | 404 | undefined ) => {
// 	if ( ! status || status === 404 ) {
// 		return false;
// 	}

// 	return isTransferring( status );
// };

interface useSiteTransferStatusQueryOptions {
	pooling: boolean;
}
export const useSiteTransferStatusQuery = (
	siteId: number | undefined,
	options?: useSiteTransferStatusQueryOptions
) => {
	const { pooling = true } = options || {};

	return useQuery( {
		queryKey: getSiteTransferStatusQueryKey( siteId! ),
		queryFn: () => fetchStatus( siteId! ),
		select: ( data ) => {
			return {
				isTransferring: data?.status ? isTransferring( data.status as TransferStates ) : false,
				isStarted: data?.code !== 'no_transfer_record',
				isComplete: data?.status === transferStates.COMPLETE,
				status: data.status,
				error: null,
			};
		},

		refetchInterval: 2000,
		enabled: !! siteId && pooling,
	} );
};
