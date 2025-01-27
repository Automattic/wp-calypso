import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { transferStates, type TransferStates } from 'calypso/state/automated-transfer/constants';

// The endpoint returns HTTP status 200 with a JSON body with status 404 when the transfer was not initiated.
type TransferState = TransferStates;

export type TransferStatusResponse = {
	status: TransferState;
	code?: string;
};

const fetchStatus = ( siteId: number ): Promise< TransferStatusResponse > => {
	return wpcom.req
		.get( {
			path: `/sites/${ siteId }/atomic/transfers/latest`,
			apiNamespace: 'wpcom/v2',
		} )
		.catch( ( error: { message: string; code: string } ) => {
			if ( error?.code === 'no_transfer_record' ) {
				// The processing of the `no_transfer_record` as an error make the query to be refetched infinitely,
				// so I need to return a resolved promise with the status NONE.
				return Promise.resolve( { status: transferStates.NONE } );
			}
			return Promise.reject( error );
		} );
};

const REFETCH_TIME = process.env.NODE_ENV === 'test' ? 300 : 3000;

const endStates: TransferState[] = [
	transferStates.NONE,
	transferStates.COMPLETE,
	transferStates.COMPLETED,
	transferStates.FAILURE,
	transferStates.ERROR,
	transferStates.REVERTED,
];

const isTransferring = ( status: TransferState ) => {
	return ! endStates.includes( status );
};

const readyToTransferStates: TransferState[] = [ transferStates.NONE, transferStates.REVERTED ];

const isReadyToTransfer = ( status: TransferState ) => {
	return readyToTransferStates.includes( status );
};

export function getSiteTransferStatusQueryKey( siteId: number ) {
	return [ 'sites', siteId, 'atomic', 'transfers', 'latest' ];
}

const shouldRefetch = ( status: TransferStates | undefined ) => {
	if ( ! status ) {
		return false;
	}

	// This condition ensures that when the status is NONE,
	// we expect it might change in another tab. This allows the UI to reflect any updates dynamically.
	if ( transferStates.NONE === status ) {
		return true;
	}

	return isTransferring( status );
};

type Options = Pick< UseQueryOptions, 'retry' | 'refetchIntervalInBackground' >;

/**
 * Query hook to get the site transfer status, pooling the endpoint.
 * @param siteId
 * @returns
 */
export const useSiteTransferStatusQuery = ( siteId: number | undefined, options?: Options ) => {
	return useQuery( {
		queryKey: getSiteTransferStatusQueryKey( siteId! ),
		queryFn: () => fetchStatus( siteId! ),
		retry: options?.retry ?? 20,
		select: ( data ) => {
			return {
				isTransferring: data?.status ? isTransferring( data.status as TransferStates ) : false,
				isReadyToTransfer: data?.status
					? isReadyToTransfer( data.status as TransferStates )
					: false,
				completed: data?.status === transferStates.COMPLETED,
				status: data.status,
				error: null,
			};
		},
		refetchOnWindowFocus: false,
		refetchIntervalInBackground: !! options?.refetchIntervalInBackground,
		refetchInterval: ( { state } ) =>
			shouldRefetch( state.data?.status ) ? REFETCH_TIME : false,
		enabled: !! siteId,
	} );
};
